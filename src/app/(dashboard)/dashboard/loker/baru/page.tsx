import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, Building2 } from "lucide-react";

import { JobWizard } from "@/components/dashboard/employer/job-wizard";
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
  title: "Pasang Lowongan Baru | KerjaNTB",
  description:
    "Formulir publikasi lowongan kerja baru untuk 10 Kabupaten/Kota se-NTB.",
};

export default async function CreateJobPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/loker/baru");
  }

  const [company, locations, categories] = await Promise.all([
    user.company
      ? prisma.company.findUnique({
          where: { id: user.company.id },
          include: { verification: true },
        })
      : prisma.company.findUnique({
          where: { userId: user.id },
          include: { verification: true },
        }),
    prisma.location.findMany({
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
    prisma.jobCategory.findMany({
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!company) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Pasang Lowongan Baru
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Lengkapi profil perusahaan Anda sebelum menerbitkan lowongan.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/dashboard/employer/loker">
              <ArrowLeft className="mr-1.5 size-4" />
              <span>Kembali</span>
            </Link>
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <Building2 className="text-muted-foreground mx-auto mb-2 size-12" />
            <CardTitle className="text-base font-bold sm:text-lg">
              Profil Perusahaan Belum Dibuat
            </CardTitle>
            <CardDescription className="text-xs">
              Untuk memasang lowongan pekerjaan di platform KerjaNTB, Anda wajib
              mengisi data profil instansi / perusahaan terlebih dahulu.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild className="rounded-xl px-6 font-semibold">
              <Link href="/dashboard/company">
                <span>Buat Profil Perusahaan Sekarang</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <JobWizard
      company={{
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl,
        isVerified: company.isVerified,
        verification: company.verification
          ? { status: company.verification.status }
          : null,
      }}
      locations={locations}
      categories={categories}
      mode="create"
    />
  );
}
