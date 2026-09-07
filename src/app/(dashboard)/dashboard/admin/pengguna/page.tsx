import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import {
  UserItemData,
  UserRoleManagement,
} from "@/components/dashboard/admin/user-role-management";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Manajemen Pengguna & Role | KerjaNTB",
  description:
    "Ubah hak akses role pengguna (Superadmin, Perusahaan, Pencari Kerja) di platform KerjaNTB.",
};

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    include: {
      profile: true,
      company: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedUsers: UserItemData[] = users.map((u) => ({
    id: u.id,
    clerkId: u.clerkId,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: new Date(u.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    name:
      u.role === "COMPANY" && u.company?.name
        ? u.company.name
        : u.profile?.fullName || u.email.split("@")[0],
    avatarUrl: u.profile?.avatarUrl || u.company?.logoUrl || null,
    companyName: u.company?.name || null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Manajemen Pengguna &amp; Role Akun
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Ubah hak akses pengguna antara Superadmin, Perusahaan (Employer),
            dan Pencari Kerja secara langsung.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Admin</span>
          </Link>
        </Button>
      </div>

      <UserRoleManagement
        initialUsers={serializedUsers}
        currentAdminId={currentUser.id}
      />
    </div>
  );
}
