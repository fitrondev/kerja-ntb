"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { ApplicationStatus, UserRole } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

import type { ActionResponse } from "./types";

const applicationSchema = z.object({
  jobId: z.string().min(1, "ID lowongan kerja wajib disertakan."),
  resumeId: z.string().optional().or(z.literal("")),
  customResumeUrl: z
    .string()
    .url("URL berkas CV tidak valid.")
    .or(z.string().startsWith("/"))
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
    // 1. Validasi sinkron skema input lamaran (0ms early-exit)
    const parsed = applicationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data lamaran gagal.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { jobId, resumeId, customResumeUrl, coverLetter } = parsed.data;

    // Pastikan salah satu CV terlampir (Resume ID atau URL upload) sebelum menyentuh DB
    if (!resumeId && !customResumeUrl) {
      return {
        success: false,
        error:
          "Mohon pilih salah satu CV dari Resume Builder atau unggah berkas CV PDF.",
      };
    }

    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error:
          "Silakan masuk ke akun Anda terlebih dahulu untuk melamar pekerjaan.",
      };
    }

    // 2. Paralelkan pengecekan validitas lowongan dan riwayat lamaran pengguna
    const [job, existingApplication] = await Promise.all([
      prisma.job.findUnique({
        where: { id: jobId },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          deadline: true,
        },
      }),
      prisma.application.findUnique({
        where: {
          jobId_userId: {
            jobId,
            userId: user.id,
          },
        },
      }),
    ]);

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

const employerUpdateApplicationSchema = z.object({
  applicationId: z.string().min(1, "ID lamaran wajib disertakan."),
  status: z.nativeEnum(ApplicationStatus),
  notes: z
    .string()
    .max(3000, "Catatan internal maksimal 3000 karakter.")
    .optional()
    .or(z.literal("")),
  rejectionReason: z
    .string()
    .max(1000, "Alasan penolakan maksimal 1000 karakter.")
    .optional()
    .or(z.literal("")),
  interviewDate: z.string().optional().or(z.literal("")),
});

export type EmployerUpdateApplicationInput = z.infer<
  typeof employerUpdateApplicationSchema
>;

/**
 * Memperbarui status seleksi kandidat pelamar oleh perusahaan (Employer ATS).
 */
export async function updateEmployerApplicationStatusAction(
  input: EmployerUpdateApplicationInput
): Promise<
  ActionResponse<{ applicationId: string; status: ApplicationStatus }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    const parsed = employerUpdateApplicationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Data perubahan status pelamar tidak valid.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { applicationId, status, notes, rejectionReason, interviewDate } =
      parsed.data;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: { company: true },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Data berkas lamaran tidak ditemukan." };
    }

    const isOwner =
      application.job.creatorId === user.id ||
      application.job.company?.userId === user.id;
    const isSuperadmin = user.role === UserRole.SUPERADMIN;

    if (!isOwner && !isSuperadmin) {
      return {
        success: false,
        error:
          "Anda tidak berhak memperbarui status berkas pelamar untuk lowongan ini.",
      };
    }

    const interviewDateTime = interviewDate ? new Date(interviewDate) : null;

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        notes: notes ? notes.trim() : null,
        rejectionReason: rejectionReason ? rejectionReason.trim() : null,
        interviewDate: interviewDateTime,
      },
    });

    revalidatePath("/dashboard/employer/pelamar");
    revalidatePath("/dashboard/employer");
    revalidatePath("/dashboard/user/applications");

    return {
      success: true,
      data: {
        applicationId: updated.id,
        status: updated.status,
      },
    };
  } catch (error) {
    console.error("Error updating employer application status:", error);
    return {
      success: false,
      error: "Gagal memperbarui status pelamar. Silakan coba kembali.",
    };
  }
}
