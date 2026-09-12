"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Plus,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { createJobAction, updateJobAction } from "@/actions/jobs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  ApplicationMethod,
  EducationLevel,
  ExperienceLevel,
  JobStatus,
  JobType,
  WorkplaceType,
} from "@/generated/prisma/enums";

const APPLICATION_METHOD_LABELS: Record<ApplicationMethod, string> = {
  [ApplicationMethod.KERJANTB]: "Portal KerjaNTB (Direkomendasikan)",
  [ApplicationMethod.EMAIL]: "Kirim via Email HRD",
  [ApplicationMethod.EXTERNAL_URL]: "Website Karir Perusahaan",
};

export interface JobWizardProps {
  locations: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
    isVerified: boolean;
    verification?: {
      status: string;
    } | null;
  };
  mode?: "create" | "edit";
  initialJob?: {
    id: string;
    title: string;
    categoryId: string;
    locationId: string;
    type: JobType;
    workplace: WorkplaceType;
    isSalaryDisclosed: boolean;
    salaryMin?: number | null;
    salaryMax?: number | null;
    description: string;
    responsibilities: string;
    requirements: string;
    benefits?: string | null;
    education: EducationLevel;
    experience: ExperienceLevel;
    isFreshGraduate: boolean;
    applicationMethod: ApplicationMethod;
    applicationEmail?: string | null;
    externalUrl?: string | null;
    deadline?: string | null;
    skills?: Array<{ name: string }>;
  };
}

const STEPS = [
  { id: 1, title: "Info Dasar", desc: "Judul & Lokasi" },
  { id: 2, title: "Kompensasi", desc: "Gaji & UMP" },
  { id: 3, title: "Deskripsi", desc: "Tugas & Fasilitas" },
  { id: 4, title: "Kualifikasi", desc: "Syarat & Keahlian" },
  { id: 5, title: "Metode Lamaran", desc: "Pendaftaran & Deadline" },
  { id: 6, title: "Pratinjau", desc: "Review & Publikasi" },
];

const POPULAR_SKILLS = [
  "Komunikasi",
  "Microsoft Office",
  "Customer Service",
  "Bahasa Inggris",
  "Pemasaran Digital",
  "Penjualan / Sales",
  "Manajemen Waktu",
  "Akuntansi",
  "Desain Grafis",
  "Negosiasi",
  "Pariwisata & Hospitality",
  "Administrasi",
];

const JOB_TYPES: Array<{ value: JobType; label: string }> = [
  { value: JobType.FULL_TIME, label: "Penuh Waktu (Full Time)" },
  { value: JobType.PART_TIME, label: "Paruh Waktu (Part Time)" },
  { value: JobType.CONTRACT, label: "Kontrak (Contract)" },
  { value: JobType.INTERNSHIP, label: "Magang (Internship)" },
  { value: JobType.FREELANCE, label: "Lepas / Freelance" },
];

const WORKPLACE_TYPES: Array<{ value: WorkplaceType; label: string }> = [
  { value: WorkplaceType.ONSITE, label: "Kerja di Kantor (On-site)" },
  { value: WorkplaceType.HYBRID, label: "Kombinasi (Hybrid)" },
  { value: WorkplaceType.REMOTE, label: "Kerja Jarak Jauh (Remote)" },
];

const EDUCATION_LEVELS: Array<{ value: EducationLevel; label: string }> = [
  { value: EducationLevel.NONE, label: "Semua Jenjang / Tanpa Minimal" },
  { value: EducationLevel.SMA_SMK, label: "SMA / SMK Sederajat" },
  { value: EducationLevel.D1, label: "Diploma 1 (D1)" },
  { value: EducationLevel.D2, label: "Diploma 2 (D2)" },
  { value: EducationLevel.D3, label: "Diploma 3 (D3)" },
  { value: EducationLevel.D4_S1, label: "Sarjana / Diploma 4 (D4 / S1)" },
  { value: EducationLevel.S2, label: "Magister (S2)" },
  { value: EducationLevel.S3, label: "Doktor (S3)" },
];

