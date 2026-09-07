import * as React from "react";

import Link from "next/link";

import { Sparkles } from "lucide-react";

import { SectionContainer } from "@/components/layout/section-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * CTA section untuk HRD dan pemilik usaha di NTB.
 * Mengajak perusahaan untuk memasang lowongan di KerjaNTB.
 */
export function CtaSection() {
  return (
    <SectionContainer
      as="section"
      fullWidth
      className="border-border from-primary/10 via-primary/5 to-background border-t bg-linear-to-r py-16 sm:py-20"
    >
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <Badge
          variant="outline"
          className="bg-primary text-primary-foreground border-primary/20 text-xs font-semibold tracking-wider uppercase"
        >
          Untuk HRD &amp; Pemilik Usaha di NTB
        </Badge>

        <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          Rekrut Talenta Terbaik NTB untuk Memajukan Usaha Anda
        </h2>

        <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
          Pasang lowongan kerja dalam hitungan menit. Dapatkan pelamar
          berkualitas dari 10 Kabupaten/Kota se-NTB dengan sistem seleksi dan
          dashboard ATS yang terpadu.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full gap-2 font-medium shadow-sm sm:w-auto"
          >
            <Link href="/pasang-loker">
              <Sparkles className="size-4" />
              <span>Pasang Lowongan Sekarang</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/tentang">Pelajari Ketentuan NIB</Link>
          </Button>
        </div>
      </div>
    </SectionContainer>
  );
}
