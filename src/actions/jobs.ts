"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import {
  ApplicationMethod,
  EducationLevel,
  ExperienceLevel,
  JobStatus,
  JobType,
  ReportReason,
  ReportStatus,
  UserRole,
  VerificationStatus,
  WorkplaceType,
} from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

import type { ActionResponse } from "./types";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const jobFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Judul lowongan minimal 3 karakter.")
      .max(120, "Judul lowongan maksimal 120 karakter."),
    categoryId: z.string().min(1, "Kategori pekerjaan wajib dipilih."),
    locationId: z
      .string()
      .min(1, "Lokasi Kabupaten/Kota di NTB wajib dipilih."),
    type: z.nativeEnum(JobType),
    workplace: z.nativeEnum(WorkplaceType),
    isSalaryDisclosed: z.boolean().default(true),
    salaryMin: z.coerce
      .number()
      .min(0, "Gaji minimum tidak valid.")
      .optional()
      .nullable(),
    salaryMax: z.coerce
      .number()
      .min(0, "Gaji maksimum tidak valid.")
      .optional()
      .nullable(),
    description: z
      .string()
      .min(20, "Deskripsi lowongan minimal 20 karakter.")
      .max(10000, "Deskripsi lowongan maksimal 10.000 karakter."),
    responsibilities: z
      .string()
      .min(20, "Tanggung jawab utama minimal 20 karakter.")
      .max(10000, "Tanggung jawab maksimal 10.000 karakter."),
    requirements: z
      .string()
      .min(20, "Kualifikasi pekerjaan minimal 20 karakter.")
      .max(10000, "Kualifikasi maksimal 10.000 karakter."),
    benefits: z
      .string()
      .max(3000, "Fasilitas maksimal 3000 karakter.")
      .optional()
      .or(z.literal("")),
    education: z.nativeEnum(EducationLevel).default(EducationLevel.NONE),
    experience: z
      .nativeEnum(ExperienceLevel)
      .default(ExperienceLevel.FRESH_GRADUATE),
    isFreshGraduate: z.boolean().default(false),
    applicationMethod: z
      .nativeEnum(ApplicationMethod)
      .default(ApplicationMethod.KERJANTB),
    applicationEmail: z
      .string()
      .email("Format email pengiriman lamaran tidak valid.")
      .optional()
      .or(z.literal("")),
    externalUrl: z
      .string()
      .url("Format URL tautan pendaftaran tidak valid.")
      .optional()
      .or(z.literal("")),
    deadline: z.string().optional().or(z.literal("")),
    skills: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      if (
        data.isSalaryDisclosed &&
        data.salaryMin != null &&
        data.salaryMax != null &&
        data.salaryMin > data.salaryMax
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Gaji minimum tidak boleh lebih besar daripada gaji maksimum.",
      path: ["salaryMax"],
    }
  )
  .refine(
    (data) => {
      if (
        data.applicationMethod === ApplicationMethod.EMAIL &&
        !data.applicationEmail
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Alamat email penerima lamaran wajib diisi jika metode pengiriman adalah Email.",
      path: ["applicationEmail"],
    }
  )
  .refine(
    (data) => {
      if (
        data.applicationMethod === ApplicationMethod.EXTERNAL_URL &&
        !data.externalUrl
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "URL website pendaftaran wajib diisi jika metode pengiriman adalah Website Eksternal.",
      path: ["externalUrl"],
    }
  );

export type JobFormInput = z.infer<typeof jobFormSchema>;

/**
 * Membuat lowongan pekerjaan baru (Multi-Step Job Posting).
 * Menerapkan Logika Moderasi:
 * - isVerified = true -> status PUBLISHED
 * - isVerified = false -> status PENDING_REVIEW
 */
export async function createJobAction(
  input: JobFormInput
): Promise<ActionResponse<{ jobId: string; slug: string; status: JobStatus }>> {
  try {
    // Validasi sinkron input skema terlebih dahulu (0ms early-exit tanpa menyentuh database)
    const parsed = jobFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error:
          "Validasi formulir lowongan gagal. Silakan periksa kembali data isian.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Autentikasi diperlukan. Silakan masuk terlebih dahulu.",
      };
    }

    const company = user.company
      ? await prisma.company.findUnique({
          where: { id: user.company.id },
          include: { verification: true },
        })
      : await prisma.company.findUnique({
          where: { userId: user.id },
          include: { verification: true },
        });

    if (!company) {
      return {
        success: false,
        error:
          "Anda belum memiliki profil perusahaan. Silakan lengkapi profil perusahaan terlebih dahulu.",
      };
    }

    // Pastikan lokasi dan kategori valid
    const [location, category] = await Promise.all([
      prisma.location.findUnique({ where: { id: data.locationId } }),
      prisma.jobCategory.findUnique({ where: { id: data.categoryId } }),
    ]);

    if (!location || !category) {
      return {
        success: false,
        error: "Data lokasi atau kategori lowongan tidak valid.",
      };
    }

    // Logika Moderasi Otomatis
    const isVerified =
      company.isVerified ||
      company.verification?.status === VerificationStatus.APPROVED;
    const initialStatus = isVerified
      ? JobStatus.PUBLISHED
      : JobStatus.PENDING_REVIEW;

    // Generate unique slug
    const baseSlug = generateSlug(`${data.title}-${location.name}`);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.job.findUnique({ where: { slug: uniqueSlug } })) {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      uniqueSlug = `${baseSlug}-${randomSuffix}-${counter}`;
      counter++;
    }

    const deadlineDate = data.deadline ? new Date(data.deadline) : null;

    // Buat lowongan baru
    const newJob = await prisma.job.create({
      data: {
        creatorId: user.id,
        companyId: company.id,
        categoryId: category.id,
        locationId: location.id,
        title: data.title.trim(),
        slug: uniqueSlug,
        type: data.type,
        workplace: data.workplace,
        salaryMin:
          data.isSalaryDisclosed && data.salaryMin != null
            ? data.salaryMin
            : null,
        salaryMax:
          data.isSalaryDisclosed && data.salaryMax != null
            ? data.salaryMax
            : null,
        isSalaryDisclosed: data.isSalaryDisclosed,
        description: data.description.trim(),
        responsibilities: data.responsibilities.trim(),
        requirements: data.requirements.trim(),
        benefits: data.benefits ? data.benefits.trim() : null,
        education: data.education,
        experience: data.experience,
        isFreshGraduate: data.isFreshGraduate,
        applicationMethod: data.applicationMethod,
        applicationEmail:
          data.applicationMethod === ApplicationMethod.EMAIL &&
          data.applicationEmail
            ? data.applicationEmail.trim()
            : null,
        externalUrl:
          data.applicationMethod === ApplicationMethod.EXTERNAL_URL &&
          data.externalUrl
            ? data.externalUrl.trim()
            : null,
        deadline: deadlineDate,
        status: initialStatus,
      },
    });

    // Hubungkan Skills
    if (data.skills && data.skills.length > 0) {
      for (const skillName of data.skills) {
        const trimmed = skillName.trim();
        if (!trimmed) continue;
        const skillSlug = generateSlug(trimmed);

        const skill = await prisma.skill.upsert({
          where: { slug: skillSlug },
          create: { name: trimmed, slug: skillSlug },
          update: {},
        });

        await prisma.jobSkill
          .create({
            data: {
              jobId: newJob.id,
              skillId: skill.id,
            },
          })
          .catch(() => {
            // Abaikan jika duplikat
          });
      }
    }

    revalidatePath("/loker");
    revalidatePath(`/loker/${newJob.slug}`);
    revalidatePath("/dashboard/employer");
    revalidatePath("/dashboard/employer/loker");

    return {
      success: true,
      data: {
        jobId: newJob.id,
        slug: newJob.slug,
        status: newJob.status,
      },
    };
  } catch (error) {
    console.error("Error creating job posting:", error);
    return {
      success: false,
      error:
        "Terjadi kesalahan saat memproses pembuatan lowongan. Silakan coba lagi.",
    };
  }
}

