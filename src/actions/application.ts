"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { ApplicationStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

import type { ActionResponse } from "./types";

const applicationSchema = z.object({
  jobId: z.string().min(1, "ID lowongan kerja wajib disertakan."),
  resumeId: z.string().optional().or(z.literal("")),
  customResumeUrl: z
    .string()
    .url("URL berkas CV tidak valid.")
    .optional()
    .or(z.literal("")),
  coverLetter: z
    .string()
    .max(3000, "Surat lamaran maksimal 3000 karakter.")
    .optional()
    .or(z.literal("")),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

/**
 * Mengirimkan lamaran kerja ke lowongan yang aktif di KerjaNTB.
 */
export async function submitJobApplicationAction(
  input: ApplicationInput
): Promise<ActionResponse<{ applicationId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error:
          "Silakan masuk ke akun Anda terlebih dahulu untuk melamar pekerjaan.",
      };
    }

    const parsed = applicationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data lamaran gagal.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { jobId, resumeId, customResumeUrl, coverLetter } = parsed.data;

    // Pastikan salah satu CV terlampir (Resume ID atau URL upload)
    if (!resumeId && !customResumeUrl) {
      return {
        success: false,
        error:
          "Mohon pilih salah satu CV dari Resume Builder atau unggah berkas CV PDF.",
      };
    }

    // Pastikan lowongan valid & PUBLISHED
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        deadline: true,
      },
    });

    if (!job || job.status !== "PUBLISHED") {
      return {
        success: false,
        error:
          "Lowongan ini sudah tidak aktif atau tidak menerima lamaran baru.",
      };
    }

    if (job.deadline && new Date() > new Date(job.deadline)) {
      return {
        success: false,
        error:
          "Batas waktu pengiriman lamaran untuk posisi ini telah berakhir.",
      };
    }

    // Periksa apakah user sudah pernah melamar di lowongan ini
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId: user.id,
        },
      },
    });

    if (existingApplication) {
      return {
        success: false,
        error: "Anda sudah pernah mengirimkan lamaran untuk lowongan ini.",
      };
    }

    // Buat record lamaran baru
    const application = await prisma.application.create({
      data: {
        jobId,
        userId: user.id,
        resumeId: resumeId && resumeId !== "" ? resumeId : null,
        customResumeUrl:
          customResumeUrl && customResumeUrl !== "" ? customResumeUrl : null,
        coverLetter: coverLetter ? coverLetter.trim() : null,
        status: ApplicationStatus.APPLIED,
      },
    });

    // Tambah counter pelamar pada lowongan
    await prisma.job.update({
      where: { id: jobId },
      data: { appliesCount: { increment: 1 } },
    });

    revalidatePath(`/loker/${job.slug}`);
    revalidatePath("/dashboard/user");
    revalidatePath("/dashboard/user/applications");

    return {
      success: true,
      data: { applicationId: application.id },
    };
  } catch (error) {
    console.error("Error submitting job application:", error);
    return {
      success: false,
      error:
        "Terjadi kesalahan saat memproses lamaran kerja Anda. Silakan coba lagi.",
    };
  }
}

/**
 * Membatalkan lamaran pekerjaan oleh pelamar.
 */
export async function withdrawJobApplicationAction(
  applicationId: string
): Promise<ActionResponse<{ withdrawn: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId, userId: user.id },
      include: { job: { select: { slug: true } } },
    });

    if (!application) {
      return { success: false, error: "Data lamaran tidak ditemukan." };
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      return { success: true, data: { withdrawn: true } };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.WITHDRAWN },
    });

    revalidatePath("/dashboard/user");
    revalidatePath("/dashboard/user/applications");
    if (application.job?.slug) {
      revalidatePath(`/loker/${application.job.slug}`);
    }

    return { success: true, data: { withdrawn: true } };
  } catch (error) {
    console.error("Error withdrawing application:", error);
    return { success: false, error: "Gagal membatalkan lamaran." };
  }
}
