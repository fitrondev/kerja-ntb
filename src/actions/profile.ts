"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

import type { ActionResponse } from "./types";

const profileSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter.").max(100),
  avatarUrl: z
    .string()
    .url("URL avatar tidak valid.")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,20}$/, "Format nomor telepon/WhatsApp tidak valid.")
    .optional()
    .or(z.literal("")),
  locationId: z.string().optional().or(z.literal("")),
  address: z
    .string()
    .max(300, "Alamat maksimal 300 karakter.")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(1000, "Bio maksimal 1000 karakter.")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z
    .enum(["LAKI_LAKI", "PEREMPUAN", "LAINNYA"])
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
  github: z
    .string()
    .url("URL GitHub tidak valid.")
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/**
 * Memperbarui data profil pencari kerja (dan relasi Profile di MySQL).
 */
export async function updateUserProfileAction(
  input: ProfileInput
): Promise<ActionResponse<{ profileId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Autentikasi diperlukan. Silakan masuk terlebih dahulu.",
      };
    }

    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validasi formulir profil gagal.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const {
      fullName,
      avatarUrl,
      phone,
      locationId,
      address,
      bio,
      dateOfBirth,
      gender,
      website,
      linkedIn,
      github,
    } = parsed.data;

    const parsedDate = dateOfBirth ? new Date(dateOfBirth) : null;

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: fullName.trim(),
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
        phone: phone ? phone.trim() : null,
        locationId: locationId && locationId !== "" ? locationId : null,
        address: address ? address.trim() : null,
        bio: bio ? bio.trim() : null,
        dateOfBirth: parsedDate,
        gender: gender || null,
        website: website ? website.trim() : null,
        linkedIn: linkedIn ? linkedIn.trim() : null,
        github: github ? github.trim() : null,
      },
      update: {
        fullName: fullName.trim(),
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
        phone: phone ? phone.trim() : null,
        locationId: locationId && locationId !== "" ? locationId : null,
        address: address ? address.trim() : null,
        bio: bio ? bio.trim() : null,
        dateOfBirth: parsedDate,
        gender: gender || null,
        website: website ? website.trim() : null,
        linkedIn: linkedIn ? linkedIn.trim() : null,
        github: github ? github.trim() : null,
      },
    });

    revalidatePath("/dashboard/user");
    revalidatePath("/dashboard/user/profile");

    return {
      success: true,
      data: { profileId: updatedProfile.id },
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: "Gagal menyimpan data profil. Silakan coba beberapa saat lagi.",
    };
  }
}
