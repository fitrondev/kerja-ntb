"use client";

import * as React from "react";

import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { updateUserRoleAction } from "@/actions/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/generated/prisma/enums";

export interface UserItemData {
  id: string;
  clerkId: string;
  email: string;
  role: UserRole;
  status: string;
  createdAt: string;
  name: string;
  avatarUrl?: string | null;
  companyName?: string | null;
}

interface UserRoleManagementProps {
  initialUsers: UserItemData[];
  currentAdminId: string;
}

const roleOptions: {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  badgeClass: string;
}[] = [
  {
    value: "SUPERADMIN",
    label: "Superadmin",
    description: "Akses penuh platform, moderasi loker, NIB, & user",
    icon: Shield,
    badgeClass:
      "bg-primary/15 text-primary border-primary/25 hover:bg-primary/20",
  },
  {
    value: "COMPANY",
    label: "Perusahaan (Employer)",
    description: "Pasang lowongan, kelola pelamar, verifikasi NIB",
    icon: Building2,
    badgeClass:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25 hover:bg-blue-500/20",
  },
  {
    value: "INDIVIDUAL",
    label: "Pencari Kerja (Pelamar)",
    description: "Cari loker NTB, lamaran kerja, & resume multi-CV",
    icon: User,
    badgeClass:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20",
  },
];

export function UserRoleManagement({
  initialUsers,
  currentAdminId,
}: UserRoleManagementProps) {
  const [users, setUsers] = React.useState<UserItemData[]>(initialUsers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterRole, setFilterRole] = React.useState<string>("ALL");
  const [loadingUserId, setLoadingUserId] = React.useState<string | null>(null);

  // Filter pencarian & kategori role
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchesRole = filterRole === "ALL" ? true : u.role === filterRole;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.companyName && u.companyName.toLowerCase().includes(query));

      return matchesRole && matchesSearch;
    });
  }, [users, filterRole, searchQuery]);

  // Handler update role
  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser || targetUser.role === newRole) return;

    setLoadingUserId(targetUserId);

    try {
      const res = await updateUserRoleAction({
        targetUserId,
        newRole,
      });

      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
        );
        const roleLabel =
          roleOptions.find((r) => r.value === newRole)?.label || newRole;
        toast.success("Role Akun Berhasil Diperbarui", {
          description: `Akun ${targetUser.name} kini memiliki hak akses sebagai ${roleLabel}.`,
        });
      } else {
        toast.error("Gagal Memperbarui Role", {
          description: res.error || "Terjadi kendala saat mengubah role.",
        });
      }
    } catch (err) {
      toast.error("Kesalahan Sistem", {
        description:
          err instanceof Error ? err.message : "Gagal memproses permintaan.",
      });
    } finally {
      setLoadingUserId(null);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Hitung jumlah per role
  const counts = React.useMemo(() => {
    return {
      all: users.length,
      superadmin: users.filter((u) => u.role === "SUPERADMIN").length,
      company: users.filter((u) => u.role === "COMPANY").length,
      individual: users.filter((u) => u.role === "INDIVIDUAL").length,
    };
  }, [users]);

  return (
    <div className="space-y-4">
      {/* Kontrol Filter & Pencarian */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tab Filter Role */}
        <div className="border-border bg-card flex flex-wrap items-center gap-1.5 rounded-xl border p-1">
          <Button
            variant={filterRole === "ALL" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterRole("ALL")}
            className="h-8 rounded-lg text-xs"
          >
            Semua ({counts.all})
          </Button>
          <Button
            variant={filterRole === "SUPERADMIN" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterRole("SUPERADMIN")}
            className="h-8 gap-1.5 rounded-lg text-xs"
          >
            <Shield className="size-3" />
            <span>Superadmin ({counts.superadmin})</span>
          </Button>
          <Button
            variant={filterRole === "COMPANY" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterRole("COMPANY")}
            className="h-8 gap-1.5 rounded-lg text-xs"
          >
            <Building2 className="size-3" />
            <span>Perusahaan ({counts.company})</span>
          </Button>
          <Button
            variant={filterRole === "INDIVIDUAL" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterRole("INDIVIDUAL")}
            className="h-8 gap-1.5 rounded-lg text-xs"
          >
            <User className="size-3" />
            <span>Pelamar ({counts.individual})</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-xl pl-9 text-xs"
          />
        </div>
      </div>

      {/* Card Daftar Pengguna */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base font-bold">
            <span className="flex items-center gap-2">
              <Users className="text-primary size-4.5" />
              <span>Daftar Akun Pengguna ({filteredUsers.length})</span>
            </span>
            <span className="text-muted-foreground text-xs font-normal">
              Klik badge role untuk mengubah hak akses
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-xs">
              <Users className="text-muted-foreground/60 mx-auto mb-2 size-8" />
              <span className="text-foreground block font-semibold">
                Tidak Ada Pengguna Ditemukan
              </span>
              <span className="mt-1 block">
                Coba sesuaikan kata kunci pencarian atau filter role.
              </span>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const roleMeta =
                roleOptions.find((r) => r.value === u.role) || roleOptions[2];
              const isLoading = loadingUserId === u.id;
              const isSelf = u.id === currentAdminId;

              return (
                <div
                  key={u.id}
                  className="border-border/70 hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
                >
                  {/* Identitas Pengguna */}
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="border-border h-10 w-10 shrink-0 rounded-xl border">
                      {u.avatarUrl && (
                        <AvatarImage src={u.avatarUrl} alt={u.name} />
                      )}
                      <AvatarFallback className="bg-primary/15 text-primary rounded-xl text-xs font-bold">
                        {getInitials(u.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground truncate text-sm font-bold">
                          {u.name}
                        </span>
                        {isSelf && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-0 px-1.5 py-0 text-[10px]"
                          >
                            Akun Anda
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Mail className="text-primary size-3" />
                          <span className="truncate">{u.email}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          <span>{u.createdAt}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role Selector Dropdown */}
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={isLoading}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 gap-2 rounded-xl border text-xs font-semibold ${roleMeta.badgeClass}`}
                        >
                          {isLoading ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <roleMeta.icon className="size-3.5 shrink-0" />
                          )}
                          <span>{roleMeta.label}</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="w-64 rounded-xl p-2 shadow-lg"
                      >
                        <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-xs font-semibold">
                          Ubah Hak Akses / Role:
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {roleOptions.map((opt) => {
                          const isSelected = u.role === opt.value;
                          return (
                            <DropdownMenuItem
                              key={opt.value}
                              onClick={() => handleRoleChange(u.id, opt.value)}
                              className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2"
                            >
                              <div
                                className={`mt-0.5 rounded-md p-1 ${
                                  opt.value === "SUPERADMIN"
                                    ? "bg-primary/15 text-primary"
                                    : opt.value === "COMPANY"
                                      ? "bg-blue-500/15 text-blue-600"
                                      : "bg-emerald-500/15 text-emerald-600"
                                }`}
                              >
                                <opt.icon className="size-3.5" />
                              </div>
                              <div className="grid flex-1 leading-snug">
                                <div className="flex items-center justify-between">
                                  <span className="text-foreground text-xs font-bold">
                                    {opt.label}
                                  </span>
                                  {isSelected && (
                                    <Check className="text-primary size-3.5 font-bold" />
                                  )}
                                </div>
                                <span className="text-muted-foreground mt-0.5 text-[10px] leading-tight">
                                  {opt.description}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
