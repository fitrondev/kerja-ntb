import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import {
  JobModerationTable,
  SerializedJob,
} from "@/components/dashboard/admin/job-moderation-table";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Moderasi Lowongan Kerja | KerjaNTB",
  description:
    "Review, persetujuan, dan kurasi lowongan kerja baru di Nusa Tenggara Barat.",
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

  const serializedJobs: SerializedJob[] = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    slug: j.slug,
    type: j.type,
    workplace: j.workplace,
    status: j.status,
    salaryMin: j.salaryMin ? Number(j.salaryMin) : null,
    salaryMax: j.salaryMax ? Number(j.salaryMax) : null,
    isSalaryDisclosed: j.isSalaryDisclosed,
    education: j.education,
    experience: j.experience,
    description: j.description,
    responsibilities: j.responsibilities,
    requirements: j.requirements,
    benefits: j.benefits,
    applicationMethod: j.applicationMethod,
    applicationEmail: j.applicationEmail,
    externalUrl: j.externalUrl,
    createdAt: new Date(j.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    rejectionReason: j.rejectionReason,
    reviewedAt: j.reviewedAt
      ? new Date(j.reviewedAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null,
    company: j.company
      ? {
          id: j.company.id,
          name: j.company.name,
          slug: j.company.slug,
          logoUrl: j.company.logoUrl,
          isVerified: j.company.isVerified,
        }
      : null,
    location: {
      id: j.location.id,
      name: j.location.name,
    },
    category: {
      id: j.category.id,
      name: j.category.name,
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Moderasi Lowongan Kerja NTB
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Validasi integritas, kepatuhan upah, dan keamanan lowongan sebelum
            dipublikasikan kepada pencari kerja di 10 Kabupaten/Kota NTB.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Panel Admin</span>
          </Link>
        </Button>
      </div>

      <JobModerationTable initialJobs={serializedJobs} />
    </div>
  );
}
