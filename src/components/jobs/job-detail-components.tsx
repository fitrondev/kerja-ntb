import * as React from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Home,
  Mail,
  MapPin,
  Send,
  Share2,
  ShieldAlert,
  Users,
} from "lucide-react";

import { SectionHeader } from "@/components/common/section-header";
// ---------------------------------------------------------------------------
// SimilarJobsSection
// ---------------------------------------------------------------------------

import { JobCard, type JobCardProps } from "@/components/jobs/job-card";
import { JobReportDialog } from "@/components/jobs/job-report-dialog";
import { JobSaveButton } from "@/components/jobs/job-save-button";
import { SectionContainer } from "@/components/layout/section-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  EDUCATION_LABELS,
  EXPERIENCE_LABELS,
  JOB_TYPE_LABELS,
  WORKPLACE_LABELS,
  formatRelativeDate,
} from "@/lib/formatters";

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

interface Skill {
  slug: string;
  name: string;
}

interface JobSkill {
  skill: Skill;
}

interface CompanyVerification {
  nib: string;
  legalName: string;
  status: string;
}

interface Company {
  name: string;
  slug: string;
  logoUrl?: string | null;
  isVerified?: boolean;
  description?: string | null;
  industry?: string | null;
  companySize?: string | null;
  address?: string | null;
  website?: string | null;
  verification?: CompanyVerification | null;
}

export interface JobDetailProps {
  id: string;
  title: string;
  slug: string;
  type: string;
  workplace: string;
  education: string;
  experience: string;
  salaryMin?: { toNumber?: () => number } | number | string | null;
  salaryMax?: { toNumber?: () => number } | number | string | null;
  isSalaryDisclosed: boolean;
  createdAt: Date | string;
  deadline?: Date | string | null;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits?: string | null;
  applicationMethod: string;
  applicationEmail?: string | null;
  externalUrl?: string | null;
  company?: Company | null;
  location: { name: string; slug: string };
  category?: { name: string; slug: string } | null;
  skills?: JobSkill[];
  categoryId?: string;
  locationId?: string;
}

// ---------------------------------------------------------------------------
// JobDetailHeader
// ---------------------------------------------------------------------------

export interface JobDetailHeaderProps {
  job: JobDetailProps;
  companyName: string;
  initials: string;
  initialSaved?: boolean;
}

/**
 * Header halaman detail lowongan: breadcrumb, logo, judul, meta, dan CTA utama.
 */
