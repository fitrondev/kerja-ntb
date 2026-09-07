"use client";

import * as React from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Briefcase, MapPin, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JobSearchBarProps {
  locations: Array<{ name: string; slug: string }>;
  categories: Array<{ name: string; slug: string }>;
  className?: string;
}

export function JobSearchBar({
  locations,
  categories,
  className = "",
}: JobSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = React.useState(searchParams.get("q") || "");
  const [selectedLocation, setSelectedLocation] = React.useState(
    searchParams.get("location") || ""
  );
  const [selectedCategory, setSelectedCategory] = React.useState(
    searchParams.get("category") || ""
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    if (selectedLocation) {
      params.set("location", selectedLocation);
    } else {
      params.delete("location");
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    // Reset pagination to page 1 on new search
    params.delete("page");

    router.push(`/loker?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedLocation("");
    setSelectedCategory("");
    router.push("/loker");
  };

  const hasFilters = Boolean(
    query ||
    selectedLocation ||
    selectedCategory ||
    searchParams.get("type") ||
    searchParams.get("workplace")
  );

  return (
    <div
      className={`border-border bg-card rounded-2xl border p-2.5 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-2 md:flex-row md:items-center"
      >
        {/* Keyword input */}
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Posisi, keahlian, atau nama perusahaan..."
            className="h-11 border-0 bg-transparent pl-10 text-sm shadow-none focus-visible:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              aria-label="Hapus kata kunci"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="bg-border hidden h-7 w-px md:block" />

        {/* Location selector */}
        <div className="relative md:w-52">
          <MapPin className="text-primary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            aria-label="Pilih Lokasi di NTB"
            className="text-foreground h-11 w-full cursor-pointer rounded-lg border-0 bg-transparent pr-4 pl-9 text-xs focus-visible:outline-hidden sm:text-sm"
          >
            <option value="" className="bg-popover text-popover-foreground">
              Semua Wilayah NTB
            </option>
            {locations.map((loc) => (
              <option
                key={loc.slug}
                value={loc.name}
                className="bg-popover text-popover-foreground"
              >
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-border hidden h-7 w-px md:block" />

        {/* Category selector */}
        <div className="relative md:w-52">
          <Briefcase className="text-primary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Pilih Kategori Pekerjaan"
            className="text-foreground h-11 w-full cursor-pointer rounded-lg border-0 bg-transparent pr-4 pl-9 text-xs focus-visible:outline-hidden sm:text-sm"
          >
            <option value="" className="bg-popover text-popover-foreground">
              Semua Kategori
            </option>
            {categories.map((cat) => (
              <option
                key={cat.slug}
                value={cat.slug}
                className="bg-popover text-popover-foreground"
              >
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1 md:pt-0">
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground h-11 px-3 text-xs"
            >
              Reset
            </Button>
          )}

          <Button
            type="submit"
            size="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full gap-2 rounded-xl px-5 font-medium shadow-2xs md:w-auto"
          >
            <Search className="size-4" />
            <span>Cari Loker</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
