"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ChevronDown, MapPin, PlusCircle, Sparkles } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { SectionContainer } from "@/components/layout/section-container";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ntbRegions = [
  { name: "Kota Mataram", island: "Lombok" },
  { name: "Lombok Barat", island: "Lombok" },
  { name: "Lombok Tengah", island: "Lombok" },
  { name: "Lombok Timur", island: "Lombok" },
  { name: "Lombok Utara", island: "Lombok" },
  { name: "Sumbawa", island: "Sumbawa" },
  { name: "Sumbawa Barat", island: "Sumbawa" },
  { name: "Dompu", island: "Sumbawa" },
  { name: "Bima", island: "Sumbawa" },
  { name: "Kota Bima", island: "Sumbawa" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur transition-all">
      <SectionContainer
        as="div"
        className="flex h-16 items-center justify-between gap-4"
      >
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/api/storage/file/Logo/logo.webp"
                alt="Logo KerjaNTB"
                width={36}
                height={36}
                className="size-9 object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground text-lg font-bold tracking-tight">
                  KerjaNTB
                </span>
                <Badge
                  variant="outline"
                  className="bg-chart-1/10 text-chart-1 border-chart-1/20 px-1.5 py-0 text-[10px] font-bold tracking-wider uppercase"
                >
                  NTB
                </Badge>
              </div>
              <span className="text-muted-foreground -mt-0.5 text-[10px]">
                Karir Terpercaya NTB
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
            <Link
              href="/loker"
              className={`rounded-md px-3 py-1.5 transition-colors ${
                pathname === "/loker"
                  ? "bg-muted text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              Cari Lowongan
            </Link>
            <Link
              href="/perusahaan"
              className={`rounded-md px-3 py-1.5 transition-colors ${
                pathname === "/perusahaan"
                  ? "bg-muted text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              Perusahaan
            </Link>
            <Link
              href="/kategori"
              className={`rounded-md px-3 py-1.5 transition-colors ${
                pathname === "/kategori"
                  ? "bg-muted text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              Kategori
            </Link>

            {/* NTB 10 Regions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none"
                >
                  <MapPin className="text-primary size-3.5" />
                  <span>10 Wilayah NTB</span>
                  <ChevronDown className="size-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2">
                <DropdownMenuLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Cakupan 10 Daerah NTB
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid grid-cols-2 gap-1 py-1">
                  {ntbRegions.map((region) => (
                    <DropdownMenuItem asChild key={region.name}>
                      <Link
                        href={`/loker?location=${encodeURIComponent(region.name)}`}
                        className="cursor-pointer text-xs"
                      >
                        <MapPin className="text-primary mr-1 size-3" />
                        <span className="truncate">{region.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/tentang"
              className={`rounded-md px-3 py-1.5 transition-colors ${
                pathname === "/tentang"
                  ? "bg-muted text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              Tentang Kami
            </Link>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Post Job CTA for Employers */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hidden gap-1.5 sm:inline-flex"
          >
            <Link href="/pasang-loker">
              <PlusCircle className="text-primary size-4" />
              <span>Pasang Lowongan</span>
            </Link>
          </Button>

          <ThemeToggle />

          {/* Clerk Auth Actions */}
          <Show when="signed-out">
            <div className="hidden items-center gap-2 sm:flex">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                >
                  Daftar
                </Button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href="/dashboard">
                <Sparkles className="text-primary mr-1 size-3.5" />
                Dashboard
              </Link>
            </Button>
            <div className="flex items-center pl-1">
              <UserButton />
            </div>
          </Show>

          {/* Mobile Drawer Navigation */}
          <MobileNav />
        </div>
      </SectionContainer>
    </header>
  );
}
