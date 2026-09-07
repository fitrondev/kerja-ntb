"use client";

import * as React from "react";

import Link from "next/link";

import {
  Calendar,
  Clock,
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { withdrawJobApplicationAction } from "@/actions/application";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ApplicationStatus } from "@/generated/prisma/enums";
import { formatRelativeDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface ApplicationItem {
  id: string;
  status: ApplicationStatus;
  createdAt: Date | string;
  coverLetter?: string | null;
  customResumeUrl?: string | null;
  interviewDate?: Date | string | null;
  rejectionReason?: string | null;
  job: {
    id: string;
    title: string;
    slug: string;
    type: string;
    location: { name: string };
    company?: {
      name: string;
      slug: string;
      logoUrl?: string | null;
      isVerified?: boolean;
    } | null;
  };
  resume?: {
    id: string;
    title: string;
    fileUrl?: string | null;
  } | null;
}

export interface ApplicationsListProps {
  initialApplications: ApplicationItem[];
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  APPLIED: {
    label: "Lamaran Terkirim",
    bgClass: "bg-blue-500/10 border-blue-500/20",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  REVIEWING: {
    label: "Sedang Ditinjau",
    bgClass: "bg-amber-500/10 border-amber-500/20",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  SHORTLISTED: {
    label: "Lolos Seleksi Berkas",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  INTERVIEW: {
    label: "Jadwal Wawancara",
    bgClass: "bg-purple-500/10 border-purple-500/20",
    textClass: "text-purple-600 dark:text-purple-400",
  },
  ACCEPTED: {
    label: "Diterima Bekerja",
    bgClass: "bg-emerald-600/15 border-emerald-600/30",
    textClass: "text-emerald-700 dark:text-emerald-300 font-bold",
  },
  REJECTED: {
    label: "Tidak Lolos",
    bgClass: "bg-destructive/10 border-destructive/20",
    textClass: "text-destructive",
  },
  WITHDRAWN: {
    label: "Dibatalkan",
    bgClass: "bg-muted border-border",
    textClass: "text-muted-foreground",
  },
};

export function ApplicationsList({
  initialApplications,
}: ApplicationsListProps) {
  const [applications, setApplications] = React.useState(initialApplications);
  const [filterStatus, setFilterStatus] = React.useState<
    "ALL" | "ACTIVE" | "DONE"
  >("ALL");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleWithdraw = async (applicationId: string) => {
    if (
      !confirm("Apakah Anda yakin ingin membatalkan lamaran pekerjaan ini?")
    ) {
      return;
    }

    setLoadingId(applicationId);
    try {
      const res = await withdrawJobApplicationAction(applicationId);
      if (res.success) {
        toast.info("Lamaran kerja berhasil dibatalkan.");
        setApplications(
          applications.map((app) =>
            app.id === applicationId
              ? { ...app, status: ApplicationStatus.WITHDRAWN }
              : app
          )
        );
      } else {
        toast.error(res.error || "Gagal membatalkan lamaran.");
      }
    } catch {
      toast.error("Terjadi masalah saat membatalkan lamaran.");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "ACTIVE") {
      return ["APPLIED", "REVIEWING", "SHORTLISTED", "INTERVIEW"].includes(
        app.status
      );
    }
    if (filterStatus === "DONE") {
      return ["ACCEPTED", "REJECTED", "WITHDRAWN"].includes(app.status);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="border-border bg-card flex items-center gap-1.5 rounded-xl border p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus("ALL")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition-colors",
              filterStatus === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Semua ({applications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("ACTIVE")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition-colors",
              filterStatus === "ACTIVE"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Aktif (
            {
              applications.filter((a) =>
                ["APPLIED", "REVIEWING", "SHORTLISTED", "INTERVIEW"].includes(
                  a.status
                )
              ).length
            }
            )
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("DONE")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition-colors",
              filterStatus === "DONE"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Selesai (
            {
              applications.filter((a) =>
                ["ACCEPTED", "REJECTED", "WITHDRAWN"].includes(a.status)
              ).length
            }
            )
          </button>
        </div>

        <p className="text-muted-foreground text-xs">
          Menampilkan {filteredApplications.length} berkas lamaran
        </p>
      </div>

      {filteredApplications.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileCheck2 className="text-muted-foreground/40 mb-3 size-12" />
            <h3 className="text-foreground text-base font-bold">
              Belum Ada Lamaran
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
              Anda belum memiliki riwayat pengiriman lamaran pekerjaan. Temukan
              berbagai lowongan kerja terverifikasi se-NTB sekarang.
            </p>
            <Button asChild size="sm" className="mt-4 gap-2">
              <Link href="/loker">Eksplorasi Lowongan Kerja</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const statusConfig =
              STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED;
            const companyName = app.job.company?.name || "Perusahaan di NTB";
            const initials = companyName
              .split(" ")
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase();

            const cvUrl = app.customResumeUrl || app.resume?.fileUrl;

            return (
              <Card
                key={app.id}
                className="border-border bg-card transition-shadow hover:shadow-sm"
              >
                <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    {/* Logo Perusahaan */}
                    <div className="bg-primary/10 text-primary border-primary/20 flex size-12 shrink-0 items-center justify-center rounded-xl border text-sm font-bold">
                      {app.job.company?.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={app.job.company.logoUrl}
                          alt={companyName}
                          className="size-full rounded-xl object-contain p-1"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                          {companyName}
                        </span>
                        {app.job.company?.isVerified && (
                          <VerifiedBadge variant="company" size="sm" />
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                            statusConfig.bgClass,
                            statusConfig.textClass
                          )}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      <h4 className="text-foreground hover:text-primary text-base font-bold transition-colors">
                        <Link href={`/loker/${app.job.slug}`}>
                          {app.job.title}
                        </Link>
                      </h4>

                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="text-primary size-3" />
                          <span>{app.job.location.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>
                            Dilamar {formatRelativeDate(app.createdAt)}
                          </span>
                        </div>
                        {app.resume && (
                          <div className="flex items-center gap-1">
                            <FileText className="text-primary size-3" />
                            <span>{app.resume.title}</span>
                          </div>
                        )}
                      </div>

                      {/* Notifikasi Khusus Status */}
                      {app.status === ApplicationStatus.INTERVIEW &&
                        app.interviewDate && (
                          <div className="mt-2 flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 p-2 text-xs text-purple-700 dark:text-purple-300">
                            <Calendar className="size-4 shrink-0" />
                            <span>
                              Jadwal Interview:{" "}
                              <strong>
                                {new Date(app.interviewDate).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </strong>
                            </span>
                          </div>
                        )}

                      {app.status === ApplicationStatus.REJECTED &&
                        app.rejectionReason && (
                          <p className="text-muted-foreground mt-1 text-[11px] italic">
                            Catatan: &ldquo;{app.rejectionReason}&rdquo;
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                    {cvUrl && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                      >
                        <a
                          href={cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="size-3.5" />
                          <span>Lihat CV</span>
                          <ExternalLink className="size-3" />
                        </a>
                      </Button>
                    )}

                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      <Link href={`/loker/${app.job.slug}`}>
                        Lihat Lowongan
                      </Link>
                    </Button>

                    {["APPLIED", "REVIEWING"].includes(app.status) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={loadingId === app.id}
                        onClick={() => handleWithdraw(app.id)}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 gap-1 text-xs"
                        title="Batalkan lamaran pekerjaan ini"
                      >
                        {loadingId === app.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <XCircle className="size-3" />
                        )}
                        <span>Batalkan</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