/**
 * Memperbarui data lowongan yang sudah ada.
 */
export async function updateJobAction(
  jobId: string,
  input: JobFormInput
): Promise<ActionResponse<{ jobId: string; slug: string }>> {
  try {
    if (!jobId || typeof jobId !== "string") {
      return {
        success: false,
        error: "ID lowongan kerja tidak valid.",
      };
    }

    // Validasi sinkron input skema terlebih dahulu (0ms early-exit)
    const parsed = jobFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data edit lowongan gagal.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;

    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Autentikasi diperlukan. Silakan masuk terlebih dahulu.",
      };
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      return {
        success: false,
        error: "Lowongan kerja tidak ditemukan.",
      };
    }

    const isOwner =
      job.creatorId === user.id || job.company?.userId === user.id;
    const isSuperadmin = user.role === UserRole.SUPERADMIN;

    if (!isOwner && !isSuperadmin) {
      return {
        success: false,
        error: "Anda tidak memiliki izin untuk mengedit lowongan ini.",
      };
    }

    const deadlineDate = data.deadline ? new Date(data.deadline) : null;

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: data.title.trim(),
        categoryId: data.categoryId,
        locationId: data.locationId,
        type: data.type,
        workplace: data.workplace,
        salaryMin:
          data.isSalaryDisclosed && data.salaryMin != null
            ? data.salaryMin
            : null,
        salaryMax:
          data.isSalaryDisclosed && data.salaryMax != null
            ? data.salaryMax
            : null,
        isSalaryDisclosed: data.isSalaryDisclosed,
        description: data.description.trim(),
        responsibilities: data.responsibilities.trim(),
        requirements: data.requirements.trim(),
        benefits: data.benefits ? data.benefits.trim() : null,
        education: data.education,
        experience: data.experience,
        isFreshGraduate: data.isFreshGraduate,
        applicationMethod: data.applicationMethod,
        applicationEmail:
          data.applicationMethod === ApplicationMethod.EMAIL &&
          data.applicationEmail
            ? data.applicationEmail.trim()
            : null,
        externalUrl:
          data.applicationMethod === ApplicationMethod.EXTERNAL_URL &&
          data.externalUrl
            ? data.externalUrl.trim()
            : null,
        deadline: deadlineDate,
      },
    });

    // Perbarui relasi skills
    await prisma.jobSkill.deleteMany({ where: { jobId } });
    if (data.skills && data.skills.length > 0) {
      for (const skillName of data.skills) {
        const trimmed = skillName.trim();
        if (!trimmed) continue;
        const skillSlug = generateSlug(trimmed);

        const skill = await prisma.skill.upsert({
          where: { slug: skillSlug },
          create: { name: trimmed, slug: skillSlug },
          update: {},
        });

        await prisma.jobSkill
          .create({
            data: {
              jobId: updatedJob.id,
              skillId: skill.id,
            },
          })
          .catch(() => {});
      }
    }

    revalidatePath("/loker");
    revalidatePath(`/loker/${updatedJob.slug}`);
    revalidatePath("/dashboard/employer");
    revalidatePath("/dashboard/employer/loker");

    return {
      success: true,
      data: { jobId: updatedJob.id, slug: updatedJob.slug },
    };
  } catch (error) {
    console.error("Error updating job:", error);
    return {
      success: false,
      error: "Gagal memperbarui data lowongan. Silakan coba kembali.",
    };
  }
}

