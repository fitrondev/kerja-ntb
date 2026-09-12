import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db/prisma";

export const revalidate = 3600; // Revalidate sitemap setiap 1 jam

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kerjantb.com";

  try {
    // 1. Ambil seluruh data dinamis secara paralel
    const [jobs, locations, categories] = await Promise.all([
      prisma.job.findMany({
        where: { status: "PUBLISHED" },
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.location.findMany({
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.jobCategory.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: { orderIndex: "asc" },
      }),
    ]);

    // 2. Rute Statis Pokok
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/loker`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];

    // 3. Rute Dinamis Lowongan Kerja Aktif
    const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
      url: `${baseUrl}/loker/${job.slug}`,
      lastModified: job.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    // 4. Rute Dinamis 10 Kabupaten/Kota NTB (SEO Wilayah Lokal)
    const locationRoutes: MetadataRoute.Sitemap = locations.map((loc) => ({
      url: `${baseUrl}/loker?lokasi=${loc.slug}`,
      lastModified: loc.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // 5. Rute Dinamis Kategori Pekerjaan
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/loker?kategori=${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [
      ...staticRoutes,
      ...jobRoutes,
      ...locationRoutes,
      ...categoryRoutes,
    ];
  } catch (error) {
    console.error(
      "[Sitemap Generation Warning]: Gagal membaca database:",
      error
    );
    // Fallback minimal jika koneksi DB bermasalah saat build time
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/loker`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];
  }
}
