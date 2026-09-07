import * as React from "react";

import Link from "next/link";

import { RotateCcw, Search, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

interface JobEmptyStateProps {
  title?: string;
  description?: string;
  resetUrl?: string;
}

export function JobEmptyState({
  title = "Tidak ada lowongan yang sesuai",
  description = "Coba gunakan kata kunci yang lebih umum, ubah filter wilayah NTB, atau reset filter pencarian untuk melihat semua lowongan kerja aktif.",
  resetUrl = "/loker",
}: JobEmptyStateProps) {
  return (
    <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
      <div className="bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-2xl">
        <SearchX className="size-7" />
      </div>

      <h3 className="text-foreground text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl"
        >
          <Link href={resetUrl}>
            <RotateCcw className="size-3.5" />
            <span>Reset Semua Filter</span>
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl"
        >
          <Link href="/loker">
            <Search className="size-3.5" />
            <span>Lihat Semua Loker</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
