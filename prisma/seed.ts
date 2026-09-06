import { prisma } from "../src/lib/db/prisma";

const LOCATIONS_NTB = [
  { name: "Kota Mataram", slug: "kota-mataram", type: "KOTA", orderIndex: 1 },
  {
    name: "Kabupaten Lombok Barat",
    slug: "lombok-barat",
    type: "KABUPATEN",
    orderIndex: 2,
  },
  {
    name: "Kabupaten Lombok Tengah",
    slug: "lombok-tengah",
    type: "KABUPATEN",
    orderIndex: 3,
  },
  {
    name: "Kabupaten Lombok Timur",
    slug: "lombok-timur",
    type: "KABUPATEN",
    orderIndex: 4,
  },
  {
    name: "Kabupaten Lombok Utara",
    slug: "lombok-utara",
    type: "KABUPATEN",
    orderIndex: 5,
  },
  {
    name: "Kabupaten Sumbawa",
    slug: "sumbawa",
    type: "KABUPATEN",
    orderIndex: 6,
  },
  {
    name: "Kabupaten Sumbawa Barat",
    slug: "sumbawa-barat",
    type: "KABUPATEN",
    orderIndex: 7,
  },
  { name: "Kabupaten Dompu", slug: "dompu", type: "KABUPATEN", orderIndex: 8 },
  { name: "Kabupaten Bima", slug: "bima", type: "KABUPATEN", orderIndex: 9 },
  { name: "Kota Bima", slug: "kota-bima", type: "KOTA", orderIndex: 10 },
];

const JOB_CATEGORIES = [
  {
    name: "Pariwisata & Perhotelan",
    slug: "pariwisata-perhotelan",
    icon: "Hotel",
    orderIndex: 1,
  },
  {
    name: "Teknologi Informasi & IT",
    slug: "teknologi-informasi",
    icon: "Code2",
    orderIndex: 2,
  },
  {
    name: "Pertambangan & Energi",
    slug: "pertambangan-energi",
    icon: "Pickaxe",
    orderIndex: 3,
  },
  {
    name: "Pertanian & Perkebunan",
    slug: "pertanian-perkebunan",
    icon: "Wheat",
    orderIndex: 4,
  },
  {
    name: "Kelautan & Perikanan",
    slug: "kelautan-perikanan",
    icon: "Fish",
    orderIndex: 5,
  },
  {
    name: "Konstruksi & Properti",
    slug: "konstruksi-properti",
    icon: "HardHat",
    orderIndex: 6,
  },
  {
    name: "Pendidikan & Pelatihan",
    slug: "pendidikan-pelatihan",
    icon: "GraduationCap",
    orderIndex: 7,
  },
  {
    name: "Kesehatan & Farmasi",
    slug: "kesehatan-farmasi",
    icon: "HeartPulse",
    orderIndex: 8,
  },
  {
    name: "Keuangan & Perbankan",
    slug: "keuangan-perbankan",
    icon: "BadgeDollarSign",
    orderIndex: 9,
  },
  {
    name: "Penjualan & Retail",
    slug: "penjualan-retail",
    icon: "ShoppingBag",
    orderIndex: 10,
  },
  {
    name: "Administrasi & HR",
    slug: "administrasi-hr",
    icon: "Briefcase",
    orderIndex: 11,
  },
  {
    name: "Logistik & Transportasi",
    slug: "logistik-transportasi",
    icon: "Truck",
    orderIndex: 12,
  },
];

async function main() {
  console.log("==> Memulai seeding data KerjaNTB...");

  // Seed 10 Wilayah NTB
  for (const loc of LOCATIONS_NTB) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      update: { name: loc.name, type: loc.type, orderIndex: loc.orderIndex },
      create: loc,
    });
  }
  console.log("✓ 10 Wilayah Kabupaten/Kota NTB berhasil di-seed.");

  // Seed 12 Kategori Lowongan
  for (const cat of JOB_CATEGORIES) {
    await prisma.jobCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        orderIndex: cat.orderIndex,
        isActive: true,
      },
      create: cat,
    });
  }
  console.log("✓ 12 Kategori Lowongan Kerja berhasil di-seed.");

  console.log("==> Seeding selesai!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
