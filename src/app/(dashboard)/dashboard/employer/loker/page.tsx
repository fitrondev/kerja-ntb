import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Briefcase,
  ExternalLink,
  MapPin,
  PlusCircle,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    : await prisma.company.findFirst();

  if (!company) {
    redirect("/dashboard/company");
  }

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: {
      location: true,
      category: true,
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
            Pantau status tayang, antrean moderasi, dan jumlah berkas pelamar
            masuk.
          </p>
        </div>
        <Button asChild size="sm" className="text-xs">
          <Link href="/dashboard/loker/baru">
            <PlusCircle className="mr-1.5 size-4" />
            <span>Pasang Lowongan Baru</span>
          </Link>
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Briefcase className="text-primary size-4.5" />
            <span>Daftar Lowongan ({jobs.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-xs">
              <Briefcase className="text-muted-foreground/60 mx-auto mb-2 size-8" />
              <span className="text-foreground block font-semibold">
                Belum Ada Lowongan Dipasang
              </span>
              <span className="mt-1 block">
                Pasang lowongan kerja pertama perusahaan Anda untuk menjangkau
                pencari kerja di NTB.
              </span>
              <Button asChild size="sm" className="mt-4 text-xs">
                <Link href="/dashboard/loker/baru">
                  <PlusCircle className="mr-1.5 size-4" />
                  <span>Pasang Lowongan Sekarang</span>
                </Link>
              </Button>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="border-border/70 hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/loker/${job.slug}`}
                      className="text-foreground hover:text-primary text-sm font-bold transition-colors"
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
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-0.5 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="text-primary size-3" />
                      <span>{job.location.name}</span>
                    </span>
                    <span>•</span>
                    <span>{job.category.name}</span>
                    <span>•</span>
                    <span className="text-foreground font-semibold">
                      {job._count.applications} Pelamar
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs"
                  >
                    <Link href={`/dashboard/employer/pelamar?jobId=${job.id}`}>
                      <Users className="size-3.5" />
                      <span>Pelamar ({job._count.applications})</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 text-xs"
                  >
                    <Link href={`/loker/${job.slug}`}>
                      <span>Preview</span>
                      <ExternalLink className="size-3.5" />
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
