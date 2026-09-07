import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  Clock,
  ExternalLink,
  FileCheck2,
  FileText,
  Mail,
  Phone,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Pelamar & Rekrutmen | KerjaNTB",
  description:
    "Kelola berkas lamaran dan proses rekrutmen kandidat pelamar di NTB.",
};

export default async function EmployerApplicantsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/employer/pelamar");
  }

  const company = user.company
    ? await prisma.company.findUnique({ where: { id: user.company.id } })
    : await prisma.company.findFirst();

  if (!company) {
    redirect("/dashboard/company");
  }

  const applications = await prisma.application.findMany({
    where: { job: { companyId: company.id } },
    include: {
      user: {
        include: {
          profile: {
            include: { location: true },
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
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Pelamar &amp; Rekrutmen Masuk
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

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <FileCheck2 className="text-primary size-4.5" />
            <span>Total Lamaran Masuk ({applications.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {applications.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-xs">
              <User className="text-muted-foreground/60 mx-auto mb-2 size-8" />
              <span className="text-foreground block font-semibold">
                Belum Ada Pelamar Masuk
              </span>
              <span className="mt-1 block">
                Pelamar yang mengirimkan berkas lamaran ke lowongan Anda akan
                muncul di sini.
              </span>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="border-border/70 hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-bold">
                      {app.user.profile?.fullName || app.user.email}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-0 text-[10px]"
                    >
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Melamar posisi:{" "}
                    <Link
                      href={`/loker/${app.job.slug}`}
                      className="text-primary font-semibold hover:underline"
                    >
                      {app.job.title}
                    </Link>
                  </p>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                    {app.user.profile?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="size-3 text-emerald-600" />
                        <span>{app.user.profile.phone}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" />
                      <span>{app.user.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>
                        {new Date(app.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {app.resume?.fileUrl && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs"
                    >
                      <a
                        href={app.resume.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="size-3.5" />
                        <span>Unduh CV</span>
                      </a>
                    </Button>
                  )}
                  <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                    <Link href={`/loker/${app.job.slug}`}>
                      <span>Lihat Loker</span>
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
