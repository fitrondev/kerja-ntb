import * as React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface JobsPaginationProps {
  currentPage: number;
  totalPages: number;
  params: Record<string, string | string[] | undefined>;
}

/**
 * Komponen pagination untuk halaman daftar lowongan.
 * Tidak dirender jika hanya ada 1 halaman.
 */
export function JobsPagination({
  currentPage,
  totalPages,
  params,
}: JobsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="pt-6">
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href={buildPageUrl(currentPage - 1, params)}
                text="Sebelumnya"
              />
            </PaginationItem>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                href={buildPageUrl(p, params)}
                isActive={p === currentPage}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                href={buildPageUrl(currentPage + 1, params)}
                text="Selanjutnya"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper (lokal)
// ---------------------------------------------------------------------------

function buildPageUrl(
  pageNumber: number,
  params: Record<string, string | string[] | undefined>,
): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (k !== "page" && typeof v === "string") {
      p.set(k, v);
    }
  });
  p.set("page", pageNumber.toString());
  return `/loker?${p.toString()}`;
}
