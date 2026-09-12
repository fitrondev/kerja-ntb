"use server";

import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  canAccessStorageFile,
  canModifyStorageFile,
} from "@/lib/storage/authorization";
import {
  PresignedUploadResult,
  UploadCategory,
  deleteObjectFromStorage,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  validateFileConstraints,
} from "@/lib/storage/upload";

import { ActionResponse } from "./types";

const uploadRequestSchema = z.object({
  fileName: z.string().min(1, "Nama file wajib diisi."),
  fileType: z.string().min(1, "Tipe MIME file wajib diisi."),
  fileSize: z.number().positive("Ukuran file harus lebih dari 0."),
  category: z.enum([
    "RESUME",
    "LOGO",
    "AVATAR",
    "VERIFICATION",
    "BLOG",
  ] as const),
  companyId: z.string().optional(),
});

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;

/**
 * Server Action: Dapatkan Presigned PUT URL untuk upload langsung ke SumoPod S3
 */
export async function getPresignedUploadUrlAction(
  input: UploadRequestInput
): Promise<ActionResponse<PresignedUploadResult>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Autentikasi diperlukan. Silakan masuk terlebih dahulu.",
      };
    }

    // SEC-04: Rate limiting proteksi presign URL flooding
    const rateCheck = checkRateLimit(`action_presign:${user.id}`, {
      intervalMs: 60_000,
      maxRequests: 20,
    });
    if (!rateCheck.success) {
      return {
        success: false,
        error:
          "Terlalu banyak permintaan unggah berkas. Silakan coba lagi dalam 1 menit.",
      };
    }

    const validationResult = uploadRequestSchema.safeParse(input);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validationResult.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }
      return {
        success: false,
        error: "Validasi parameter upload gagal.",
        fieldErrors,
      };
    }

    const { fileName, fileType, fileSize, category, companyId } =
      validationResult.data;

    // Validasi batasan ukuran & tipe berkas
    const fileValidation = validateFileConstraints(
      category,
      fileSize,
      fileType,
      fileName
    );
    if (!fileValidation.valid) {
      return {
        success: false,
        error: fileValidation.error || "Validasi berkas gagal.",
      };
    }

    // SEC-03: Tentukan ownerId & validasi otorisasi kepemilikan perusahaan
    let ownerId = user.id;
    if (category === "LOGO" || category === "VERIFICATION") {
      const targetCompanyId = companyId || user.company?.id;
      if (!targetCompanyId) {
        return {
          success: false,
          error: "ID Perusahaan wajib disertakan untuk kategori ini.",
        };
      }

      if (user.role !== "SUPERADMIN") {
        const ownedCompany = await prisma.company.findFirst({
          where: { id: targetCompanyId, userId: user.id },
          select: { id: true },
        });

        if (!ownedCompany) {
          return {
            success: false,
            error:
              "Akses ditolak. Anda tidak memiliki izin untuk perusahaan ini.",
          };
        }
      }

      ownerId = targetCompanyId;
    } else if (category === "BLOG") {
      if (user.role !== "SUPERADMIN") {
        return {
          success: false,
          error: "Hanya Superadmin yang berhak mengunggah aset blog.",
        };
      }
      ownerId = "public";
    }

    const presignedData = await getPresignedUploadUrl({
      fileName,
      fileType,
      fileSize,
      category,
      ownerId,
    });

    return {
      success: true,
      data: presignedData,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Gagal membuat URL upload.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Server Action: Dapatkan Presigned GET URL untuk file privat (CV / NIB)
 */
export async function getPresignedDownloadUrlAction(
  storageKey: string,
  expiresInSeconds = 900
): Promise<ActionResponse<{ downloadUrl: string }>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Autentikasi diperlukan untuk mengakses dokumen privat.",
      };
    }

    if (!storageKey || typeof storageKey !== "string") {
      return {
        success: false,
        error: "Storage key berkas tidak valid.",
      };
    }

    const cleanKey = storageKey.startsWith("/")
      ? storageKey.slice(1)
      : storageKey;

    // SEC-02: Otorisasi kepemilikan objek
    const isAuthorized = await canAccessStorageFile(
      { id: user.id, clerkId: user.clerkId, role: user.role },
      cleanKey
    );

    if (!isAuthorized) {
      return {
        success: false,
        error:
          "Akses ditolak. Anda tidak memiliki izin untuk mengunduh dokumen privat ini.",
      };
    }

    const downloadUrl = await getPresignedDownloadUrl(
      cleanKey,
      expiresInSeconds
    );

    return {
      success: true,
      data: { downloadUrl },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Gagal menghasilkan URL unduhan.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Server Action: Hapus berkas dari SumoPod Object Storage
 */
export async function deleteStorageFileAction(
  storageKey: string
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Autentikasi diperlukan untuk menghapus berkas.",
      };
    }

    if (!storageKey) {
      return {
        success: false,
        error: "Storage key berkas tidak valid.",
      };
    }

    const cleanKey = storageKey.startsWith("/")
      ? storageKey.slice(1)
      : storageKey;

    // SEC-03: Otorisasi hak modifikasi / hapus berkas
    const isAuthorized = await canModifyStorageFile(
      { id: user.id, clerkId: user.clerkId, role: user.role },
      cleanKey
    );

    if (!isAuthorized) {
      return {
        success: false,
        error:
          "Akses ditolak. Anda tidak memiliki izin untuk menghapus berkas ini.",
      };
    }

    await deleteObjectFromStorage(cleanKey);

    return {
      success: true,
      data: { deleted: true },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Gagal menghapus berkas dari storage.";
    return {
      success: false,
      error: message,
    };
  }
}
