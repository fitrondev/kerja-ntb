import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, Briefcase, ExternalLink, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Semua Lowongan Kerja | KerjaNTB",
  description: "Daftar seluruh lowongan pekerjaan di Nusa Tenggara Barat.",
};

export default async function AdminAllJobsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const jobs = await prisma.job.findMany({
    include: {
      company: true,
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
            Semua Lowongan Kerja NTB
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Total {jobs.length} lowongan di seluruh 10 Kabupaten/Kota se-NTB.
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
            <Briefcase className="text-primary size-4.5" />
            <span>Seluruh Lowongan ({jobs.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.map((job) => (
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
                    className={
                      job.status === "PUBLISHED"
                        ? "bg-chart-1/10 text-chart-1 border-0 text-[10px]"
                        : "border-0 bg-amber-500/15 text-[10px] text-amber-600"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
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
                  <span>•</span>
                  <span className="text-foreground font-semibold">
                    {job._count.applications} Pelamar
                  </span>
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
                    <span>Lihat</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
