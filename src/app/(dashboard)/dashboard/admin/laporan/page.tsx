import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Laporan Pelanggaran | KerjaNTB",
  description:
    "Penanganan laporan indikasi penipuan atau pungutan liar dari pengguna.",
};

export default async function AdminReportsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const reports = await prisma.report.findMany({
    include: {
      job: {
        include: { company: true },
      },
      reporter: {
        select: { email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Laporan Pelanggaran Pengguna
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Pantau dan tindak lanjuti laporan anti-fraud untuk menjaga keamanan
            bursa kerja NTB.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Admin</span>
          </Link>
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <AlertTriangle className="text-destructive size-4.5" />
            <span>Daftar Laporan Masuk ({reports.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center text-xs">
              <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500" />
              <span className="text-foreground block font-semibold">
                Bursa Kerja Aman &amp; Bersih
              </span>
              <span className="mt-1 block">
                Tidak ada laporan pelanggaran aktif dari pengguna saat ini.
              </span>
            </div>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className="border-destructive/20 bg-destructive/5 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-bold">
                      {r.job.title}
                    </span>
                    <Badge variant="destructive" className="text-[10px]">
                      {r.reason}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Perusahaan:{" "}
                    <span className="text-foreground font-medium">
                      {r.job.company?.name || "Perusahaan"}
                    </span>{" "}
                    • Pelapor: {r.reporter.email}
                  </p>
                  <p className="text-foreground/80 bg-background/80 border-border/60 mt-2 rounded-lg border p-2 text-xs">
                    &ldquo;{r.description}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs"
                  >
                    <Link href={`/loker/${r.job.slug}`}>
                      <span>Lihat Loker</span>
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
