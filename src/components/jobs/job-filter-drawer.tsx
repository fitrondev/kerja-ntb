"use client";

import * as React from "react";

import { useSearchParams } from "next/navigation";

import { Filter } from "lucide-react";

import { JobFilters } from "@/components/jobs/job-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function JobFilterDrawer() {
  const [open, setOpen] = React.useState(false);
  const searchParams = useSearchParams();

  // Count active filter tags
  const activeCount = [
    searchParams.get("type"),
    searchParams.get("workplace"),
    searchParams.get("education"),
    searchParams.get("salaryMin"),
    searchParams.get("location"),
    searchParams.get("category"),
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative gap-2 lg:hidden"
        >
          <Filter className="size-4" />
          <span>Filter</span>
          {activeCount > 0 && (
            <Badge
              variant="default"
              className="bg-primary text-primary-foreground size-5 rounded-full p-0 text-[10px] font-bold"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto p-6">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="text-base font-bold">
            Filter Lowongan Kerja
          </SheetTitle>
        </SheetHeader>
        <JobFilters />
      </SheetContent>
    </Sheet>
  );
}
