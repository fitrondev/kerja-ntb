import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import {
  CompanyVerificationTable,
  SerializedVerification,
} from "@/components/dashboard/admin/company-verification-table";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Verifikasi NIB Perusahaan | KerjaNTB",
  description:
    "Review legalitas perizinan berusaha OSS (NIB 13 digit) dan dokumen resmi mitra perusahaan NTB.",
};

export default async function AdminVerificationPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const verifications = await prisma.companyVerification.findMany({
    include: {
      company: {
        include: {
          location: true,
          user: {
            select: { email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedVerifications: SerializedVerification[] = verifications.map(
    (v) => ({
      id: v.id,
      legalName: v.legalName,
      nib: v.nib,
      taxId: v.taxId,
      address: v.address,
      phone: v.phone,
      email: v.email,
      website: v.website,
      documentUrl: v.documentUrl,
      status: v.status,
      rejectionReason: v.rejectionReason,
      reviewedAt: v.reviewedAt
        ? new Date(v.reviewedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : null,
      createdAt: new Date(v.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      company: {
        id: v.company.id,
        name: v.company.name,
        slug: v.company.slug,
        logoUrl: v.company.logoUrl,
        isVerified: v.company.isVerified,
        location: v.company.location ? { name: v.company.location.name } : null,
        user: {
          email: v.company.user.email,
        },
      },
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Verifikasi NIB &amp; Legalitas Perusahaan
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Tinjau keabsahan izin OSS Nomor Induk Berusaha (13 digit) dan
            dokumen legalitas privat mitra perusahaan sebelum menyematkan badge
            centang biru NTB.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Panel Admin</span>
          </Link>
        </Button>
      </div>

      <CompanyVerificationTable
        initialVerifications={serializedVerifications}
      />
    </div>
  );
}
