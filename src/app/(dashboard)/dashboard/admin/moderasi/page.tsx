import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  CheckSquare,
  ExternalLink,
  MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Moderasi Lowongan | KerjaNTB",
  description:
    "Review dan persetujuan lowongan kerja baru di Nusa Tenggara Barat.",
};

export default async function AdminModerationPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const jobs = await prisma.job.findMany({
    include: {
      company: true,
      location: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingJobs = jobs.filter((j) => j.status === "PENDING_REVIEW");
  const publishedJobs = jobs.filter((j) => j.status === "PUBLISHED");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Moderasi Lowongan Kerja
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Validasi integritas lowongan sebelum dipublikasikan kepada pencari
            kerja se-NTB.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Admin</span>
          </Link>
        </Button>
      </div>

      {/* Ringkasan Status */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs">
              Menunggu Review
            </span>
            <p className="mt-1 text-2xl font-black text-amber-600">
              {pendingJobs.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs">Telah Terbit</span>
            <p className="mt-1 text-2xl font-black text-emerald-600">
              {publishedJobs.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs">
              Total Loker Terdaftar
            </span>
            <p className="text-foreground mt-1 text-2xl font-black">
              {jobs.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Lowongan */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <CheckSquare className="size-4.5 text-amber-500" />
            <span>
              Daftar Lowongan Menunggu Moderasi ({pendingJobs.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingJobs.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center text-xs">
              <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500" />
              <span className="text-foreground block font-semibold">
                Semua Lowongan Telah Ditinjau
              </span>
              <span className="mt-1 block">
                Tidak ada lowongan baru yang membutuhkan persetujuan saat ini.
              </span>
            </div>
          ) : (
            pendingJobs.map((job) => (
              <div
                key={job.id}
                className="border-border/70 hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-bold">
                      {job.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className="border-0 bg-amber-500/15 text-[10px] text-amber-600"
                    >
                      Pending Review
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-foreground font-medium">
                      {job.company?.name || "Perusahaan"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="text-primary size-3" />
                      <span>{job.location.name}</span>
                    </span>
                    <span>•</span>
                    <span>{job.category.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs"
                  >
                    <Link href={`/loker/${job.slug}`}>
                      <span>Buka Loker</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