/**
 * Mengubah status publikasi lowongan (PUBLISHED, PAUSED, CLOSED).
 */
export async function updateJobStatusAction(
  jobId: string,
  newStatus: JobStatus
): Promise<ActionResponse<{ status: JobStatus }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          include: { verification: true },
        },
      },
    });

    if (!job) {
      return { success: false, error: "Lowongan tidak ditemukan." };
    }

    const isOwner =
      job.creatorId === user.id || job.company?.userId === user.id;
    const isSuperadmin = user.role === UserRole.SUPERADMIN;

    if (!isOwner && !isSuperadmin) {
      return {
        success: false,
        error: "Anda tidak berhak mengubah status lowongan ini.",
      };
    }

    // Jika ingin me-republish, pastikan perusahaan verified atau lowongan sudah pernah diapprove
    if (newStatus === JobStatus.PUBLISHED) {
      const isVerified =
        job.company?.isVerified ||
        job.company?.verification?.status === VerificationStatus.APPROVED;
      if (
        !isVerified &&
        job.status === JobStatus.PENDING_REVIEW &&
        !isSuperadmin
      ) {
        return {
          success: false,
          error:
            "Lowongan belum dapat dipublikasikan karena masih dalam peninjauan verifikasi admin.",
        };
      }
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { status: newStatus },
    });

    revalidatePath("/loker");
    revalidatePath(`/loker/${job.slug}`);
    revalidatePath("/dashboard/employer");
    revalidatePath("/dashboard/employer/loker");

    return {
      success: true,
      data: { status: updated.status },
    };
  } catch (error) {
    console.error("Error updating job status:", error);
    return { success: false, error: "Gagal memperbarui status lowongan." };
  }
}

/**
 * Menghapus lowongan kerja beserta dependensi relasi miliknya.
 */
export async function deleteJobAction(
  jobId: string
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      return { success: false, error: "Lowongan tidak ditemukan." };
    }

    const isOwner =
      job.creatorId === user.id || job.company?.userId === user.id;
    const isSuperadmin = user.role === UserRole.SUPERADMIN;

    if (!isOwner && !isSuperadmin) {
      return {
        success: false,
        error: "Anda tidak memiliki wewenang untuk menghapus lowongan ini.",
      };
    }

    await prisma.job.delete({ where: { id: jobId } });

    revalidatePath("/loker");
    revalidatePath("/dashboard/employer");
    revalidatePath("/dashboard/employer/loker");

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error("Error deleting job:", error);
    return {
      success: false,
      error: "Gagal menghapus lowongan. Silakan coba kembali.",
    };
  }
}

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
