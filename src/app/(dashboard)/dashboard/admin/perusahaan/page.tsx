import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, Building2, CheckCircle2, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Daftar Perusahaan | KerjaNTB",
  description:
    "Daftar seluruh perusahaan mitra terdaftar di 10 Kabupaten/Kota se-NTB.",
};

export default async function AdminCompaniesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const companies = await prisma.company.findMany({
    include: {
      location: true,
      verification: true,
      _count: { select: { jobs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Daftar Perusahaan NTB
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Total {companies.length} mitra perusahaan terdaftar di 10
            Kabupaten/Kota Nusa Tenggara Barat.
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
            <Building2 className="text-primary size-4.5" />
            <span>Seluruh Perusahaan ({companies.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {companies.map((c) => (
            <div
              key={c.id}
              className="border-border/70 hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm font-bold">
                    {c.name}
                  </span>
                  {c.isVerified && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600"
                    >
                      <CheckCircle2 className="size-3" />
                      <span>Terverifikasi NIB</span>
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                  <span>{c.industry || "Sektor Usaha"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="text-primary size-3" />
                    <span>{c.location?.name || "NTB"}</span>
                  </span>
                  <span>•</span>
                  <span className="text-foreground font-medium">
                    {c._count.jobs} Lowongan
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                >
                  <Link href={`/dashboard/admin/verifikasi`}>
                    <span>Legalitas</span>
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