export function JobDetailHeader({
  job,
  companyName,
  initials,
  initialSaved = false,
}: JobDetailHeaderProps) {
  return (
    <SectionContainer
      as="header"
      fullWidth
      className="border-border from-background via-muted/10 to-muted/30 border-b bg-linear-to-b py-8 sm:py-12"
    >
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs"
        >
          <Link
            href="/"
            className="hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <Home className="size-3.5" />
            <span>Beranda</span>
          </Link>
          <ChevronRight className="size-3" />
          <Link
            href="/loker"
            className="hover:text-foreground transition-colors"
          >
            Lowongan Kerja
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground max-w-xs truncate font-medium">
            {job.title}
          </span>
        </nav>

        {/* Job Overview */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Company Logo / Initials */}
            <div className="bg-primary/10 text-primary border-primary/20 flex size-16 shrink-0 items-center justify-center rounded-2xl border text-xl font-bold shadow-xs sm:size-20">
              {job.company?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.company.logoUrl}
                  alt={companyName}
                  className="size-full rounded-2xl object-contain p-2"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">
                  {companyName}
                </span>
                {job.company?.isVerified && (
                  <VerifiedBadge variant="company" size="default" />
                )}
                {job.company?.verification?.nib && (
                  <Badge
                    variant="outline"
                    className="bg-card text-muted-foreground text-[11px]"
                  >
                    NIB: {job.company.verification.nib}
                  </Badge>
                )}
              </div>

              <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                {job.title}
              </h1>

              <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1 font-medium">
                  <MapPin className="text-primary size-4 shrink-0" />
                  <span>{job.location.name}, NTB</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="size-4 shrink-0" />
                  <span>Ditayangkan {formatRelativeDate(job.createdAt)}</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <span>
                      Batas:{" "}
                      {new Date(job.deadline).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA: Lamar Sekarang, Simpan Lowongan, Laporkan */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl px-7 font-semibold shadow-sm"
            >
              <a href="#lamar-section">
                <Send className="size-4" />
                <span>Lamar Sekarang</span>
              </a>
            </Button>

            <JobSaveButton
              jobId={job.id}
              jobTitle={job.title}
              initialSaved={initialSaved}
              size="lg"
              variant="outline"
              className="rounded-xl px-4"
            />

            <JobReportDialog
              jobId={job.id}
              jobTitle={job.title}
              companyName={companyName}
              triggerSize="lg"
              triggerVariant="outline"
              className="rounded-xl px-3"
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

// ---------------------------------------------------------------------------
// JobMetricsBar
// ---------------------------------------------------------------------------

export interface JobMetricsBarProps {
  salaryDisplay: string;
  type: string;
  workplace: string;
  education: string;
}

/**
 * 4 kartu ringkasan info kunci lowongan: gaji, tipe, sistem kerja, pendidikan.
 */
export function JobMetricsBar({
  salaryDisplay,
  type,
  workplace,
  education,
}: JobMetricsBarProps) {
  const metrics = [
    {
      label: "Kisaran Gaji",
      value: salaryDisplay,
      icon: Banknote,
      iconClass: "bg-chart-1/10 text-chart-1",
    },
    {
      label: "Tipe Pekerjaan",
      value: JOB_TYPE_LABELS[type] || type,
      icon: Briefcase,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      label: "Sistem Kerja",
      value: WORKPLACE_LABELS[workplace] || workplace,
      icon: Building2,
      iconClass: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Pendidikan",
      value: EDUCATION_LABELS[education] || education,
      icon: GraduationCap,
      iconClass: "bg-primary/10 text-primary",
    },
  ];

  return (
    <SectionContainer as="div" className="pt-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {metrics.map(({ label, value, icon: Icon, iconClass }) => (
          <Card key={label} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${iconClass}`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="text-foreground truncate text-sm font-bold">
                  {value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}

// ---------------------------------------------------------------------------
// JobDescription
// ---------------------------------------------------------------------------

export interface JobDescriptionProps {
  description: string;
  responsibilities: string;
  requirements: string;
  benefits?: string | null;
  skills?: JobSkill[];
}

/**
 * Konten utama deskripsi lowongan: deskripsi, tanggung jawab, kualifikasi, benefit, keahlian.
 */
export function JobDescription({
  description,
  responsibilities,
  requirements,
  benefits,
  skills,
}: JobDescriptionProps) {
  return (
    <div className="min-w-0 flex-1 space-y-8">
      <section className="space-y-4">
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          Deskripsi Pekerjaan
        </h2>
        <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line sm:text-base">
          {description}
        </div>
      </section>

      <Separator />

      {responsibilities && (
        <>
          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              Tanggung Jawab Utama
            </h2>
            <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line sm:text-base">
              {responsibilities}
            </div>
          </section>
          <Separator />
        </>
      )}

      <section className="space-y-4">
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          Persyaratan &amp; Kualifikasi
        </h2>
        <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line sm:text-base">
          {requirements}
        </div>
      </section>

      {benefits && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              Fasilitas &amp; Benefit
            </h2>
            <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line sm:text-base">
              {benefits}
            </div>
          </section>
        </>
      )}

      {skills && skills.length > 0 && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              Keahlian yang Dibutuhkan
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(({ skill }) => (
                <Badge
                  key={skill.slug}
                  variant="secondary"
                  className="px-3 py-1 text-xs font-medium"
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// JobApplyCard
// ---------------------------------------------------------------------------

export interface JobApplyCardProps {
  jobSlug: string;
  jobTitle: string;
  companyName: string;
  applicationMethod: string;
  applicationEmail?: string | null;
  externalUrl?: string | null;
}

/**
 * Kartu lamaran pekerjaan dengan 3 metode: KerjaNTB, Email, External URL.
 * Juga berisi tombol berbagi ke WhatsApp.
 */
export function JobApplyCard({
  jobSlug,
  jobTitle,
  companyName,
  applicationMethod,
  applicationEmail,
  externalUrl,
}: JobApplyCardProps) {
  return (
    <div id="lamar-section" className="scroll-mt-24 pt-4">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="space-y-4 p-6 sm:p-8">
          <div className="space-y-2">
            <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
              Lamaran Terbuka
            </Badge>
            <h3 className="text-foreground text-xl font-bold">
              Tertarik Bergabung dengan {companyName}?
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Kirimkan lamaran kerja Anda langsung melalui platform KerjaNTB
              secara gratis tanpa dipungut biaya apapun.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            {applicationMethod === "EMAIL" && applicationEmail ? (
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-sm"
              >
                <a
                  href={`mailto:${applicationEmail}?subject=Lamaran%20Kerja%20-%20${encodeURIComponent(jobTitle)}`}
                >
                  <Mail className="size-4" />
                  <span>Kirim CV via Email</span>
                </a>
              </Button>
            ) : applicationMethod === "EXTERNAL_URL" && externalUrl ? (
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-sm"
              >
                <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                  <span>Lamar di Situs Perusahaan</span>
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-sm"
              >
                <Link href={`/loker/${jobSlug}/apply`}>
                  <Send className="size-4" />
                  <span>Lamar Sekarang (KerjaNTB)</span>
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" size="lg" className="gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Info Lowongan Kerja di NTB: ${jobTitle} di ${companyName} - https://kerjantb.id/loker/${jobSlug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Share2 className="size-4" />
                <span>Bagikan ke WhatsApp</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// JobCompanySidebar
// ---------------------------------------------------------------------------

export interface JobCompanySidebarProps {
  company?: Company | null;
  companyName: string;
  jobId?: string;
  jobTitle?: string;
}

/**
 * Sidebar detail lowongan: profil perusahaan, peringatan anti-penipuan, tombol kembali.
 */
export function JobCompanySidebar({
  company,
  companyName,
  jobId,
  jobTitle,
}: JobCompanySidebarProps) {
  return (
    <aside className="space-y-6 lg:w-80 lg:shrink-0">
      {/* Profil Singkat Perusahaan */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">
            Tentang Perusahaan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1">
            <h4 className="text-foreground font-semibold">{companyName}</h4>
            {company?.industry && (
              <p className="text-muted-foreground">{company.industry}</p>
            )}
          </div>

          {company?.description && (
            <p className="text-muted-foreground leading-relaxed">
              {company.description}
            </p>
          )}

          <div className="border-border/60 space-y-2 border-t pt-3">
            {company?.companySize && (
              <div className="flex items-center gap-2">
                <Users className="text-muted-foreground size-4" />
                <span>{company.companySize}</span>
              </div>
            )}
            {company?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <span className="leading-snug">{company.address}</span>
              </div>
            )}
            {company?.website && (
              <div className="flex items-center gap-2 pt-1">
                <ExternalLink className="text-muted-foreground size-4" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Kunjungi Website
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Peringatan Anti Penipuan */}
      <Card className="border-chart-1/30 bg-chart-1/5">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-chart-1 size-5" />
            <h4 className="text-foreground text-sm font-bold">
              Perlindungan Pencari Kerja NTB
            </h4>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Perusahaan terverifikasi di KerjaNTB{" "}
            <strong>TIDAK PERNAH memungut biaya apapun</strong> (biaya tiket
            travel, akomodasi, atau seragam) dalam seluruh tahapan seleksi
            rekrutmen.
          </p>
          <div className="text-chart-1 flex items-center justify-between gap-1.5 pt-1 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>Lowongan ini Terverifikasi Aman</span>
            </div>
          </div>
          {jobId && jobTitle && (
            <div className="pt-2">
              <JobReportDialog
                jobId={jobId}
                jobTitle={jobTitle}
                companyName={companyName}
                triggerVariant="ghost"
                triggerSize="sm"
                triggerText="Laporkan Pungutan / Penipuan"
                className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive w-full justify-center text-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back Button */}
      <Button asChild variant="outline" className="w-full gap-2 rounded-xl">
        <Link href="/loker">
          <ArrowLeft className="size-4" />
          <span>Kembali ke Daftar Loker</span>
        </Link>
      </Button>
    </aside>
  );
}

export interface SimilarJobsSectionProps {
  jobs: JobCardProps["job"][];
}

/**
 * Section lowongan serupa di bagian bawah halaman detail.
 * Tidak dirender jika tidak ada lowongan serupa.
 */
export function SimilarJobsSection({ jobs }: SimilarJobsSectionProps) {
  if (jobs.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      fullWidth
      className="border-border bg-muted/20 border-t py-12 sm:py-16"
    >
      <div className="space-y-8">
        <SectionHeader
          label="Rekomendasi Terkait"
          title="Lowongan Serupa di NTB"
          description="Peluang karir lain di sektor atau wilayah yang relevan dengan pilihan Anda."
          action={{ href: "/loker", label: "Lihat Semua Loker" }}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

// Re-export unused import to satisfy TS (formatters used via named imports above)
export { EXPERIENCE_LABELS };
