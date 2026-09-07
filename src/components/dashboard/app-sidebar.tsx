"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bell,
  Briefcase,
  Building2,
  CheckSquare,
  ChevronsUpDown,
  Compass,
  FileCheck2,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
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

const mainNavItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Cari Lowongan",
    url: "/loker",
    icon: Compass,
    badge: null,
  },
  {
    title: "Lamaran Saya",
    url: "/dashboard/applications",
    icon: FileCheck2,
    badge: "2",
  },
  {
    title: "Resume & CV",
    url: "/dashboard/resumes",
    icon: FileText,
    badge: null,
  },
];

const employerNavItems = [
  {
    title: "Kelola Lowongan",
    url: "/dashboard/loker",
    icon: Briefcase,
    badge: null,
  },
  {
    title: "Pasang Loker Baru",
    url: "/dashboard/loker/baru",
    icon: PlusCircle,
    badge: "Pro",
  },
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
  },
];

const adminNavItems = [
  {
    title: "Moderasi Loker",
    url: "/dashboard/moderation",
    icon: CheckSquare,
    badge: "3",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-sidebar-border border-b px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
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
                    <span className="text-sidebar-foreground text-sm font-semibold tracking-tight">
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
                    Portal Karir Terpercaya
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Menu Utama */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-2 text-xs font-medium">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="text-xs">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-2" />

        {/* Pemberi Kerja / Employer */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-2 text-xs font-medium">
            Pemberi Kerja (Company)
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {employerNavItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge
                        className={
                          item.badge === "Penting"
                            ? "border-0 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-primary/10 text-primary border-0"
                        }
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

        <SidebarSeparator className="mx-2" />

        {/* Moderasi & Admin */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-2 text-xs font-medium">
            Moderasi & Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="bg-destructive/15 text-destructive border-0">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/avatar-placeholder.png" alt="User" />
                    <AvatarFallback className="bg-primary/15 text-primary rounded-lg text-xs font-semibold">
                      NTB
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="text-sidebar-foreground truncate font-semibold">
                      Pengguna KerjaNTB
                    </span>
                    <span className="text-muted-foreground truncate text-[11px]">
                      user@kerjantb.id
                    </span>
                  </div>
                  <ChevronsUpDown className="text-muted-foreground ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="bg-primary/15 text-primary rounded-lg text-xs font-semibold">
                        NTB
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight">
                      <span className="truncate font-semibold">
                        Pengguna KerjaNTB
                      </span>
                      <span className="text-muted-foreground truncate text-[11px]">
                        user@kerjantb.id
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/verification"
                      className="cursor-pointer"
                    >
                      <Sparkles className="mr-2 size-4 text-amber-500" />
                      <span>Verifikasi NIB Perusahaan</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 size-4" />
                      <span>Pengaturan Akun</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/help" className="cursor-pointer">
                      <HelpCircle className="mr-2 size-4" />
                      <span>Bantuan & FAQ</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 size-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
