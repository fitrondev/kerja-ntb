import * as React from "react";

import Link from "next/link";

import { ArrowRight, MapPin } from "lucide-react";

import { SectionHeader } from "@/components/common/section-header";
import { SectionContainer } from "@/components/layout/section-container";
import { Card, CardContent } from "@/components/ui/card";

/** Mapping slug lokasi ke nama pulau */
const ISLAND_MAP: Record<string, string> = {
  "kota-mataram": "Pulau Lombok",
  "lombok-barat": "Pulau Lombok",
  "lombok-tengah": "Pulau Lombok",
  "lombok-timur": "Pulau Lombok",
  "lombok-utara": "Pulau Lombok",
  sumbawa: "Pulau Sumbawa",
  "sumbawa-barat": "Pulau Sumbawa",
  dompu: "Pulau Sumbawa",
  bima: "Pulau Sumbawa",
  "kota-bima": "Pulau Sumbawa",
};

export interface LocationItem {
  name: string;
  slug: string;
  type: string;
  province: string;
  _count: { jobs: number };
}

export interface RegionsSectionProps {
  locations: LocationItem[];
}

/**
 * Section 10 wilayah Kabupaten/Kota NTB di homepage.
 * Menampilkan jumlah loker per wilayah secara real-time dari database.
 */
export function RegionsSection({ locations }: RegionsSectionProps) {
  return (
    <SectionContainer as="section" className="py-16 sm:py-20">
      <div className="space-y-10">
        <SectionHeader
          label="Peluang Seluruh Wilayah NTB"
          title="10 Kabupaten & Kota Se-Nusa Tenggara Barat"
          description="Temukan lowongan kerja di dekat domisili Anda di Pulau Lombok maupun Pulau Sumbawa."
          align="center"
          labelVariant="chart"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {locations.map((loc) => (
            <RegionCard key={loc.slug} location={loc} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function RegionCard({ location: loc }: { location: LocationItem }) {
  const island = ISLAND_MAP[loc.slug] ?? "NTB";
  const jobCount = loc._count.jobs;

  return (
    <Link href={`/loker?location=${loc.slug}`} className="group block">
      <Card className="border-border bg-card hover:border-primary/50 hover:bg-card/90 h-full transition-all duration-200">
        <CardContent className="flex h-full flex-col justify-between space-y-3 p-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <MapPin className="text-primary size-4 transition-transform group-hover:scale-110" />
              <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-[10px] font-medium">
                {island.replace("Pulau ", "")}
              </span>
            </div>
            <h3 className="text-foreground group-hover:text-primary pt-1 text-sm leading-tight font-semibold transition-colors">
              {loc.name}
            </h3>
            <p className="text-muted-foreground text-[11px] capitalize">
              {loc.type === "KOTA" ? "Kota" : "Kabupaten"} &middot;{" "}
              {loc.province.split(" ").slice(-1)[0]}
            </p>
          </div>
          <div className="border-border/60 flex items-center justify-between border-t pt-2 text-xs">
            <span className="text-chart-1 font-semibold">
              {jobCount > 0 ? `${jobCount} Loker` : "Segera hadir"}
            </span>
            <ArrowRight className="text-muted-foreground group-hover:text-primary size-3 transition-all group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
