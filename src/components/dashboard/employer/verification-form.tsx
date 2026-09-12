"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { submitCompanyVerificationAction } from "@/actions/company";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VerificationStatus } from "@/generated/prisma/enums";
import { useStorageUpload } from "@/hooks/use-storage-upload";

export interface VerificationFormProps {
  companyId: string;
  companyName: string;
  companyAddress?: string | null;
  companyPhone?: string | null;
  companyEmail?: string | null;
  initialVerification?: {
    legalName?: string;
    nib?: string;
    taxId?: string | null;
    address?: string;
    phone?: string;
    email?: string;
    website?: string | null;
    documentUrl?: string;
    status?: VerificationStatus;
    rejectionReason?: string | null;
    createdAt?: Date | string;
  } | null;
}

export function VerificationForm({
  companyId,
  companyName,
  companyAddress,
  companyPhone,
  companyEmail,
  initialVerification,
}: VerificationFormProps) {
  const router = useRouter();

  const [legalName, setLegalName] = React.useState(
    initialVerification?.legalName || companyName || ""
  );
  const [nib, setNib] = React.useState(initialVerification?.nib || "");
  const [taxId, setTaxId] = React.useState(initialVerification?.taxId || "");
  const [address, setAddress] = React.useState(
    initialVerification?.address || companyAddress || ""
  );
  const [phone, setPhone] = React.useState(
    initialVerification?.phone || companyPhone || ""
  );
  const [email, setEmail] = React.useState(
    initialVerification?.email || companyEmail || ""
  );
  const [website, setWebsite] = React.useState(
    initialVerification?.website || ""
  );
  const [documentUrl, setDocumentUrl] = React.useState(
    initialVerification?.documentUrl || ""
  );
  const [documentFileName, setDocumentFileName] = React.useState<string>("");

  const [isPending, startTransition] = React.useTransition();
  const [isEditingAfterReject, setIsEditingAfterReject] = React.useState(false);

  const { upload, isUploading, progress } = useStorageUpload();

  const status = initialVerification?.status;

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Hanya berkas PDF atau gambar (JPG/PNG) yang diperbolehkan.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran berkas dokumen maksimal 10 MB.");
      return;
    }

    setDocumentFileName(file.name);
    const res = await upload(file, "VERIFICATION", companyId);
    const uploadedUrl = res?.fileUrl || res?.publicUrl;
    if (res && uploadedUrl) {
      setDocumentUrl(uploadedUrl);
      toast.success("Dokumen legalitas berhasil diunggah!");
    } else {
      toast.error("Gagal mengunggah dokumen legalitas. Silakan coba lagi.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!legalName.trim()) {
      toast.error("Nama legal badan usaha wajib diisi.");
      return;
    }

    const cleanNib = nib.trim();
    if (!/^\d{13}$/.test(cleanNib)) {
      toast.error("Nomor Induk Berusaha (NIB) wajib berupa 13 digit angka.");
      return;
    }

    if (!address.trim()) {
      toast.error("Alamat domisili legal perusahaan wajib diisi.");
      return;
    }

    if (!phone.trim()) {
      toast.error("Nomor telepon operasional wajib diisi.");
      return;
    }

    if (!email.trim()) {
      toast.error("Email resmi perusahaan wajib diisi.");
      return;
    }

    if (!documentUrl) {
      toast.error(
        "Wajib mengunggah dokumen NIB atau bukti legalitas usaha (PDF/JPG)."
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await submitCompanyVerificationAction({
          legalName: legalName.trim(),
          nib: cleanNib,
          taxId: taxId.trim() || undefined,
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          website: website.trim() || undefined,
          documentUrl,
        });

        if (res.success) {
          toast.success("Pengajuan verifikasi NIB berhasil dikirim!");
          setIsEditingAfterReject(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal mengirimkan pengajuan verifikasi.");
        }
      } catch {
        toast.error("Terjadi kegagalan sistem saat memproses pengajuan.");
      }
    });
  };

  // Status: APPROVED
  if (status === VerificationStatus.APPROVED) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="size-7" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                Perusahaan Terverifikasi Resmi NIB NTB
              </CardTitle>
              <CardDescription className="text-xs text-emerald-600/90 dark:text-emerald-400/80">
                Legalitas badan usaha Anda telah disetujui oleh tim kurator
                Superadmin KerjaNTB.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="bg-card grid grid-cols-1 gap-4 rounded-xl border border-emerald-500/20 p-4 text-xs sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Nama Legal Usaha:</span>
              <p className="font-semibold">{initialVerification?.legalName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">
                Nomor Induk Berusaha (NIB):
              </span>
              <p className="font-mono font-semibold">
                {initialVerification?.nib}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">NPWP Perusahaan:</span>
              <p className="font-mono font-semibold">
                {initialVerification?.taxId || "-"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Dokumen Legalitas:</span>
              <p>
                <a
                  href={initialVerification?.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
                >
                  <FileText className="size-3.5" />
                  <span>Lihat Berkas Izin Usaha</span>
                  <ExternalLink className="size-3" />
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>
              Hak istimewa aktif: Setiap lowongan baru yang Anda pasang akan
              langsung <strong>TAYANG (PUBLISHED)</strong> seketika tanpa
              antrean moderasi.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Status: PENDING
  if (status === VerificationStatus.PENDING) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Clock className="size-7" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-amber-700 dark:text-amber-400">
                Pengajuan Verifikasi Sedang Ditinjau
              </CardTitle>
              <CardDescription className="text-xs text-amber-600/90 dark:text-amber-400/80">
                Dokumen NIB dan legalitas usaha Anda telah diterima dan dalam
                antrean peninjauan kurasi.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="bg-card grid grid-cols-1 gap-4 rounded-xl border border-amber-500/20 p-4 text-xs sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Nama Legal Usaha:</span>
              <p className="font-semibold">{initialVerification?.legalName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">
                Nomor Induk Berusaha (NIB):
              </span>
              <p className="font-mono font-semibold">
                {initialVerification?.nib}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">NPWP Perusahaan:</span>
              <p className="font-mono font-semibold">
                {initialVerification?.taxId || "-"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Berkas Legalitas:</span>
              <p>
                <a
                  href={initialVerification?.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
                >
                  <FileText className="size-3.5" />
                  <span>Berkas Dokumen Terlampir</span>
                  <ExternalLink className="size-3" />
                </a>
              </p>
            </div>
          </div>

          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200">
            <Clock className="size-4 text-amber-600" />
            <AlertTitle className="text-xs font-bold">
              Estimasi Peninjauan: 1 x 24 Jam Kerja
            </AlertTitle>
            <AlertDescription className="text-xs">
              Selama masa peninjauan, Anda tetap dapat memasang lowongan kerja.
              Lowongan yang dipasang akan berstatus{" "}
              <strong>PENDING_REVIEW</strong> dan otomatis terbit seketika
              verifikasi ini disetujui.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Status: REJECTED (with option to edit)
  const isRejected = status === VerificationStatus.REJECTED;

  return (
    <div className="space-y-6">
      {isRejected && !isEditingAfterReject && (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle className="text-xs font-bold">
            Pengajuan Verifikasi NIB Belum Disetujui
          </AlertTitle>
          <AlertDescription className="mt-1 space-y-2 text-xs">
            <p>
              Alasan penolakan tim kurator:{" "}
              <strong>
                {initialVerification?.rejectionReason ||
                  "Dokumen legalitas tidak terbaca atau NIB tidak sesuai domisili."}
              </strong>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditingAfterReject(true)}
              className="mt-2 text-xs"
            >
              Perbaiki &amp; Ajukan Ulang Verifikasi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {(!isRejected || isEditingAfterReject) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-amber-500" />
                <CardTitle className="text-base font-bold sm:text-lg">
                  Formulir Verifikasi NIB (Nomor Induk Berusaha)
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Verifikasi resmi untuk menjamin keaslian lowongan kerja di NTB,
                memberikan lencana Terverifikasi, dan mengaktifkan fitur
                publikasi instan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="legal-name" className="text-xs font-semibold">
                    Nama Legal Badan Usaha (PT / CV / Yayasan / UD / Koperasi){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="legal-name"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Contoh: PT Rinjani Bahari Sejahtera"
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nib-number" className="text-xs font-semibold">
                    Nomor Induk Berusaha (NIB 13 Digit){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nib-number"
                    value={nib}
                    maxLength={13}
                    onChange={(e) => setNib(e.target.value.replace(/\D/g, ""))}
                    placeholder="Contoh: 9120001234567"
                    required
                    className="font-mono text-xs"
                  />
                  <p className="text-muted-foreground text-[11px]">
                    13 digit angka resmi dari sistem OSS (Online Single
                    Submission).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-id" className="text-xs font-semibold">
                    NPWP Badan Usaha (Opsional)
                  </Label>
                  <Input
                    id="tax-id"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="Contoh: 01.234.567.8-901.000"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="verif-phone"
                    className="text-xs font-semibold"
                  >
                    Nomor Telepon Operasional{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="verif-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="verif-email"
                    className="text-xs font-semibold"
                  >
                    Email Resmi Perusahaan{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="verif-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="legal@perusahaan.co.id"
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="verif-website"
                    className="text-xs font-semibold"
                  >
                    Website Resmi (Opsional)
                  </Label>
                  <Input
                    id="verif-website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://perusahaan.co.id"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="verif-address"
                  className="text-xs font-semibold"
                >
                  Alamat Domisili Legal Usaha di NTB{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="verif-address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat kantor sesuai lampiran NIB / Izin Lokasi..."
                  required
                  className="text-xs"
                />
              </div>

              {/* Upload Berkas Dokumen NIB */}
              <div className="border-border rounded-xl border border-dashed p-4">
                <Label className="text-xs font-semibold">
                  Unggah Berkas NIB / Izin Usaha OSS (PDF / JPG / PNG){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <p className="text-muted-foreground mt-0.5 mb-3 text-[11px]">
                  Unggah salinan dokumen NIB resmi atau Surat Izin Usaha
                  Perdagangan (SIUP) berukuran maksimal 10 MB. Dokumen disimpan
                  aman di penyimpanan terenkripsi SumoPod Object Storage.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    className="relative overflow-hidden text-xs"
                  >
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      onChange={handleDocumentUpload}
                      disabled={isUploading}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        <span>Mengunggah ({progress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="mr-1.5 size-3.5" />
                        <span>Pilih Berkas Dokumen</span>
                      </>
                    )}
                  </Button>

                  {documentUrl && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                      <FileText className="size-4 shrink-0" />
                      <span className="font-medium">
                        {documentFileName ||
                          "Berkas dokumen berhasil terlampir"}
                      </span>
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary ml-1 inline-flex items-center gap-0.5 hover:underline"
                      >
                        (Pratinjau)
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            {isRejected && isEditingAfterReject && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditingAfterReject(false)}
                className="text-xs"
              >
                Batal
              </Button>
            )}
            <Button
              type="submit"
              disabled={isPending || isUploading || !documentUrl}
              className="rounded-xl px-6 font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  <span>Mengirim Pengajuan...</span>
                </>
              ) : (
                <span>Kirim Pengajuan Verifikasi NIB</span>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
