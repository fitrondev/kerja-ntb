import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Building2, ExternalLink, MapPin, ShieldCheck } from "lucide-react";

import { CompanyProfileForm } from "@/components/dashboard/employer/company-profile-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerifiedBadge } from "@/components/ui/verified-badge";
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

  const [company, locations] = await Promise.all([
    user.company
      ? prisma.company.findUnique({
          where: { id: user.company.id },
          include: { location: true, verification: true },
        })
      : prisma.company.findUnique({
          where: { userId: user.id },
          include: { location: true, verification: true },
        }),
    prisma.location.findMany({
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!company) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Buat Profil Perusahaan
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Lengkapi data usaha atau instansi Anda untuk mulai memasang lowongan
            pekerjaan di Nusa Tenggara Barat.
          </p>
        </div>

        <CompanyProfileForm locations={locations} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Profil Perusahaan
            </h1>
            {company.isVerified ? (
              <VerifiedBadge size="default" />
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/20 bg-amber-500/10 text-xs text-amber-600"
              >
                Belum Terverifikasi NIB
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Informasi identitas perusahaan Anda untuk menarik talenta terbaik di
            wilayah NTB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href={`/perusahaan/${company.slug}`} target="_blank">
              <ExternalLink className="mr-1.5 size-3.5" />
              <span>Halaman Publik</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/dashboard/verification">
              <ShieldCheck className="mr-1.5 size-3.5 text-amber-500" />
              <span>Verifikasi NIB</span>
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="text-xs">
            Edit Profil Perusahaan
          </TabsTrigger>
          <TabsTrigger value="overview" className="text-xs">
            Ringkasan Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-6">
          <CompanyProfileForm
            initialCompany={{
              id: company.id,
              name: company.name,
              industry: company.industry,
              companySize: company.companySize,
              foundedYear: company.foundedYear,
              locationId: company.locationId,
              address: company.address,
              phone: company.phone,
              email: company.email,
              website: company.website,
              linkedIn: company.linkedIn,
              instagram: company.instagram,
              description: company.description,
              logoUrl: company.logoUrl,
            }}
            locations={locations}
          />
        </TabsContent>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border-border md:col-span-1">
              <CardHeader className="text-center">
                <div className="bg-primary/10 text-primary border-border mx-auto mb-2 flex size-20 items-center justify-center rounded-2xl border">
                  {company.logoUrl ? (
                    <Image
                      src={company.logoUrl}
                      alt={company.name}
                      width={80}
                      height={80}
                      className="size-full rounded-2xl object-cover"
                    />
                  ) : (
                    <Building2 className="size-10" />
                  )}
                </div>
                <CardTitle className="text-base font-bold">
                  {company.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {company.industry || "Industri Belum Diatur"}
                </CardDescription>
              </CardHeader>
              <CardContent className="border-border space-y-3 border-t pt-4 text-xs">
                <div className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="text-primary size-4 shrink-0" />
                  <span className="text-foreground font-medium">
                    {company.location?.name || "Wilayah NTB"}
                  </span>
                </div>
                {company.companySize && (
                  <p className="text-muted-foreground">
                    Skala:{" "}
                    <span className="text-foreground font-medium">
                      {company.companySize}
                    </span>
                  </p>
                )}
                {company.foundedYear && (
                  <p className="text-muted-foreground">
                    Berdiri:{" "}
                    <span className="text-foreground font-medium">
                      {company.foundedYear}
                    </span>
                  </p>
                )}
                {company.email && (
                  <p className="text-muted-foreground truncate">
                    Email:{" "}
                    <span className="text-foreground font-medium">
                      {company.email}
                    </span>
                  </p>
                )}
                {company.phone && (
                  <p className="text-muted-foreground">
                    Telepon:{" "}
                    <span className="text-foreground font-medium">
                      {company.phone}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  Tentang Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed">
                <p className="text-foreground/90 whitespace-pre-line">
                  {company.description ||
                    "Belum ada deskripsi profil perusahaan."}
                </p>

                <div className="border-border border-t pt-4">
                  <h3 className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
                    Alamat Domisili Kantor NTB
                  </h3>
                  <p className="text-foreground text-xs sm:text-sm">
                    {company.address || "Alamat lengkap belum diisi."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
