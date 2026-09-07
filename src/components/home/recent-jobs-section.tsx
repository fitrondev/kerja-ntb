import * as React from "react";

import Link from "next/link";

import { ArrowRight, Briefcase } from "lucide-react";

import { SectionHeader } from "@/components/common/section-header";
import { JobCard, type JobCardProps } from "@/components/jobs/job-card";
import { SectionContainer } from "@/components/layout/section-container";
import { Button } from "@/components/ui/button";

export interface RecentJobsSectionProps {
  jobs: JobCardProps["job"][];
  totalCount: number;
}

/**
 * Section lowongan terbaru di homepage.
 * Hanya tampil jika ada lowongan yang dipublikasikan.
 * Menampilkan maksimal 6 lowongan paling baru.
 */
export function RecentJobsSection({
  jobs,
  totalCount,
}: RecentJobsSectionProps) {
  if (jobs.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      fullWidth
      className="border-border bg-muted/20 border-y py-16 sm:py-20"
    >
      <div className="space-y-10">
        <SectionHeader
          label={
            <>
              <Briefcase className="mr-1 size-3" />
              Peluang Kerja Terbaru
            </>
          }
          title="Lowongan Kerja Teranyar di NTB"
          description="Posisi terbaru yang telah diverifikasi kelengkapan NIB dan keabsahan usahanya."
          action={{
            href: "/loker",
            label: `Lihat Semua (${totalCount})`,
          }}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl px-8 font-medium shadow-sm"
          >
            <Link href="/loker">
              <span>Jelajahi Seluruh Lowongan di NTB</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </SectionContainer>
  );
}