const EXPERIENCE_LEVELS: Array<{ value: ExperienceLevel; label: string }> = [
  {
    value: ExperienceLevel.FRESH_GRADUATE,
    label: "Lulusan Baru (Fresh Graduate)",
  },
  { value: ExperienceLevel.LESS_THAN_1_YEAR, label: "Kurang dari 1 Tahun" },
  { value: ExperienceLevel.ONE_TO_THREE_YEARS, label: "1 - 3 Tahun" },
  { value: ExperienceLevel.THREE_TO_FIVE_YEARS, label: "3 - 5 Tahun" },
  { value: ExperienceLevel.FIVE_PLUS_YEARS, label: "Lebih dari 5 Tahun" },
];

function formatRupiah(num?: number | null): string {
  if (num == null || isNaN(num)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function JobWizard({
  locations,
  categories,
  company,
  mode = "create",
  initialJob,
}: JobWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [title, setTitle] = React.useState(initialJob?.title || "");
  const [categoryId, setCategoryId] = React.useState(
    initialJob?.categoryId || (categories[0]?.id ?? "")
  );
  const [locationId, setLocationId] = React.useState(
    initialJob?.locationId || (locations[0]?.id ?? "")
  );
  const [type, setType] = React.useState<JobType>(
    initialJob?.type || JobType.FULL_TIME
  );
  const [workplace, setWorkplace] = React.useState<WorkplaceType>(
    initialJob?.workplace || WorkplaceType.ONSITE
  );

  // Step 2: Kompensasi
  const [isSalaryDisclosed, setIsSalaryDisclosed] = React.useState<boolean>(
    initialJob?.isSalaryDisclosed ?? true
  );
  const [salaryMin, setSalaryMin] = React.useState<string>(
    initialJob?.salaryMin ? String(initialJob.salaryMin) : ""
  );
  const [salaryMax, setSalaryMax] = React.useState<string>(
    initialJob?.salaryMax ? String(initialJob.salaryMax) : ""
  );

  // Step 3: Deskripsi & Tanggung Jawab
  const [description, setDescription] = React.useState(
    initialJob?.description || ""
  );
  const [responsibilities, setResponsibilities] = React.useState(
    initialJob?.responsibilities || ""
  );
  const [benefits, setBenefits] = React.useState(initialJob?.benefits || "");

  // Step 4: Kualifikasi & Skill
  const [education, setEducation] = React.useState<EducationLevel>(
    initialJob?.education || EducationLevel.SMA_SMK
  );
  const [experience, setExperience] = React.useState<ExperienceLevel>(
    initialJob?.experience || ExperienceLevel.FRESH_GRADUATE
  );
  const [isFreshGraduate, setIsFreshGraduate] = React.useState<boolean>(
    initialJob?.isFreshGraduate ?? true
  );
  const [requirements, setRequirements] = React.useState(
    initialJob?.requirements || ""
  );
  const [skills, setSkills] = React.useState<string[]>(
    initialJob?.skills ? initialJob.skills.map((s) => s.name) : []
  );
  const [skillInput, setSkillInput] = React.useState("");

  // Step 5: Metode Lamaran & Deadline
  const [applicationMethod, setApplicationMethod] =
    React.useState<ApplicationMethod>(
      initialJob?.applicationMethod || ApplicationMethod.KERJANTB
    );
  const [applicationEmail, setApplicationEmail] = React.useState(
    initialJob?.applicationEmail || ""
  );
  const [externalUrl, setExternalUrl] = React.useState(
    initialJob?.externalUrl || ""
  );
  const [deadline, setDeadline] = React.useState<string>(
    initialJob?.deadline ? initialJob.deadline.slice(0, 10) : ""
  );

  const isCompanyVerified =
    company.isVerified || company.verification?.status === "APPROVED";

  // Skill management
  const handleAddSkill = (skillToAdd?: string) => {
    const text = (skillToAdd || skillInput).trim();
    if (!text) return;
    if (skills.some((s) => s.toLowerCase() === text.toLowerCase())) {
      toast.error("Keahlian tersebut sudah ditambahkan.");
      return;
    }
    if (skills.length >= 15) {
      toast.error("Maksimal 15 keahlian.");
      return;
    }
    setSkills([...skills, text]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!title.trim() || title.trim().length < 3) {
        toast.error("Judul lowongan minimal 3 karakter.");
        return false;
      }
      if (!categoryId) {
        toast.error("Pilih kategori pekerjaan.");
        return false;
      }
      if (!locationId) {
        toast.error("Pilih lokasi penempatan di NTB.");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (isSalaryDisclosed) {
        const min = salaryMin ? Number(salaryMin) : null;
        const max = salaryMax ? Number(salaryMax) : null;
        if (min != null && max != null && min > max) {
          toast.error(
            "Gaji minimum tidak boleh lebih besar dari gaji maksimum."
          );
          return false;
        }
      }
      return true;
    }

    if (step === 3) {
      if (!description.trim() || description.trim().length < 20) {
        toast.error("Deskripsi lowongan minimal 20 karakter.");
        return false;
      }
      if (!responsibilities.trim() || responsibilities.trim().length < 20) {
        toast.error("Tanggung jawab utama minimal 20 karakter.");
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!requirements.trim() || requirements.trim().length < 20) {
        toast.error("Kualifikasi pekerjaan minimal 20 karakter.");
        return false;
      }
      return true;
    }

    if (step === 5) {
      if (applicationMethod === ApplicationMethod.EMAIL) {
        if (!applicationEmail.trim()) {
          toast.error("Email penerima lamaran wajib diisi.");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicationEmail.trim())) {
          toast.error("Format email lamaran tidak valid.");
          return false;
        }
      }
      if (applicationMethod === ApplicationMethod.EXTERNAL_URL) {
        if (!externalUrl.trim()) {
          toast.error("Tautan URL pendaftaran eksternal wajib diisi.");
          return false;
        }
        try {
          new URL(externalUrl.trim());
        } catch {
          toast.error(
            "Format URL tautan pendaftaran tidak valid (gunakan awalan https://)."
          );
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        categoryId,
        locationId,
        type,
        workplace,
        isSalaryDisclosed,
        salaryMin: isSalaryDisclosed && salaryMin ? Number(salaryMin) : null,
        salaryMax: isSalaryDisclosed && salaryMax ? Number(salaryMax) : null,
        description: description.trim(),
        responsibilities: responsibilities.trim(),
        requirements: requirements.trim(),
        benefits: benefits.trim() || undefined,
        education,
        experience,
        isFreshGraduate,
        applicationMethod,
        applicationEmail: applicationEmail.trim() || undefined,
        externalUrl: externalUrl.trim() || undefined,
        deadline: deadline || undefined,
        skills,
      };

      if (mode === "edit" && initialJob) {
        const res = await updateJobAction(initialJob.id, payload);
        if (res.success) {
          toast.success("Lowongan kerja berhasil diperbarui!");
          router.push("/dashboard/employer/loker");
        } else {
          toast.error(res.error || "Gagal memperbarui lowongan.");
        }
      } else {
        const res = await createJobAction(payload);
        if (res.success) {
          if (res.data?.status === JobStatus.PUBLISHED) {
            toast.success(
              "Selamat! Lowongan Anda langsung TAYANG (PUBLISHED) karena perusahaan terverifikasi NIB NTB."
            );
          } else {
            toast.info(
              "Lowongan berhasil dibuat dan masuk antrean TINJAUAN (PENDING_REVIEW) oleh moderator."
            );
          }
          router.push("/dashboard/employer/loker");
        } else {
          toast.error(res.error || "Gagal membuat lowongan kerja.");
        }
      }
    } catch {
      toast.error("Terjadi kendala sistem saat memproses data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryName =
    categories.find((c) => c.id === categoryId)?.name || "Kategori";
  const selectedLocationName =
    locations.find((l) => l.id === locationId)?.name || "Wilayah NTB";
  const selectedJobTypeLabel =
    JOB_TYPES.find((t) => t.value === type)?.label || type;
  const selectedWorkplaceLabel =
    WORKPLACE_TYPES.find((w) => w.value === workplace)?.label || workplace;
  const selectedEducationLabel =
    EDUCATION_LEVELS.find((e) => e.value === education)?.label || education;
  const selectedExperienceLabel =
    EXPERIENCE_LEVELS.find((e) => e.value === experience)?.label || experience;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header Wizard */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            {mode === "edit"
              ? "Edit Lowongan Kerja"
              : "Pasang Lowongan Kerja Baru"}
          </h1>
          {isCompanyVerified ? (
            <Badge className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600">
              <CheckCircle2 className="size-3" />
              <span>Verifikasi NIB Aktif</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-xs text-amber-600"
            >
              Antrean Moderasi
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Lengkapi formulir 6 langkah untuk menjangkau pencari kerja terampil di
          10 Kabupaten/Kota se-NTB.
        </p>
      </div>

      {/* Navigasi Progres Langkah (Steps Bar) */}
      <div className="bg-card border-border rounded-2xl border p-3 sm:p-4">
        <div className="grid grid-cols-6 gap-1 sm:gap-2">
          {STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                type="button"
                key={step.id}
                onClick={() => {
                  // Hanya bisa lompat ke langkah sebelumnya atau langkah yang valid
                  if (step.id < currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={step.id > currentStep}
                className={`group flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-all ${
                  isCurrent
                    ? "bg-primary/10 text-primary font-bold shadow-xs"
                    : isDone
                      ? "text-foreground hover:bg-muted/50 cursor-pointer"
                      : "text-muted-foreground/60 cursor-not-allowed opacity-60"
                }`}
              >
                <div
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground ring-primary/30 ring-2"
                      : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="size-3.5" /> : step.id}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs leading-tight font-semibold">
                    {step.title}
                  </p>
                  <p className="text-muted-foreground text-[10px] leading-tight">
                    {step.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Konten Langkah Formulir */}
      <Card className="border-border bg-card">
        {/* STEP 1: INFORMASI DASAR */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="text-primary size-5" />
                <CardTitle className="text-base font-bold sm:text-lg">
                  Langkah 1: Informasi Dasar Lowongan
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Tentukan posisi jabatan, klasifikasi industri, dan wilayah
                penempatan di NTB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-title" className="text-xs font-semibold">
                  Judul Posisi Pekerjaan{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="job-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Staff Akuntansi & Keuangan, Resepsionis Hotel, Web Developer"
                  required
                  className="text-xs"
                />
                <p className="text-muted-foreground text-[11px]">
                  Gunakan judul jabatan yang jelas dan mudah dicari oleh
                  pelamar.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="job-category"
                    className="text-xs font-semibold"
                  >
                    Kategori Bidang Pekerjaan{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="job-category" className="text-xs">
                      <SelectValue placeholder="Pilih kategori..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={cat.id}
                          className="text-xs"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="job-location"
                    className="text-xs font-semibold"
                  >
                    Wilayah Penempatan (10 Kab/Kota NTB){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger id="job-location" className="text-xs">
                      <SelectValue placeholder="Pilih wilayah NTB..." />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem
                          key={loc.id}
                          value={loc.id}
                          className="text-xs"
                        >
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-type" className="text-xs font-semibold">
                    Tipe Ikatan Kerja{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={type}
                    onValueChange={(val) => setType(val as JobType)}
                  >
                    <SelectTrigger id="job-type" className="text-xs">
                      <SelectValue placeholder="Pilih tipe..." />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map((t) => (
                        <SelectItem
                          key={t.value}
                          value={t.value}
                          className="text-xs"
                        >
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="job-workplace"
                    className="text-xs font-semibold"
                  >
                    Model Tempat Bekerja{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={workplace}
                    onValueChange={(val) => setWorkplace(val as WorkplaceType)}
                  >
                    <SelectTrigger id="job-workplace" className="text-xs">
                      <SelectValue placeholder="Pilih model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKPLACE_TYPES.map((w) => (
                        <SelectItem
                          key={w.value}
                          value={w.value}
                          className="text-xs"
                        >
                          {w.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* STEP 2: KOMPENSASI GAJI */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Coins className="text-primary size-5" />
                <CardTitle className="text-base font-bold sm:text-lg">
                  Langkah 2: Perkiraan Gaji &amp; Kompensasi
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Transparansi kisaran gaji sangat meningkatkan minat pelamar
                berkualitas di NTB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-border bg-muted/30 flex items-center justify-between rounded-xl border p-4">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="salary-disclosed"
                    className="cursor-pointer text-xs font-semibold"
                  >
                    Tampilkan Rentang Gaji ke Publik
                  </Label>
                  <p className="text-muted-foreground text-[11px]">
                    Jika dinonaktifkan, info gaji akan ditampilkan sebagai
                    &quot;Gaji Dinegosiasikan&quot;.
                  </p>
                </div>
                <Switch
                  id="salary-disclosed"
                  checked={isSalaryDisclosed}
                  onCheckedChange={setIsSalaryDisclosed}
                />
              </div>

              {isSalaryDisclosed ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="salary-min"
                        className="text-xs font-semibold"
                      >
                        Gaji Minimum (Rp / Bulan)
                      </Label>
                      <Input
                        id="salary-min"
                        type="number"
                        min="0"
                        step="50000"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        placeholder="Contoh: 2600000"
                        className="font-mono text-xs"
                      />
                      {salaryMin && (
                        <p className="text-primary font-mono text-[11px]">
                          {formatRupiah(Number(salaryMin))}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="salary-max"
                        className="text-xs font-semibold"
                      >
                        Gaji Maksimum (Rp / Bulan)
                      </Label>
                      <Input
                        id="salary-max"
                        type="number"
                        min="0"
                        step="50000"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        placeholder="Contoh: 4500000"
                        className="font-mono text-xs"
                      />
                      {salaryMax && (
                        <p className="text-primary font-mono text-[11px]">
                          {formatRupiah(Number(salaryMax))}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Benchmark UMP NTB */}
                  <div className="border-primary/20 bg-primary/5 rounded-xl border p-4 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="text-primary mt-0.5 size-4 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-foreground font-semibold">
                          Standar Upah Minimum Wilayah NTB 2026:
                        </p>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          Upah Minimum Provinsi (UMP) NTB 2026 adalah sekitar{" "}
                          <strong className="text-foreground">
                            Rp 2.444.067
                          </strong>
                          . Kota Mataram &amp; Sumbawa Barat memiliki Upah
                          Minimum Kabupaten/Kota (UMK) yang sedikit lebih
                          tinggi. Memberikan upah di atas standar minimum
                          menarik talenta terbaik dengan loyalitas tinggi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-border bg-muted/40 rounded-xl border p-6 text-center text-xs">
                  <Lock className="text-muted-foreground mx-auto mb-2 size-6" />
                  <p className="font-semibold">Kisaran Gaji Dirahasiakan</p>
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    Pelamar akan melihat keterangan bahwa besaran gaji akan
                    didiskusikan selama tahap wawancara kerja.
                  </p>
                </div>
              )}
            </CardContent>
          </>
        )}

        {/* STEP 3: DESKRIPSI & TANGGUNG JAWAB */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="text-primary size-5" />
                <CardTitle className="text-base font-bold sm:text-lg">
                  Langkah 3: Deskripsi &amp; Tanggung Jawab
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Jelaskan lingkup pekerjaan, target operasional, serta benefit
                yang didapatkan kandidat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-desc" className="text-xs font-semibold">
                  Deskripsi Pekerjaan{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="job-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan gambaran umum tentang peran ini, divisi penempatan, dan tujuan pekerjaan..."
                  required
                  className="text-xs leading-relaxed"
                />
                <p className="text-muted-foreground text-[11px]">
                  Minimal 20 karakter. Berikan konteks yang menarik dan jelas.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="job-responsibilities"
                  className="text-xs font-semibold"
                >
                  Tanggung Jawab Utama{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="job-responsibilities"
                  rows={4}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="Tuliskan daftar tugas utama, misalnya:&#10;• Mengelola pencatatan pembukuan harian&#10;• Menyusun laporan keuangan bulanan&#10;• Berkoordinasi dengan tim audit dan operasional..."
                  required
                  className="text-xs leading-relaxed"
                />
                <p className="text-muted-foreground text-[11px]">
                  Gunakan tanda poin bullet (•) untuk memudahkan keterbacaan.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-benefits" className="text-xs font-semibold">
                  Tunjangan &amp; Fasilitas (Benefit)
                </Label>
                <Textarea
                  id="job-benefits"
                  rows={3}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Contoh: BPJS Ketenagakerjaan & Kesehatan, Tunjangan Makan & Transportasi, Bonus Tahunan, Pelatihan Sertifikasi..."
                  className="text-xs leading-relaxed"
                />
              </div>
            </CardContent>
          </>
        )}

        {/* STEP 4: KUALIFIKASI & KETERAMPILAN */}
        {currentStep === 4 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="text-primary size-5" />
                <CardTitle className="text-base font-bold sm:text-lg">
                  Langkah 4: Kualifikasi &amp; Keahlian
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Tentukan standar pendidikan, pengalaman kerja, serta tag
                keahlian yang dibutuhkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="job-edu" className="text-xs font-semibold">
                    Pendidikan Minimal{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={education}
                    onValueChange={(val) => setEducation(val as EducationLevel)}
                  >
                    <SelectTrigger id="job-edu" className="text-xs">
                      <SelectValue placeholder="Pilih pendidikan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => (
                        <SelectItem
                          key={e.value}
                          value={e.value}
                          className="text-xs"
                        >
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-exp" className="text-xs font-semibold">
                    Pengalaman Kerja Minimal{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={experience}
                    onValueChange={(val) =>
                      setExperience(val as ExperienceLevel)
                    }
                  >
                    <SelectTrigger id="job-exp" className="text-xs">
                      <SelectValue placeholder="Pilih pengalaman..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((exp) => (
                        <SelectItem
                          key={exp.value}
                          value={exp.value}
                          className="text-xs"
                        >
                          {exp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-border flex items-center space-x-2 rounded-xl border p-3">
                <Checkbox
                  id="fresh-grad"
                  checked={isFreshGraduate}
                  onCheckedChange={(checked) =>
                    setIsFreshGraduate(Boolean(checked))
                  }
                />
                <Label
                  htmlFor="fresh-grad"
                  className="cursor-pointer text-xs font-medium"
                >
                  Terbuka untuk Lulusan Baru (Fresh Graduate)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-reqs" className="text-xs font-semibold">
                  Kualifikasi &amp; Persyaratan Lengkap{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="job-reqs"
                  rows={4}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Tuliskan syarat usia, domisili, sikap kerja, misalnya:&#10;• Pria/Wanita, usia maksimal 30 tahun&#10;• Berdomisili di Kota Mataram atau Lombok Barat&#10;• Memiliki ketelitian tinggi dan integritas..."
                  required
                  className="text-xs leading-relaxed"
                />
              </div>

              {/* Tag Keahlian / Skills */}
              <div className="border-border space-y-3 border-t pt-4">
                <Label className="text-xs font-semibold">
                  Tag Keahlian / Skills yang Dibutuhkan
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Ketik keahlian lalu tekan Enter atau Tambah (misal: Excel, Komunikasi)"
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSkill()}
                    className="shrink-0 text-xs"
                  >
                    <Plus className="mr-1 size-3.5" />
                    Tambah
                  </Button>
                </div>

                {/* Selected skills */}
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="gap-1 px-2.5 py-1 text-xs"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="text-muted-foreground hover:text-destructive ml-1"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {/* Pilihan Cepat */}
                <div className="space-y-1.5 pt-2">
                  <p className="text-muted-foreground text-[11px]">
                    Rekomendasi keahlian populer:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.filter((ps) => !skills.includes(ps)).map(
                      (ps) => (
                        <button
                          type="button"
                          key={ps}
                          onClick={() => handleAddSkill(ps)}
                          className="border-border bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] transition-colors"
                        >
                          <Plus className="size-2.5" />
                          <span>{ps}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* STEP 5: METODE LAMARAN & DEADLINE */}
        {currentStep === 5 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Send className="text-primary size-5" />
                <CardTitle className="text-base font-bold sm:text-lg">
                  Langkah 5: Metode Pengiriman Berkas &amp; Batas Waktu
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Tentukan bagaimana pelamar dapat mengirimkan CV dan tenggat
                waktu penerimaan berkas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-semibold">
                  Pilih Kanal Penerimaan Berkas Lamaran{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Pilihan 1: KerjaNTB (Direkomendasikan) */}
                  <div
                    onClick={() =>
                      setApplicationMethod(ApplicationMethod.KERJANTB)
                    }
                    className={`border-border flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                      applicationMethod === ApplicationMethod.KERJANTB
                        ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-xs font-bold">
                          Portal KerjaNTB
                        </span>
                        <Badge className="bg-primary/15 text-primary border-0 text-[10px]">
                          Direkomendasikan
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed">
                        Pelamar melamar langsung via form KerjaNTB. Berkas CV
                        &amp; profil masuk ke Dashboard ATS perusahaan Anda.
                      </p>
                    </div>
                  </div>

                  {/* Pilihan 2: Email */}
                  <div
                    onClick={() =>
                      setApplicationMethod(ApplicationMethod.EMAIL)
                    }
                    className={`border-border flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                      applicationMethod === ApplicationMethod.EMAIL
                        ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-xs font-bold">
                          Kirim via Email
                        </span>
                        <Mail className="text-muted-foreground size-4" />
                      </div>
                      <p className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed">
                        Kandidat akan diarahkan untuk mengirim surat lamaran dan
                        CV langsung ke alamat email HRD Anda.
                      </p>
                    </div>
                  </div>

                  {/* Pilihan 3: External URL */}
                  <div
                    onClick={() =>
                      setApplicationMethod(ApplicationMethod.EXTERNAL_URL)
                    }
                    className={`border-border flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                      applicationMethod === ApplicationMethod.EXTERNAL_URL
                        ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-xs font-bold">
                          Website Karir Perusahaan
                        </span>
                        <ExternalLink className="text-muted-foreground size-4" />
                      </div>
                      <p className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed">
                        Kandidat akan diarahkan ke Google Form atau portal karir
                        internal perusahaan Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input khusus Email */}
              {applicationMethod === ApplicationMethod.EMAIL && (
                <div className="border-border bg-muted/20 space-y-2 rounded-xl border p-4">
                  <Label htmlFor="app-email" className="text-xs font-semibold">
                    Alamat Email Penerima Lamaran{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                    <Input
                      id="app-email"
                      type="email"
                      value={applicationEmail}
                      onChange={(e) => setApplicationEmail(e.target.value)}
                      placeholder="rekrutmen@perusahaan.co.id"
                      required
                      className="pl-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Input khusus External URL */}
              {applicationMethod === ApplicationMethod.EXTERNAL_URL && (
                <div className="border-border bg-muted/20 space-y-2 rounded-xl border p-4">
                  <Label htmlFor="app-url" className="text-xs font-semibold">
                    URL Tautan Formulir / Portal Karir{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <ExternalLink className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                    <Input
                      id="app-url"
                      type="url"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://karir.perusahaan.com/apply/posisi"
                      required
                      className="pl-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Tenggat Waktu (Deadline) */}
              <div className="border-border space-y-2 border-t pt-4">
                <Label htmlFor="app-deadline" className="text-xs font-semibold">
                  Batas Akhir Penerimaan Berkas (Deadline) - Opsional
                </Label>
                <div className="relative max-w-sm">
                  <Calendar className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                  <Input
                    id="app-deadline"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="pl-8 text-xs"
                  />
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Kosongkan jika lowongan dibuka hingga kuota pelamar terpenuhi.
                </p>
              </div>
            </CardContent>
          </>
        )}

        {/* STEP 6: PRATINJAU & PUBLIKASI */}
        {currentStep === 6 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="text-primary size-5" />
                <CardTitle className="text-base font-bold sm:text-lg">
                  Langkah 6: Pratinjau &amp; Konfirmasi Publikasi
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Periksa kembali ringkasan lowongan sebelum resmi disimpan ke
                sistem KerjaNTB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notifikasi Logika Moderasi */}
              {isCompanyVerified ? (
                <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <AlertTitle className="text-xs font-bold">
                    Perusahaan Terverifikasi Resmi NIB NTB
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    Lowongan ini akan{" "}
                    <strong>LANGSUNG TAYANG (PUBLISHED)</strong> di direktori
                    pencarian KerjaNTB seketika setelah Anda menekan tombol
                    terbitkan.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200">
                  <Clock className="size-4 text-amber-600" />
                  <AlertTitle className="text-xs font-bold">
                    Menunggu Peninjauan Kurator (PENDING_REVIEW)
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    Perusahaan Anda belum menyelesaikan verifikasi NIB. Lowongan
                    akan ditinjau oleh tim kurator Superadmin KerjaNTB terlebih
                    dahulu (maksimal 1x24 jam) demi mencegah tindak penipuan
                    loker.
                    <div className="mt-2">
                      <Button
                        asChild
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs font-bold text-amber-900 underline dark:text-amber-100"
                      >
                        <Link href="/dashboard/verification" target="_blank">
                          Ajukan Verifikasi NIB Sekarang untuk Akses Posting
                          Instan &rarr;
                        </Link>
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Kartu Pratinjau Live */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Pratinjau Kartu Lowongan Publik
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Live Mockup
                  </Badge>
                </div>

                <div className="border-border bg-card hover:border-primary/30 rounded-2xl border p-5 shadow-xs transition-all">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary border-border flex size-12 shrink-0 items-center justify-center rounded-xl border">
                      {company.logoUrl ? (
                        <Image
                          src={company.logoUrl}
                          alt={company.name}
                          width={48}
                          height={48}
                          className="size-full rounded-xl object-cover"
                        />
                      ) : (
                        <Building2 className="size-6" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground text-sm font-bold sm:text-base">
                          {title || "Judul Lowongan"}
                        </span>
                        {isCompanyVerified && <VerifiedBadge size="sm" />}
                      </div>

                      <p className="text-muted-foreground text-xs font-medium">
                        {company.name} &bull; {selectedCategoryName}
                      </p>

                      <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-2 text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin className="text-primary size-3.5" />
                          <span>{selectedLocationName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="text-primary size-3.5" />
                          <span>{selectedJobTypeLabel}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="text-primary size-3.5" />
                          <span className="text-foreground font-semibold">
                            {isSalaryDisclosed
                              ? salaryMin && salaryMax
                                ? `${formatRupiah(Number(salaryMin))} - ${formatRupiah(Number(salaryMax))}`
                                : salaryMin
                                  ? `Mulai ${formatRupiah(Number(salaryMin))}`
                                  : "Gaji Ditampilkan"
                              : "Gaji Dinegosiasikan"}
                          </span>
                        </span>
                      </div>

                      {/* Badge workplace & fresh graduate */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <Badge
                          variant="outline"
                          className="border-border text-muted-foreground gap-1 text-[10px]"
                        >
                          {selectedWorkplaceLabel}
                        </Badge>
                        {isFreshGraduate && (
                          <Badge className="bg-chart-1/10 text-chart-1 gap-1 border-0 text-[10px]">
                            Fresh Graduate
                          </Badge>
                        )}
                      </div>

                      {/* Tag skill preview */}
                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-3">
                          {skills.slice(0, 5).map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="px-2 py-0.5 text-[10px]"
                            >
                              {s}
                            </Badge>
                          ))}
                          {skills.length > 5 ? (
                            <span className="text-muted-foreground self-center text-[10px]">
                              +{skills.length - 5} lainnya
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Tambahan */}
              <div className="bg-muted/30 border-border space-y-2 rounded-xl border p-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model Kerja:</span>
                  <span className="font-semibold">
                    {selectedWorkplaceLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Minimal Pendidikan:
                  </span>
                  <span className="font-semibold">
                    {selectedEducationLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Minimal Pengalaman:
                  </span>
                  <span className="font-semibold">
                    {selectedExperienceLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode Lamaran:</span>
                  <span className="font-semibold">
                    {APPLICATION_METHOD_LABELS[applicationMethod]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Batas Waktu Lamaran:
                  </span>
                  <span className="font-semibold">
                    {deadline
                      ? new Date(deadline).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Tanpa Batas"}
                  </span>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* FOOTER WIZARD: TOMBOL NAVIGASI */}
        <CardFooter className="border-border flex items-center justify-between border-t p-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            className="text-xs"
          >
            <ChevronLeft className="mr-1 size-4" />
            Kembali
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden text-xs sm:inline">
              Langkah {currentStep} dari {STEPS.length}
            </span>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="text-xs font-semibold"
              >
                Selanjutnya
                <ChevronRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl px-6 text-xs font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    <span>Menyimpan Lowongan...</span>
                  </>
                ) : mode === "edit" ? (
                  <span>Simpan Perubahan Lowongan</span>
                ) : (
                  <span>Terbitkan Lowongan Sekarang</span>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
