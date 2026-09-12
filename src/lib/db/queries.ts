import { cache } from "react";

import { prisma } from "@/lib/db/prisma";

/**
 * Mengambil data detail lowongan berdasarkan slug.
 * Di-memoize per-request menggunakan React.cache() sehingga panggilan
 * dari generateMetadata() dan Page Component tidak memicu query ganda.
 */
export const getJobBySlug = cache(async (slug: string) => {
  return await prisma.job.findUnique({
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
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });
});

/**
 * Mengambil daftar seluruh 10 Kabupaten/Kota NTB.
 * Di-memoize per-request untuk mencegah duplikasi query master data di layout & subkomponen.
 */
export const getLocations = cache(async () => {
  return await prisma.location.findMany({
    orderBy: { orderIndex: "asc" },
  });
});

/**
 * Mengambil daftar kategori pekerjaan aktif di NTB.
 * Di-memoize per-request menggunakan React.cache().
 */
export const getJobCategories = cache(async () => {
  return await prisma.jobCategory.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
  });
});
