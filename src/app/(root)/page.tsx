import { CategoriesSection } from "@/components/home/categories-section";
import { CtaSection } from "@/components/home/cta-section";
import { HeroSection } from "@/components/home/hero-section";
import { RecentJobsSection } from "@/components/home/recent-jobs-section";
import { RegionsSection } from "@/components/home/regions-section";
import { TrustSection } from "@/components/home/trust-section";
import { prisma } from "@/lib/db/prisma";

/**
 * Homepage KerjaNTB.
 * Seluruh data di-fetch sekaligus via Promise.all kemudian didelegasikan ke
 * masing-masing section component. Page ini hanya bertugas mengambil data
 * dan menyusun layout antar-section.
 */
export default async function Home() {
  const [
    recentJobs,
    totalJobsCount,
    verifiedCompaniesCount,
    locations,
    jobCategories,
  ] = await Promise.all([
    // 6 lowongan terbaru (PUBLISHED)
    prisma.job.findMany({
      where: { status: "PUBLISHED" },
      include: {
        company: {
          select: { name: true, slug: true, logoUrl: true, isVerified: true },
        },
        location: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        skills: {
          include: { skill: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),

    // Total lowongan aktif
    prisma.job.count({ where: { status: "PUBLISHED" } }),

    // Total perusahaan terverifikasi
    prisma.company.count({ where: { isVerified: true } }),

    // 10 Wilayah NTB beserta jumlah loker
    prisma.location.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: { select: { jobs: { where: { status: "PUBLISHED" } } } },
      },
    }),

    // Kategori aktif (maks 8) beserta jumlah loker
    prisma.jobCategory.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      include: {
        _count: { select: { jobs: { where: { status: "PUBLISHED" } } } },
      },
      take: 8,
    }),
  ]);

  return (
    <div className="flex flex-col">
      <HeroSection
        locations={locations}
        totalJobsCount={totalJobsCount}
        verifiedCompaniesCount={verifiedCompaniesCount}
      />

      <CategoriesSection categories={jobCategories} />

      <RecentJobsSection jobs={recentJobs} totalCount={totalJobsCount} />

      <RegionsSection locations={locations} />

      <TrustSection />

      <CtaSection />
    </div>
  );
}
