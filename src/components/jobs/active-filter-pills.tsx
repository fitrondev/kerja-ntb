import * as React from "react";

import Link from "next/link";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ActiveFilter {
  key: string;
  label: string;
}

export interface ActiveFilterPillsProps {
  filters: ActiveFilter[];
  /** Raw params object untuk membangun URL hapus filter */
  params: Record<string, string | string[] | undefined>;
}

/**
 * Daftar pill filter aktif yang dapat di-klik untuk menghapus filter satu per satu.
 * Tidak dirender jika tidak ada filter aktif.
 */
export function ActiveFilterPills({ filters, params }: ActiveFilterPillsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="text-muted-foreground text-xs font-medium">
        Filter aktif:
      </span>
      {filters.map((f) => (
        <Link
          key={f.key}
          href={buildFilterUrl(f.key, params)}
          className="group"
        >
          <Badge
            variant="secondary"
            className="group-hover:border-destructive/40 group-hover:bg-destructive/10 group-hover:text-destructive gap-1.5 text-xs transition-colors"
          >
            <span>{f.label}</span>
            <X className="size-3" />
          </Badge>
        </Link>
      ))}
      <Button
        asChild
        variant="link"
        size="sm"
        className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
      >
        <Link href="/loker">Hapus Semua</Link>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper (lokal)
// ---------------------------------------------------------------------------

function buildFilterUrl(
  keyToRemove: string,
  params: Record<string, string | string[] | undefined>
): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (k !== keyToRemove && k !== "page" && typeof v === "string") {
      p.set(k, v);
    }
  });
  const queryStr = p.toString();
  return `/loker${queryStr ? `?${queryStr}` : ""}`;
}
