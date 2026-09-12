"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { UserRole, VerificationStatus } from "@/generated/prisma/enums";
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

const companyProfileSchema = z.object({
  name: z.string().min(2, "Nama perusahaan minimal 2 karakter.").max(120),
  industry: z.string().min(2, "Bidang industri wajib diisi.").max(100),
  companySize: z.string().optional().or(z.literal("")),
  foundedYear: z.coerce
    .number()
    .int()
    .min(1900, "Tahun berdiri tidak valid.")
    .max(
      new Date().getFullYear(),
      "Tahun berdiri tidak boleh melebihi tahun sekarang."
    )
    .optional()
    .nullable(),
  locationId: z.string().min(1, "Pilih salah satu Kabupaten/Kota di NTB."),
  address: z
    .string()
    .min(5, "Alamat kantor perusahaan minimal 5 karakter.")
    .max(300),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,20}$/, "Format nomor telepon tidak valid.")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Format email perusahaan tidak valid.")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("URL website tidak valid.")
    .optional()
    .or(z.literal("")),
  linkedIn: z
    .string()
    .url("URL LinkedIn tidak valid.")
    .optional()
    .or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  description: z
    .string()
    .min(10, "Deskripsi profil perusahaan minimal 10 karakter.")
    .max(5000, "Deskripsi profil perusahaan maksimal 5000 karakter."),
  logoUrl: z
    .string()
    .url("URL logo tidak valid.")
    .or(z.string().startsWith("/"))
    .optional()
    .or(z.literal("")),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

/**
 * Membuat atau memperbarui profil perusahaan pemberi kerja.
 */
export async function upsertCompanyProfileAction(
  input: CompanyProfileInput
): Promise<ActionResponse<{ companyId: string; slug: string }>> {
  try {
    // Validasi sinkron input data profil perusahaan (0ms early-exit)
    const parsed = companyProfileSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data profil perusahaan gagal.",
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

    // Pastikan lokasi valid
    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
    });
    if (!location) {
      return {
        success: false,
        error: "Wilayah Kabupaten/Kota NTB yang dipilih tidak valid.",
      };
    }

    // Cari apakah perusahaan sudah ada untuk pengguna ini
    const existingCompany = await prisma.company.findUnique({
      where: { userId: user.id },
    });

    let slug = existingCompany?.slug;
    if (!existingCompany) {
      // Buat base slug yang unik
      let baseSlug = generateSlug(data.name);
      if (!baseSlug) {
        baseSlug = "perusahaan";
      }

      let candidateSlug = baseSlug;
      let counter = 1;
      while (
        await prisma.company.findUnique({ where: { slug: candidateSlug } })
      ) {
        candidateSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      slug = candidateSlug;
    }

    const companyData = {
      name: data.name.trim(),
      industry: data.industry.trim(),
      companySize: data.companySize ? data.companySize.trim() : null,
      foundedYear: data.foundedYear || null,
      locationId: data.locationId,
      address: data.address.trim(),
      phone: data.phone ? data.phone.trim() : null,
      email: data.email ? data.email.trim() : null,
      website: data.website ? data.website.trim() : null,
      linkedIn: data.linkedIn ? data.linkedIn.trim() : null,
      instagram: data.instagram ? data.instagram.trim() : null,
      description: data.description.trim(),
      logoUrl: data.logoUrl ? data.logoUrl.trim() : null,
    };

    let company;
    if (existingCompany) {
      company = await prisma.company.update({
        where: { id: existingCompany.id },
        data: companyData,
      });
    } else {
      company = await prisma.company.create({
        data: {
          ...companyData,
          slug: slug!,
          userId: user.id,
        },
      });

      // Update user role ke COMPANY jika sebelumnya INDIVIDUAL
      if (user.role === UserRole.INDIVIDUAL) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.COMPANY },
        });
      }
    }

    revalidatePath("/dashboard/company");
    revalidatePath("/dashboard/employer");
    revalidatePath("/dashboard/loker/baru");
    revalidatePath(`/perusahaan/${company.slug}`);

    return {
      success: true,
      data: {
        companyId: company.id,
        slug: company.slug,
      },
    };
  } catch (error) {
    console.error("Error upsert company profile:", error);
    return {
      success: false,
      error:
        "Terjadi kesalahan saat menyimpan data perusahaan. Silakan coba lagi.",
    };
  }
}

const companyVerificationSchema = z.object({
  legalName: z
    .string()
    .min(3, "Nama legal badan usaha minimal 3 karakter.")
    .max(150, "Nama legal maksimal 150 karakter."),
  nib: z
    .string()
    .regex(
      /^\d{13}$/,
      "Nomor Induk Berusaha (NIB) wajib terdiri dari 13 digit angka."
    ),
  taxId: z
    .string()
    .max(30, "NPWP maksimal 30 karakter.")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "Alamat domisili legal perusahaan minimal 5 karakter.")
    .max(300),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,20}$/, "Nomor telepon operasional tidak valid."),
  email: z.string().email("Email resmi perusahaan tidak valid."),
  website: z
    .string()
    .url("URL website tidak valid.")
    .optional()
    .or(z.literal("")),
  documentUrl: z
    .string()
    .min(1, "Dokumen bukti NIB / Izin Usaha wajib diunggah."),
});

export type CompanyVerificationInput = z.infer<
  typeof companyVerificationSchema
>;

/**
 * Mengajukan verifikasi legalitas Nomor Induk Berusaha (NIB) ke tim kurator Superadmin.
 */
export async function submitCompanyVerificationAction(
  input: CompanyVerificationInput
): Promise<ActionResponse<{ verificationId: string }>> {
  try {
    // Validasi sinkron input pengajuan NIB terlebih dahulu (0ms early-exit)
    const parsed = companyVerificationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi data pengajuan NIB gagal.",
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
          "Mohon lengkapi profil perusahaan terlebih dahulu sebelum mengajukan verifikasi NIB.",
      };
    }

    const verification = await prisma.companyVerification.upsert({
      where: { companyId: company.id },
      create: {
        companyId: company.id,
        legalName: data.legalName.trim(),
        nib: data.nib.trim(),
        taxId: data.taxId ? data.taxId.trim() : null,
        address: data.address.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        website: data.website ? data.website.trim() : null,
        documentUrl: data.documentUrl.trim(),
        status: VerificationStatus.PENDING,
        rejectionReason: null,
      },
      update: {
        legalName: data.legalName.trim(),
        nib: data.nib.trim(),
        taxId: data.taxId ? data.taxId.trim() : null,
        address: data.address.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        website: data.website ? data.website.trim() : null,
        documentUrl: data.documentUrl.trim(),
        status: VerificationStatus.PENDING,
        rejectionReason: null,
      },
    });

    revalidatePath("/dashboard/verification");
    revalidatePath("/dashboard/employer");

    return {
      success: true,
      data: { verificationId: verification.id },
    };
  } catch (error) {
    console.error("Error submitting company verification:", error);
    return {
      success: false,
      error:
        "Terjadi kesalahan saat memproses pengajuan verifikasi NIB. Silakan coba kembali.",
    };
  }
}
