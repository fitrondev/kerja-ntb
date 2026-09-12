"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

import type { ActionResponse } from "./types";

const educationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(2, "Nama institusi/kampus minimal 2 karakter."),
  degree: z.string().min(1, "Jenjang pendidikan wajib diisi."),
  fieldOfStudy: z.string().min(1, "Bidang studi/jurusan wajib diisi."),
  startDate: z.string().min(4, "Tahun mulai wajib diisi."),
  endDate: z.string().optional().or(z.literal("")),
  isCurrent: z.boolean().default(false),
  grade: z.string().optional().or(z.literal("")),
});

const experienceItemSchema = z.object({
  id: z.string().optional(),
  companyName: z
    .string()
    .min(2, "Nama perusahaan/organisasi minimal 2 karakter."),
  position: z.string().min(2, "Jabatan/posisi minimal 2 karakter."),
  location: z.string().optional().or(z.literal("")),
  startDate: z.string().min(4, "Tahun mulai wajib diisi."),
  endDate: z.string().optional().or(z.literal("")),
  isCurrent: z.boolean().default(false),
  description: z.string().optional().or(z.literal("")),
});

const saveResumeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Judul CV minimal 2 karakter.").max(100),
  summary: z
    .string()
    .max(2000, "Ringkasan profesional maksimal 2000 karakter.")
    .optional()
    .or(z.literal("")),
  fileUrl: z
    .string()
    .url("URL berkas tidak valid.")
    .or(z.string().startsWith("/"))
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean().default(false),
  educations: z.array(educationItemSchema).default([]),
  experiences: z.array(experienceItemSchema).default([]),
});

export type SaveResumeInput = z.infer<typeof saveResumeSchema>;

/**
 * Membuat atau memperbarui Resume lengkap beserta riwayat pendidikan & pengalaman.
 */
export async function saveResumeAction(
  input: SaveResumeInput
): Promise<ActionResponse<{ resumeId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Autentikasi diperlukan. Silakan masuk terlebih dahulu.",
      };
    }

    const parsed = saveResumeSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data resume gagal.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { id, title, summary, fileUrl, isDefault, educations, experiences } =
      parsed.data;

    // Jika isDefault diatur true, reset resume lainnya
    if (isDefault) {
      await prisma.resume.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    let resumeId = id;

    if (id) {
      // Pastikan resume milik user
      const existing = await prisma.resume.findUnique({
        where: { id, userId: user.id },
      });
      if (!existing) {
        return {
          success: false,
          error: "Resume tidak ditemukan atau Anda tidak memiliki akses.",
        };
      }

      await prisma.resume.update({
        where: { id },
        data: {
          title: title.trim(),
          summary: summary ? summary.trim() : null,
          fileUrl: fileUrl && fileUrl !== "" ? fileUrl : null,
          isDefault,
        },
      });

      // Hapus pendidikan & pengalaman lama lalu masukkan yang baru
      await prisma.education.deleteMany({ where: { resumeId: id } });
      await prisma.experience.deleteMany({ where: { resumeId: id } });
    } else {
      // Periksa apakah ini resume pertama, jika ya jadikan default
      const totalResumes = await prisma.resume.count({
        where: { userId: user.id },
      });
      const makeDefault = totalResumes === 0 || isDefault;

      const newResume = await prisma.resume.create({
        data: {
          userId: user.id,
          title: title.trim(),
          summary: summary ? summary.trim() : null,
          fileUrl: fileUrl && fileUrl !== "" ? fileUrl : null,
          isDefault: makeDefault,
        },
      });
      resumeId = newResume.id;
    }

    // Masukkan data Pendidikan
    if (resumeId && educations.length > 0) {
      await prisma.education.createMany({
        data: educations.map((edu) => ({
          resumeId: resumeId as string,
          institution: edu.institution.trim(),
          degree: edu.degree.trim(),
          fieldOfStudy: edu.fieldOfStudy.trim(),
          startDate: new Date(edu.startDate),
          endDate: edu.endDate && !edu.isCurrent ? new Date(edu.endDate) : null,
          isCurrent: edu.isCurrent,
          grade: edu.grade ? edu.grade.trim() : null,
        })),
      });
    }

    // Masukkan data Pengalaman
    if (resumeId && experiences.length > 0) {
      await prisma.experience.createMany({
        data: experiences.map((exp) => ({
          resumeId: resumeId as string,
          companyName: exp.companyName.trim(),
          position: exp.position.trim(),
          location: exp.location ? exp.location.trim() : null,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate && !exp.isCurrent ? new Date(exp.endDate) : null,
          isCurrent: exp.isCurrent,
          description: exp.description ? exp.description.trim() : null,
        })),
      });
    }

    revalidatePath("/dashboard/user");
    revalidatePath("/dashboard/user/resume");

    return {
      success: true,
      data: { resumeId: resumeId as string },
    };
  } catch (error) {
    console.error("Error saving resume:", error);
    return {
      success: false,
      error: "Gagal menyimpan data resume. Silakan coba kembali.",
    };
  }
}

/**
 * Menghapus Resume milik pengguna.
 */
export async function deleteResumeAction(
  resumeId: string
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    const existing = await prisma.resume.findUnique({
      where: { id: resumeId, userId: user.id },
    });

    if (!existing) {
      return { success: false, error: "Resume tidak ditemukan." };
    }

    await prisma.resume.delete({ where: { id: resumeId } });

    revalidatePath("/dashboard/user");
    revalidatePath("/dashboard/user/resume");

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error("Error deleting resume:", error);
    return { success: false, error: "Gagal menghapus resume." };
  }
}

/**
 * Menetapkan satu Resume sebagai resume utama (default).
 */
export async function setDefaultResumeAction(
  resumeId: string
): Promise<ActionResponse<{ isDefault: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    // Set all others to false
    await prisma.resume.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    // Set targeted resume to true
    await prisma.resume.update({
      where: { id: resumeId, userId: user.id },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard/user");
    revalidatePath("/dashboard/user/resume");

    return { success: true, data: { isDefault: true } };
  } catch (error) {
    console.error("Error setting default resume:", error);
    return { success: false, error: "Gagal menetapkan resume default." };
  }
}
