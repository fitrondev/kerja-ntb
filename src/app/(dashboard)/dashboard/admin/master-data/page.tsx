import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, Layers, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Master Data Wilayah & Kategori | KerjaNTB",
  description: "Daftar 10 Kabupaten/Kota resmi NTB dan kategori pekerjaan.",
};

export default async function AdminMasterDataPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const [locations, categories] = await Promise.all([
    prisma.location.findMany({
      include: {
        _count: { select: { jobs: true, companies: true } },
      },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.jobCategory.findMany({
      include: {
        _count: { select: { jobs: true } },
      },
      orderBy: { orderIndex: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Master Data Wilayah &amp; Kategori NTB
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Entitas resmi 10 Kabupaten/Kota se-Nusa Tenggara Barat dan kategori
            industri bursa kerja.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Admin</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Wilayah NTB */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <MapPin className="text-primary size-4.5" />
              <span>10 Kabupaten / Kota NTB ({locations.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="border-border/60 flex items-center justify-between rounded-xl border p-3 text-xs"
              >
                <div>
                  <span className="text-foreground block font-bold">
                    {loc.name}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    Tipe: {loc.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {loc._count.jobs} Loker
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {loc._count.companies} Perusahaan
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Kategori Pekerjaan */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Layers className="text-primary size-4.5" />
              <span>Kategori Pekerjaan ({categories.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="border-border/60 flex items-center justify-between rounded-xl border p-3 text-xs"
              >
                <div>
                  <span className="text-foreground block font-bold">
                    {cat.name}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {cat.slug}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {cat._count.jobs} Loker
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
