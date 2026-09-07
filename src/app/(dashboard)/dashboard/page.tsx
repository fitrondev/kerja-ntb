import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/clerk-sync";

/**
 * Halaman gerbang /dashboard yang secara cerdas mengarahkan pengguna
 * ke dashboard spesifik sesuai role akun aktif di MySQL.
 */
export default async function DashboardRootPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  // Pengalihan berbasis role
  switch (user.role) {
    case "SUPERADMIN":
      redirect("/dashboard/admin");
    case "COMPANY":
      redirect("/dashboard/employer");
    case "INDIVIDUAL":
    default:
      redirect("/dashboard/user");
  }
}
