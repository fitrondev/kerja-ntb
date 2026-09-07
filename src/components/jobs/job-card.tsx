import * as React from "react";

import Link from "next/link";

import {
  Briefcase,
  Building2,
  Clock,
  ExternalLink,
  MapPin,
  Wallet,
} from "lucide-react";

import { JobSaveButton } from "@/components/jobs/job-save-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  JOB_TYPE_LABELS,
  WORKPLACE_LABELS,
  formatRelativeDate,
  formatSalary,
} from "@/lib/formatters";

export interface JobCardProps {
  job: {
    id: string;
    title: string;
    slug: string;
    type: string;
    workplace: string;
    salaryMin?: number | string | { toNumber?: () => number } | null;
    salaryMax?: number | string | { toNumber?: () => number } | null;
    isSalaryDisclosed?: boolean;
    createdAt: Date | string;
    company?: {
      name: string;
      slug: string;
      logoUrl?: string | null;
      isVerified?: boolean;
    } | null;
    location: {
      name: string;
      slug: string;
    };
    category?: {
      name: string;
      slug: string;
    } | null;
    skills?: Array<{
      skill: {
        name: string;
        slug: string;
      };
    }>;
  };
}

export function JobCard({ job }: JobCardProps) {
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
    <Card className="border-border bg-card hover:border-primary/40 group relative overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="flex flex-col justify-between gap-4 p-5 sm:p-6">
        <div className="space-y-3">
          {/* Header row: Company logo/initials + Company info & badges */}
          <div className="flex items-start gap-3.5">
            <div className="bg-primary/10 text-primary border-primary/20 flex size-12 shrink-0 items-center justify-center rounded-xl border text-sm font-bold shadow-2xs">
              {job.company?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.company.logoUrl}
                  alt={companyName}
                  className="size-full rounded-xl object-contain p-1"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground truncate text-xs font-medium">
                  {companyName}
                </span>
                {job.company?.isVerified && (
                  <VerifiedBadge variant="company" size="sm" />
                )}
              </div>

              <h3 className="text-foreground group-hover:text-primary text-base leading-snug font-bold transition-colors sm:text-lg">
                <Link
                  href={`/loker/${job.slug}`}
                  className="focus-visible:ring-ring rounded-xs focus-visible:ring-2 focus-visible:outline-hidden"
                >
                  {job.title}
                </Link>
              </h3>
            </div>

            <JobSaveButton
              jobId={job.id}
              jobTitle={job.title}
              size="icon"
              variant="ghost"
              showLabel={false}
              className="text-muted-foreground hover:text-primary size-8 shrink-0"
            />
          </div>

          {/* Location & Tags row */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="text-primary size-3.5 shrink-0" />
              <span>{job.location.name}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Briefcase className="size-3.5 shrink-0" />
              <span>{JOB_TYPE_LABELS[job.type] || job.type}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Building2 className="size-3.5 shrink-0" />
              <span>{WORKPLACE_LABELS[job.workplace] || job.workplace}</span>
            </div>
          </div>

          {/* Skills pills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {job.skills.slice(0, 3).map(({ skill }) => (
                <Badge
                  key={skill.slug}
                  variant="secondary"
                  className="text-[11px] font-normal"
                >
                  {skill.name}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <span className="text-muted-foreground self-center text-[11px]">
                  +{job.skills.length - 3} lainnya
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Salary & Time & Action */}
        <div className="border-border/60 flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1.5">
            <Wallet className="text-chart-1 size-4 shrink-0" />
            <span className="text-foreground text-sm font-semibold">
              {salaryDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="size-3 shrink-0" />
              <span>{formatRelativeDate(job.createdAt)}</span>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="group/btn hover:bg-primary hover:text-primary-foreground hover:border-primary gap-1 text-xs font-medium transition-colors"
            >
              <Link href={`/loker/${job.slug}`}>
                <span>Rincian</span>
                <ExternalLink className="size-3 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
