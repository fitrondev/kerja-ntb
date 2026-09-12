import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Building2, FileCheck, ShieldCheck, Sparkles } from "lucide-react";

import { VerificationForm } from "@/components/dashboard/employer/verification-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Verifikasi NIB NTB | KerjaNTB",
  description:
    "Pengajuan dan status verifikasi Nomor Induk Berusaha (NIB) perusahaan di NTB.",
};

export default async function VerificationPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/verification");
  }

  const company = user.company
    ? await prisma.company.findUnique({
        where: { id: user.company.id },
        include: { verification: true },
      })
    : await prisma.company.findFirst({
        where: { userId: user.id },
        include: { verification: true },
      });

  if (!company) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Verifikasi NIB NTB
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Validasi izin operasional usaha di 10 Kabupaten/Kota se-Nusa
            Tenggara Barat.
          </p>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <Building2 className="text-muted-foreground mx-auto mb-2 size-12" />
            <CardTitle className="text-base font-bold sm:text-lg">
              Profil Perusahaan Belum Dibuat
            </CardTitle>
            <CardDescription className="text-xs">
              Anda perlu mengisi data profil instansi / perusahaan terlebih
              dahulu sebelum mengajukan verifikasi legalitas NIB.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild className="rounded-xl px-6 font-semibold">
              <Link href="/dashboard/company">
                <span>Lengkapi Profil Perusahaan Terlebih Dahulu</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const verification = company.verification;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          Verifikasi NIB NTB (Nomor Induk Berusaha)
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Tingkatkan kredibilitas lowongan kerja Anda dengan verifikasi izin
          berusaha resmi dari pemerintah di wilayah Nusa Tenggara Barat.
        </p>
      </div>

      {/* Keunggulan Verifikasi NIB Banner */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="border-border/60 bg-card rounded-2xl border p-4">
          <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <ShieldCheck className="size-4" />
          </div>
          <span className="text-foreground block text-xs font-bold sm:text-sm">
            Lencana Resmi NTB
          </span>
          <span className="text-muted-foreground mt-0.5 block text-[11px] leading-relaxed">
            Lencana Verified muncul di setiap lowongan untuk menjamin
            kepercayaan pencari kerja lokal.
          </span>
        </div>

        <div className="border-border/60 bg-card rounded-2xl border p-4">
          <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
            <FileCheck className="size-4" />
          </div>
          <span className="text-foreground block text-xs font-bold sm:text-sm">
            Publikasi Otomatis (Instan)
          </span>
          <span className="text-muted-foreground mt-0.5 block text-[11px] leading-relaxed">
            Lowongan baru langsung tayang berstatus PUBLISHED tanpa antrean
            moderasi manual.
          </span>
        </div>

        <div className="border-border/60 bg-card rounded-2xl border p-4">
          <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Sparkles className="size-4" />
          </div>
          <span className="text-foreground block text-xs font-bold sm:text-sm">
            Prioritas Rekomendasi
          </span>
          <span className="text-muted-foreground mt-0.5 block text-[11px] leading-relaxed">
            Diprioritaskan dalam hasil pencarian dan notifikasi loker mingguan
            kepada pencari kerja.
          </span>
        </div>
      </div>

      {/* Form & Status Verifikasi */}
      <VerificationForm
        companyId={company.id}
        companyName={company.name}
        companyAddress={company.address}
        companyPhone={company.phone}
        companyEmail={company.email}
        initialVerification={
          verification
            ? {
                legalName: verification.legalName,
                nib: verification.nib,
                taxId: verification.taxId,
                address: verification.address,
                phone: verification.phone,
                email: verification.email,
                website: verification.website,
                documentUrl: verification.documentUrl,
                status: verification.status,
                rejectionReason: verification.rejectionReason,
                createdAt: verification.createdAt,
              }
            : null
        }
      />
    </div>
  );
}
