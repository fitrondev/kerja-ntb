"use server";

import { revalidatePath } from "next/cache";

import { clerkClient } from "@clerk/nextjs/server";

import { UserRole } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

import type { ActionResponse } from "./types";

interface UpdateUserRoleParams {
  targetUserId: string;
  newRole: UserRole;
}

/**
 * Server Action untuk mengubah role akun pengguna di platform KerjaNTB.
 * Wajib dijalankan oleh akun dengan role SUPERADMIN.
 * Memperbarui data di MySQL via Prisma dan menyinkronkan metadata ke Clerk.
 */
export async function updateUserRoleAction(
  params: UpdateUserRoleParams
): Promise<ActionResponse<{ role: UserRole }>> {
  try {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "SUPERADMIN") {
      return {
        success: false,
        error:
          "Akses ditolak. Hanya Superadmin yang memiliki otoritas untuk mengubah role pengguna.",
      };
    }

    const { targetUserId, newRole } = params;

    if (!targetUserId || !newRole) {
      return {
        success: false,
        error: "Parameter target pengguna atau role baru tidak valid.",
      };
    }

    // Validasi target user di database
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { company: true },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Pengguna tidak ditemukan dalam sistem.",
      };
    }

    // Update role di MySQL via Prisma
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    // Jika role diubah menjadi COMPANY dan belum memiliki entitas Company, buatkan data awal
    if (newRole === "COMPANY" && !targetUser.company) {
      const emailPrefix = targetUser.email.split("@")[0];
      const companyName = `PT ${emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)} NTB`;
      const baseSlug = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      await prisma.company.create({
        data: {
          userId: targetUserId,
          name: companyName,
          slug,
        },
      });
    }

    // Sinkronkan metadata role ke Clerk agar session JWT terbarui
    try {
      if (targetUser.clerkId && !targetUser.clerkId.startsWith("demo_clerk_")) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(targetUser.clerkId, {
          publicMetadata: {
            role: newRole,
          },
        });
      }
    } catch (clerkErr) {
      console.warn("[Clerk Metadata Sync Warning]:", clerkErr);
    }

    // Invalidate cache halaman dashboard
    revalidatePath("/dashboard/admin/pengguna");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { role: updatedUser.role },
    };
  } catch (error) {
    console.error("[updateUserRoleAction Error]:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan internal saat memperbarui role pengguna.",
    };
  }
}
