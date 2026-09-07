import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileCheck2,
  MapPin,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Dashboard Perusahaan | KerjaNTB",
  description:
    "Pusat pengelolaan lowongan kerja, pelamar masuk, dan verifikasi NIB perusahaan di NTB.",
};

export default async function EmployerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/employer");
  }

  // Jika bukan Company atau Superadmin, arahkan ke dashboard user
  if (user.role !== "COMPANY" && user.role !== "SUPERADMIN") {
    redirect("/dashboard/user");
  }

  // Cari data perusahaan dari akun ini
  const company = user.company
    ? await prisma.company.findUnique({
        where: { id: user.company.id },
        include: { verification: true },
      })
    : await prisma.company.findFirst({
        include: { verification: true },
      }); // Fallback untuk testing bila belum mengaitkan company

  if (!company) {
    return (
      <div className="space-y-6">
        <div className="border-border bg-card rounded-2xl border p-8 text-center shadow-xs">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
            <Building2 className="size-7" />
          </div>
          <h2 className="text-foreground text-xl font-bold">
            Profil Perusahaan Belum Terdaftar
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-xs leading-relaxed sm:text-sm">
            Lengkapi data profil perusahaan Anda untuk mulai memasang lowongan
            pekerjaan dan merekrut talenta terbaik di seluruh Kabupaten/Kota
            NTB.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="rounded-xl">
              <Link href="/dashboard/company">
                <Building2 className="mr-2 size-4" />
                <span>Buat Profil Perusahaan Sekarang</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fetch metrik riil perusahaan
  const [
    totalJobsCount,
    activeJobsCount,
    totalApplicantsCount,
    recentJobs,
    recentApplicants,
  ] = await Promise.all([
    prisma.job.count({ where: { companyId: company.id } }),
    prisma.job.count({ where: { companyId: company.id, status: "PUBLISHED" } }),
    prisma.application.count({ where: { job: { companyId: company.id } } }),
    prisma.job.findMany({
      where: { companyId: company.id },
      include: {
        location: true,
        _count: { select: { applications: true } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: {
        user: { include: { profile: true } },
        job: { select: { title: true, slug: true } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const isVerified =
    company.isVerified || company.verification?.status === "APPROVED";

  return (
    <div className="space-y-6">
      {/* Banner Perusahaan */}
      <div className="border-primary/20 from-primary via-primary/95 to-primary/85 text-primary-foreground relative overflow-hidden rounded-2xl border bg-linear-to-r p-6 shadow-md">
        <div className="relative z-10 space-y-2">
          <div className="bg-primary-foreground/15 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Building2 className="size-3.5" />
            <span>Portal Rekrutmen Pemberi Kerja</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {company.name}
          </h1>
          <p className="text-primary-foreground/85 max-w-2xl text-xs leading-relaxed sm:text-sm">
            Kelola proses rekrutmen perusahaan Anda di NTB. Pantau lamaran
            masuk, publikasikan lowongan baru, dan pastikan kepatuhan legalitas
            usaha daerah.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button
            asChild
            size="sm"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-xl font-semibold"
          >
            <Link href="/dashboard/loker/baru" className="gap-2">
              <PlusCircle className="size-4" />
              <span>Pasang Lowongan Baru</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 rounded-xl font-semibold"
          >
            <Link href="/dashboard/employer/pelamar" className="gap-2">
              <Users className="size-4" />
              <span>Lihat Pelamar ({totalApplicantsCount})</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 rounded-xl font-semibold"
          >
            <Link href="/dashboard/verification" className="gap-2">
              <ShieldCheck className="size-4" />
              <span>Status NIB</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid 4 Metrik Riil Perusahaan */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Lowongan Aktif
              </span>
              <div className="bg-chart-1/10 text-chart-1 rounded-xl p-2">
                <Briefcase className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black">
                {activeJobsCount}
              </span>
              <span className="text-chart-1 text-[11px] font-semibold">
                dari {totalJobsCount} lowongan
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Total Pelamar Masuk
              </span>
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                <FileCheck2 className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black">
                {totalApplicantsCount}
              </span>
              <span className="text-muted-foreground text-[11px]">
                kandidat
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Status Verifikasi NIB
              </span>
              <div
                className={`rounded-xl p-2 ${
                  isVerified
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {isVerified ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <ShieldAlert className="size-4" />
                )}
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-sm font-bold ${
                  isVerified ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {isVerified ? "Terverifikasi Resmi" : "Belum Verifikasi"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Wilayah Kantor
              </span>
              <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
                <MapPin className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground truncate text-sm font-bold">
                {company.address ? "NTB" : "Lengkapi Alamat"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Konten Utama 2 Kolom: Lowongan Aktif & Pelamar Terkini */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Daftar Lowongan Milik Perusahaan */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-foreground text-base font-bold sm:text-lg">
                Lowongan Kerja Perusahaan Anda
              </h2>
              <p className="text-muted-foreground text-xs">
                Kelola status publikasi lowongan dan tinjau pelamar.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/dashboard/employer/loker">
                <span>Lihat Semua</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {recentJobs.length === 0 ? (
              <Card className="border-border/60 border-dashed">
                <CardContent className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center text-xs">
                  <Briefcase className="text-muted-foreground/60 mb-2 size-8" />
                  <span className="text-foreground font-semibold">
                    Belum Ada Lowongan yang Dipasang
                  </span>
                  <span className="mt-1">
                    Mulai pasang lowongan pertama perusahaan Anda untuk
                    menjangkau pencari kerja di NTB.
                  </span>
                  <Button asChild size="sm" className="mt-4 rounded-xl">
                    <Link href="/dashboard/loker/baru">
                      <PlusCircle className="mr-1.5 size-4" />
                      Pasang Lowongan Sekarang
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="border-border/70 bg-card hover:border-border flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-xs"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/loker/${job.slug}`}
                        className="text-foreground hover:text-primary truncate text-sm font-bold transition-colors"
                      >
                        {job.title}
                      </Link>
                      <Badge
                        variant="secondary"
                        className={
                          job.status === "PUBLISHED"
                            ? "bg-chart-1/10 text-chart-1 border-0 text-[10px]"
                            : "border-0 bg-amber-500/15 text-[10px] text-amber-600"
                        }
                      >
                        {job.status === "PUBLISHED" ? "Tayang" : job.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span>{job.location.name}</span>
                      <span>•</span>
                      <span>{job._count.applications} berkas pelamar</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs"
                    >
                      <Link
                        href={`/dashboard/employer/pelamar?jobId=${job.id}`}
                      >
                        <span>Pelamar</span>
                        <Users className="size-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan: Pelamar Masuk Terbaru & NIB Card */}
        <div className="space-y-6">
          {/* Status NIB NTB Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Sparkles className="size-4 text-amber-500" />
                <span>Verifikasi NIB NTB</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Perusahaan dengan Nomor Induk Berusaha (NIB) terverifikasi
                mendapatkan lencana Resmi, prioritas rekomendasi di halaman
                depan, dan kepercayaan lebih tinggi dari pelamar kerja lokal.
              </p>
              <div className="border-border flex items-center justify-between border-t pt-2 text-xs">
                <span>Status:</span>
                <span className="text-foreground font-semibold">
                  {isVerified ? "Terverifikasi" : "Belum Diajukan"}
                </span>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                <Link href="/dashboard/verification">
                  <span>
                    {isVerified ? "Lihat Dokumen NIB" : "Ajukan Verifikasi NIB"}
                  </span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pelamar Masuk Terkini */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <FileCheck2 className="size-4 text-blue-500" />
                  <span>Pelamar Masuk</span>
                </CardTitle>
                <Link
                  href="/dashboard/employer/pelamar"
                  className="text-primary text-xs hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentApplicants.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-xs">
                  <span>Belum ada pelamar yang melamar lowongan Anda.</span>
                </div>
              ) : (
                recentApplicants.map((app) => (
                  <div
                    key={app.id}
                    className="border-border/60 hover:bg-muted/30 flex items-center justify-between rounded-xl border p-3 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-foreground block truncate text-xs font-bold">
                        {app.user.profile?.fullName || app.user.email}
                      </span>
                      <span className="text-muted-foreground block truncate text-[11px]">
                        Loker: {app.job.title}
                      </span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-[11px]"
                    >
                      <Link href={`/dashboard/employer/pelamar`}>Review</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
