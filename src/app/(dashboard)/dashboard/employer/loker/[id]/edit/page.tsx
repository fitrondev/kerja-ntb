import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { JobWizard } from "@/components/dashboard/employer/job-wizard";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Edit Lowongan Kerja | KerjaNTB",
  description: "Perbarui rincian lowongan kerja Anda di KerjaNTB.",
};

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/sign-in?redirect_url=/dashboard/employer/loker/${id}/edit`);
  }

  const [job, locations, categories] = await Promise.all([
    prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          include: { verification: true },
        },
        skills: {
          include: { skill: true },
        },
      },
    }),
    prisma.location.findMany({
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
    prisma.jobCategory.findMany({
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!job) {
    notFound();
  }

  const isOwner = job.creatorId === user.id || job.company?.userId === user.id;
  const isSuperadmin = user.role === UserRole.SUPERADMIN;

  if (!isOwner && !isSuperadmin) {
    redirect("/dashboard/employer/loker");
  }

  const companyId = job.companyId || user.company?.id;

  if (!companyId) {
    redirect("/dashboard/company");
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { verification: true },
  });

  if (!company) {
    redirect("/dashboard/company");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/employer/loker">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Daftar Lowongan</span>
          </Link>
        </Button>
      </div>

      <JobWizard
        company={{
          id: company.id,
          name: company.name,
          logoUrl: company.logoUrl,
          isVerified: company.isVerified,
          verification: company.verification
            ? { status: company.verification.status }
            : null,
        }}
        locations={locations}
        categories={categories}
        mode="edit"
        initialJob={{
          id: job.id,
          title: job.title,
          categoryId: job.categoryId,
          locationId: job.locationId,
          type: job.type,
          workplace: job.workplace,
          isSalaryDisclosed: job.isSalaryDisclosed,
          salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
          salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
          description: job.description,
          responsibilities: job.responsibilities,
          requirements: job.requirements,
          benefits: job.benefits,
          education: job.education,
          experience: job.experience,
          isFreshGraduate: job.isFreshGraduate,
          applicationMethod: job.applicationMethod,
          applicationEmail: job.applicationEmail,
          externalUrl: job.externalUrl,
          deadline: job.deadline ? job.deadline.toISOString() : null,
          skills: job.skills.map((s) => ({ name: s.skill.name })),
        }}
      />
    </div>
  );
}
