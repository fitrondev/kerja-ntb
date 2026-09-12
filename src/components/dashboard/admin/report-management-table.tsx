"use client";

import { useMemo, useState, useTransition } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileWarning,
  Filter,
  Info,
  PauseCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { ReportActionType, resolveReportAction } from "@/actions/admin";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface SerializedReport {
  id: string;
  reason: string;
  description: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED" | "ACTION_TAKEN";
  actionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    slug: string;
    status: string;
    company: {
      id: string;
      name: string;
      slug: string;
    } | null;
    creator: {
      id: string;
      email: string;
      status: string;
    };
  };
  reporter: {
    id: string;
    email: string;
  };
}

interface ReportManagementTableProps {
  initialReports: SerializedReport[];
}

export function ReportManagementTable({
  initialReports,
}: ReportManagementTableProps) {
  const router = useRouter();
  const [reports, setReports] = useState<SerializedReport[]>(initialReports);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "REVIEWED" | "ACTION_TAKEN" | "DISMISSED"
  >("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // State Dialog Tindakan Laporan
  const [selectedReport, setSelectedReport] = useState<SerializedReport | null>(
    null
  );
  const [actionType, setActionType] = useState<ReportActionType>("REMOVE_JOB");
  const [actionNotes, setActionNotes] = useState("");
  const [actionError, setActionError] = useState("");

  // Filter & Search
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter === "PENDING" && r.status !== "PENDING") return false;
      if (statusFilter === "REVIEWED" && r.status !== "REVIEWED") return false;
      if (statusFilter === "ACTION_TAKEN" && r.status !== "ACTION_TAKEN")
        return false;
      if (statusFilter === "DISMISSED" && r.status !== "DISMISSED")
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.job.title.toLowerCase().includes(q);
        const matchCompany =
          r.job.company?.name.toLowerCase().includes(q) || false;
        const matchReporter = r.reporter.email.toLowerCase().includes(q);
        const matchReason = r.reason.toLowerCase().includes(q);
        return matchTitle || matchCompany || matchReporter || matchReason;
      }

      return true;
    });
  }, [reports, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: reports.length,
      pending: reports.filter((r) => r.status === "PENDING").length,
      reviewed: reports.filter((r) => r.status === "REVIEWED").length,
      actionTaken: reports.filter((r) => r.status === "ACTION_TAKEN").length,
      dismissed: reports.filter((r) => r.status === "DISMISSED").length,
    };
  }, [reports]);

  // Format label alasan pelanggaran
  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "FRAUD":
      case "FAKE_JOB":
        return (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertOctagon className="size-3" />
            <span>Indikasi Penipuan</span>
          </Badge>
        );
      case "REQUESTING_MONEY":
        return (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertTriangle className="size-3" />
            <span>Pungutan Biaya / Pungli</span>
          </Badge>
        );
      case "MISLEADING_INFORMATION":
        return (
          <Badge
            variant="secondary"
            className="border-0 bg-amber-500/15 text-[10px] text-amber-700 dark:text-amber-400"
          >
            <span>Informasi Palsu / Misleading</span>
          </Badge>
        );
      case "SPAM":
        return (
          <Badge variant="secondary" className="text-[10px]">
            <span>Spam / Duplikat</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            <span>{reason.replace("_", " ")}</span>
          </Badge>
        );
    }
  };

  // Handler Submit Tindakan Laporan
  const handleExecuteAction = () => {
    if (!selectedReport) return;

    if (!actionNotes.trim() || actionNotes.trim().length < 5) {
      setActionError(
        "Catatan penanganan wajib diisi minimal 5 karakter sebagai arsip audit."
      );
      return;
    }

    const reportId = selectedReport.id;
    const type = actionType;
    const notes = actionNotes.trim();

    startTransition(async () => {
      try {
        const res = await resolveReportAction({
          reportId,
          actionType: type,
          actionNotes: notes,
        });

        if (!res.success) {
          toast.error(res.error || "Gagal memproses tindakan laporan.");
          return;
        }

        const newStatus = res.data?.status || "ACTION_TAKEN";
        toast.success(
          "Tindakan laporan berhasil dieksekusi dan dicatat ke Audit Log."
        );

        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? {
                  ...r,
                  status: newStatus,
                  actionNotes: `[${type}]: ${notes}`,
                  job: {
                    ...r.job,
                    status:
                      type === "REMOVE_JOB" || type === "SUSPEND_USER"
                        ? "REMOVED"
                        : type === "PAUSE_JOB"
                          ? "PAUSED"
                          : r.job.status,
                    creator: {
                      ...r.job.creator,
                      status:
                        type === "SUSPEND_USER"
                          ? "SUSPENDED"
                          : r.job.creator.status,
                    },
                  },
                }
              : r
          )
        );

        setSelectedReport(null);
        setActionNotes("");
        setActionError("");
        router.refresh();
      } catch {
        toast.error("Terjadi kegagalan saat mengeksekusi tindakan.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Tab Filter & Pencarian */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="border-border bg-card flex flex-wrap items-center gap-1.5 rounded-xl border p-1">
          <Button
            size="sm"
            variant={statusFilter === "PENDING" ? "default" : "ghost"}
            onClick={() => setStatusFilter("PENDING")}
            className="h-8 text-xs font-semibold"
          >
            <Clock className="mr-1.5 size-3.5" />
            <span>Perlu Tindakan ({counts.pending})</span>
          </Button>

          <Button
            size="sm"
            variant={statusFilter === "ACTION_TAKEN" ? "default" : "ghost"}
            onClick={() => setStatusFilter("ACTION_TAKEN")}
            className="h-8 text-xs font-semibold"
          >
            <CheckCircle2 className="mr-1.5 size-3.5 text-emerald-500" />
            <span>Ditindak ({counts.actionTaken})</span>
          </Button>

          <Button
            size="sm"
            variant={statusFilter === "REVIEWED" ? "default" : "ghost"}
            onClick={() => setStatusFilter("REVIEWED")}
            className="h-8 text-xs font-semibold"
          >
            <Info className="mr-1.5 size-3.5 text-blue-500" />
            <span>Ditinjau ({counts.reviewed})</span>
          </Button>

          <Button
            size="sm"
            variant={statusFilter === "DISMISSED" ? "default" : "ghost"}
            onClick={() => setStatusFilter("DISMISSED")}
            className="h-8 text-xs font-semibold"
          >
            <XCircle className="mr-1.5 size-3.5" />
            <span>Diabaikan ({counts.dismissed})</span>
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

        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Cari lowongan, pelapor, alasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* List Laporan */}
      {filteredReports.length === 0 ? (
        <Card className="border-border">
          <CardContent className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center text-xs">
            <CheckCircle2 className="mb-2 size-10 text-emerald-500" />
            <p className="text-foreground text-sm font-bold">
              Bursa Kerja Bersih &amp; Aman
            </p>
            <p className="mt-1 max-w-sm">
              {statusFilter === "PENDING"
                ? "Tidak ada laporan pelanggaran aktif dari pengguna yang menunggu tindakan admin."
                : "Tidak ditemukan data laporan pada filter ini."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const isPendingItem = report.status === "PENDING";
            const isActionTaken = report.status === "ACTION_TAKEN";
            const isDismissed = report.status === "DISMISSED";
            const isReviewed = report.status === "REVIEWED";

            return (
              <Card
                key={report.id}
                className={
                  isPendingItem
                    ? "border-destructive/30 bg-destructive/5 hover:border-destructive/60 transition-all"
                    : "border-border/80 hover:border-primary/40 transition-all"
                }
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    {/* Ringkasan Laporan */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground text-base font-bold">
                          {report.job.title}
                        </span>

                        {getReasonBadge(report.reason)}

                        {isPendingItem && (
                          <Badge
                            variant="destructive"
                            className="animate-pulse text-[10px] font-semibold"
                          >
                            Perlu Tindakan Cepat
                          </Badge>
                        )}
                        {isActionTaken && (
                          <Badge
                            variant="secondary"
                            className="border-0 bg-emerald-500/15 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="mr-1 size-3" />
                            Telah Ditindak
                          </Badge>
                        )}
                        {isReviewed && (
                          <Badge
                            variant="secondary"
                            className="border-0 bg-blue-500/15 text-[10px] font-semibold text-blue-700 dark:text-blue-400"
                          >
                            Sedang Diinvestigasi
                          </Badge>
                        )}
                        {isDismissed && (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground text-[10px]"
                          >
                            Laporan Diabaikan
                          </Badge>
                        )}
                      </div>

                      <div className="text-muted-foreground flex flex-wrap items-center gap-2.5 text-xs">
                        <span className="text-foreground font-semibold">
                          Perusahaan:{" "}
                          {report.job.company?.name || "Perusahaan Anonim"}
                        </span>
                        <span>•</span>
                        <span>Pelapor: {report.reporter.email}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="text-muted-foreground size-3" />
                          <span>{report.createdAt}</span>
                        </span>
                        <span>•</span>
                        <span>Status Loker: {report.job.status}</span>
                      </div>

                      {/* Kutipan Keterangan Aduan Pelapor */}
                      <div className="border-border/70 bg-card text-foreground rounded-lg border p-3 text-xs">
                        <span className="text-muted-foreground mb-0.5 block text-[11px] font-semibold">
                          Keterangan / Keluhan Pengguna:
                        </span>
                        <p className="italic">
                          &ldquo;{report.description}&rdquo;
                        </p>
                      </div>

                      {/* Catatan Aksi Admin Jika Ada */}
                      {report.actionNotes && (
                        <div className="border-primary/20 bg-primary/5 rounded-lg border p-2 text-xs">
                          <span className="text-foreground font-bold">
                            Catatan Penanganan Admin:{" "}
                          </span>
                          <span className="text-muted-foreground">
                            {report.actionNotes}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tombol Aksi Moderasi Laporan */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {/* Buka Lowongan Publik */}
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="text-muted-foreground h-8 gap-1 text-xs"
                      >
                        <Link
                          href={`/loker/${report.job.slug}`}
                          target="_blank"
                        >
                          <span>Buka Loker</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      </Button>

                      {/* Tombol Tindak Lanjuti */}
                      <Button
                        size="sm"
                        variant={isPendingItem ? "destructive" : "outline"}
                        onClick={() => {
                          setSelectedReport(report);
                          setActionType("REMOVE_JOB");
                          setActionNotes("");
                          setActionError("");
                        }}
                        className="h-8 gap-1.5 text-xs font-semibold"
                      >
                        <ShieldAlert className="size-3.5" />
                        <span>Tindak Lanjuti</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOG TINDAKAN PENANGANAN LAPORAN (ACTION RESOLUTION DIALOG) */}
      {/* ========================================================================= */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReport(null);
            setActionError("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-destructive flex items-center gap-2">
              <ShieldAlert className="size-5" />
              <DialogTitle>Tindak Lanjuti Laporan Pelanggaran</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Pilih tindakan disipliner atau resolusi atas lowongan &ldquo;
              <span className="text-foreground font-bold">
                {selectedReport?.job.title}
              </span>
              &rdquo;. Setiap tindakan akan dicatat ke Audit Log.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Pilihan Tindakan */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                Pilih Tindakan Moderasi{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={actionType}
                onValueChange={(val) => setActionType(val as ReportActionType)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Pilih tindakan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAUSE_JOB">
                    <span className="font-semibold text-amber-600">
                      Jeda Lowongan (Pause)
                    </span>{" "}
                    - Sembunyikan sementara dari publik
                  </SelectItem>
                  <SelectItem value="REMOVE_JOB">
                    <span className="text-destructive font-semibold">
                      Hapus Lowongan (Remove)
                    </span>{" "}
                    - Cabut publikasi lowongan secara permanen
                  </SelectItem>
                  <SelectItem value="SUSPEND_USER">
                    <span className="text-destructive font-semibold">
                      Suspend Akun &amp; Hapus Loker
                    </span>{" "}
                    - Blokir pengguna pembuat lowongan
                  </SelectItem>
                  <SelectItem value="MARK_REVIEWED">
                    <span className="font-semibold text-blue-600">
                      Tandai Sedang Diinvestigasi
                    </span>{" "}
                    - Verifikasi lebih lanjut ke pihak terkait
                  </SelectItem>
                  <SelectItem value="DISMISS">
                    <span className="text-muted-foreground font-semibold">
                      Abaikan Laporan (Dismiss)
                    </span>{" "}
                    - Aduan tidak valid / spam
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Catatan Penanganan Wajib */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                Catatan Penanganan (Action Notes){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Jelaskan dasar pertimbangan tindakan yang diambil (contoh: 'Perusahaan terindikasi meminta uang pendaftaran via WhatsApp, loker telah dicabut dan peringatan telah diberikan')."
                value={actionNotes}
                onChange={(e) => {
                  setActionNotes(e.target.value);
                  if (actionError) setActionError("");
                }}
                rows={4}
                className="text-xs"
              />
              <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                <span>Minimal 5 karakter</span>
                <span>{actionNotes.length}/2000</span>
              </div>
              {actionError && (
                <p className="text-destructive text-xs font-semibold">
                  {actionError}
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
                setSelectedReport(null);
                setActionError("");
              }}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant={
                actionType === "DISMISS" || actionType === "MARK_REVIEWED"
                  ? "default"
                  : "destructive"
              }
              size="sm"
              disabled={isPending}
              onClick={handleExecuteAction}
              className="text-xs font-semibold"
            >
              {isPending ? (
                <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <ShieldAlert className="mr-1.5 size-3.5" />
              )}
              Eksekusi Tindakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
