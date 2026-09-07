"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@clerk/nextjs";
import {
  AlertTriangle,
  ArrowUpRight,
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  CheckSquare,
  ChevronsUpDown,
  Compass,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  PlusCircle,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export type RoleType = "SUPERADMIN" | "COMPANY" | "INDIVIDUAL";

export interface SidebarUserData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: RoleType;
  companyName?: string | null;
  isVerified?: boolean;
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: SidebarUserData | null;
}

// ---------------------------------------------------------------------------
// Definisi Menu Per Role
// ---------------------------------------------------------------------------

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string | null;
  badgeVariant?:
    "default" | "secondary" | "destructive" | "outline" | "warning";
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Menu untuk SUPERADMIN (Mencakup seluruh fungsionalitas sistem web)
 */
const superadminGroups: NavGroup[] = [
  {
    label: "Kendali Platform",
    items: [
      {
        title: "Ringkasan Sistem",
        url: "/dashboard/admin",
        icon: LayoutDashboard,
        badge: null,
      },
      {
        title: "Moderasi Lowongan",
        url: "/dashboard/admin/moderasi",
        icon: CheckSquare,
        badge: "Review",
        badgeVariant: "warning",
      },
      {
        title: "Verifikasi NIB NTB",
        url: "/dashboard/admin/verifikasi",
        icon: ShieldCheck,
        badge: "NIB",
        badgeVariant: "default",
      },
      {
        title: "Laporan Pelanggaran",
        url: "/dashboard/admin/laporan",
        icon: AlertTriangle,
        badge: "Laporan",
        badgeVariant: "destructive",
      },
    ],
  },
  {
    label: "Manajemen Data & Pengguna",
    items: [
      {
        title: "Manajemen Pengguna & Role",
        url: "/dashboard/admin/pengguna",
        icon: Users,
        badge: "Ubah Role",
        badgeVariant: "secondary",
      },
      {
        title: "Daftar Perusahaan",
        url: "/dashboard/admin/perusahaan",
        icon: Building2,
        badge: null,
      },
      {
        title: "Semua Lowongan Loker",
        url: "/dashboard/admin/loker",
        icon: Briefcase,
        badge: null,
      },
      {
        title: "Wilayah & Kategori",
        url: "/dashboard/admin/master-data",
        icon: MapPin,
        badge: "10 Kab/Kota",
      },
    ],
  },
  {
    label: "Pintasan Operasional",
    items: [
      {
        title: "Dashboard Perusahaan",
        url: "/dashboard/employer",
        icon: Briefcase,
        badge: null,
      },
      {
        title: "Pasang Loker Baru",
        url: "/dashboard/loker/baru",
        icon: PlusCircle,
        badge: "Form",
      },
      {
        title: "Dashboard Pencari Kerja",
        url: "/dashboard/user",
        icon: User,
        badge: null,
      },
      {
        title: "Resume & CV Builder",
        url: "/dashboard/user/resume",
        icon: FileText,
        badge: null,
      },
    ],
  },
  {
    label: "Portal Publik",
    items: [
      {
        title: "Jelajah Lowongan NTB",
        url: "/loker",
        icon: Compass,
        badge: null,
      },
      {
        title: "Halaman Utama",
        url: "/",
        icon: ArrowUpRight,
        badge: null,
      },
    ],
  },
];

/**
 * Menu untuk COMPANY (Pemberi Kerja / Perusahaan)
 */
const companyGroups: NavGroup[] = [
  {
    label: "Rekrutmen & Lowongan",
    items: [
      {
        title: "Dashboard Perusahaan",
        url: "/dashboard/employer",
        icon: LayoutDashboard,
        badge: null,
      },
      {
        title: "Pasang Loker Baru",
        url: "/dashboard/loker/baru",
        icon: PlusCircle,
        badge: "Pro",
        badgeVariant: "default",
      },
      {
        title: "Kelola Lowongan",
        url: "/dashboard/employer/loker",
        icon: Briefcase,
        badge: null,
      },
      {
        title: "Pelamar & Seleksi",
        url: "/dashboard/employer/pelamar",
        icon: FileCheck2,
        badge: "Kandidat",
        badgeVariant: "secondary",
      },
    ],
  },
  {
    label: "Profil & Legalitas Usaha",
    items: [
      {
        title: "Profil Perusahaan",
        url: "/dashboard/company",
        icon: Building2,
        badge: null,
      },
      {
        title: "Verifikasi NIB NTB",
        url: "/dashboard/verification",
        icon: ShieldCheck,
        badge: "Penting",
        badgeVariant: "warning",
      },
    ],
  },
  {
    label: "Eksplorasi",
    items: [
      {
        title: "Cari Lowongan Lain di NTB",
        url: "/loker",
        icon: Compass,
        badge: null,
      },
      {
        title: "Halaman Utama",
        url: "/",
        icon: ArrowUpRight,
        badge: null,
      },
    ],
  },
];

