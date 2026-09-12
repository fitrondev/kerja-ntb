import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import {
  ReportManagementTable,
  SerializedReport,
} from "@/components/dashboard/admin/report-management-table";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Laporan Pelanggaran Pengguna | KerjaNTB",
  description:
    "Pusat penanganan laporan anti-fraud, sanksi lowongan palsu, dan pemblokiran akun pelanggar.",
};

export default async function AdminReportsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const reports = await prisma.report.findMany({
    include: {
      job: {
        include: {
          company: true,
          creator: true,
        },
      },
      reporter: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedReports: SerializedReport[] = reports.map((r) => ({
    id: r.id,
    reason: r.reason,
    description: r.description,
    status: r.status,
    actionNotes: r.actionNotes,
    resolvedAt: r.resolvedAt
      ? new Date(r.resolvedAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null,
    createdAt: new Date(r.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    job: {
      id: r.job.id,
      title: r.job.title,
      slug: r.job.slug,
      status: r.job.status,
      company: r.job.company
        ? {
            id: r.job.company.id,
            name: r.job.company.name,
            slug: r.job.company.slug,
          }
        : null,
      creator: {
        id: r.job.creator.id,
        email: r.job.creator.email,
        status: r.job.creator.status,
      },
    },
    reporter: {
      id: r.reporter.id,
      email: r.reporter.email,
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Penanganan Laporan Pelanggaran Anti-Fraud
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Tindak lanjuti aduan indikasi penipuan, pungutan biaya, dan
            informasi palsu demi menjaga integritas dan kepercayaan bursa kerja
            NTB.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Panel Admin</span>
          </Link>
        </Button>
      </div>

      <ReportManagementTable initialReports={serializedReports} />
    </div>
  );
}
