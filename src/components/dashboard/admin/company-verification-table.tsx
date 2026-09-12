"use client";

import { useMemo, useState, useTransition } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  approveCompanyVerificationAction,
  getSecureVerificationDocUrlAction,
  rejectCompanyVerificationAction,
} from "@/actions/admin";
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

export interface SerializedVerification {
  id: string;
  legalName: string;
  nib: string;
  taxId: string | null;
  address: string;
  phone: string;
  email: string;
  website: string | null;
  documentUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    isVerified: boolean;
    location: {
      name: string;
    } | null;
    user: {
      email: string;
    };
  };
}

interface CompanyVerificationTableProps {
  initialVerifications: SerializedVerification[];
}

export function CompanyVerificationTable({
  initialVerifications,
}: CompanyVerificationTableProps) {
  const router = useRouter();
  const [verifications, setVerifications] =
    useState<SerializedVerification[]>(initialVerifications);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // State Dialog Detail & Document Preview
  const [selectedVerification, setSelectedVerification] =
    useState<SerializedVerification | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [signedDocUrl, setSignedDocUrl] = useState<string | null>(null);
  const [isDocPdf, setIsDocPdf] = useState(false);

  // State Konfirmasi Approve
  const [itemToApprove, setItemToApprove] =
    useState<SerializedVerification | null>(null);

  // State Dialog Reject
  const [itemToReject, setItemToReject] =
    useState<SerializedVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Filter & Search
  const filteredItems = useMemo(() => {
    return verifications.filter((item) => {
      if (statusFilter === "PENDING" && item.status !== "PENDING") return false;
      if (statusFilter === "APPROVED" && item.status !== "APPROVED")
        return false;
      if (statusFilter === "REJECTED" && item.status !== "REJECTED")
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.company.name.toLowerCase().includes(q);
        const matchLegal = item.legalName.toLowerCase().includes(q);
        const matchNib = item.nib.includes(q);
        const matchLoc =
          item.company.location?.name.toLowerCase().includes(q) || false;
        return matchName || matchLegal || matchNib || matchLoc;
      }

      return true;
    });
  }, [verifications, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: verifications.length,
      pending: verifications.filter((v) => v.status === "PENDING").length,
      approved: verifications.filter((v) => v.status === "APPROVED").length,
      rejected: verifications.filter((v) => v.status === "REJECTED").length,
    };
  }, [verifications]);

  // Buka dokumen privat dengan Signed URL
  const handleOpenDocument = async (verification: SerializedVerification) => {
    setDocLoading(true);
    try {
      const res = await getSecureVerificationDocUrlAction(verification.id);
      if (res.success && res.data) {
        setSignedDocUrl(res.data.downloadUrl);
        setIsDocPdf(res.data.isPdf);
        window.open(res.data.downloadUrl, "_blank", "noopener,noreferrer");
      } else {
        // Fallback ke documentUrl langsung bila presign gagal
        window.open(verification.documentUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      window.open(verification.documentUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDocLoading(false);
    }
  };

  // Handler Approve Verifikasi
  const handleConfirmApprove = () => {
    if (!itemToApprove) return;

    const vId = itemToApprove.id;
    const cName = itemToApprove.company.name;

    startTransition(async () => {
      try {
        const res = await approveCompanyVerificationAction(vId);
        if (!res.success) {
          toast.error(res.error || "Gagal memverifikasi perusahaan.");
          return;
        }

        toast.success(
          `Perusahaan "${cName}" berhasil diverifikasi dengan badge resmi NTB! 🛡️`
        );
        setVerifications((prev) =>
          prev.map((v) =>
            v.id === vId
              ? {
                  ...v,
                  status: "APPROVED",
                  rejectionReason: null,
                  company: { ...v.company, isVerified: true },
                }
              : v
          )
        );
        if (selectedVerification?.id === vId) {
          setSelectedVerification((prev) =>
            prev
              ? {
                  ...prev,
                  status: "APPROVED",
                  company: { ...prev.company, isVerified: true },
                }
              : null
          );
        }
        setItemToApprove(null);
        router.refresh();
      } catch {
        toast.error("Terjadi kegagalan saat menyetujui verifikasi.");
      }
    });
  };

  // Handler Reject Verifikasi
  const handleConfirmReject = () => {
    if (!itemToReject) return;

    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      setRejectError(
        "Alasan penolakan verifikasi NIB wajib diisi minimal 10 karakter."
      );
      return;
    }

    const vId = itemToReject.id;
    const cName = itemToReject.company.name;
    const reason = rejectionReason.trim();

    startTransition(async () => {
      try {
        const res = await rejectCompanyVerificationAction({
          verificationId: vId,
          rejectionReason: reason,
        });

        if (!res.success) {
          toast.error(res.error || "Gagal menolak pengajuan verifikasi.");
          return;
        }

        toast.warning(
          `Pengajuan verifikasi "${cName}" ditolak dengan catatan alasan.`
        );
        setVerifications((prev) =>
          prev.map((v) =>
            v.id === vId
              ? {
                  ...v,
                  status: "REJECTED",
                  rejectionReason: reason,
                  company: { ...v.company, isVerified: false },
                }
              : v
          )
        );
        if (selectedVerification?.id === vId) {
          setSelectedVerification((prev) =>
            prev
              ? {
                  ...prev,
                  status: "REJECTED",
                  rejectionReason: reason,
                  company: { ...prev.company, isVerified: false },
                }
              : null
          );
        }
        setItemToReject(null);
        setRejectionReason("");
        setRejectError("");
        router.refresh();
      } catch {
        toast.error("Terjadi kegagalan saat memproses penolakan verifikasi.");
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
            <span>Menunggu Verifikasi ({counts.pending})</span>
          </Button>

          <Button
            size="sm"
            variant={statusFilter === "APPROVED" ? "default" : "ghost"}
            onClick={() => setStatusFilter("APPROVED")}
            className="h-8 text-xs font-semibold"
          >
            <ShieldCheck className="mr-1.5 size-3.5 text-blue-500" />
            <span>Terverifikasi ({counts.approved})</span>
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

        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Cari perusahaan, NIB, lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* List Verifikasi */}
      {filteredItems.length === 0 ? (
        <Card className="border-border">
          <CardContent className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center text-xs">
            <ShieldCheck className="mb-2 size-10 text-blue-500" />
            <p className="text-foreground text-sm font-bold">
              Tidak Ada Antrean Verifikasi
            </p>
            <p className="mt-1 max-w-sm">
              {statusFilter === "PENDING"
                ? "Tidak ada permohonan verifikasi NIB baru yang menunggu persetujuan admin."
                : "Tidak ditemukan data verifikasi pada filter ini."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isPendingItem = item.status === "PENDING";
            const isApproved = item.status === "APPROVED";
            const isRejected = item.status === "REJECTED";
            const isValidNibFormat = /^\d{13}$/.test(item.nib);

            return (
              <Card
                key={item.id}
                className="border-border/80 hover:border-primary/40 transition-all hover:shadow-xs"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    {/* Info Legalitas Perusahaan */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground text-base font-bold">
                          {item.company.name}
                        </span>

                        {isPendingItem && (
                          <Badge
                            variant="secondary"
                            className="border-0 bg-amber-500/15 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
                          >
                            <Clock className="mr-1 size-3" />
                            Menunggu Verifikasi
                          </Badge>
                        )}
                        {isApproved && (
                          <Badge
                            variant="secondary"
                            className="border-0 bg-blue-500/15 text-[11px] font-semibold text-blue-700 dark:text-blue-400"
                          >
                            <ShieldCheck className="mr-1 size-3 text-blue-600 dark:text-blue-400" />
                            Terverifikasi NIB
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge
                            variant="destructive"
                            className="text-[11px] font-semibold"
                          >
                            <XCircle className="mr-1 size-3" />
                            Verifikasi Ditolak
                          </Badge>
                        )}

                        <Badge
                          variant="outline"
                          className={
                            isValidNibFormat
                              ? "border-emerald-500/40 bg-emerald-500/5 text-[10px] text-emerald-700 dark:text-emerald-400"
                              : "border-destructive/40 bg-destructive/5 text-destructive text-[10px]"
                          }
                        >
                          NIB: {item.nib} (
                          {isValidNibFormat
                            ? "13 Digit Valid"
                            : "Format Invalid"}
                          )
                        </Badge>
                      </div>

                      {/* Detail Legalitas & Kontak */}
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2.5 text-xs">
                        <span className="text-foreground font-semibold">
                          Badan Usaha: {item.legalName}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="text-primary size-3.5" />
                          <span>
                            {item.company.location?.name || "Wilayah NTB"}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="text-muted-foreground size-3" />
                          <span>{item.phone}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Mail className="text-muted-foreground size-3" />
                          <span>{item.email}</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="text-muted-foreground size-3" />
                          <span>Diajukan: {item.createdAt}</span>
                        </span>
                      </div>

                      {/* Alasan Penolakan Jika Ada */}
                      {item.rejectionReason && (
                        <div className="border-destructive/30 bg-destructive/5 text-destructive w-full rounded-lg border p-2 text-xs">
                          <span className="font-bold">Catatan Penolakan: </span>
                          <span>{item.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    {/* Tombol Aksi Verifikasi */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {/* Tombol Detail Lengkap */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedVerification(item)}
                        className="h-8 gap-1.5 text-xs font-semibold"
                      >
                        <Eye className="text-muted-foreground size-3.5" />
                        <span>Rincian</span>
                      </Button>

                      {/* Tombol Preview Dokumen Privat dengan Presigned S3 */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDocument(item)}
                        disabled={docLoading}
                        className="h-8 gap-1.5 border-blue-500/30 text-xs font-semibold text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
                        title="Buka dokumen legalitas dengan tautan aman bertanda tangan digital"
                      >
                        {docLoading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <FileCheck className="size-3.5" />
                        )}
                        <span>Lihat Dokumen NIB</span>
                        <ExternalLink className="size-3" />
                      </Button>

                      {/* Tombol Setujui Verifikasi */}
                      {item.status !== "APPROVED" && (
                        <Button
                          size="sm"
                          onClick={() => setItemToApprove(item)}
                          disabled={isPending}
                          className="h-8 gap-1.5 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                          <ShieldCheck className="size-3.5" />
                          <span>Verifikasi</span>
                        </Button>
                      )}

                      {/* Tombol Tolak Verifikasi */}
                      {item.status !== "REJECTED" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setItemToReject(item);
                            setRejectionReason(item.rejectionReason || "");
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
      {/* DIALOG DETAIL LENGKAP VERIFIKASI NIB */}
      {/* ========================================================================= */}
      <Dialog
        open={!!selectedVerification}
        onOpenChange={(open) => !open && setSelectedVerification(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
          {selectedVerification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold">
                    {selectedVerification.company.name}
                  </DialogTitle>
                  <Badge variant="outline" className="text-xs">
                    {selectedVerification.status}
                  </Badge>
                </div>
                <DialogDescription className="text-xs">
                  Pengajuan legalitas usaha OSS se-NTB diajukan pada{" "}
                  {selectedVerification.createdAt}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="border-border bg-muted/20 space-y-2.5 rounded-xl border p-4">
                  <div className="border-border/50 flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">
                      Nomor Induk Berusaha (NIB):
                    </span>
                    <span className="text-foreground font-mono font-bold">
                      {selectedVerification.nib}
                    </span>
                  </div>
                  <div className="border-border/50 flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">
                      Nama Legal Badan Usaha:
                    </span>
                    <span className="text-foreground font-semibold">
                      {selectedVerification.legalName}
                    </span>
                  </div>
                  <div className="border-border/50 flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">
                      NPWP Perusahaan (Tax ID):
                    </span>
                    <span className="text-foreground font-mono">
                      {selectedVerification.taxId || "-"}
                    </span>
                  </div>
                  <div className="border-border/50 flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">
                      Wilayah Domisili:
                    </span>
                    <span className="text-foreground">
                      {selectedVerification.company.location?.name || "NTB"}
                    </span>
                  </div>
                  <div className="border-border/50 flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">
                      Nomor Telepon:
                    </span>
                    <span className="text-foreground">
                      {selectedVerification.phone}
                    </span>
                  </div>
                  <div className="border-border/50 flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">
                      Email Korespondensi:
                    </span>
                    <span className="text-foreground">
                      {selectedVerification.email}
                    </span>
                  </div>
                  {selectedVerification.website && (
                    <div className="border-border/50 flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">
                        Website Resmi:
                      </span>
                      <a
                        href={selectedVerification.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedVerification.website}
                      </a>
                    </div>
                  )}
                  <div className="pt-1">
                    <span className="text-muted-foreground block">
                      Alamat Domisili Legal:
                    </span>
                    <p className="text-foreground mt-1 font-medium">
                      {selectedVerification.address}
                    </p>
                  </div>
                </div>

                {/* Tautan Dokumen Pendukung */}
                <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                  <div className="space-y-0.5">
                    <span className="text-foreground font-bold">
                      Dokumen Bukti NIB / Izin Usaha
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      Tersimpan di SumoPod Object Storage Privat (Aman &amp;
                      Terenkripsi)
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenDocument(selectedVerification)}
                    disabled={docLoading}
                    className="h-8 gap-1.5 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    {docLoading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                    <span>Buka File</span>
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex flex-row items-center justify-between gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVerification(null)}
                >
                  Tutup
                </Button>

                <div className="flex items-center gap-2">
                  {selectedVerification.status !== "APPROVED" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setItemToApprove(selectedVerification);
                        setSelectedVerification(null);
                      }}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <ShieldCheck className="mr-1.5 size-3.5" />
                      Setujui NIB
                    </Button>
                  )}

                  {selectedVerification.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setItemToReject(selectedVerification);
                        setRejectionReason(
                          selectedVerification.rejectionReason || ""
                        );
                        setRejectError("");
                        setSelectedVerification(null);
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
      {/* ALERT DIALOG KONFIRMASI APPROVE VERIFIKASI */}
      {/* ========================================================================= */}
      <AlertDialog
        open={!!itemToApprove}
        onOpenChange={(open) => !open && setItemToApprove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-blue-600">
              <ShieldCheck className="size-5" />
              <AlertDialogTitle>
                Verifikasi Legalitas NIB Perusahaan?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs">
              Perusahaan &ldquo;
              <span className="text-foreground font-bold">
                {itemToApprove?.company.name}
              </span>
              &rdquo; dengan NIB <strong>{itemToApprove?.nib}</strong> akan
              resmi memperoleh status <strong>Terverifikasi</strong> beserta
              badge centang biru NTB. Lowongan kerja yang diterbitkan perusahaan
              ini di masa depan akan otomatis terpublikasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="text-xs">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleConfirmApprove}
              className="bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
            >
              {isPending ? (
                <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="mr-1.5 size-3.5" />
              )}
              Ya, Verifikasi Perusahaan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========================================================================= */}
      {/* DIALOG INPUT ALASAN PENOLAKAN VERIFIKASI (MANDATORY) */}
      {/* ========================================================================= */}
      <Dialog
        open={!!itemToReject}
        onOpenChange={(open) => {
          if (!open) {
            setItemToReject(null);
            setRejectError("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-destructive flex items-center gap-2">
              <AlertTriangle className="size-5" />
              <DialogTitle>Tolak Pengajuan Verifikasi NIB</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Berikan alasan penolakan yang rinci agar pemilik perusahaan dapat
              melakukan perbaikan dokumen NIB yang sah.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-bold">
                Alasan Penolakan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Contoh: Dokumen NIB buram/tidak terbaca, data badan usaha tidak sesuai dengan OSS, atau izin operasional kadaluwarsa."
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
                setItemToReject(null);
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
