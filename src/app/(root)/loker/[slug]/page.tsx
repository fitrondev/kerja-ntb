import { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  JobApplyCard,
  JobCompanySidebar,
  JobDescription,
  JobDetailHeader,
  JobMetricsBar,
  SimilarJobsSection,
} from "@/components/jobs/job-detail-components";
import { SectionContainer } from "@/components/layout/section-container";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";
import { formatSalary } from "@/lib/formatters";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await prisma.job.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      company: { select: { name: true } },
      location: { select: { name: true } },
    },
  });

  if (!job) return { title: "Lowongan Tidak Ditemukan | KerjaNTB" };

  const companyName = job.company?.name ?? "Perusahaan NTB";
  return {
    title: `${job.title} di ${companyName} - ${job.location.name} | KerjaNTB`,
    description: job.description.slice(0, 160),
    openGraph: {
      title: `${job.title} — ${companyName}`,
      description: job.description.slice(0, 160),
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const job = await prisma.job.findUnique({
    where: { slug },
    include: {
      company: {
        include: {
          verification: {
            select: { nib: true, legalName: true, status: true },
          },
        },
      },
      location: true,
      category: true,
      skills: { include: { skill: true } },
    },
  });

  if (!job) notFound();

  // Increment view count (fire-and-forget)
  prisma.job
    .update({ where: { id: job.id }, data: { viewsCount: { increment: 1 } } })
    .catch(() => {});

  // Fetch similar jobs
  const similarJobs = await prisma.job.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: job.id },
      OR: [{ categoryId: job.categoryId }, { locationId: job.locationId }],
    },
    include: {
      company: {
        select: { name: true, slug: true, logoUrl: true, isVerified: true },
      },
      location: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      skills: { include: { skill: { select: { name: true, slug: true } } } },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // Derived values
  const companyName = job.company?.name ?? "Perusahaan di NTB";
  const initials = companyName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const salaryDisplay = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.isSalaryDisclosed
  );

  // Check if current user saved this job
  let isSaved = false;
  const user = await getCurrentUser();
  if (user) {
    const savedRecord = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId: job.id,
        },
      },
    });
    isSaved = Boolean(savedRecord);
  }

  // Google Jobs structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    validThrough: job.deadline?.toISOString(),
    employmentType: job.type,
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
      sameAs: job.company?.website ?? undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location.name,
        addressRegion: "Nusa Tenggara Barat",
        addressCountry: "ID",
      },
    },
    baseSalary:
      job.isSalaryDisclosed && job.salaryMin
        ? {
            "@type": "MonetaryAmount",
            currency: "IDR",
            value: {
              "@type": "QuantitativeValue",
              minValue: Number(job.salaryMin),
              maxValue: job.salaryMax ? Number(job.salaryMax) : undefined,
              unitText: "MONTH",
            },
          }
        : undefined,
  };

  return (
    <div className="flex flex-col">
      {/* Google Jobs Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <JobDetailHeader
        job={job}
        companyName={companyName}
        initials={initials}
        initialSaved={isSaved}
      />

      <JobMetricsBar
        salaryDisplay={salaryDisplay}
        type={job.type}
        workplace={job.workplace}
        education={job.education}
      />

      <SectionContainer as="div" className="py-8 sm:py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <main className="min-w-0 flex-1 space-y-8">
            <JobDescription
              description={job.description}
              responsibilities={job.responsibilities}
              requirements={job.requirements}
              benefits={job.benefits}
              skills={job.skills}
            />
            <JobApplyCard
              jobSlug={job.slug}
              jobTitle={job.title}
              companyName={companyName}
              applicationMethod={job.applicationMethod}
              applicationEmail={job.applicationEmail}
              externalUrl={job.externalUrl}
            />
          </main>

          <JobCompanySidebar
            company={job.company}
            companyName={companyName}
            jobId={job.id}
            jobTitle={job.title}
          />
        </div>
      </SectionContainer>

      <SimilarJobsSection jobs={similarJobs} />
    </div>
  );
}
