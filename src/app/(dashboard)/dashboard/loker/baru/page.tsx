import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, MapPin, PlusCircle, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  title: "Pasang Lowongan Baru | KerjaNTB",
  description:
    "Formulir publikasi lowongan kerja baru untuk 10 Kabupaten/Kota se-NTB.",
};

export default async function CreateJobPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/loker/baru");
  }

  const [locations, categories] = await Promise.all([
    prisma.location.findMany({ orderBy: { orderIndex: "asc" } }),
    prisma.jobCategory.findMany({ orderBy: { orderIndex: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Pasang Lowongan Kerja Baru
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Publikasikan kesempatan karir terverifikasi untuk masyarakat Nusa
            Tenggara Barat.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/employer/loker">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Lowongan</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info & Ketentuan Publikasi NTB */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <PlusCircle className="text-primary size-4.5" />
                <span>Petunjuk Posting Loker Anti-Penipuan</span>
              </CardTitle>
              <CardDescription>
                Standar integritas bursa kerja KerjaNTB sesuai regulasi
                Disnakertrans NTB.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-foreground/90 space-y-4 text-xs leading-relaxed">
              <div className="border-border/60 bg-muted/30 space-y-2 rounded-xl border p-4">
                <span className="text-foreground block text-sm font-bold">
                  Komitmen Lowongan Bebas Pungutan Biaya
                </span>
                <p className="text-muted-foreground">
                  Seluruh lowongan di KerjaNTB dilarang keras memungut biaya
                  apapun (biaya seragam, akomodasi travel, atau administrasi
                  seleksi). Pelanggaran akan berakibat penutupan permanen akun
                  perusahaan dan pelaporan ke pihak berwajib.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-foreground block font-bold">
                  Cakupan Wilayah Resmi NTB:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {locations.map((loc) => (
                    <Badge
                      key={loc.id}
                      variant="outline"
                      className="py-0.5 text-[11px]"
                    >
                      <MapPin className="text-primary mr-1 size-2.5" />
                      <span>{loc.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-foreground block font-bold">
                  Kategori Pekerjaan Tersedia:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant="secondary"
                      className="py-0.5 text-[11px]"
                    >
                      <span>{cat.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Samping: Status Akun */}
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="text-primary size-4" />
                <span>Kredibilitas Perusahaan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground text-[11px]">
                Lowongan dari perusahaan dengan NIB terverifikasi akan langsung
                terbit tanpa antrean moderasi Superadmin.
              </p>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full text-xs"
              >
                <Link href="/dashboard/verification">
                  <span>Cek Status NIB NTB</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
