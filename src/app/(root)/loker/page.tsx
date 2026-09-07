import { Metadata } from "next";

import { ActiveFilterPills } from "@/components/jobs/active-filter-pills";
import { JobCard } from "@/components/jobs/job-card";
import { JobEmptyState } from "@/components/jobs/job-empty-state";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobsPageHeader } from "@/components/jobs/jobs-page-header";
import { JobsPagination } from "@/components/jobs/jobs-pagination";
import { JobsResultsBar } from "@/components/jobs/jobs-results-bar";
import { SectionContainer } from "@/components/layout/section-container";
import { Card, CardContent } from "@/components/ui/card";
import {
  EducationLevel,
  JobType,
  Prisma,
  WorkplaceType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Cari Lowongan Kerja di Nusa Tenggara Barat | KerjaNTB",
  description:
    "Eksplorasi lowongan kerja terbaru dan terverifikasi NIB di 10 Kabupaten/Kota se-NTB. Bebas penipuan dan terhubung langsung dengan HRD lokal.",
};

const PAGE_SIZE = 10;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // ---------------------------------------------------------------------------
  // Parse search params
  // ---------------------------------------------------------------------------
  const q = typeof params.q === "string" ? params.q.trim() : undefined;
  const location =
    typeof params.location === "string" ? params.location.trim() : undefined;
  const category =
    typeof params.category === "string" ? params.category.trim() : undefined;
  const type =
    typeof params.type === "string" ? (params.type as JobType) : undefined;
  const workplace =
    typeof params.workplace === "string"
      ? (params.workplace as WorkplaceType)
      : undefined;
  const education =
    typeof params.education === "string"
      ? (params.education as EducationLevel)
      : undefined;
  const salaryMinStr =
    typeof params.salaryMin === "string" ? params.salaryMin : undefined;
  const salaryMinNum = salaryMinStr ? parseFloat(salaryMinStr) : undefined;
  const currentPage =
    typeof params.page === "string" && parseInt(params.page, 10) > 0
      ? parseInt(params.page, 10)
      : 1;

  // ---------------------------------------------------------------------------
  // Build Prisma where filter
  // ---------------------------------------------------------------------------
  const where: Prisma.JobWhereInput = { status: "PUBLISHED" };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { requirements: { contains: q } },
      { company: { name: { contains: q } } },
    ];
  }
  if (location) {
    where.location = {
      OR: [{ name: { contains: location } }, { slug: location }],
    };
  }
  if (category) where.category = { slug: category };
  if (type) where.type = type;
  if (workplace) where.workplace = workplace;
  if (education) where.education = education;
  if (salaryMinNum && !isNaN(salaryMinNum)) {
    where.OR = [
      ...(where.OR ?? []),
      { salaryMin: { gte: salaryMinNum } },
      { salaryMax: { gte: salaryMinNum } },
    ];
  }

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const [jobs, totalJobs, locations, categories] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: {
          select: { name: true, slug: true, logoUrl: true, isVerified: true },
        },
        location: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        skills: { include: { skill: { select: { name: true, slug: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
    }),
    prisma.job.count({ where }),
    prisma.location.findMany({
      orderBy: { orderIndex: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.jobCategory.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  const totalPages = Math.ceil(totalJobs / PAGE_SIZE);

  // ---------------------------------------------------------------------------
  // Active filters list
  // ---------------------------------------------------------------------------
  const activeFilters = [
    q ? { key: "q", label: `Cari: "${q}"` } : null,
    location ? { key: "location", label: `Wilayah: ${location}` } : null,
    category
      ? {
          key: "category",
          label: `Kategori: ${categories.find((c) => c.slug === category)?.name ?? category}`,
        }
      : null,
    type ? { key: "type", label: `Tipe: ${type}` } : null,
    workplace ? { key: "workplace", label: `Sistem: ${workplace}` } : null,
    education ? { key: "education", label: `Pendidikan: ${education}` } : null,
    salaryMinNum
      ? {
          key: "salaryMin",
          label: `Gaji Min: Rp ${(salaryMinNum / 1_000_000).toFixed(0)} Juta`,
        }
      : null,
  ].filter(Boolean) as { key: string; label: string }[];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col">
      <JobsPageHeader locations={locations} categories={categories} />

      <SectionContainer as="div" className="py-8 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <Card className="border-border bg-card sticky top-20">
              <CardContent className="p-5">
                <JobFilters />
              </CardContent>
            </Card>
          </aside>

          {/* Results Column */}
          <main className="min-w-0 flex-1 space-y-6">
            <JobsResultsBar totalJobs={totalJobs} />
            <ActiveFilterPills filters={activeFilters} params={params} />

            {jobs.length === 0 ? (
              <JobEmptyState />
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            <JobsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              params={params}
            />
          </main>
        </div>
      </SectionContainer>
    </div>
  );
}
