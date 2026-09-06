"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

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
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Autentikasi diperlukan. Silakan masuk terlebih dahulu.",
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
      fileType
    );
    if (!fileValidation.valid) {
      return {
        success: false,
        error: fileValidation.error || "Validasi berkas gagal.",
      };
    }

    // Tentukan ownerId berdasarkan kategori
    let ownerId = userId;
    if (category === "LOGO" || category === "VERIFICATION") {
      ownerId = companyId || userId;
    } else if (category === "BLOG") {
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
    const { userId } = await auth();

    if (!userId) {
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

    // Hanya izinkan akses jika berkas berada di bucket yang sah
    const cleanKey = storageKey.startsWith("/")
      ? storageKey.slice(1)
      : storageKey;

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
    const { userId } = await auth();

    if (!userId) {
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

    await deleteObjectFromStorage(storageKey);

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
