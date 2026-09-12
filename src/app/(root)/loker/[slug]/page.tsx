import { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";

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
import { getJobBySlug } from "@/lib/db/queries";
import { formatSalary } from "@/lib/formatters";
import { generateJobPostingJsonLd } from "@/lib/seo/job-posting-schema";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) return { title: "Lowongan Tidak Ditemukan | KerjaNTB" };

  const companyName = job.company?.name ?? "Perusahaan NTB";
  const title = `${job.title} di ${companyName} (${job.location.name}) | KerjaNTB`;
  const description = `${job.description.slice(0, 155)}...`;

  return {
    title,
    description,
    alternates: {
      canonical: `/loker/${slug}`,
    },
    openGraph: {
      title: `${job.title} — ${companyName}`,
      description,
      url: `/loker/${slug}`,
      siteName: "KerjaNTB",
      locale: "id_ID",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} — ${companyName}`,
      description,
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

  const job = await getJobBySlug(slug);

  if (!job) notFound();

  // Increment view count non-blockingly via after()
  after(async () => {
    try {
      await prisma.job.update({
        where: { id: job.id },
        data: { viewsCount: { increment: 1 } },
      });
    } catch {
      // Fail-safe view counter
    }
  });

  // Parallel fetch: current user and similar jobs concurrently
  const [user, similarJobs] = await Promise.all([
    getCurrentUser(),
    prisma.job.findMany({
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
    }),
  ]);

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

  // Check if current user saved this job or has applied, and fetch resumes
  let isSaved = false;
  let hasApplied = false;
  let userResumes: Array<{
    id: string;
    title: string;
    fileUrl: string | null;
    isDefault: boolean;
  }> = [];

  if (user) {
    const [savedRecord, applicationRecord, dbResumes] = await Promise.all([
      prisma.savedJob.findUnique({
        where: {
          userId_jobId: {
            userId: user.id,
            jobId: job.id,
          },
        },
      }),
      prisma.application.findUnique({
        where: {
          jobId_userId: {
            jobId: job.id,
            userId: user.id,
          },
        },
      }),
      prisma.resume.findMany({
        where: { userId: user.id },
        select: { id: true, title: true, fileUrl: true, isDefault: true },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
    ]);

    isSaved = Boolean(savedRecord);
    hasApplied = Boolean(applicationRecord);
    userResumes = dbResumes;
  }

  // Google for Jobs structured data resmi (Schema.org/JobPosting)
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kerjantb.com";
  const jsonLd = generateJobPostingJsonLd(job, appBaseUrl);

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
              jobId={job.id}
              jobSlug={job.slug}
              jobTitle={job.title}
              companyName={companyName}
              applicationMethod={job.applicationMethod}
              applicationEmail={job.applicationEmail}
              externalUrl={job.externalUrl}
              userResumes={userResumes}
              isLoggedIn={Boolean(user)}
              hasApplied={hasApplied}
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
