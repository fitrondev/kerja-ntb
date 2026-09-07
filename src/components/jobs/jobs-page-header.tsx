import * as React from "react";

import Link from "next/link";

import { ChevronRight, Home, Sparkles } from "lucide-react";

import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { SectionContainer } from "@/components/layout/section-container";
import { Badge } from "@/components/ui/badge";

interface Location {
  name: string;
  slug: string;
}

interface Category {
  name: string;
  slug: string;
}

export interface JobsPageHeaderProps {
  locations: Location[];
  categories: Category[];
}

/**
 * Header halaman daftar lowongan kerja.
 * Berisi breadcrumb, judul halaman, dan search bar.
 */
export function JobsPageHeader({ locations, categories }: JobsPageHeaderProps) {
  return (
    <SectionContainer
      as="header"
      fullWidth
      className="border-border from-background via-muted/10 to-muted/30 border-b bg-linear-to-b py-8 sm:py-12"
    >
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-muted-foreground flex items-center gap-2 text-xs"
        >
          <Link
            href="/"
            className="hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <Home className="size-3.5" />
            <span>Beranda</span>
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">Lowongan Kerja</span>
        </nav>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold"
            >
              <Sparkles className="mr-1 size-3" />
              Eksplorasi Karir NTB
            </Badge>
          </div>
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            Lowongan Kerja di Nusa Tenggara Barat
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
            Temukan peluang karir terverifikasi NIB di 10 Kabupaten/Kota
            se-Lombok dan Sumbawa.
          </p>
        </div>

        {/* Search Box */}
        <JobSearchBar locations={locations} categories={categories} />
      </div>
    </SectionContainer>
  );
}
