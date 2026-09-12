"use client";

import { useMemo, useState, useTransition } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  AlertTriangle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { approveJobAction, rejectJobAction } from "@/actions/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface SerializedJob {
  id: string;
  title: string;
  slug: string;
  type: string;
  workplace: string;
  status: string;
  salaryMin: number | null;
  salaryMax: number | null;
  isSalaryDisclosed: boolean;
  education: string;
  experience: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string | null;
  applicationMethod: string;
  applicationEmail: string | null;
  externalUrl: string | null;
  createdAt: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    isVerified: boolean;
  } | null;
  location: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
}

interface JobModerationTableProps {
  initialJobs: SerializedJob[];
}

export function JobModerationTable({ initialJobs }: JobModerationTableProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<SerializedJob[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "PUBLISHED" | "REJECTED"
  >("PENDING");
  const [isPending, startTransition] = useTransition();

  // State Dialog Detail Preview
  const [selectedJob, setSelectedJob] = useState<SerializedJob | null>(null);

  // State Dialog Konfirmasi Approve
  const [jobToApprove, setJobToApprove] = useState<SerializedJob | null>(null);

  // State Dialog Reject dengan Alasan Wajib
  const [jobToReject, setJobToReject] = useState<SerializedJob | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Filter & Search
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Filter status tab
      if (statusFilter === "PENDING" && job.status !== "PENDING_REVIEW")
        return false;
      if (statusFilter === "PUBLISHED" && job.status !== "PUBLISHED")
        return false;
      if (statusFilter === "REJECTED" && job.status !== "REJECTED")
        return false;

      // Filter search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(query);
        const matchCompany =
          job.company?.name.toLowerCase().includes(query) || false;
        const matchLocation = job.location.name.toLowerCase().includes(query);
        const matchCategory = job.category.name.toLowerCase().includes(query);
        return matchTitle || matchCompany || matchLocation || matchCategory;
      }

      return true;
    });
  }, [jobs, statusFilter, searchQuery]);

  // Hitung jumlah untuk counter tabs
  const counts = useMemo(() => {
    return {
      all: jobs.length,
      pending: jobs.filter((j) => j.status === "PENDING_REVIEW").length,
      published: jobs.filter((j) => j.status === "PUBLISHED").length,
      rejected: jobs.filter((j) => j.status === "REJECTED").length,
    };
  }, [jobs]);

  // Handler Approve
  const handleConfirmApprove = () => {
    if (!jobToApprove) return;

    const targetId = jobToApprove.id;
    const targetTitle = jobToApprove.title;

    startTransition(async () => {
      try {
        const res = await approveJobAction(targetId);
        if (!res.success) {
          toast.error(res.error || "Gagal menyetujui lowongan.");
          return;
        }

        toast.success(
          `Lowongan "${targetTitle}" berhasil disetujui dan dipublikasikan! 🎉`
        );
        setJobs((prev) =>
          prev.map((j) =>
            j.id === targetId
              ? { ...j, status: "PUBLISHED", rejectionReason: null }
              : j
          )
        );
        if (selectedJob?.id === targetId) {
          setSelectedJob((prev) =>
            prev ? { ...prev, status: "PUBLISHED" } : null
          );
        }
        setJobToApprove(null);
        router.refresh();
      } catch {
        toast.error("Terjadi kegagalan saat menyetujui lowongan.");
      }
    });
  };

  // Handler Reject
  const handleConfirmReject = () => {
    if (!jobToReject) return;

    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      setRejectError("Alasan penolakan wajib diisi minimal 10 karakter.");
      return;
    }

    const targetId = jobToReject.id;
    const targetTitle = jobToReject.title;
    const reason = rejectionReason.trim();

    startTransition(async () => {
      try {
        const res = await rejectJobAction({
          jobId: targetId,
          rejectionReason: reason,
        });

        if (!res.success) {
          toast.error(res.error || "Gagal menolak lowongan.");
          return;
        }

        toast.warning(
          `Lowongan "${targetTitle}" telah ditolak dengan catatan alasan.`
        );
        setJobs((prev) =>
          prev.map((j) =>
            j.id === targetId
              ? { ...j, status: "REJECTED", rejectionReason: reason }
              : j
          )
        );
        if (selectedJob?.id === targetId) {
          setSelectedJob((prev) =>
            prev
              ? { ...prev, status: "REJECTED", rejectionReason: reason }
              : null
          );
        }
        setJobToReject(null);
        setRejectionReason("");
        setRejectError("");
        router.refresh();
      } catch {
        toast.error("Terjadi kegagalan saat menolak lowongan.");
      }
    });
  };

  const formatRupiah = (val: number | null) => {
    if (!val) return null;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* Tab Filter Status & Pencarian */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="border-border bg-card flex flex-wrap items-center gap-1.5 rounded-xl border p-1">
          <Button
            size="sm"
            variant={statusFilter === "PENDING" ? "default" : "ghost"}
            onClick={() => setStatusFilter("PENDING")}
            className="h-8 text-xs font-semibold"
          >
            <Clock className="mr-1.5 size-3.5" />
            <span>Perlu Review ({counts.pending})</span>
          </Button>

          <Button
            size="sm"
            variant={statusFilter === "PUBLISHED" ? "default" : "ghost"}
            onClick={() => setStatusFilter("PUBLISHED")}
            className="h-8 text-xs font-semibold"
          >
            <CheckCircle2 className="mr-1.5 size-3.5" />
            <span>Terbit ({counts.published})</span>
          </Button>

          <Button
            size="sm"
            variant={statusFilter === "REJECTED" ? "default" : "ghost"}
            onClick={() => setStatusFilter("REJECTED")}
            className="h-8 text-xs font-semibold"
          >
            <XCircle className="mr-1.5 size-3.5" />
            <span>Ditolak ({counts.rejected})</span>
          </Button>

          <Button
            size="sm"
            variant={statusFilter === "ALL" ? "default" : "ghost"}
            onClick={() => setStatusFilter("ALL")}
            className="h-8 text-xs font-semibold"
          >
            <span>Semua ({counts.all})</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Cari judul, perusahaan, lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* List Antrean Loker */}
      {filteredJobs.length === 0 ? (
        <Card className="border-border">
          <CardContent className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center text-xs">
            <CheckCircle2 className="mb-2 size-10 text-emerald-500" />
            <p className="text-foreground text-sm font-bold">
              Tidak Ada Lowongan yang Cocok
            </p>
            <p className="mt-1 max-w-sm">
              {statusFilter === "PENDING"
                ? "Bagus! Seluruh lowongan baru telah ditinjau dan tidak ada antrean yang tertunda."
                : "Tidak ditemukan data lowongan kerja pada kategori filter yang dipilih."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const isJobPending = job.status === "PENDING_REVIEW";
            const isJobPublished = job.status === "PUBLISHED";
            const isJobRejected = job.status === "REJECTED";

            return (
              <Card
                key={job.id}
                className="border-border/80 hover:border-primary/40 transition-all hover:shadow-xs"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    {/* Informasi Pokok Loker */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground text-base font-bold">
                          {job.title}
                        </span>

                        {isJobPending && (
                          <Badge
                            variant="secondary"
                            className="border-0 bg-amber-500/15 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
                          >
                            <Clock className="mr-1 size-3" />
                            Menunggu Review
                          </Badge>
                        )}
                        {isJobPublished && (
                          <Badge
                            variant="secondary"
                            className="border-0 bg-emerald-500/15 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="mr-1 size-3" />
                            Aktif Terbit
                          </Badge>
                        )}
                        {isJobRejected && (
                          <Badge
                            variant="destructive"
                            className="text-[11px] font-semibold"
                          >
                            <XCircle className="mr-1 size-3" />
                            Ditolak
                          </Badge>
                        )}

                        <Badge variant="outline" className="text-[10px]">
                          {job.type.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {job.workplace}
                        </Badge>
                      </div>

                      {/* Info Perusahaan, Wilayah, Kategori */}
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2.5 text-xs">
                        <span className="text-foreground inline-flex items-center gap-1 font-semibold">
                          <Building2 className="text-muted-foreground size-3.5" />
                          <span>
                            {job.company?.name || "Perusahaan Anonim"}
                          </span>
                          {job.company?.isVerified && (
                            <span title="Perusahaan Terverifikasi NIB">
                              <ShieldCheck className="size-3.5 text-blue-500" />
                            </span>
                          )}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="text-primary size-3.5" />
                          <span>{job.location.name}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="text-muted-foreground size-3.5" />
                          <span>{job.category.name}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="text-muted-foreground size-3.5" />
                          <span>Diajukan: {job.createdAt}</span>
                        </span>
                      </div>

                      {/* Gaji & Alasan Penolakan (bila ada) */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        {job.isSalaryDisclosed &&
                        (job.salaryMin || job.salaryMax) ? (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            Gaji: {formatRupiah(job.salaryMin)} -{" "}
                            {formatRupiah(job.salaryMax)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Gaji dirahasiakan
                          </span>
                        )}

                        {job.rejectionReason && (
                          <div className="border-destructive/30 bg-destructive/5 text-destructive w-full rounded-lg border p-2 text-xs">
                            <span className="font-bold">
                              Alasan Penolakan Terakhir:{" "}
                            </span>
                            <span>{job.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tombol Aksi Moderasi */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {/* Tombol Preview Detail */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedJob(job)}
                        className="h-8 gap-1.5 text-xs font-semibold"
                      >
                        <Eye className="text-muted-foreground size-3.5" />
                        <span>Detail Loker</span>
                      </Button>

                      {/* Tombol Taut Lowongan Publik */}
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground h-8 gap-1 text-xs"
                      >
                        <Link href={`/loker/${job.slug}`} target="_blank">
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </Button>

                      {/* Tombol Setujui (Approve) */}
                      {job.status !== "PUBLISHED" && (
                        <Button
                          size="sm"
                          onClick={() => setJobToApprove(job)}
                          disabled={isPending}
                          className="h-8 gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>Setujui</span>
                        </Button>
                      )}

                      {/* Tombol Tolak (Reject) */}
                      {job.status !== "REJECTED" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setJobToReject(job);
                            setRejectionReason(job.rejectionReason || "");
                            setRejectError("");
                          }}
                          disabled={isPending}
                          className="h-8 gap-1.5 text-xs font-semibold"
                        >
                          <XCircle className="size-3.5" />
                          <span>Tolak</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOG DETAIL PREVIEW LENGKAP LOKER */}
      {/* ========================================================================= */}
      <Dialog
        open={!!selectedJob}
        onOpenChange={(open) => !open && setSelectedJob(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold">
                    {selectedJob.title}
                  </DialogTitle>
                  <Badge variant="outline" className="text-xs">
                    {selectedJob.status}
                  </Badge>
                </div>
                <DialogDescription className="text-xs">
                  {selectedJob.company?.name} • {selectedJob.location.name} •
                  Diajukan pada {selectedJob.createdAt}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* Ringkasan Parameter */}
                <div className="border-border bg-muted/20 grid grid-cols-2 gap-2 rounded-xl border p-3 sm:grid-cols-4">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Tipe Pekerjaan
                    </span>
                    <span className="text-foreground font-semibold">
                      {selectedJob.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Tempat Kerja
                    </span>
                    <span className="text-foreground font-semibold">
                      {selectedJob.workplace}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Pendidikan Min.
                    </span>
                    <span className="text-foreground font-semibold">
                      {selectedJob.education}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Pengalaman Min.
                    </span>
                    <span className="text-foreground font-semibold">
                      {selectedJob.experience}
                    </span>
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <h4 className="text-foreground font-bold">
                    Deskripsi Pekerjaan:
                  </h4>
                  <div className="border-border/60 bg-card text-foreground mt-1 rounded-lg border p-3 leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </div>
                </div>

                {/* Tanggung Jawab */}
                <div>
                  <h4 className="text-foreground font-bold">
                    Tanggung Jawab Utama:
                  </h4>
                  <div className="border-border/60 bg-card text-foreground mt-1 rounded-lg border p-3 leading-relaxed whitespace-pre-line">
                    {selectedJob.responsibilities}
                  </div>
                </div>

                {/* Kualifikasi & Persyaratan */}
                <div>
                  <h4 className="text-foreground font-bold">
                    Kualifikasi &amp; Persyaratan:
                  </h4>
                  <div className="border-border/60 bg-card text-foreground mt-1 rounded-lg border p-3 leading-relaxed whitespace-pre-line">
                    {selectedJob.requirements}
                  </div>
                </div>

                {/* Benefit */}
                {selectedJob.benefits && (
                  <div>
                    <h4 className="text-foreground font-bold">
                      Fasilitas &amp; Benefit:
                    </h4>
                    <div className="border-border/60 bg-card text-foreground mt-1 rounded-lg border p-3 leading-relaxed whitespace-pre-line">
                      {selectedJob.benefits}
                    </div>
                  </div>
                )}

                {/* Metode Pelamaran */}
                <div className="border-border/60 bg-muted/10 rounded-lg border p-3">
                  <span className="text-foreground font-bold">
                    Metode Lamaran:{" "}
                  </span>
                  <span>{selectedJob.applicationMethod} </span>
                  {selectedJob.applicationEmail && (
                    <span>(Email: {selectedJob.applicationEmail})</span>
                  )}
                  {selectedJob.externalUrl && (
                    <span>(Tautan: {selectedJob.externalUrl})</span>
                  )}
                </div>
              </div>

              <DialogFooter className="flex flex-row items-center justify-between gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedJob(null)}
                >
                  Tutup
                </Button>

                <div className="flex items-center gap-2">
                  {selectedJob.status !== "PUBLISHED" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setJobToApprove(selectedJob);
                        setSelectedJob(null);
                      }}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="mr-1.5 size-3.5" />
                      Setujui
                    </Button>
                  )}

                  {selectedJob.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setJobToReject(selectedJob);
                        setRejectionReason(selectedJob.rejectionReason || "");
                        setRejectError("");
                        setSelectedJob(null);
                      }}
                    >
                      <XCircle className="mr-1.5 size-3.5" />
                      Tolak
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* ALERT DIALOG KONFIRMASI APPROVE */}
      {/* ========================================================================= */}
      <AlertDialog
        open={!!jobToApprove}
        onOpenChange={(open) => !open && setJobToApprove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="size-5" />
              <AlertDialogTitle>
                Setujui &amp; Publikasikan Lowongan?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs">
              Lowongan &ldquo;
              <span className="text-foreground font-bold">
                {jobToApprove?.title}
              </span>
              &rdquo; milik{" "}
              <span className="text-foreground font-bold">
                {jobToApprove?.company?.name}
              </span>{" "}
              akan langsung berstatus <strong>PUBLISHED</strong> dan tayang di
              bursa KerjaNTB. Notifikasi konfirmasi akan dikirimkan ke employer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="text-xs">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleConfirmApprove}
              className="bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              {isPending ? (
                <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 size-3.5" />
              )}
              Ya, Setujui Lowongan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========================================================================= */}
      {/* DIALOG INPUT ALASAN PENOLAKAN (MANDATORY) */}
      {/* ========================================================================= */}
      <Dialog
        open={!!jobToReject}
        onOpenChange={(open) => {
          if (!open) {
            setJobToReject(null);
            setRejectError("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-destructive flex items-center gap-2">
              <AlertTriangle className="size-5" />
              <DialogTitle>Tolak Lowongan Kerja</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Tuliskan alasan penolakan secara jelas. Keterangan ini wajib diisi
              dan akan dikirimkan kepada pemilik lowongan agar dapat diperbaiki.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-bold">
                Alasan Penolakan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Contoh: Rentang gaji tidak sesuai UMR NTB, deskripsi mencurigakan, atau kualifikasi terindikasi memungut biaya pendaftaran."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectError) setRejectError("");
                }}
                rows={4}
                className="mt-1.5 text-xs"
              />
              <div className="text-muted-foreground mt-1 flex items-center justify-between text-[11px]">
                <span>Minimal 10 karakter</span>
                <span>{rejectionReason.length}/1000</span>
              </div>
              {rejectError && (
                <p className="text-destructive mt-1.5 text-xs font-semibold">
                  {rejectError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => {
                setJobToReject(null);
                setRejectError("");
              }}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={handleConfirmReject}
              className="text-xs font-semibold"
            >
              {isPending ? (
                <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <XCircle className="mr-1.5 size-3.5" />
              )}
              Kirim Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
