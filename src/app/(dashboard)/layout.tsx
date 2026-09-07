import * as React from "react";

import {
  AppSidebar,
  type SidebarUserData,
} from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth/clerk-sync";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const sidebarUser: SidebarUserData | null = user
    ? {
        id: user.id,
        name:
          user.role === "COMPANY" && user.company?.name
            ? user.company.name
            : user.profile?.fullName ||
              user.email.split("@")[0] ||
              "Pengguna KerjaNTB",
        email: user.email,
        avatarUrl:
          user.role === "COMPANY" && user.company?.logoUrl
            ? user.company.logoUrl
            : (user.profile?.avatarUrl ?? null),
        role: user.role,
        companyName: user.company?.name ?? null,
        isVerified: user.company?.isVerified ?? false,
      }
    : null;

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      <SidebarInset className="bg-background flex min-w-0 flex-col">
        <DashboardHeader user={sidebarUser} />
        <main className="bg-muted/30 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
