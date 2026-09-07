import { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  CheckCircle2,
  FileCheck,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    "Pengajuan dan status verifikasi Nomor Induk Berusaha (NIB) perusahaan.",
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
        include: { verification: true },
      });

  const verification = company?.verification;
  const isApproved = company?.isVerified || verification?.status === "APPROVED";
  const isPending = verification?.status === "PENDING";
  const isRejected = verification?.status === "REJECTED";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          Verifikasi NIB NTB (Nomor Induk Berusaha)
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Tingkatkan kredibilitas lowongan kerja Anda dengan verifikasi izin
          berusaha resmi dari pemerintah.
        </p>
      </div>

      {/* Kartu Status Verifikasi */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Shield className="text-primary size-5" />
              <span>Status Verifikasi Perusahaan</span>
            </CardTitle>
            {isApproved && (
              <Badge className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600">
                <CheckCircle2 className="size-3.5" />
                <span>Terverifikasi Resmi</span>
              </Badge>
            )}
            {isPending && (
              <Badge className="gap-1 border-0 bg-amber-500/15 text-xs text-amber-600">
                <span>Sedang Ditinjau Admin</span>
              </Badge>
            )}
            {isRejected && (
              <Badge className="bg-destructive/15 text-destructive gap-1 border-0 text-xs">
                <ShieldAlert className="size-3.5" />
                <span>Pengajuan Ditolak</span>
              </Badge>
            )}
            {!verification && !isApproved && (
              <Badge variant="outline" className="text-xs">
                <span>Belum Mengajukan NIB</span>
              </Badge>
            )}
          </div>
          <CardDescription>
            {isApproved
              ? "Perusahaan Anda telah tervalidasi dengan Nomor Induk Berusaha resmi. Lowongan yang dipasang langsung berstatus Tayang."
              : isPending
                ? "Dokumen NIB Anda sedang dalam antrean pemeriksaan oleh tim moderator Superadmin KerjaNTB."
                : "Unggah dokumen NIB atau NPWP perusahaan Anda untuk mendapatkan lencana resmi di KerjaNTB."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verification && (
            <div className="bg-muted/40 border-border/80 space-y-2 rounded-xl border p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Nama Legal Badan Usaha:
                </span>
                <span className="text-foreground font-semibold">
                  {verification.legalName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Nomor Induk Berusaha (NIB):
                </span>
                <span className="text-foreground font-semibold">
                  {verification.nib}
                </span>
              </div>
              {verification.taxId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    NPWP Perusahaan:
                  </span>
                  <span className="text-foreground font-semibold">
                    {verification.taxId}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Manfaat Verifikasi */}
          <div className="border-border border-t pt-4">
            <h3 className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-bold">
              <Sparkles className="size-4 text-amber-500" />
              <span>Keunggulan Akun Terverifikasi di NTB</span>
            </h3>
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
              <div className="border-border/60 bg-card rounded-xl border p-3">
                <ShieldCheck className="mb-1 size-5 text-emerald-600" />
                <span className="text-foreground block font-bold">
                  Lencana Resmi
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Badge Verified NIB muncul di setiap kartu lowongan Anda.
                </span>
              </div>
              <div className="border-border/60 bg-card rounded-xl border p-3">
                <FileCheck className="mb-1 size-5 text-blue-600" />
                <span className="text-foreground block font-bold">
                  Posting Instan
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Lowongan baru langsung terbit tanpa menunggu antrean moderasi
                  manual.
                </span>
              </div>
              <div className="border-border/60 bg-card rounded-xl border p-3">
                <Sparkles className="mb-1 size-5 text-amber-500" />
                <span className="text-foreground block font-bold">
                  Prioritas Rekomendasi
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Tampil di urutan teratas hasil pencarian loker bagi pelamar
                  NTB.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
