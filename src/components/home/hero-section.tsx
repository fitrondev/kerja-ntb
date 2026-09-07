import * as React from "react";

import { CheckCircle2, MapPin, Mountain, Search, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { SectionContainer } from "@/components/layout/section-container";

interface Location {
  name: string;
  slug: string;
}

export interface HeroSectionProps {
  locations: Location[];
  totalJobsCount: number;
  verifiedCompaniesCount: number;
}

/**
 * Hero section homepage KerjaNTB.
 * Menampilkan headline utama, search box dengan dropdown wilayah, dan trust metrics bar.
 */
export function HeroSection({
  locations,
  totalJobsCount,
  verifiedCompaniesCount,
}: HeroSectionProps) {
  return (
    <SectionContainer
      as="section"
      fullWidth
      className="border-border from-background via-muted/10 to-muted/30 relative overflow-hidden border-b bg-linear-to-b py-16 sm:py-24"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8 text-center">
        {/* Trust Banner Badge */}
        <div className="inline-flex items-center gap-2">
          <VerifiedBadge variant="anti-fraud" size="default" />
          <Badge
            variant="outline"
            className="bg-card text-muted-foreground hidden sm:inline-flex"
          >
            10 Kabupaten/Kota se-NTB
          </Badge>
        </div>

        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-foreground text-4xl leading-[1.15] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Gerbang Karir &amp; Peluang Kerja Terpercaya di{" "}
            <span className="text-primary decoration-primary/30 underline decoration-wavy decoration-2 underline-offset-8">
              Nusa Tenggara Barat
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed sm:text-xl">
            Hubungkan masa depan karir Anda dengan perusahaan terverifikasi NIB
            di Pulau Lombok dan Sumbawa. Bebas pungutan biaya dan transparan.
          </p>
        </div>

        {/* Quick Search Box */}
        <HeroSearchBox locations={locations} />

        {/* Trust Metrics Bar */}
        <HeroMetricsBar
          totalJobsCount={totalJobsCount}
          verifiedCompaniesCount={verifiedCompaniesCount}
        />
      </div>
    </SectionContainer>
  );
}

// ---------------------------------------------------------------------------
// Sub-components (private, tidak diekspor)
// ---------------------------------------------------------------------------

function HeroSearchBox({ locations }: { locations: Location[] }) {
  return (
    <div className="border-border bg-card w-full max-w-3xl rounded-2xl border p-3 shadow-lg transition-shadow hover:shadow-xl">
      <form
        action="/loker"
        method="GET"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <Input
            type="text"
            name="q"
            placeholder="Keahlian, posisi, atau nama perusahaan..."
            className="h-12 border-0 bg-transparent pl-10 text-sm shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="bg-border hidden h-8 w-px sm:block" />

        <div className="relative sm:w-56">
          <MapPin className="text-primary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <select
            name="location"
            aria-label="Pilih Wilayah NTB"
            className="text-foreground h-12 w-full cursor-pointer border-0 bg-transparent pr-4 pl-9 text-xs focus-visible:outline-hidden sm:text-sm"
            defaultValue=""
          >
            <option value="" className="bg-popover text-popover-foreground">
              Semua Wilayah NTB
            </option>
            {locations.map((loc) => (
              <option
                key={loc.slug}
                value={loc.slug}
                className="bg-popover text-popover-foreground"
              >
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 gap-2 rounded-xl px-6 font-medium shadow-sm"
        >
          <Search className="size-4" />
          <span>Cari Loker</span>
        </Button>
      </form>
    </div>
  );
}

function HeroMetricsBar({
  totalJobsCount,
  verifiedCompaniesCount,
}: {
  totalJobsCount: number;
  verifiedCompaniesCount: number;
}) {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-6 pt-2 text-xs sm:gap-10 sm:text-sm">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="text-chart-1 size-4" />
        <span>
          <strong className="text-foreground">
            {totalJobsCount > 0 ? `${totalJobsCount}+` : "600+"}
          </strong>{" "}
          Lowongan Aktif
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-chart-1 size-4" />
        <span>
          <strong className="text-foreground">
            {verifiedCompaniesCount > 0 ? `${verifiedCompaniesCount}+` : "150+"}
          </strong>{" "}
          Perusahaan Terverifikasi
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Mountain className="text-primary size-4" />
        <span>
          <strong className="text-foreground">10</strong> Daerah Resmi NTB
        </span>
      </div>
    </div>
  );
}
