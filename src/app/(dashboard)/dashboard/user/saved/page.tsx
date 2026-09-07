import { Metadata } from "next";
import { redirect } from "next/navigation";

import { SavedJobsList } from "@/components/dashboard/user/saved-jobs-list";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Lowongan Tersimpan | KerjaNTB",
  description:
    "Daftar lowongan kerja yang Anda simpan untuk dilamar di kemudian waktu.",
};

export default async function UserSavedJobsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/user/saved");
  }

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId: user.id },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          workplace: true,
          salaryMin: true,
          salaryMax: true,
          isSalaryDisclosed: true,
          location: { select: { name: true, slug: true } },
          company: {
            select: { name: true, slug: true, logoUrl: true, isVerified: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Lowongan Tersimpan
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Pantau dan kirimkan lamaran ke posisi pekerjaan yang telah Anda tandai
          sebagai favorit.
        </p>
      </div>

      <SavedJobsList initialSavedJobs={savedJobs} />
    </div>
  );
}
