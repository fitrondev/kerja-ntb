"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  Briefcase,
  Building2,
  ChevronDown,
  Compass,
  Info,
  MapPin,
  Menu,
  PlusCircle,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    title: "Cari Lowongan",
    href: "/loker",
    icon: Briefcase,
  },
  {
    title: "Daftar Perusahaan",
    href: "/perusahaan",
    icon: Building2,
  },
  {
    title: "Kategori Pekerjaan",
    href: "/kategori",
    icon: Compass,
  },
  {
    title: "Tentang Kami",
    href: "/tentang",
    icon: Info,
  },
];

const ntbRegions = [
  "Kota Mataram",
  "Lombok Barat",
  "Lombok Tengah",
  "Lombok Timur",
  "Lombok Utara",
  "Sumbawa",
  "Sumbawa Barat",
  "Dompu",
  "Bima",
  "Kota Bima",
];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const [regionsOpen, setRegionsOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-background border-border flex w-72 flex-col p-0 sm:w-80"
      >
        {/* Header Bersih tanpa Logo & ThemeToggle */}
        <SheetHeader className="border-border border-b px-4 py-3 text-left">
          <SheetTitle className="text-foreground text-sm font-semibold tracking-tight">
            Menu Navigasi
          </SheetTitle>
        </SheetHeader>

        {/* Konten Menu Kompak - Tidak Perlu Scroll di Layar Kecil */}
        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}

            {/* Wilayah NTB - Menggunakan Collapsible agar tidak memakan ruang tinggi */}
            <Collapsible
              open={regionsOpen}
              onOpenChange={setRegionsOpen}
              className="mt-0.5"
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="hover:bg-muted text-foreground flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="text-primary size-4 shrink-0" />
                    <span>10 Wilayah NTB</span>
                  </div>
                  <ChevronDown
                    className={`text-muted-foreground size-4 transition-transform duration-200 ${
                      regionsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 pb-1">
                <div className="bg-muted/50 grid grid-cols-2 gap-1 rounded-lg p-1.5">
                  {ntbRegions.map((region) => (
                    <Link
                      key={region}
                      href={`/loker?location=${encodeURIComponent(region)}`}
                      onClick={() => setOpen(false)}
                      className="text-muted-foreground hover:bg-background hover:text-foreground flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors"
                    >
                      <span className="bg-primary/70 size-1.5 shrink-0 rounded-full" />
                      <span className="truncate">{region}</span>
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </ScrollArea>

        {/* Footer Actions Kompak */}
        <div className="border-border bg-card/50 border-t p-3">
          <Show when="signed-out">
            <div className="grid grid-cols-2 gap-2">
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => setOpen(false)}
                >
                  Masuk
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground w-full justify-center"
                  onClick={() => setOpen(false)}
                >
                  Daftar
                </Button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center justify-between gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                <Link href="/dashboard">
                  <Sparkles className="mr-1.5 size-3.5" />
                  Dashboard
                </Link>
              </Button>
              <UserButton />
            </div>
          </Show>

          <Button
            asChild
            variant="secondary"
            size="sm"
            className="mt-2 w-full justify-center gap-1.5"
            onClick={() => setOpen(false)}
          >
            <Link href="/pasang-loker">
              <PlusCircle className="text-primary size-3.5" />
              <span>Pasang Lowongan Kerja</span>
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
