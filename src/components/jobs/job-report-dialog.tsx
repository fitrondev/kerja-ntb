"use client";

import * as React from "react";

import Link from "next/link";

import { AlertTriangle, Flag, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { submitJobReportAction } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReportReason } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const REPORT_REASONS: Array<{
  value: ReportReason;
  label: string;
  desc: string;
}> = [
  {
    value: ReportReason.REQUESTING_MONEY,
    label: "Permintaan Uang / Pungutan Biaya",
    desc: "Meminta biaya formulir, tiket travel, tes medis berbayar, atau seragam.",
  },
  {
    value: ReportReason.FAKE_JOB,
    label: "Lowongan Palsu / Perusahaan Fiktif",
    desc: "Alamat, kantor, atau legalitas perusahaan tidak dapat dipertanggungjawabkan.",
  },
  {
    value: ReportReason.FRAUD,
    label: "Indikasi Penipuan / Skema Mencurigakan",
    desc: "Penipuan data pribadi, penawaran investasi, judi online berkedok loker.",
  },
  {
    value: ReportReason.MISLEADING_INFORMATION,
    label: "Informasi Menyesatkan",
    desc: "Gaji, lokasi penempatan, atau deskripsi kerja sangat berbeda dengan kenyataan.",
  },
  {
    value: ReportReason.SPAM,
    label: "Spam / Lowongan Duplikat",
    desc: "Lowongan dipasang berulang kali atau bukan lowongan kerja nyata.",
  },
  {
    value: ReportReason.DISCRIMINATION,
    label: "Diskriminasi SARA / Gender",
    desc: "Persyaratan diskriminatif yang melanggar norma ketenagakerjaan.",
  },
  {
    value: ReportReason.ILLEGAL_CONTENT,
    label: "Konten Melanggar Hukum",
    desc: "Mengandung unsur eksploitasi, narkotika, atau pelanggaran hukum RI.",
  },
  {
    value: ReportReason.OTHER,
    label: "Lainnya",
    desc: "Keluhan atau pelanggaran etika lainnya yang perlu ditinjau admin.",
  },
];

export interface JobReportDialogProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  triggerVariant?: "outline" | "ghost" | "destructive" | "secondary";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  triggerText?: string;
  showIconOnly?: boolean;
  className?: string;
}

export function JobReportDialog({
  jobId,
  jobTitle,
  companyName,
  triggerVariant = "outline",
  triggerSize = "default",
  triggerText = "Laporkan",
  showIconOnly = false,
  className,
}: JobReportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<ReportReason>(
    ReportReason.REQUESTING_MONEY
  );
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [authError, setAuthError] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (description.trim().length < 10) {
      toast.error("Rincian laporan minimal 10 karakter.");
      return;
    }

    setIsSubmitting(true);
    setAuthError(false);

    try {
      const res = await submitJobReportAction({
        jobId,
        reason,
        description: description.trim(),
      });

      if (res.success) {
        toast.success("Laporan berhasil dikirim!", {
          description:
            "Tim verifikasi KerjaNTB akan segera mengaudit lowongan ini. Terima kasih telah menjaga keamanan komunitas kami.",
        });
        setOpen(false);
        setDescription("");
      } else {
        if (res.error?.includes("masuk (login)")) {
          setAuthError(true);
        }
        toast.error(res.error || "Gagal mengirimkan laporan.");
      }
    } catch {
      toast.error("Terjadi kegagalan koneksi. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          className={cn(
            "text-muted-foreground hover:text-destructive hover:border-destructive/30 gap-2 transition-colors",
            className
          )}
          title="Laporkan lowongan ini ke tim moderasi KerjaNTB"
        >
          <Flag className="size-4" />
          {!showIconOnly && <span>{triggerText}</span>}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-5" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Pusat Perlindungan Pencari Kerja NTB
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">
            Laporkan Lowongan Kerja
          </DialogTitle>
          <DialogDescription className="text-xs">
            Laporan Anda ditujukan untuk posisi <strong>{jobTitle}</strong> di{" "}
            <strong>{companyName}</strong>. Seluruh identitas pelapor
            dirahasiakan.
          </DialogDescription>
        </DialogHeader>

        {authError ? (
          <div className="border-destructive/30 bg-destructive/10 space-y-3 rounded-xl border p-4 text-xs">
            <div className="text-destructive flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              <span>Login Diperlukan</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Untuk mencegah manipulasi dan laporan palsu, Anda wajib masuk ke
              akun KerjaNTB sebelum mengirimkan laporan.
            </p>
            <div className="pt-2">
              <Button asChild size="sm" className="w-full">
                <Link href="/sign-in">Masuk Sekarang</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-sm">
            {/* Pilihan Alasan */}
            <div className="space-y-1.5">
              <Label htmlFor="report-reason" className="text-xs font-semibold">
                Alasan Pelaporan <span className="text-destructive">*</span>
              </Label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-lg border px-3 text-xs focus-visible:ring-2 focus-visible:outline-hidden sm:text-sm"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-muted-foreground text-[11px]">
                {REPORT_REASONS.find((r) => r.value === reason)?.desc}
              </p>
            </div>

            {/* Rincian Deskripsi */}
            <div className="space-y-1.5">
              <Label
                htmlFor="report-description"
                className="text-xs font-semibold"
              >
                Rincian Bukti &amp; Keterangan{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan detail kecurangan atau bukti yang Anda temukan (contoh: diminta transfer uang travel, nomor kontak palsu, dsb)..."
                rows={4}
                className="resize-none text-xs sm:text-sm"
                required
              />
              <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                <span>Minimal 10 karakter</span>
                <span>{description.length}/1000</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting || description.trim().length < 10}
                className="gap-2 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Flag className="size-4" />
                    <span>Kirim Laporan</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
