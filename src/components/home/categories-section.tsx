import * as React from "react";

import Link from "next/link";

import {
  BadgeDollarSign,
  Briefcase,
  Building2,
  Code2,
  Fish,
  GraduationCap,
  HardHat,
  HeartPulse,
  Hotel,
  Pickaxe,
  ShoppingBag,
  Truck,
  Wheat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SectionHeader } from "@/components/common/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/layout/section-container";

/** Map nama icon (dari DB) ke komponen Lucide */
const ICON_MAP: Record<string, LucideIcon> = {
  Hotel,
  Code2,
  Pickaxe,
  Wheat,
  Fish,
  HardHat,
  GraduationCap,
  HeartPulse,
  BadgeDollarSign,
  ShoppingBag,
  Briefcase,
  Truck,
  Building2,
};

export interface CategoryItem {
  name: string;
  slug: string;
  icon: string | null;
  _count: { jobs: number };
}

export interface CategoriesSectionProps {
  categories: CategoryItem[];
}

/**
 * Section kategori pekerjaan populer di homepage.
 * Menampilkan grid kategori dari database beserta jumlah lowongan aktif.
 */
export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <SectionContainer as="section" className="py-16 sm:py-20">
      <div className="space-y-10">
        <SectionHeader
          label="Kategori Unggulan"
          title="Jelajahi Berdasarkan Bidang Karir"
          description="Pilih sektor industri yang sesuai dengan pengalaman dan keahlian Anda."
          action={{ href: "/loker", label: "Semua Kategori" }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function CategoryCard({ category }: { category: CategoryItem }) {
  const Icon = category.icon
    ? (ICON_MAP[category.icon] ?? Briefcase)
    : Briefcase;
  const jobCount = category._count.jobs;

  return (
    <Link href={`/loker?category=${category.slug}`} className="group block">
      <Card className="border-border bg-card hover:border-primary/40 h-full transition-all duration-200 hover:shadow-md">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground group-hover:text-primary truncate text-sm font-semibold transition-colors">
              {category.name}
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {jobCount > 0 ? `${jobCount} Lowongan` : "Belum ada lowongan"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
