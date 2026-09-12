import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Building2, PlusCircle } from "lucide-react";

import { EmployerJobsTable } from "@/components/dashboard/employer/employer-jobs-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Kelola Lowongan Perusahaan | KerjaNTB",
  description:
    "Daftar dan status seluruh lowongan kerja yang dipublikasikan oleh perusahaan Anda.",
};

export default async function EmployerJobsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/employer/loker");
  }

  const company = user.company
    ? await prisma.company.findUnique({ where: { id: user.company.id } })
    : await prisma.company.findFirst({ where: { userId: user.id } });

  if (!company) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Kelola Lowongan Perusahaan
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Pantau status tayang, antrean moderasi, dan jumlah berkas pelamar
            masuk.
          </p>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <Building2 className="text-muted-foreground mx-auto mb-2 size-12" />
            <CardTitle className="text-base font-bold sm:text-lg">
              Profil Perusahaan Belum Dibuat
            </CardTitle>
            <CardDescription className="text-xs">
              Buat profil perusahaan Anda terlebih dahulu untuk mulai memasang
              dan mengelola lowongan kerja di NTB.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild className="rounded-xl px-6 font-semibold">
              <Link href="/dashboard/company">
                <span>Lengkapi Profil Perusahaan</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: {
      location: { select: { name: true, slug: true } },
      category: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Kelola Lowongan Perusahaan
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Pantau status tayang, antrean moderasi, dan kelola berkas pelamar
            masuk di wilayah NTB.
          </p>
        </div>
      </div>

      <EmployerJobsTable initialJobs={jobs} />
    </div>
  );
}
