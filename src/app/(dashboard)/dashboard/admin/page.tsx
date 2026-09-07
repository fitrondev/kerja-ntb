import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  MapPin,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Panel Superadmin | KerjaNTB",
  description:
    "Pusat kendali moderasi, verifikasi NIB, penanganan laporan, dan manajemen pengguna se-NTB.",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  // Fetch semua metrik riil sistem secara paralel
  const [
    totalUsersCount,
    totalCompaniesCount,
    totalJobsCount,
    pendingJobsCount,
    pendingVerificationsCount,
    pendingReportsCount,
    recentPendingJobs,
    recentVerifications,
    recentReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.job.count(),
    prisma.job.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.companyVerification.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.job.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { company: true, location: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.companyVerification.findMany({
      where: { status: "PENDING" },
      include: { company: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.findMany({
      where: { status: "PENDING" },
      include: {
        job: { select: { title: true, slug: true } },
        reporter: { select: { email: true } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Banner Utama Superadmin */}
      <div className="border-primary/20 from-primary via-primary/95 to-primary/85 text-primary-foreground relative overflow-hidden rounded-2xl border bg-linear-to-r p-6 shadow-md">
        <div className="relative z-10 space-y-2">
          <div className="bg-primary-foreground/15 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Shield className="size-3.5" />
            <span>Pusat Kendali Superadmin KerjaNTB</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Ringkasan Operasional Platform NTB
          </h1>
          <p className="text-primary-foreground/85 max-w-2xl text-xs leading-relaxed sm:text-sm">
            Pantau dan kelola seluruh aktivitas bursa kerja di 10 Kabupaten/Kota
            Nusa Tenggara Barat. Pastikan seluruh lowongan aman, bebas penipuan,
            dan perusahaan memiliki NIB resmi.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button
            asChild
            size="sm"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-xl font-semibold"
          >
            <Link href="/dashboard/admin/moderasi" className="gap-2">
              <CheckSquare className="size-4" />
              <span>Moderasi Lowongan ({pendingJobsCount})</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 rounded-xl font-semibold"
          >
            <Link href="/dashboard/admin/verifikasi" className="gap-2">
              <ShieldCheck className="size-4" />
              <span>Verifikasi NIB ({pendingVerificationsCount})</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 rounded-xl font-semibold"
          >
            <Link href="/dashboard/admin/pengguna" className="gap-2">
              <Users className="size-4" />
              <span>Kelola &amp; Ubah Role ({totalUsersCount})</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid 4 Metrik Kritis Perlu Tindakan */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Pending Review Lowongan */}
        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Antrean Review Loker
              </span>
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <Clock className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black">
                {pendingJobsCount}
              </span>
              <span className="text-[11px] font-semibold text-amber-600">
                perlu persetujuan
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Verifikasi NIB */}
        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Antrean NIB Perusahaan
              </span>
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black">
                {pendingVerificationsCount}
              </span>
              <span className="text-[11px] font-semibold text-blue-600">
                dokumen NIB
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Laporan Pelanggaran Pending */}
        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Laporan Pelanggaran
              </span>
              <div className="bg-destructive/10 text-destructive rounded-xl p-2">
                <AlertTriangle className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black">
                {pendingReportsCount}
              </span>
              <span className="text-destructive text-[11px] font-semibold">
                laporan aktif
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Perusahaan Terdaftar */}
        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Perusahaan Terdaftar
              </span>
              <div className="bg-chart-1/10 text-chart-1 rounded-xl p-2">
                <Building2 className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black">
                {totalCompaniesCount}
              </span>
              <span className="text-muted-foreground text-[11px]">
                mitra NTB
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid 3 Metrik Platform Tambahan */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="border-border/80 bg-muted/20 flex items-center justify-between rounded-xl border p-4">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-xs font-medium">
              Total Pengguna Akun
            </span>
            <p className="text-foreground text-xl font-bold">
              {totalUsersCount}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link href="/dashboard/admin/pengguna">
              <span>Detail</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="border-border/80 bg-muted/20 flex items-center justify-between rounded-xl border p-4">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-xs font-medium">
              Total Lowongan Tersimpan
            </span>
            <p className="text-foreground text-xl font-bold">
              {totalJobsCount}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link href="/dashboard/admin/loker">
              <span>Detail</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="border-border/80 bg-muted/20 flex items-center justify-between rounded-xl border p-4">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-xs font-medium">
              Wilayah Resmi NTB
            </span>
            <p className="text-foreground text-xl font-bold">10 Daerah</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link href="/dashboard/admin/master-data">
              <span>Master Data</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Konten Utama 2 Kolom: Antrean Review & Verifikasi */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kolom Kiri: Antrean Review Lowongan */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <CheckSquare className="size-4.5 text-amber-500" />
                <span>Antrean Review Lowongan</span>
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                Lowongan kerja baru yang menunggu persetujuan Superadmin.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/dashboard/admin/moderasi">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPendingJobs.length === 0 ? (
              <div className="border-border/60 text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center text-xs">
                <CheckCircle2 className="mb-1.5 size-8 text-emerald-500" />
                <span className="text-foreground font-semibold">
                  Semua Lowongan Bersih!
                </span>
                <span>Tidak ada lowongan yang menunggu antrean review.</span>
              </div>
            ) : (
              recentPendingJobs.map((job) => (
                <div
                  key={job.id}
                  className="border-border/60 hover:bg-muted/30 flex items-center justify-between rounded-xl border p-3.5 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground truncate text-sm font-bold">
                        {job.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="border-0 bg-amber-500/15 text-[10px] text-amber-600 dark:text-amber-400"
                      >
                        Pending
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span>{job.company?.name || "Perusahaan NTB"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {job.location?.name || "NTB"}
                      </span>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 gap-1 text-xs"
                  >
                    <Link href={`/loker/${job.slug}`}>
                      <span>Tinjau</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Kolom Kanan: Antrean Verifikasi NIB & Laporan */}
        <div className="space-y-6">
          {/* Verifikasi NIB */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-0.5">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <ShieldCheck className="size-4.5 text-blue-500" />
                  <span>Pengajuan NIB Perusahaan</span>
                </CardTitle>
                <p className="text-muted-foreground text-xs">
                  Validasi legalitas perusahaan di 10 Kabupaten/Kota NTB.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/dashboard/admin/verifikasi">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentVerifications.length === 0 ? (
                <div className="border-border/60 text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-6 text-center text-xs">
                  <ShieldCheck className="mb-1 size-7 text-blue-500" />
                  <span>Tidak ada pengajuan NIB yang menunggu verifikasi.</span>
                </div>
              ) : (
                recentVerifications.map((v) => (
                  <div
                    key={v.id}
                    className="border-border/60 hover:bg-muted/30 flex items-center justify-between rounded-xl border p-3 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-foreground block truncate text-xs font-bold">
                        {v.company.name}
                      </span>
                      <span className="text-muted-foreground block text-[11px]">
                        NIB: {v.nib} • {v.legalName}
                      </span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                    >
                      <Link href="/dashboard/admin/verifikasi">Periksa</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Laporan Pelanggaran */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-0.5">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <AlertTriangle className="text-destructive size-4.5" />
                  <span>Laporan Pelanggaran Pengguna</span>
                </CardTitle>
                <p className="text-muted-foreground text-xs">
                  Aduan lowongan penipuan atau indikasi pungutan biaya.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/dashboard/admin/laporan">Lihat Semua</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReports.length === 0 ? (
                <div className="border-border/60 text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-6 text-center text-xs">
                  <CheckCircle2 className="mb-1 size-7 text-emerald-500" />
                  <span>Tidak ada laporan pelanggaran aktif saat ini.</span>
                </div>
              ) : (
                recentReports.map((r) => (
                  <div
                    key={r.id}
                    className="border-destructive/20 bg-destructive/5 flex items-center justify-between rounded-xl border p-3"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-foreground block truncate text-xs font-bold">
                        {r.job.title}
                      </span>
                      <span className="text-muted-foreground block text-[11px]">
                        Oleh: {r.reporter.email} • {r.reason}
                      </span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="destructive"
                      className="h-7 text-[11px]"
                    >
                      <Link href="/dashboard/admin/laporan">Tindak</Link>
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
