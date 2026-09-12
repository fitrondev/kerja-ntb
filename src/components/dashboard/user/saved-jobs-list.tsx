"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import { BookmarkX, Briefcase, MapPin, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { toggleSaveJobAction } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatSalary } from "@/lib/formatters";

export interface SavedJobItem {
  id: string; // SavedJob id
  createdAt: Date | string;
  job: {
    id: string;
    title: string;
    slug: string;
    type: string;
    workplace: string;
    salaryMin?: number | string | { toNumber?: () => number } | null;
    salaryMax?: number | string | { toNumber?: () => number } | null;
    isSalaryDisclosed?: boolean;
    location: { name: string; slug: string };
    company?: {
      name: string;
      slug: string;
      logoUrl?: string | null;
      isVerified?: boolean;
    } | null;
  };
}

export interface SavedJobsListProps {
  initialSavedJobs: SavedJobItem[];
}

export function SavedJobsList({ initialSavedJobs }: SavedJobsListProps) {
  const [savedJobs, setSavedJobs] = React.useState(initialSavedJobs);

  const handleRemove = async (jobId: string, title: string) => {
    try {
      const res = await toggleSaveJobAction(jobId);
      if (res.success) {
        toast.info(`"${title}" telah dihapus dari daftar tersimpan.`);
        setSavedJobs(savedJobs.filter((item) => item.job.id !== jobId));
      } else {
        toast.error("Gagal menghapus lowongan.");
      }
    } catch {
      toast.error("Terjadi masalah saat menghapus lowongan.");
    }
  };

  if (savedJobs.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BookmarkX className="text-muted-foreground/40 mb-3 size-12" />
          <h3 className="text-foreground text-base font-bold">
            Belum Ada Lowongan yang Disimpan
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
            Simpan lowongan kerja menarik yang Anda temukan di KerjaNTB untuk
            ditinjau dan dilamar nanti.
          </p>
          <Button asChild size="sm" className="mt-4 gap-2">
            <Link href="/loker">Cari Lowongan Sekarang</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>Tersimpan {savedJobs.length} lowongan</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {savedJobs.map(({ id, job }) => {
          const companyName = job.company?.name || "Perusahaan di NTB";
          const initials = companyName
            .split(" ")
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
          const salaryDisplay = formatSalary(
            job.salaryMin,
            job.salaryMax,
            job.isSalaryDisclosed ?? true
          );

          return (
            <Card
              key={id}
              className="border-border bg-card transition-shadow hover:shadow-sm"
            >
              <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary border-primary/20 relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-sm font-bold">
                    {job.company?.logoUrl ? (
                      <Image
                        src={job.company.logoUrl}
                        alt={companyName}
                        width={48}
                        height={48}
                        className="size-full rounded-xl object-contain p-1"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-muted-foreground text-xs font-medium">
                        {companyName}
                      </span>
                      {job.company?.isVerified && (
                        <VerifiedBadge variant="company" size="sm" />
                      )}
                    </div>

                    <h4 className="text-foreground hover:text-primary text-base font-bold transition-colors">
                      <Link href={`/loker/${job.slug}`}>{job.title}</Link>
                    </h4>

                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="text-primary size-3" />
                        <span>{job.location.name}</span>
                      </div>
                      <div className="text-foreground flex items-center gap-1 font-semibold">
                        <span>{salaryDisplay}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="size-3" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  <Button
                    asChild
                    size="sm"
                    className="h-9 gap-1.5 text-xs font-semibold"
                  >
                    <Link href={`/loker/${job.slug}#lamar-section`}>
                      <Send className="size-3.5" />
                      <span>Lamar Lowongan</span>
                    </Link>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(job.id, job.title)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 text-xs"
                    title="Hapus dari daftar tersimpan"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
