"use server";

import { revalidatePath } from "next/cache";

import { auth, clerkClient } from "@clerk/nextjs/server";

import { isAdminRole } from "@/lib/auth/rbac";

export async function setRole(formData: FormData): Promise<void> {
  const { sessionClaims } = await auth();

  // Pastikan hanya admin / superadmin yang dapat mengubah role
  if (!isAdminRole(sessionClaims?.metadata?.role)) {
    throw new Error("Not Authorized: Akses Ditolak");
  }

  const userId = formData.get("id");
  const role = formData.get("role");

  if (
    typeof userId !== "string" ||
    !userId ||
    typeof role !== "string" ||
    !role
  ) {
    throw new Error("ID pengguna atau Role tidak valid.");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  revalidatePath("/admin");
}

export async function removeRole(formData: FormData): Promise<void> {
  const { sessionClaims } = await auth();

  if (!isAdminRole(sessionClaims?.metadata?.role)) {
    throw new Error("Not Authorized: Akses Ditolak");
  }

  const userId = formData.get("id");

  if (typeof userId !== "string" || !userId) {
    throw new Error("ID pengguna tidak valid.");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: null },
  });

  revalidatePath("/admin");
}