/**
 * Menu untuk INDIVIDUAL (Pencari Kerja / Pelamar)
 */
const individualGroups: NavGroup[] = [
  {
    label: "Karir & Lamaran",
    items: [
      {
        title: "Dashboard Saya",
        url: "/dashboard/user",
        icon: LayoutDashboard,
        badge: null,
      },
      {
        title: "Cari Lowongan NTB",
        url: "/loker",
        icon: Compass,
        badge: null,
      },
      {
        title: "Lamaran Saya",
        url: "/dashboard/user/applications",
        icon: FileCheck2,
        badge: null,
      },
      {
        title: "Resume & CV",
        url: "/dashboard/user/resume",
        icon: FileText,
        badge: "Multi-CV",
        badgeVariant: "secondary",
      },
      {
        title: "Loker Tersimpan",
        url: "/dashboard/user/saved",
        icon: Bookmark,
        badge: null,
      },
    ],
  },
  {
    label: "Pengaturan Akun",
    items: [
      {
        title: "Profil Saya",
        url: "/dashboard/user/profile",
        icon: User,
        badge: null,
      },
    ],
  },
  {
    label: "Eksplorasi",
    items: [
      {
        title: "Halaman Utama",
        url: "/",
        icon: ArrowUpRight,
        badge: null,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Komponen AppSidebar Utama
// ---------------------------------------------------------------------------

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  // Ambil role asli dari database; default ke INDIVIDUAL bila belum terautentikasi
  const activeRole: RoleType = user?.role || "INDIVIDUAL";

  // Pilih konfigurasi menu yang tepat berdasarkan role
  const currentNavGroups = React.useMemo(() => {
    switch (activeRole) {
      case "SUPERADMIN":
        return superadminGroups;
      case "COMPANY":
        return companyGroups;
      case "INDIVIDUAL":
      default:
        return individualGroups;
    }
  }, [activeRole]);

  // Ekstraksi data profil riil
  const displayName =
    activeRole === "COMPANY" && user?.companyName
      ? user.companyName
      : user?.name || "Pengguna KerjaNTB";

  const displayEmail = user?.email || "user@kerjantb.id";
  const displayAvatar = user?.avatarUrl || null;

  // Inisial untuk Avatar Fallback
  const initials = React.useMemo(() => {
    if (!displayName) return "NTB";
    const parts = displayName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [displayName]);

  // Label & Styling Role Badge
  const roleMeta = React.useMemo(() => {
    switch (activeRole) {
      case "SUPERADMIN":
        return {
          label: "Superadmin",
          badgeClass:
            "bg-primary/15 text-primary border-primary/25 hover:bg-primary/20",
          icon: Shield,
        };
      case "COMPANY":
        return {
          label: user?.isVerified ? "Perusahaan (NIB)" : "Perusahaan",
          badgeClass:
            "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25 hover:bg-blue-500/20",
          icon: Building2,
        };
      case "INDIVIDUAL":
      default:
        return {
          label: "Pencari Kerja",
          badgeClass:
            "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20",
          icon: User,
        };
    }
  }, [activeRole, user?.isVerified]);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header Sidebar: Logo Brand & Status Badge */}
      <SidebarHeader className="border-sidebar-border border-b px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href={
                  activeRole === "SUPERADMIN"
                    ? "/dashboard/admin"
                    : activeRole === "COMPANY"
                      ? "/dashboard/employer"
                      : "/dashboard/user"
                }
                className="flex items-center gap-3"
              >
                <div className="bg-primary/10 flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                  <Image
                    src="/api/storage/file/Logo/logo.webp"
                    alt="Logo KerjaNTB"
                    width={32}
                    height={32}
                    className="size-8 object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sidebar-foreground text-sm font-bold tracking-tight">
                      KerjaNTB
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary h-4 border-0 px-1 text-[10px] font-semibold tracking-wider uppercase"
                    >
                      NTB
                    </Badge>
                  </div>
                  <span className="text-muted-foreground truncate text-[11px]">
                    {activeRole === "SUPERADMIN"
                      ? "Panel Pusat Superadmin"
                      : activeRole === "COMPANY"
                        ? "Portal Pemberi Kerja"
                        : "Portal Karir Pelamar"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Konten Sidebar: Dinamis Sesuai Role */}
      <SidebarContent>
        {currentNavGroups.map((group, groupIdx) => (
          <React.Fragment key={group.label}>
            {groupIdx > 0 && <SidebarSeparator className="mx-2" />}
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/70 px-2 text-xs font-semibold tracking-wider uppercase">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link
                            href={item.url}
                            className="flex items-center gap-3"
                          >
                            <item.icon className="size-4 shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && (
                          <SidebarMenuBadge
                            className={`text-[10px] font-medium ${
                              item.badgeVariant === "destructive"
                                ? "bg-destructive/15 text-destructive border-0"
                                : item.badgeVariant === "warning"
                                  ? "border-0 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  : item.badgeVariant === "secondary"
                                    ? "bg-secondary text-secondary-foreground border-0"
                                    : "bg-primary/10 text-primary border-0"
                            }`}
                          >
                            {item.badge}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* Footer Sidebar: Profil Riil & Menu Akun Sesuai Role */}
      <SidebarFooter className="border-sidebar-border border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-3 rounded-xl p-2"
                >
                  <Avatar className="border-border/80 h-9 w-9 rounded-lg border">
                    {displayAvatar && (
                      <AvatarImage src={displayAvatar} alt={displayName} />
                    )}
                    <AvatarFallback className="bg-primary/15 text-primary rounded-lg text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-sidebar-foreground truncate font-semibold">
                        {displayName}
                      </span>
                      {user?.isVerified && (
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                      )}
                    </div>
                    <span className="text-muted-foreground truncate text-[11px]">
                      {displayEmail}
                    </span>
                  </div>
                  <ChevronsUpDown className="text-muted-foreground ml-auto size-4 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl p-2 shadow-lg"
                side="bottom"
                align="end"
                sideOffset={6}
              >
                {/* Header Dropdown: Identitas & Role Badge Riil */}
                <DropdownMenuLabel className="p-1 font-normal">
                  <div className="flex items-center gap-3 px-1 py-1 text-left text-sm">
                    <Avatar className="border-border/80 h-10 w-10 rounded-lg border">
                      {displayAvatar && (
                        <AvatarImage src={displayAvatar} alt={displayName} />
                      )}
                      <AvatarFallback className="bg-primary/15 text-primary rounded-lg text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-foreground truncate font-bold">
                          {displayName}
                        </span>
                      </div>
                      <span className="text-muted-foreground truncate text-[11px]">
                        {displayEmail}
                      </span>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`h-4.5 px-2 text-[10px] font-semibold tracking-wide ${roleMeta.badgeClass}`}
                        >
                          <roleMeta.icon className="mr-1 size-3" />
                          <span>{roleMeta.label}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1.5" />

                {/* Menu Relevan Sesuai Role */}
                <DropdownMenuGroup>
                  {activeRole === "SUPERADMIN" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/admin"
                          className="cursor-pointer font-medium"
                        >
                          <Shield className="text-primary mr-2 size-4" />
                          <span>Panel Utama Superadmin</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/admin/moderasi"
                          className="cursor-pointer"
                        >
                          <CheckSquare className="mr-2 size-4 text-amber-500" />
                          <span>Moderasi Lowongan</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/admin/verifikasi"
                          className="cursor-pointer"
                        >
                          <ShieldCheck className="mr-2 size-4 text-emerald-500" />
                          <span>Verifikasi NIB Perusahaan</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/user/profile"
                          className="cursor-pointer"
                        >
                          <User className="mr-2 size-4" />
                          <span>Profil Saya</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {activeRole === "COMPANY" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/company"
                          className="cursor-pointer font-medium"
                        >
                          <Building2 className="text-primary mr-2 size-4" />
                          <span>Profil Perusahaan</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/verification"
                          className="cursor-pointer"
                        >
                          <Sparkles className="mr-2 size-4 text-amber-500" />
                          <span>Verifikasi NIB NTB</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/loker/baru"
                          className="cursor-pointer"
                        >
                          <PlusCircle className="mr-2 size-4 text-emerald-500" />
                          <span>Pasang Lowongan Baru</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/employer/pelamar"
                          className="cursor-pointer"
                        >
                          <FileCheck2 className="mr-2 size-4 text-blue-500" />
                          <span>Daftar Pelamar Masuk</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {activeRole === "INDIVIDUAL" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/user/profile"
                          className="cursor-pointer font-medium"
                        >
                          <User className="text-primary mr-2 size-4" />
                          <span>Profil Saya</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/user/resume"
                          className="cursor-pointer"
                        >
                          <FileText className="mr-2 size-4 text-purple-500" />
                          <span>Resume &amp; Multi-CV</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/user/applications"
                          className="cursor-pointer"
                        >
                          <FileCheck2 className="mr-2 size-4 text-blue-500" />
                          <span>Lamaran Saya</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/user/saved"
                          className="cursor-pointer"
                        >
                          <Bookmark className="mr-2 size-4 text-emerald-500" />
                          <span>Loker Tersimpan</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5" />

                {/* Menu Umum: Pengaturan & Bantuan */}
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/loker" className="cursor-pointer">
                      <Compass className="text-muted-foreground mr-2 size-4" />
                      <span>Eksplor Lowongan NTB</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5" />

                {/* Tombol Logout Riil Terhubung ke Clerk */}
                <SignOutButton redirectUrl="/">
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 size-4" />
                    <span>Keluar dari Akun</span>
                  </DropdownMenuItem>
                </SignOutButton>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
