import * as React from "react";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Bell, Building2, Shield, User } from "lucide-react";

import type { SidebarUserData } from "@/components/dashboard/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export interface DashboardHeaderProps {
  user?: SidebarUserData | null;
}

/**
 * Header bar dashboard: sidebar trigger, breadcrumb kontekstual role, notifikasi, tema, dan user profile.
 */
export function DashboardHeader({ user }: DashboardHeaderProps) {
  const role = user?.role || "INDIVIDUAL";

  const roleLabel =
    role === "SUPERADMIN"
      ? "Superadmin"
      : role === "COMPANY"
        ? "Perusahaan"
        : "Pencari Kerja";

  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur transition-[width,height] ease-linear">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={
                  role === "SUPERADMIN"
                    ? "/dashboard/admin"
                    : role === "COMPANY"
                      ? "/dashboard/employer"
                      : "/dashboard/user"
                }
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem className="hidden sm:block">
              <BreadcrumbPage className="text-foreground font-semibold">
                {roleLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        {/* Role Badge di Header */}
        {user && (
          <div className="hidden items-center sm:flex">
            {role === "SUPERADMIN" && (
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 gap-1 text-xs font-semibold"
              >
                <Shield className="size-3" />
                <span>Superadmin</span>
              </Badge>
            )}
            {role === "COMPANY" && (
              <Badge
                variant="outline"
                className="gap-1 border-blue-500/20 bg-blue-500/10 text-xs font-semibold text-blue-600 dark:text-blue-400"
              >
                <Building2 className="size-3" />
                <span>{user.companyName || "Perusahaan"}</span>
              </Badge>
            )}
            {role === "INDIVIDUAL" && (
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <User className="size-3" />
                <span>Pencari Kerja</span>
              </Badge>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
        >
          <Bell className="size-4" />
          <span className="sr-only">Notifikasi</span>
        </Button>
        <ThemeToggle />
        <Separator orientation="vertical" className="h-4" />
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Masuk
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">Daftar</Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
