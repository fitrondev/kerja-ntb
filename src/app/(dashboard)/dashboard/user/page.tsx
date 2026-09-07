import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowRight,
  Bookmark,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  User,
} from "lucide-react";

import { ApplicationsList } from "@/components/dashboard/user/applications-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Dashboard Pencari Kerja | KerjaNTB",
  description:
    "Pantau status lamaran kerja, lowongan tersimpan, dan resume Anda di KerjaNTB.",
};

export default async function UserDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/user");
  }

  // Fetch metrics & data
  const [
    totalApplications,
    activeApplications,
    savedJobsCount,
    resumesCount,
    recentApplications,
    recentSavedJobs,
  ] = await Promise.all([
    prisma.application.count({ where: { userId: user.id } }),
    prisma.application.count({
      where: {
        userId: user.id,
        status: { in: ["APPLIED", "REVIEWING", "SHORTLISTED", "INTERVIEW"] },
      },
    }),
    prisma.savedJob.count({ where: { userId: user.id } }),
    prisma.resume.count({ where: { userId: user.id } }),
    prisma.application.findMany({
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
              select: {
                name: true,
                slug: true,
                logoUrl: true,
                isVerified: true,
              },
            },
          },
        },
        resume: { select: { id: true, title: true, fileUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.savedJob.findMany({
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
              select: {
                name: true,
                slug: true,
                logoUrl: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const userName = user.profile?.fullName || user.email.split("@")[0];

  return (
    <div className="space-y-6">
      {/* Banner Selamat Datang */}
      <div className="border-primary/20 from-primary via-primary/95 to-primary/85 text-primary-foreground relative overflow-hidden rounded-2xl border bg-linear-to-r p-6 shadow-md">
        <div className="relative z-10 space-y-2">
          <div className="bg-primary-foreground/15 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <span>Pencari Kerja NTB</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Halo, {userName}! 👋
          </h1>
          <p className="text-primary-foreground/85 max-w-2xl text-xs leading-relaxed sm:text-sm">
            Selamat datang di Dashboard Karir Anda. Pantau perkembangan lamaran
            kerja Anda ke berbagai perusahaan terverifikasi di 10 Kabupaten/Kota
            se-NTB.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button
            asChild
            size="sm"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-xl font-semibold"
          >
            <Link href="/loker" className="gap-2">
              <Compass className="size-4" />
              <span>Cari Lowongan Kerja</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 rounded-xl font-semibold"
          >
            <Link href="/dashboard/user/resume" className="gap-2">
              <FileText className="size-4" />
              <span>Kelola Resume &amp; CV</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid 4 Metrik Utama */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Lamaran Terkirim
              </span>
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                <FileCheck2 className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black">
                {totalApplications}
              </span>
              <span className="text-muted-foreground text-[11px]">berkas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Proses Seleksi
              </span>
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <Clock className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black">
                {activeApplications}
              </span>
              <span className="text-chart-1 text-[11px] font-semibold">
                sedang aktif
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Loker Tersimpan
              </span>
              <div className="bg-chart-1/10 text-chart-1 rounded-xl p-2">
                <Bookmark className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black">
                {savedJobsCount}
              </span>
              <span className="text-muted-foreground text-[11px]">
                lowongan
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                Dokumen Resume
              </span>
              <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
                <FileText className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black">
                {resumesCount}
              </span>
              <span className="text-muted-foreground text-[11px]">
                CV tersimpan
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Konten Utama 2 Kolom: Lamaran Terkini & Pintasan */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Lamaran Terkini */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-foreground text-base font-bold sm:text-lg">
                Status Lamaran Terkini
              </h2>
              <p className="text-muted-foreground text-xs">
                Pantau respon rekrutmen dari HRD perusahaan se-NTB.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/dashboard/user/applications">
                <span>Lihat Semua</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <ApplicationsList initialApplications={recentApplications} />
        </div>

        {/* Kolom Kanan: Lowongan Tersimpan & Aksi Profil */}
        <div className="space-y-6">
          {/* Loker Tersimpan */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Bookmark className="text-chart-1 size-4" />
                  <span>Loker Tersimpan</span>
                </CardTitle>
                <Link
                  href="/dashboard/user/saved"
                  className="text-primary text-xs hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSavedJobs.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-xs">
                  <span>Belum ada lowongan yang disimpan.</span>
                </div>
              ) : (
                recentSavedJobs.map((item) => (
                  <div
                    key={item.id}
                    className="border-border/60 hover:bg-muted/30 flex items-center justify-between rounded-xl border p-3 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <Link
                        href={`/loker/${item.job.slug}`}
                        className="text-foreground hover:text-primary block truncate text-xs font-bold transition-colors"
                      >
                        {item.job.title}
                      </Link>
                      <span className="text-muted-foreground block truncate text-[11px]">
                        {item.job.company?.name || "Perusahaan di NTB"}
                      </span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-[11px]"
                    >
                      <Link href={`/loker/${item.job.slug}#lamar-section`}>
                        Lamar
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Kelengkapan Profil Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <User className="text-primary size-4" />
                <span>Kelengkapan Profil</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>Status Data Pelamar</span>
                  <span className="text-chart-1 font-semibold">
                    {user.profile?.fullName && user.profile.phone
                      ? "Lengkap"
                      : "Perlu Dilengkapi"}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Profil yang lengkap dan memiliki CV terlampir meningkatkan
                  peluang dipanggil interview hingga 3x lipat oleh perusahaan di
                  NTB.
                </p>
              </div>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
              >
                <Link href="/dashboard/user/profile">
                  <User className="size-3.5" />
                  <span>Edit Profil Pelamar</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
