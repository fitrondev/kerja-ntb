import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, Building2 } from "lucide-react";

import { EmployerApplicantsTable } from "@/components/dashboard/employer/employer-applicants-table";
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
  title: "Pelamar & Rekrutmen | KerjaNTB",
  description:
    "Kelola berkas lamaran dan proses rekrutmen kandidat pelamar di NTB.",
};

export default async function EmployerApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const jobIdParam = typeof query.jobId === "string" ? query.jobId : undefined;

  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/employer/pelamar");
  }

  const company = user.company
    ? await prisma.company.findUnique({ where: { id: user.company.id } })
    : await prisma.company.findFirst({ where: { userId: user.id } });

  if (!company) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Pelamar & Rekrutmen Masuk
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Kelola berkas pelamar di seluruh lowongan perusahaan Anda.
          </p>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <Building2 className="text-muted-foreground mx-auto mb-2 size-12" />
            <CardTitle className="text-base font-bold sm:text-lg">
              Profil Perusahaan Belum Dibuat
            </CardTitle>
            <CardDescription className="text-xs">
              Buat profil instansi / perusahaan terlebih dahulu untuk memantau
              berkas lamaran masuk.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild className="rounded-xl px-6 font-semibold">
              <Link href="/dashboard/company">
                <span>Buat Profil Perusahaan</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [companyJobs, applications] = await Promise.all([
    prisma.job.findMany({
      where: { companyId: company.id },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                phone: true,
                address: true,
                bio: true,
                location: { select: { name: true } },
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        resume: {
          select: {
            id: true,
            title: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Pelamar & Rekrutmen Masuk
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Daftar berkas lamaran dari pencari kerja lokal di 10 Kabupaten/Kota
            se-NTB.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/employer">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </Button>
      </div>

      <EmployerApplicantsTable
        initialApplications={applications}
        jobsList={companyJobs}
        defaultJobId={jobIdParam}
      />
    </div>
  );
}
