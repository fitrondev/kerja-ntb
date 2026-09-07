"use client";

import * as React from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Filter, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  EDUCATION_LABELS,
  EXPERIENCE_LABELS,
  JOB_TYPE_LABELS,
  WORKPLACE_LABELS,
} from "@/lib/formatters";

interface FilterOption {
  value: string;
  label: string;
}

const JOB_TYPES: FilterOption[] = [
  { value: "FULL_TIME", label: JOB_TYPE_LABELS.FULL_TIME },
  { value: "CONTRACT", label: JOB_TYPE_LABELS.CONTRACT },
  { value: "PART_TIME", label: JOB_TYPE_LABELS.PART_TIME },
  { value: "INTERNSHIP", label: JOB_TYPE_LABELS.INTERNSHIP },
  { value: "FREELANCE", label: JOB_TYPE_LABELS.FREELANCE },
];

const WORKPLACE_TYPES: FilterOption[] = [
  { value: "ONSITE", label: WORKPLACE_LABELS.ONSITE },
  { value: "HYBRID", label: WORKPLACE_LABELS.HYBRID },
  { value: "REMOTE", label: WORKPLACE_LABELS.REMOTE },
];

const EDUCATION_LEVELS: FilterOption[] = [
  { value: "SMA_SMK", label: EDUCATION_LABELS.SMA_SMK },
  { value: "D3", label: EDUCATION_LABELS.D3 },
  { value: "D4_S1", label: EDUCATION_LABELS.D4_S1 },
  { value: "S2", label: EDUCATION_LABELS.S2 },
];

const SALARY_PRESETS = [
  { value: "3000000", label: "Mulai Rp 3 Juta/bln" },
  { value: "5000000", label: "Mulai Rp 5 Juta/bln" },
  { value: "10000000", label: "Mulai Rp 10 Juta/bln" },
  { value: "20000000", label: "Mulai Rp 20 Juta/bln" },
];

export function JobFilters({ className = "" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedType = searchParams.get("type") || "";
  const selectedWorkplace = searchParams.get("workplace") || "";
  const selectedEducation = searchParams.get("education") || "";
  const selectedSalaryMin = searchParams.get("salaryMin") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      // Toggle off if already active
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/loker?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    // preserve keyword if any
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`/loker${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const hasActiveFilters = Boolean(
    selectedType ||
    selectedWorkplace ||
    selectedEducation ||
    selectedSalaryMin ||
    searchParams.get("location") ||
    searchParams.get("category")
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="text-primary size-4" />
          <h3 className="text-foreground text-sm font-bold tracking-tight">
            Filter Lowongan
          </h3>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground h-8 gap-1 px-2 text-xs"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      <div className="space-y-5 text-sm">
        {/* Tipe Pekerjaan */}
        <div className="space-y-2.5">
          <h4 className="text-foreground text-xs font-semibold tracking-wider uppercase">
            Tipe Pekerjaan
          </h4>
          <div className="space-y-2">
            {JOB_TYPES.map((type) => (
              <label
                key={type.value}
                className="hover:text-foreground text-muted-foreground flex cursor-pointer items-center gap-2 text-xs transition-colors"
              >
                <Checkbox
                  checked={selectedType === type.value}
                  onCheckedChange={() => updateParam("type", type.value)}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-border/60 border-t" />

        {/* Sistem Tempat Kerja */}
        <div className="space-y-2.5">
          <h4 className="text-foreground text-xs font-semibold tracking-wider uppercase">
            Sistem Kerja
          </h4>
          <div className="space-y-2">
            {WORKPLACE_TYPES.map((wp) => (
              <label
                key={wp.value}
                className="hover:text-foreground text-muted-foreground flex cursor-pointer items-center gap-2 text-xs transition-colors"
              >
                <Checkbox
                  checked={selectedWorkplace === wp.value}
                  onCheckedChange={() => updateParam("workplace", wp.value)}
                />
                <span>{wp.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-border/60 border-t" />

        {/* Tingkat Pendidikan Minimal */}
        <div className="space-y-2.5">
          <h4 className="text-foreground text-xs font-semibold tracking-wider uppercase">
            Minimal Pendidikan
          </h4>
          <div className="space-y-2">
            {EDUCATION_LEVELS.map((edu) => (
              <label
                key={edu.value}
                className="hover:text-foreground text-muted-foreground flex cursor-pointer items-center gap-2 text-xs transition-colors"
              >
                <Checkbox
                  checked={selectedEducation === edu.value}
                  onCheckedChange={() => updateParam("education", edu.value)}
                />
                <span>{edu.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-border/60 border-t" />

        {/* Ekspektasi Gaji */}
        <div className="space-y-2.5">
          <h4 className="text-foreground text-xs font-semibold tracking-wider uppercase">
            Ekspektasi Gaji
          </h4>
          <div className="space-y-2">
            {SALARY_PRESETS.map((salary) => (
              <label
                key={salary.value}
                className="hover:text-foreground text-muted-foreground flex cursor-pointer items-center gap-2 text-xs transition-colors"
              >
                <Checkbox
                  checked={selectedSalaryMin === salary.value}
                  onCheckedChange={() => updateParam("salaryMin", salary.value)}
                />
                <span>{salary.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
