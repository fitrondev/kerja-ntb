import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isAdminRole } from "@/lib/auth/rbac";

import { SearchUsers } from "./SearchUsers";
import { removeRole, setRole } from "./_actions";

function getRoleBadge(role?: string | null) {
  if (!role) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Belum Ada Role
      </Badge>
    );
  }

  const normalized = role.toLowerCase();

  if (normalized === "admin" || normalized === "superadmin") {
    return (
      <Badge className="bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20 gap-1">
        <ShieldCheck className="h-3 w-3" />
        {role.toUpperCase()}
      </Badge>
    );
  }

  if (normalized === "company") {
    return (
      <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20 gap-1">
        <Building2 className="h-3 w-3" />
        COMPANY
      </Badge>
    );
  }

  if (normalized === "moderator") {
    return (
      <Badge className="gap-1 border-amber-500/30 bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400">
        <ShieldAlert className="h-3 w-3" />
        MODERATOR
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <User className="h-3 w-3" />
      {role.toUpperCase()}
    </Badge>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { sessionClaims } = await auth();
  const currentRole = sessionClaims?.metadata?.role;

  // Proteksi rute: Hanya role admin / superadmin yang diizinkan mengakses
  if (!isAdminRole(currentRole)) {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.search?.trim();

  const client = await clerkClient();

  // Ambil daftar pengguna berdasarkan pencarian atau tampilkan 15 pengguna terbaru
  const usersResponse = query
    ? await client.users.getUserList({ query, limit: 20 })
    : await client.users.getUserList({ limit: 15 });

  const users = usersResponse.data;

  return (
    <div className="bg-muted/20 min-h-screen py-10">
      <div className="container mx-auto max-w-6xl space-y-8 px-4">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm font-medium transition-colors"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Kembali ke Dashboard
              </Link>
              <span className="text-muted-foreground">•</span>
              <Badge variant="outline" className="bg-background">
                Clerk Metadata RBAC
              </Badge>
            </div>
            <h1 className="text-foreground flex items-center gap-2 text-3xl font-bold tracking-tight">
              <ShieldCheck className="text-primary h-7 w-7" />
              Manajemen Role Pengguna (RBAC)
            </h1>
            <p className="text-muted-foreground text-sm">
              Kelola otorisasi dan hak akses akun KerjaNTB secara
              tersentralisasi melalui Clerk Session Metadata.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              Role Anda:{" "}
              <strong className="ml-1 font-semibold uppercase">
                {currentRole}
              </strong>
            </Badge>
          </div>
        </div>

        {/* Petunjuk Konfigurasi Clerk Session Token */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              Sinkronisasi Klaim Session Token Clerk
            </CardTitle>
            <CardDescription className="text-xs">
              Pastikan template session token di{" "}
              <a
                href="https://dashboard.clerk.com/~/sessions"
                target="_blank"
                rel="noreferrer"
                className="text-primary inline-flex items-center gap-0.5 font-medium underline"
              >
                Clerk Dashboard &gt; Sessions{" "}
                <ExternalLink className="h-3 w-3" />
              </a>{" "}
              sudah menyertakan klaim metadata:
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <pre className="bg-muted text-foreground overflow-x-auto rounded-lg p-3 font-mono text-xs">
              {JSON.stringify(
                { metadata: "{{user.public_metadata}}" },
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>

        {/* Filter & Search Bar */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="text-muted-foreground h-5 w-5" />
                  Daftar Pengguna
                </CardTitle>
                <CardDescription className="text-xs">
                  {query
                    ? `Menampilkan hasil pencarian untuk "${query}" (${users.length} pengguna)`
                    : `Menampilkan ${users.length} pengguna terdaftar terbaru`}
                </CardDescription>
              </div>

              <SearchUsers />
            </div>
          </CardHeader>

          <CardContent>
            {users.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
                <Search className="mb-3 h-10 w-10 opacity-30" />
                <p className="text-foreground font-medium">
                  Pengguna tidak ditemukan
                </p>
                <p className="mt-1 max-w-sm text-xs">
                  Tidak ada pengguna yang cocok dengan kata kunci &quot;{query}
                  &quot;. Coba cari dengan email atau nama lengkap lainnya.
                </p>
              </div>
            ) : (
              <div className="divide-border border-border divide-y rounded-lg border">
                {users.map((user) => {
                  const primaryEmail = user.emailAddresses.find(
                    (email) => email.id === user.primaryEmailAddressId
                  )?.emailAddress;

                  const fullName =
                    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                    "Pengguna Tanpa Nama";

                  const userRole =
                    (user.publicMetadata?.role as string) || null;

                  return (
                    <div
                      key={user.id}
                      className="hover:bg-muted/30 flex flex-col justify-between gap-4 p-4 transition-colors lg:flex-row lg:items-center"
                    >
                      {/* Identitas Pengguna */}
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.imageUrl} alt={fullName} />
                          <AvatarFallback className="text-xs font-semibold">
                            {fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-foreground truncate text-sm font-semibold">
                              {fullName}
                            </span>
                            {getRoleBadge(userRole)}
                          </div>
                          <p className="text-muted-foreground truncate text-xs">
                            {primaryEmail || "Email tidak tersedia"}
                          </p>
                          <p className="text-muted-foreground font-mono text-[11px]">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>

                      {/* Tombol Aksi Penetapan Role */}
                      <div className="flex flex-wrap items-center gap-1.5 self-end lg:self-center">
                        {/* Jadikan Admin */}
                        <form action={setRole}>
                          <input type="hidden" value={user.id} name="id" />
                          <input type="hidden" value="admin" name="role" />
                          <Button
                            type="submit"
                            size="sm"
                            variant={
                              userRole?.toLowerCase() === "admin"
                                ? "default"
                                : "outline"
                            }
                            className="h-8 text-xs"
                          >
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                            Admin
                          </Button>
                        </form>

                        {/* Jadikan Company / Perusahaan */}
                        <form action={setRole}>
                          <input type="hidden" value={user.id} name="id" />
                          <input type="hidden" value="COMPANY" name="role" />
                          <Button
                            type="submit"
                            size="sm"
                            variant={
                              userRole?.toUpperCase() === "COMPANY"
                                ? "default"
                                : "outline"
                            }
                            className="h-8 text-xs"
                          >
                            <Building2 className="mr-1 h-3.5 w-3.5" />
                            Company
                          </Button>
                        </form>

                        {/* Jadikan Individual / Pencari Kerja */}
                        <form action={setRole}>
                          <input type="hidden" value={user.id} name="id" />
                          <input type="hidden" value="INDIVIDUAL" name="role" />
                          <Button
                            type="submit"
                            size="sm"
                            variant={
                              userRole?.toUpperCase() === "INDIVIDUAL"
                                ? "default"
                                : "outline"
                            }
                            className="h-8 text-xs"
                          >
                            <UserCheck className="mr-1 h-3.5 w-3.5" />
                            Individual
                          </Button>
                        </form>

                        {/* Jadikan Moderator */}
                        <form action={setRole}>
                          <input type="hidden" value={user.id} name="id" />
                          <input type="hidden" value="moderator" name="role" />
                          <Button
                            type="submit"
                            size="sm"
                            variant={
                              userRole?.toLowerCase() === "moderator"
                                ? "default"
                                : "outline"
                            }
                            className="h-8 text-xs"
                          >
                            <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                            Moderator
                          </Button>
                        </form>

                        {/* Hapus Role */}
                        {userRole && (
                          <form action={removeRole}>
                            <input type="hidden" value={user.id} name="id" />
                            <Button
                              type="submit"
                              size="sm"
                              variant="destructive"
                              className="h-8 text-xs"
                            >
                              Hapus Role
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
