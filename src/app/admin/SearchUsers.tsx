"use client";

import { useState, useTransition } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchUsers() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? ""
  );
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      const trimmed = searchTerm.trim();
      if (trimmed) {
        router.push(`${pathname}?search=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(pathname);
      }
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-lg items-center gap-2"
    >
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          id="search"
          name="search"
          type="text"
          placeholder="Cari pengguna berdasarkan nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mencari...
          </>
        ) : (
          "Cari Pengguna"
        )}
      </Button>
      {searchParams.get("search") && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setSearchTerm("");
            router.push(pathname);
          }}
        >
          Reset
        </Button>
      )}
    </form>
  );
}
