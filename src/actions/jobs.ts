"use server";

import { z } from "zod";

import { ReportReason, ReportStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

import type { ActionResponse } from "./types";

/**
 * Toggle simpan lowongan ke daftar favorit pelamar.
 * Jika belum disimpan, buat record SavedJob. Jika sudah, hapus.
 */
export async function toggleSaveJobAction(
  jobId: string
): Promise<ActionResponse<{ saved: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "UNAUTHORIZED",
      };
    }

    // Pastikan lowongan yang disimpan valid
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    });

    if (!job) {
      return {
        success: false,
        error: "Lowongan kerja tidak ditemukan.",
      };
    }

    const existingSave = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId,
        },
      },
    });

    if (existingSave) {
      await prisma.savedJob.delete({
        where: { id: existingSave.id },
      });
      return {
        success: true,
        data: { saved: false },
      };
    } else {
      await prisma.savedJob.create({
        data: {
          userId: user.id,
          jobId,
        },
      });
      return {
        success: true,
        data: { saved: true },
      };
    }
  } catch (error) {
    console.error("Error toggle simpan lowongan:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan lowongan. Silakan coba lagi.",
    };
  }
}

/**
 * Periksa apakah lowongan tertentu sudah disimpan oleh pengguna saat ini.
 */
export async function checkJobSavedAction(
  jobId: string
): Promise<ActionResponse<{ saved: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: true, data: { saved: false } };
    }

    const existingSave = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId,
        },
      },
    });

    return {
      success: true,
      data: { saved: Boolean(existingSave) },
    };
  } catch {
    return { success: true, data: { saved: false } };
  }
}

const reportSchema = z.object({
  jobId: z.string().min(1, "ID lowongan wajib disertakan."),
  reason: z.nativeEnum(ReportReason, {
    message: "Pilih alasan pelaporan yang valid.",
  }),
  description: z
    .string()
    .min(10, "Mohon berikan rincian laporan minimal 10 karakter.")
    .max(1000, "Deskripsi laporan maksimal 1000 karakter."),
});

export type SubmitReportInput = z.infer<typeof reportSchema>;

/**
 * Mengirim laporan kecurangan / penipuan lowongan kerja ke tim moderasi.
 */
export async function submitJobReportAction(
  input: SubmitReportInput
): Promise<ActionResponse<{ reportId: string }>> {
  try {
    const parsed = reportSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi laporan gagal.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error:
          "Anda harus masuk (login) terlebih dahulu untuk melaporkan lowongan kerja demi mencegah penyalahgunaan.",
      };
    }

    // Pastikan lowongan valid
    const job = await prisma.job.findUnique({
      where: { id: parsed.data.jobId },
      select: { id: true, title: true },
    });

    if (!job) {
      return {
        success: false,
        error: "Lowongan kerja yang dilaporkan tidak ditemukan.",
      };
    }

    // Buat laporan
    const report = await prisma.report.create({
      data: {
        jobId: parsed.data.jobId,
        reporterId: user.id,
        reason: parsed.data.reason,
        description: parsed.data.description.trim(),
        status: ReportStatus.PENDING,
      },
    });

    return {
      success: true,
      data: { reportId: report.id },
    };
  } catch (error) {
    console.error("Error saat mengirim laporan lowongan:", error);
    return {
      success: false,
      error: "Terjadi kegagalan sistem saat memproses laporan Anda.",
    };
  }
}
