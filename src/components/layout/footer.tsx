import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import { AlertTriangle, Mail, MapPin, ShieldCheck } from "lucide-react";

import { SectionContainer } from "@/components/layout/section-container";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VerifiedBadge } from "@/components/ui/verified-badge";

const ntbRegions = [
  { name: "Kota Mataram", island: "Pulau Lombok" },
  { name: "Kab. Lombok Barat", island: "Pulau Lombok" },
  { name: "Kab. Lombok Tengah", island: "Pulau Lombok" },
  { name: "Kab. Lombok Timur", island: "Pulau Lombok" },
  { name: "Kab. Lombok Utara", island: "Pulau Lombok" },
  { name: "Kab. Sumbawa", island: "Pulau Sumbawa" },
  { name: "Kab. Sumbawa Barat", island: "Pulau Sumbawa" },
  { name: "Kab. Dompu", island: "Pulau Sumbawa" },
  { name: "Kab. Bima", island: "Pulau Sumbawa" },
  { name: "Kota Bima", island: "Pulau Sumbawa" },
];

const popularCategories = [
  { name: "Pariwisata & Perhotelan", slug: "pariwisata-hospitality" },
  { name: "Pertambangan & Energi", slug: "pertambangan-energi" },
  { name: "Teknologi Informasi & Digital", slug: "ti-digital" },
  { name: "Perdagangan & Retail", slug: "perdagangan-retail" },
  { name: "Pendidikan & Pelatihan", slug: "pendidikan-pelatihan" },
  { name: "Kesehatan & Farmasi", slug: "kesehatan-farmasi" },
  { name: "Pertanian & Agribisnis", slug: "pertanian-agribisnis" },
  { name: "Konstruksi & Properti", slug: "konstruksi-properti" },
];

export function Footer() {
  return (
    <SectionContainer
      as="footer"
      fullWidth
      className="border-border bg-card/60 text-foreground border-t backdrop-blur-xs"
    >
      <div className="py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission (2 cols on lg) */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl">
                <Image
                  src="/api/storage/file/Logo/logo.webp"
                  alt="Logo KerjaNTB"
                  width={36}
                  height={36}
                  className="size-9 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight">
                    KerjaNTB
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-[10px] font-bold"
                  >
                    NTB
                  </Badge>
                </div>
                <span className="text-muted-foreground text-xs">
                  Portal Karir Resmi & Terpercaya se-NTB
                </span>
              </div>
            </Link>

            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              Platform bursa kerja lokal khusus wilayah Nusa Tenggara Barat.
              Menghubungkan talenta daerah dengan perusahaan terverifikasi NIB
              di 10 Kabupaten/Kota se-NTB, berkomitmen bebas penipuan dan tanpa
              pungutan biaya apapun bagi pencari kerja.
            </p>

            <div className="pt-2">
              <VerifiedBadge variant="company" size="sm" />
            </div>

            <div className="text-muted-foreground space-y-1.5 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="text-primary size-3.5 shrink-0" />
                <span>Mataram, Nusa Tenggara Barat, Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-primary size-3.5 shrink-0" />
                <span>bantuan@kerjantb.com</span>
              </div>
            </div>
          </div>

          {/* 10 Wilayah NTB */}
          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              10 Wilayah NTB
            </h3>
            <ul className="space-y-2 text-xs">
              {ntbRegions.map((region) => (
                <li key={region.name}>
                  <Link
                    href={`/loker?location=${encodeURIComponent(region.name)}`}
                    className="text-muted-foreground hover:text-primary flex items-center justify-between transition-colors"
                  >
                    <span>{region.name}</span>
                    <span className="text-muted-foreground/60 text-[10px]">
                      {region.island.replace("Pulau ", "")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kategori Populer NTB */}
          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Kategori Karir
            </h3>
            <ul className="space-y-2 text-xs">
              {popularCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/loker?category=${cat.slug}`}
                    className="text-muted-foreground hover:text-primary block transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan & Keamanan Anti-Penipuan */}
          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Layanan & Bantuan
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/loker"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Jelajahi Lowongan
                </Link>
              </li>
              <li>
                <Link
                  href="/pasang-loker"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pasang Lowongan (Perusahaan)
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard Pencari Kerja
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Tentang KerjaNTB
                </Link>
              </li>
              <li>
                <Link
                  href="/laporkan"
                  className="text-destructive flex items-center gap-1 font-medium transition-colors hover:underline"
                >
                  <AlertTriangle className="size-3 shrink-0" />
                  <span>Layanan Pengaduan Penipuan</span>
                </Link>
              </li>
            </ul>

            <div className="border-border bg-muted/40 mt-4 space-y-1 rounded-lg border p-3 text-xs">
              <span className="text-foreground flex items-center gap-1 font-semibold">
                <ShieldCheck className="text-chart-1 size-3.5" />
                Anti-Pungli & Scam
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Lamaran kerja di KerjaNTB 100% gratis. Laporkan jika ada oknum
                yang meminta imbalan dana atau tiket perjalanan.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} KerjaNTB. Seluruh hak cipta dilindungi
            undang-undang.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/privasi"
              className="hover:text-foreground transition-colors"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/syarat"
              className="hover:text-foreground transition-colors"
            >
              Syarat & Ketentuan
            </Link>
            <Link
              href="/penafian"
              className="hover:text-foreground transition-colors"
            >
              Disclaimer
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <span className="inline-flex items-center gap-1">
              Dibangun untuk Masyarakat NTB
            </span>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
