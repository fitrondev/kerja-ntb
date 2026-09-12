"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Send,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { updateEmployerApplicationStatusAction } from "@/actions/application";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationStatus } from "@/generated/prisma/enums";

export interface EmployerApplicantItem {
  id: string;
  status: ApplicationStatus;
  coverLetter?: string | null;
  customResumeUrl?: string | null;
  interviewDate?: Date | string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  createdAt: Date | string;
  job: {
    id: string;
    title: string;
    slug: string;
  };
  resume?: {
    id: string;
    title: string;
    fileUrl?: string | null;
  } | null;
  user: {
    id: string;
    email: string;
    profile?: {
      fullName?: string | null;
      avatarUrl?: string | null;
      phone?: string | null;
      address?: string | null;
      bio?: string | null;
      location?: {
        name: string;
      } | null;
    } | null;
  };
}

export interface EmployerApplicantsTableProps {
  initialApplications: EmployerApplicantItem[];
  jobsList: Array<{ id: string; title: string }>;
  defaultJobId?: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; badgeClass: string }
> = {
  [ApplicationStatus.APPLIED]: {
    label: "Terkirim",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  [ApplicationStatus.REVIEWING]: {
    label: "Ditinjau",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  [ApplicationStatus.SHORTLISTED]: {
    label: "Lolos Berkas",
    badgeClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
  [ApplicationStatus.INTERVIEW]: {
    label: "Wawancara",
    badgeClass: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  [ApplicationStatus.ACCEPTED]: {
    label: "Diterima",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  [ApplicationStatus.REJECTED]: {
    label: "Ditolak",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
  },
  [ApplicationStatus.WITHDRAWN]: {
    label: "Dibatalkan Pelamar",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
};

export function EmployerApplicantsTable({
  initialApplications,
  jobsList,
  defaultJobId,
}: EmployerApplicantsTableProps) {
  const router = useRouter();

  const [applications, setApplications] =
    React.useState<EmployerApplicantItem[]>(initialApplications);
  const [selectedJobId, setSelectedJobId] = React.useState<string>(
    defaultJobId || "ALL"
  );
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // State Dialog Evaluasi
  const [activeApp, setActiveApp] =
    React.useState<EmployerApplicantItem | null>(null);
  const [evalStatus, setEvalStatus] = React.useState<ApplicationStatus>(
    ApplicationStatus.APPLIED
  );
  const [evalNotes, setEvalNotes] = React.useState<string>("");
  const [evalRejectionReason, setEvalRejectionReason] =
    React.useState<string>("");
  const [evalInterviewDate, setEvalInterviewDate] = React.useState<string>("");
  const [isSavingEval, setIsSavingEval] = React.useState(false);

  React.useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  const handleOpenEvaluation = (app: EmployerApplicantItem) => {
    setActiveApp(app);
    setEvalStatus(app.status);
    setEvalNotes(app.notes || "");
    setEvalRejectionReason(app.rejectionReason || "");
    setEvalInterviewDate(
      app.interviewDate
        ? new Date(app.interviewDate).toISOString().slice(0, 16)
        : ""
    );
  };

  const handleSaveEvaluation = async () => {
    if (!activeApp) return;

    setIsSavingEval(true);
    try {
      const res = await updateEmployerApplicationStatusAction({
        applicationId: activeApp.id,
        status: evalStatus,
        notes: evalNotes.trim() || undefined,
        rejectionReason: evalRejectionReason.trim() || undefined,
        interviewDate: evalInterviewDate || undefined,
      });

      if (res.success) {
        toast.success("Status pelamar berhasil diperbarui!");
        setApplications((prev) =>
          prev.map((a) =>
            a.id === activeApp.id
              ? {
                  ...a,
                  status: evalStatus,
                  notes: evalNotes.trim() || null,
                  rejectionReason: evalRejectionReason.trim() || null,
                  interviewDate: evalInterviewDate || null,
                }
              : a
          )
        );
        setActiveApp(null);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal memperbarui status.");
      }
    } catch {
      toast.error("Terjadi kegagalan sistem saat menyimpan.");
    } finally {
      setIsSavingEval(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    // Filter Job
    if (selectedJobId !== "ALL" && app.job.id !== selectedJobId) {
      return false;
    }

    // Filter Status
    if (statusFilter !== "ALL" && app.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = app.user.profile?.fullName?.toLowerCase() || "";
      const email = app.user.email.toLowerCase();
      const jobTitle = app.job.title.toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !jobTitle.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const getResumeUrl = (app: EmployerApplicantItem): string | null => {
    return app.customResumeUrl || app.resume?.fileUrl || null;
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Select Lowongan */}
          <div className="w-full sm:w-56">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Pilih lowongan..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">
                  Semua Lowongan ({jobsList.length})
                </SelectItem>
                {jobsList.map((job) => (
                  <SelectItem key={job.id} value={job.id} className="text-xs">
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email pelamar..."
              className="pl-8 text-xs"
            />
          </div>
        </div>

        {/* Tab Status */}
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 text-xs sm:flex">
            <TabsTrigger value="ALL" className="text-xs">
              Semua
            </TabsTrigger>
            <TabsTrigger value={ApplicationStatus.APPLIED} className="text-xs">
              Terkirim
            </TabsTrigger>
            <TabsTrigger
              value={ApplicationStatus.SHORTLISTED}
              className="text-xs"
            >
              Lolos
            </TabsTrigger>
            <TabsTrigger
              value={ApplicationStatus.INTERVIEW}
              className="text-xs"
            >
              Wawancara
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tabel / Kartu Pelamar */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <FileCheck2 className="text-primary size-4.5" />
            <span>Berkas Pelamar Masuk ({filteredApplications.length})</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Tinjau data diri, dokumen CV, surat pengantar, dan kelola proses
            seleksi kandidat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredApplications.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-xs">
              <User className="text-muted-foreground/50 mx-auto mb-2 size-8" />
              <p className="text-foreground font-semibold">
                Tidak ada data pelamar yang sesuai filter.
              </p>
              <p className="mt-1 text-[11px]">
                Coba sesuaikan filter status atau pilihan lowongan di atas.
              </p>
            </div>
          ) : (
            filteredApplications.map((app) => {
              const resumeUrl = getResumeUrl(app);
              const config =
                STATUS_CONFIG[app.status] ||
                STATUS_CONFIG[ApplicationStatus.APPLIED];
              const phoneClean = app.user.profile?.phone?.replace(/\D/g, "");

              return (
                <div
                  key={app.id}
                  className="border-border/70 hover:bg-muted/30 flex flex-col justify-between gap-4 rounded-xl border p-4 transition-all sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    <Avatar className="border-border size-11 shrink-0 rounded-xl border">
                      <AvatarImage
                        src={app.user.profile?.avatarUrl || undefined}
                        alt={app.user.profile?.fullName || app.user.email}
                      />
                      <AvatarFallback className="rounded-xl text-xs font-bold">
                        {(app.user.profile?.fullName || app.user.email)
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground text-sm font-bold">
                          {app.user.profile?.fullName || app.user.email}
                        </span>
                        <Badge
                          variant="outline"
                          className={`px-2 py-0.5 text-[10px] ${config.badgeClass}`}
                        >
                          {config.label}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground text-xs">
                        Melamar posisi:{" "}
                        <Link
                          href={`/loker/${app.job.slug}`}
                          className="text-primary font-semibold hover:underline"
                        >
                          {app.job.title}
                        </Link>
                      </p>

                      <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                        {app.user.profile?.location?.name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="text-primary size-3" />
                            <span>{app.user.profile.location.name}</span>
                          </span>
                        )}
                        {app.user.profile?.phone && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Phone className="size-3" />
                            <span>{app.user.profile.phone}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Mail className="size-3" />
                          <span>{app.user.email}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>
                            {new Date(app.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Aksi */}
                  <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                    {resumeUrl && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs"
                      >
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="size-3.5" />
                          <span>CV</span>
                          <ExternalLink className="size-3" />
                        </a>
                      </Button>
                    )}

                    {phoneClean && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        <a
                          href={`https://wa.me/${phoneClean.startsWith("0") ? "62" + phoneClean.slice(1) : phoneClean}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageSquare className="size-3.5" />
                          <span>WA</span>
                        </a>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => handleOpenEvaluation(app)}
                      className="h-8 text-xs font-semibold"
                    >
                      <span>Evaluasi &amp; Status</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog Evaluasi Pelamar */}
      <Dialog
        open={Boolean(activeApp)}
        onOpenChange={(open) => !open && setActiveApp(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold sm:text-lg">
              Evaluasi Berkas Pelamar
            </DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui status seleksi kandidat dan simpan catatan internal HR.
            </DialogDescription>
          </DialogHeader>

          {activeApp && (
            <div className="space-y-4 text-xs">
              {/* Profil Pelamar Card */}
              <div className="bg-muted/30 border-border space-y-2 rounded-xl border p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-sm font-bold">
                      {activeApp.user.profile?.fullName || activeApp.user.email}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Melamar: <strong>{activeApp.job.title}</strong>
                    </p>
                  </div>
                  {getResumeUrl(activeApp) && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <a
                        href={getResumeUrl(activeApp)!}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-1.5 size-3.5" />
                        <span>Unduh CV Pelamar</span>
                      </a>
                    </Button>
                  )}
                </div>

                {activeApp.user.profile?.bio && (
                  <p className="text-muted-foreground border-border/60 border-t pt-1 text-[11px] leading-relaxed">
                    {activeApp.user.profile.bio}
                  </p>
                )}
              </div>

              {/* Surat Lamaran / Cover Letter */}
              {activeApp.coverLetter && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Surat Lamaran / Pengantar:
                  </Label>
                  <div className="bg-card border-border text-muted-foreground max-h-36 overflow-y-auto rounded-xl border p-3 text-xs leading-relaxed whitespace-pre-line">
                    {activeApp.coverLetter}
                  </div>
                </div>
              )}

              {/* Form Status Seleksi */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="status-select"
                    className="text-xs font-semibold"
                  >
                    Status Seleksi Kandidat
                  </Label>
                  <Select
                    value={evalStatus}
                    onValueChange={(v) => setEvalStatus(v as ApplicationStatus)}
                  >
                    <SelectTrigger id="status-select" className="text-xs">
                      <SelectValue placeholder="Pilih status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value={ApplicationStatus.APPLIED}
                        className="text-xs"
                      >
                        Terkirim (Applied)
                      </SelectItem>
                      <SelectItem
                        value={ApplicationStatus.REVIEWING}
                        className="text-xs"
                      >
                        Sedang Ditinjau (Reviewing)
                      </SelectItem>
                      <SelectItem
                        value={ApplicationStatus.SHORTLISTED}
                        className="text-xs"
                      >
                        Lolos Berkas (Shortlisted)
                      </SelectItem>
                      <SelectItem
                        value={ApplicationStatus.INTERVIEW}
                        className="text-xs"
                      >
                        Tahap Wawancara (Interview)
                      </SelectItem>
                      <SelectItem
                        value={ApplicationStatus.ACCEPTED}
                        className="text-xs"
                      >
                        Diterima Kerja (Accepted)
                      </SelectItem>
                      <SelectItem
                        value={ApplicationStatus.REJECTED}
                        className="text-xs"
                      >
                        Tidak Lolos (Rejected)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {evalStatus === ApplicationStatus.INTERVIEW && (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="interview-time"
                      className="text-xs font-semibold"
                    >
                      Jadwal Wawancara (Tanggal &amp; Waktu)
                    </Label>
                    <Input
                      id="interview-time"
                      type="datetime-local"
                      value={evalInterviewDate}
                      onChange={(e) => setEvalInterviewDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Jika Ditolak: Alasan Penolakan */}
              {evalStatus === ApplicationStatus.REJECTED && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="rejection-reason"
                    className="text-xs font-semibold"
                  >
                    Alasan Penolakan (Akan diberitahukan ramah ke pelamar)
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    rows={2}
                    value={evalRejectionReason}
                    onChange={(e) => setEvalRejectionReason(e.target.value)}
                    placeholder="Contoh: Kualifikasi pengalaman belum sesuai kebutuhan posisi saat ini..."
                    className="text-xs leading-relaxed"
                  />
                </div>
              )}

              {/* Catatan Internal HR */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="internal-notes"
                  className="text-xs font-semibold"
                >
                  Catatan Evaluasi Internal HR (Hanya terlihat oleh tim
                  perusahaan)
                </Label>
                <Textarea
                  id="internal-notes"
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Kandidat memiliki portofolio bagus, skor tes komunikasi tinggi..."
                  className="text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveApp(null)}
              disabled={isSavingEval}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveEvaluation}
              disabled={isSavingEval}
              className="rounded-xl px-5 text-xs font-semibold"
            >
              {isSavingEval ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Evaluasi</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
