import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Verifikasi NIB Perusahaan | KerjaNTB",
  description:
    "Daftar pengajuan verifikasi NIB dan legalitas badan usaha se-NTB.",
};

export default async function AdminVerificationPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const verifications = await prisma.companyVerification.findMany({
    include: {
      company: {
        include: { location: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Verifikasi NIB Perusahaan
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Tinjau legalitas perizinan berusaha OSS (NIB) perusahaan mitra di
            NTB.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Admin</span>
          </Link>
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <ShieldCheck className="text-primary size-4.5" />
            <span>Daftar Pengajuan NIB ({verifications.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {verifications.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center text-xs">
              <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500" />
              <span className="text-foreground block font-semibold">
                Tidak Ada Antrean Verifikasi
              </span>
              <span className="mt-1 block">
                Belum ada pengajuan NIB baru dari perusahaan mitra.
              </span>
            </div>
          ) : (
            verifications.map((v) => (
              <div
                key={v.id}
                className="border-border/70 hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-bold">
                      {v.company.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className={
                        v.status === "APPROVED"
                          ? "border-0 bg-emerald-500/10 text-[10px] text-emerald-600"
                          : v.status === "PENDING"
                            ? "border-0 bg-amber-500/15 text-[10px] text-amber-600"
                            : "bg-destructive/15 text-destructive border-0 text-[10px]"
                      }
                    >
                      {v.status}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-foreground font-semibold">
                      NIB: {v.nib}
                    </span>
                    <span>•</span>
                    <span>Badan Usaha: {v.legalName}</span>
                    <span>•</span>
                    <span>Lokasi: {v.company.location?.name || "NTB"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                  >
                    <a
                      href={v.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>Lihat Dokumen</span>
                    </a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
