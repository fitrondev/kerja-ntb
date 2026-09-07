import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/clerk-sync";

export default async function DashboardLokerRedirectPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/loker");
  }

  if (user.role === "SUPERADMIN") {
    redirect("/dashboard/admin/loker");
  }

  redirect("/dashboard/employer/loker");
}
