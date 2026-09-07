import * as React from "react";

import { JobFilterDrawer } from "@/components/jobs/job-filter-drawer";

export interface JobsResultsBarProps {
  totalJobs: number;
}

/**
 * Bar hasil pencarian: menampilkan jumlah lowongan yang ditemukan
 * dan tombol filter mobile (drawer).
 */
export function JobsResultsBar({ totalJobs }: JobsResultsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-foreground text-sm font-semibold sm:text-base">
          Menampilkan{" "}
          <span className="text-primary font-bold">{totalJobs}</span>{" "}
          Lowongan Kerja
        </h2>
      </div>
      <JobFilterDrawer />
    </div>
  );
}
