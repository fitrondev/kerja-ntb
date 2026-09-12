"use client";

import * as React from "react";

import Link from "next/link";

import {
  CheckCircle2,
  ExternalLink,
  FileCheck,
  FileText,
  FileUp,
  Loader2,
  LogIn,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { submitJobApplicationAction } from "@/actions/application";
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
import { useStorageUpload } from "@/hooks/use-storage-upload";
import { cn } from "@/lib/utils";

export interface UserResumeOption {
  id: string;
  title: string;
  fileUrl?: string | null;
  isDefault: boolean;
}

export interface JobApplyModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  userResumes: UserResumeOption[];
  isLoggedIn: boolean;
  hasApplied?: boolean;
  triggerVariant?: "default" | "outline" | "secondary";
  triggerSize?: "default" | "sm" | "lg";
  className?: string;
}

export function JobApplyModal({
  jobId,
  jobTitle,
  companyName,
  userResumes,
  isLoggedIn,
  hasApplied = false,
  triggerVariant = "default",
  triggerSize = "lg",
  className,
}: JobApplyModalProps) {
  const [open, setOpen] = React.useState(false);
  const defaultResume = userResumes.find((r) => r.isDefault) || userResumes[0];

  const [selectedResumeId, setSelectedResumeId] = React.useState<string>(
    defaultResume ? defaultResume.id : ""
  );
  const [customResumeUrl, setCustomResumeUrl] = React.useState<string>("");
  const [coverLetter, setCoverLetter] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isAppliedSuccess, setIsAppliedSuccess] = React.useState(hasApplied);

  const { upload, isUploading } = useStorageUpload();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Format CV harus berupa berkas PDF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran berkas CV maksimal 5 MB.");
      return;
    }

    const res = await upload(file, "RESUME");
    const uploadedUrl = res?.fileUrl || res?.publicUrl;
    if (res && uploadedUrl) {
      setCustomResumeUrl(uploadedUrl);
      setSelectedResumeId(""); // unselect existing resume
      toast.success("Berkas CV kustom berhasil diunggah!");
    } else {
      toast.error("Gagal mengunggah berkas CV.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResumeId && !customResumeUrl) {
      toast.error(
        "Mohon pilih CV dari Resume Builder atau unggah berkas CV PDF."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitJobApplicationAction({
        jobId,
        resumeId: selectedResumeId || undefined,
        customResumeUrl: customResumeUrl || undefined,
        coverLetter: coverLetter.trim() || undefined,
      });

      if (res.success) {
        setIsAppliedSuccess(true);
        toast.success("Lamaran berhasil dikirim!", {
          description: `Lamaran Anda untuk posisi "${jobTitle}" di ${companyName} telah diteruskan ke HRD.`,
        });
        setOpen(false);
      } else {
        toast.error(res.error || "Gagal mengirimkan lamaran.");
      }
    } catch {
      toast.error("Terjadi masalah jaringan. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAppliedSuccess) {
    return (
      <Button
        type="button"
        variant="outline"
        size={triggerSize}
        disabled
        className={cn(
          "border-chart-1/30 bg-chart-1/10 text-chart-1 gap-2 font-semibold",
          className
        )}
      >
        <CheckCircle2 className="size-4" />
        <span>Sudah Dilamar</span>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          className={cn(
            "bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl font-semibold shadow-sm",
            className
          )}
        >
          <Send className="size-4" />
          <span>Lamar Sekarang (KerjaNTB)</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-1">
          <div className="text-primary flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="size-3.5" />
            <span>Kirim Lamaran Kerja</span>
          </div>
          <DialogTitle className="text-xl font-bold">
            Lamar Posisi {jobTitle}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Lamaran Anda akan langsung diterima oleh tim rekrutmen{" "}
            <strong>{companyName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {!isLoggedIn ? (
          <div className="space-y-4 py-3">
            <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-xl border p-6 text-center">
              <LogIn className="text-primary mb-2 size-10" />
              <h4 className="text-foreground text-sm font-bold">
                Masuk untuk Melamar
              </h4>
              <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-relaxed">
                Anda perlu masuk (login) ke akun KerjaNTB agar profil dan CV
                Anda dapat dikirimkan ke perusahaan.
              </p>
              <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row">
                <Button asChild size="sm" className="flex-1 gap-2">
                  <Link href={`/sign-in?redirect_url=/loker`}>
                    <LogIn className="size-3.5" />
                    <span>Masuk Sekarang</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href="/sign-up">Daftar Akun Baru</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-sm">
            {/* Pilih Resume dari Builder */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Pilih Resume / CV <span className="text-destructive">*</span>
                </Label>
                <Link
                  href="/dashboard/user/resume"
                  className="text-primary text-[11px] font-medium hover:underline"
                >
                  + Kelola di Resume Builder
                </Link>
              </div>

              {userResumes.length > 0 ? (
                <div className="space-y-2">
                  {userResumes.map((r) => (
                    <label
                      key={r.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-all",
                        selectedResumeId === r.id && !customResumeUrl
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border hover:bg-muted/30 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="selectedResume"
                          checked={
                            selectedResumeId === r.id && !customResumeUrl
                          }
                          onChange={() => {
                            setSelectedResumeId(r.id);
                            setCustomResumeUrl("");
                          }}
                          className="accent-primary"
                        />
                        <div className="text-foreground font-medium">
                          {r.title}
                        </div>
                        {r.isDefault && (
                          <span className="bg-chart-1/10 text-chart-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                            Utama
                          </span>
                        )}
                      </div>
                      {r.fileUrl && (
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary flex items-center gap-1 text-[11px] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="size-3" />
                          <span>PDF</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="border-border/60 bg-muted/20 text-muted-foreground rounded-xl border border-dashed p-3 text-center text-xs">
                  <span>Anda belum menyusun CV di Resume Builder.</span>
                </div>
              )}
            </div>

            {/* Opsi Upload CV Kustom Baru */}
            <div className="border-border bg-muted/15 space-y-2 rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground text-xs font-semibold">
                  Atau Unggah CV PDF Baru
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Maks 5 MB
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  className="relative gap-2 overflow-hidden text-xs"
                >
                  <FileUp className="size-3.5" />
                  <span>
                    {isUploading ? "Mengunggah..." : "Pilih File PDF"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={isUploading}
                  />
                </Button>

                {customResumeUrl && (
                  <div className="text-chart-1 flex items-center gap-1.5 text-xs font-semibold">
                    <FileCheck className="size-4" />
                    <span>CV Baru Terpilih</span>
                  </div>
                )}
              </div>
            </div>

            {/* Surat Pengantar / Cover Letter */}
            <div className="space-y-1.5">
              <Label htmlFor="coverLetter" className="text-xs font-semibold">
                Surat Lamaran / Catatan untuk HRD (Opsional)
              </Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tuliskan motivasi, keunggulan, atau kesiapan Anda bergabung dengan perusahaan ini..."
                rows={4}
                className="resize-none text-xs sm:text-sm"
              />
              <div className="text-muted-foreground text-right text-[11px]">
                {coverLetter.length}/3000
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
                disabled={
                  isSubmitting || (!selectedResumeId && !customResumeUrl)
                }
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Mengirimkan Lamaran...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    <span>Kirim Lamaran Sekarang</span>
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
