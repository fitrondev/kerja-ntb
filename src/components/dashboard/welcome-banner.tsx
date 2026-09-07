import * as React from "react";

import Link from "next/link";

import { ArrowUpRight, PlusCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Banner selamat datang di dashboard KerjaNTB.
 * Menampilkan judul, deskripsi singkat, dan tombol aksi utama.
 */
export function WelcomeBanner() {
  return (
    <div className="from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden rounded-xl bg-linear-to-r p-6 shadow-md">
      <div className="relative z-10 max-w-2xl space-y-2">
        <Badge
          variant="secondary"
          className="border-0 bg-white/20 text-white hover:bg-white/30"
        >
          Portal Karir NTB Terpercaya
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Selamat Datang di KerjaNTB
        </h1>
        <p className="text-primary-foreground/85 text-sm sm:text-base">
          Pusat peluang karir terverifikasi di 10 Kabupaten/Kota se-Nusa
          Tenggara Barat. Kelola profil, lamaran kerja, atau pasang lowongan
          untuk perusahaan Anda.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="text-primary bg-white font-medium hover:bg-white/90"
          >
            <Link href="/dashboard/loker/baru">
              <PlusCircle className="mr-1.5 size-4" />
              Pasang Lowongan Baru
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-primary-foreground/10 border-white/30 text-white hover:bg-white/20"
          >
            <Link href="/loker">
              <ArrowUpRight className="mr-1.5 size-4" />
              Eksplor Lowongan NTB
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
