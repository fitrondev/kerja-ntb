import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Profil Perusahaan | KerjaNTB",
  description:
    "Kelola profil dan informasi perusahaan Anda di Nusa Tenggara Barat.",
};

export default async function CompanyProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/company");
  }

  const company = user.company
    ? await prisma.company.findUnique({
        where: { id: user.company.id },
        include: { location: true, verification: true },
      })
    : await prisma.company.findFirst({
        include: { location: true, verification: true },
      });

  if (!company) {
    return (
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <Building2 className="text-muted-foreground mx-auto mb-3 size-12" />
            <h2 className="text-lg font-bold">
              Profil Perusahaan Belum Dibuat
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Akun Anda belum memiliki profil perusahaan yang terhubung.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Profil Perusahaan
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Informasi identitas perusahaan yang akan dilihat oleh pelamar kerja
            di NTB.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/dashboard/verification">
              <ShieldCheck className="mr-1.5 size-4 text-amber-500" />
              <span>Verifikasi NIB</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Kolom Kiri: Kartu Identitas */}
        <Card className="border-border md:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="bg-primary/10 text-primary border-border mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl border">
              <Building2 className="size-10" />
            </div>
            <h2 className="text-foreground text-lg font-bold">
              {company.name}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {company.industry || "Industri / Sektor Usaha"}
            </p>

            <div className="mt-4 flex justify-center">
              {company.isVerified ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Terverifikasi NIB NTB</span>
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  <span>Belum Terverifikasi</span>
                </Badge>
              )}
            </div>

            <div className="border-border mt-6 space-y-3 border-t pt-4 text-left text-xs">
              <div className="text-muted-foreground flex items-center gap-2">
                <MapPin className="text-primary size-4 shrink-0" />
                <span className="text-foreground font-medium">
                  {company.location?.name || "Wilayah NTB"}
                </span>
              </div>
              {company.email && (
                <div className="text-muted-foreground flex items-center gap-2">
                  <Mail className="text-primary size-4 shrink-0" />
                  <span className="text-foreground">{company.email}</span>
                </div>
              )}
              {company.phone && (
                <div className="text-muted-foreground flex items-center gap-2">
                  <Phone className="text-primary size-4 shrink-0" />
                  <span className="text-foreground">{company.phone}</span>
                </div>
              )}
              {company.website && (
                <div className="text-muted-foreground flex items-center gap-2">
                  <Globe className="text-primary size-4 shrink-0" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary truncate hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kolom Kanan: Detail Deskripsi & Alamat */}
        <Card className="border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Tentang Perusahaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p className="text-foreground/90 whitespace-pre-line">
              {company.description ||
                "Belum ada deskripsi profil perusahaan. Lengkapi informasi profil perusahaan untuk memberikan gambaran yang jelas mengenai budaya kerja, visi, dan misi kepada para kandidat di NTB."}
            </p>

            <div className="border-border border-t pt-4">
              <h3 className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
                Alamat Kantor NTB
              </h3>
              <p className="text-foreground text-xs sm:text-sm">
                {company.address || "Alamat lengkap belum diisi."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
