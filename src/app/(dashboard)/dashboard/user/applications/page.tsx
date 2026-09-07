import { Metadata } from "next";
import { redirect } from "next/navigation";

import { ApplicationsList } from "@/components/dashboard/user/applications-list";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Lamaran Saya | KerjaNTB",
  description:
    "Pantau riwayat dan perkembangan proses seleksi lamaran kerja Anda.",
};

export default async function UserApplicationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/user/applications");
  }

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          location: { select: { name: true } },
          company: {
            select: { name: true, slug: true, logoUrl: true, isVerified: true },
          },
        },
      },
      resume: { select: { id: true, title: true, fileUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Lamaran Saya
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Seluruh berkas lamaran yang telah Anda kirimkan ke berbagai perusahaan
          di NTB beserta tahapan seleksi terkini.
        </p>
      </div>

      <ApplicationsList initialApplications={applications} />
    </div>
  );
}
