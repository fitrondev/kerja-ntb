"use client";

import * as React from "react";

import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  FileText,
  FileUp,
  GraduationCap,
  Loader2,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteResumeAction,
  saveResumeAction,
  setDefaultResumeAction,
} from "@/actions/resume";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStorageUpload } from "@/hooks/use-storage-upload";
import { cn } from "@/lib/utils";

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
}

export interface ExperienceItem {
  id?: string;
  companyName: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface ResumeData {
  id: string;
  title: string;
  summary?: string | null;
  fileUrl?: string | null;
  isDefault: boolean;
  createdAt: Date | string;
  educations: EducationItem[];
  experiences: ExperienceItem[];
}

export interface ResumeBuilderProps {
  initialResumes: ResumeData[];
}

export function ResumeBuilder({ initialResumes }: ResumeBuilderProps) {
  const [resumes, setResumes] = React.useState<ResumeData[]>(initialResumes);
  const [activeResumeId, setActiveResumeId] = React.useState<string | "NEW">(
    initialResumes.length > 0 ? initialResumes[0].id : "NEW"
  );

  const activeResume =
    activeResumeId === "NEW"
      ? null
      : resumes.find((r) => r.id === activeResumeId) || null;

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus resume ini?")) return;

    try {
      const res = await deleteResumeAction(id);
      if (res.success) {
        toast.success("Resume telah dihapus.");
        const remaining = resumes.filter((r) => r.id !== id);
        setResumes(remaining);
        setActiveResumeId(remaining.length > 0 ? remaining[0].id : "NEW");
      } else {
        toast.error(res.error || "Gagal menghapus resume.");
      }
    } catch {
      toast.error("Gagal menghapus resume.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await setDefaultResumeAction(id);
      if (res.success) {
        toast.success("Resume utama berhasil diperbarui.");
        setResumes(
          resumes.map((r) => ({
            ...r,
            isDefault: r.id === id,
          }))
        );
      }
    } catch {
      toast.error("Gagal mengatur resume default.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector Resume */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {resumes.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveResumeId(r.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all sm:text-sm",
                activeResumeId === r.id
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <FileText className="size-4" />
              <span>{r.title}</span>
              {r.isDefault && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] font-normal",
                    activeResumeId === r.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-chart-1/10 text-chart-1"
                  )}
                >
                  Utama
                </Badge>
              )}
            </button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveResumeId("NEW")}
            className={cn(
              "gap-1.5 rounded-xl text-xs",
              activeResumeId === "NEW" &&
                "border-primary bg-primary/10 text-primary"
            )}
          >
            <Plus className="size-3.5" />
            <span>Buat CV Baru</span>
          </Button>
        </div>

        {activeResume && (
          <div className="flex items-center gap-2">
            {!activeResume.isDefault && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSetDefault(activeResume.id)}
                className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
              >
                <Star className="size-3.5" />
                <span>Jadikan CV Utama</span>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(activeResume.id)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 text-xs"
            >
              <Trash2 className="size-3.5" />
              <span>Hapus CV</span>
            </Button>
          </div>
        )}
      </div>

      {/* Editor Form - Menggunakan key={activeResumeId} untuk reset otomatis tanpa useEffect */}
      <ResumeEditorForm
        key={activeResumeId}
        resume={activeResume}
        isFirstResume={resumes.length === 0}
        onSaved={(newResumeId) => {
          setActiveResumeId(newResumeId);
        }}
      />
    </div>
  );
}

interface ResumeEditorFormProps {
  resume: ResumeData | null;
  isFirstResume: boolean;
  onSaved: (resumeId: string) => void;
}

function ResumeEditorForm({
  resume,
  isFirstResume,
  onSaved,
}: ResumeEditorFormProps) {
  const [title, setTitle] = React.useState(resume?.title || "CV Baru");
  const [summary, setSummary] = React.useState(resume?.summary || "");
  const [fileUrl, setFileUrl] = React.useState(resume?.fileUrl || "");
  const [isDefault, setIsDefault] = React.useState(
    resume?.isDefault ?? isFirstResume
  );
  const [educations, setEducations] = React.useState<EducationItem[]>(
    resume?.educations.map((e) => ({
      ...e,
      startDate: e.startDate ? e.startDate.slice(0, 10) : "",
      endDate: e.endDate ? e.endDate.slice(0, 10) : "",
    })) || []
  );
  const [experiences, setExperiences] = React.useState<ExperienceItem[]>(
    resume?.experiences.map((ex) => ({
      ...ex,
      startDate: ex.startDate ? ex.startDate.slice(0, 10) : "",
      endDate: ex.endDate ? ex.endDate.slice(0, 10) : "",
    })) || []
  );

  const [isSaving, setIsSaving] = React.useState(false);
  const { upload, isUploading } = useStorageUpload();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Hanya berkas format PDF yang diperbolehkan untuk CV.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran berkas CV maksimal 5 MB.");
      return;
    }

    const res = await upload(file, "RESUME");
    if (res && res.publicUrl) {
      setFileUrl(res.publicUrl);
      toast.success("Berkas CV PDF berhasil diunggah ke SumoPod Storage!");
    } else {
      toast.error("Gagal mengunggah berkas CV.");
    }
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        institution: "",
        degree: "D4_S1",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        grade: "",
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        companyName: "",
        position: "",
        location: "Mataram, NTB",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul CV wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveResumeAction({
        id: resume?.id,
        title: title.trim(),
        summary: summary ? summary.trim() : undefined,
        fileUrl: fileUrl ? fileUrl.trim() : undefined,
        isDefault,
        educations: educations.filter((e) => e.institution.trim() !== ""),
        experiences: experiences.filter((ex) => ex.companyName.trim() !== ""),
      });

      if (res.success && res.data) {
        toast.success("Resume berhasil disimpan!");
        onSaved(res.data.resumeId);
      } else {
        toast.error(res.error || "Gagal menyimpan resume.");
      }
    } catch {
      toast.error("Terjadi kegagalan koneksi. Silakan coba kembali.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Informasi Dasar & Berkas PDF */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">
                Informasi Resume &amp; Berkas CV
              </CardTitle>
              <CardDescription>
                Beri judul identifikasi untuk resume ini dan unggah file PDF
                jika sudah memiliki CV.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(Boolean(checked))}
              />
              <Label htmlFor="isDefault" className="cursor-pointer text-xs">
                Jadikan CV Default
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="resume-title" className="text-xs font-semibold">
                Judul CV / Posisi yang Dituju{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="resume-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: CV Fullstack Developer / CV Front Office"
                required
              />
            </div>

            {/* Upload CV PDF */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Berkas CV (PDF)</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  className="relative gap-2 overflow-hidden"
                >
                  <FileUp className="size-4" />
                  <span>
                    {isUploading ? "Mengunggah PDF..." : "Unggah File PDF"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={isUploading}
                  />
                </Button>

                {fileUrl && (
                  <div className="flex items-center gap-2 text-xs">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 font-medium hover:underline"
                    >
                      <FileCheck className="text-chart-1 size-4" />
                      <span>Lihat Berkas CV</span>
                      <ExternalLink className="size-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setFileUrl("")}
                      className="text-muted-foreground hover:text-destructive text-[11px]"
                    >
                      (Hapus)
                    </button>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-[11px]">
                Format PDF, maks. 5 MB. Tersimpan aman di SumoPod Object
                Storage.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resume-summary" className="text-xs font-semibold">
              Ringkasan Profesional
            </Label>
            <Textarea
              id="resume-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Tuliskan gambaran singkat mengenai keahlian, pencapaian, dan tujuan karir Anda di NTB..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Riwayat Pendidikan */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <GraduationCap className="text-primary size-5" />
              <span>Riwayat Pendidikan</span>
            </CardTitle>
            <CardDescription>
              Cantumkan latar belakang pendidikan formal atau vokasi Anda.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEducation}
            className="gap-1.5 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Tambah Pendidikan</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {educations.length === 0 ? (
            <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
              <GraduationCap className="text-muted-foreground/60 mb-2 size-8" />
              <p className="text-muted-foreground text-xs">
                Belum ada riwayat pendidikan yang ditambahkan.
              </p>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={addEducation}
                className="text-primary text-xs"
              >
                + Tambah Riwayat Pendidikan Pertama
              </Button>
            </div>
          ) : (
            educations.map((edu, idx) => (
              <div
                key={idx}
                className="border-border/60 bg-muted/10 relative space-y-4 rounded-xl border p-4"
              >
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="text-muted-foreground hover:text-destructive absolute top-3 right-3"
                  title="Hapus baris ini"
                >
                  <Trash2 className="size-4" />
                </button>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Institusi / Kampus / Sekolah
                    </Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].institution = e.target.value;
                        setEducations(updated);
                      }}
                      placeholder="Contoh: Universitas Mataram"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Jenjang Pendidikan
                    </Label>
                    <select
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].degree = e.target.value;
                        setEducations(updated);
                      }}
                      className="border-input bg-background text-foreground h-10 w-full rounded-lg border px-3 text-xs focus-visible:ring-2 focus-visible:outline-hidden sm:text-sm"
                    >
                      <option value="SMA_SMK">SMA / SMK Sederajat</option>
                      <option value="D3">Diploma 3 (D3)</option>
                      <option value="D4_S1">Sarjana (D4 / S1)</option>
                      <option value="S2">Magister (S2)</option>
                      <option value="S3">Doktoral (S3)</option>
                      <option value="LAINNYA">Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Jurusan / Program Studi
                    </Label>
                    <Input
                      value={edu.fieldOfStudy}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].fieldOfStudy = e.target.value;
                        setEducations(updated);
                      }}
                      placeholder="Contoh: Teknik Informatika"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Tahun / Tanggal Mulai
                    </Label>
                    <Input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].startDate = e.target.value;
                        setEducations(updated);
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Tahun / Tanggal Lulus
                    </Label>
                    <Input
                      type="date"
                      value={edu.endDate || ""}
                      disabled={edu.isCurrent}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].endDate = e.target.value;
                        setEducations(updated);
                      }}
                    />
                    <label className="text-muted-foreground flex cursor-pointer items-center gap-1.5 pt-1 text-[11px]">
                      <input
                        type="checkbox"
                        checked={edu.isCurrent}
                        onChange={(e) => {
                          const updated = [...educations];
                          updated[idx].isCurrent = e.target.checked;
                          setEducations(updated);
                        }}
                      />
                      <span>Masih Sedang Menempuh Pendidikan</span>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Nilai Akhir / IPK (Opsional)
                    </Label>
                    <Input
                      value={edu.grade || ""}
                      onChange={(e) => {
                        const updated = [...educations];
                        updated[idx].grade = e.target.value;
                        setEducations(updated);
                      }}
                      placeholder="Contoh: 3.75 / 4.00"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Riwayat Pengalaman Kerja */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Briefcase className="text-primary size-5" />
              <span>Pengalaman Kerja &amp; Magang</span>
            </CardTitle>
            <CardDescription>
              Tuliskan pengalaman kerja profesional, proyek lepas, atau program
              magang Anda.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExperience}
            className="gap-1.5 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Tambah Pengalaman</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiences.length === 0 ? (
            <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
              <Briefcase className="text-muted-foreground/60 mb-2 size-8" />
              <p className="text-muted-foreground text-xs">
                Belum ada pengalaman kerja yang ditambahkan (Fresh Graduate
                diperbolehkan).
              </p>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={addExperience}
                className="text-primary text-xs"
              >
                + Tambah Pengalaman Kerja / Magang
              </Button>
            </div>
          ) : (
            experiences.map((exp, idx) => (
              <div
                key={idx}
                className="border-border/60 bg-muted/10 relative space-y-4 rounded-xl border p-4"
              >
                <button
                  type="button"
                  onClick={() => removeExperience(idx)}
                  className="text-muted-foreground hover:text-destructive absolute top-3 right-3"
                  title="Hapus baris ini"
                >
                  <Trash2 className="size-4" />
                </button>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Nama Perusahaan / Organisasi
                    </Label>
                    <Input
                      value={exp.companyName}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].companyName = e.target.value;
                        setExperiences(updated);
                      }}
                      placeholder="Contoh: PT Lombok Tourism"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Posisi / Jabatan
                    </Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].position = e.target.value;
                        setExperiences(updated);
                      }}
                      placeholder="Contoh: Marketing Associate"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Lokasi Penempatan
                    </Label>
                    <Input
                      value={exp.location || ""}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].location = e.target.value;
                        setExperiences(updated);
                      }}
                      placeholder="Contoh: Kota Mataram / Lombok Barat"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Tanggal Mulai Bekerja
                    </Label>
                    <Input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].startDate = e.target.value;
                        setExperiences(updated);
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">
                      Tanggal Berakhir
                    </Label>
                    <Input
                      type="date"
                      value={exp.endDate || ""}
                      disabled={exp.isCurrent}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].endDate = e.target.value;
                        setExperiences(updated);
                      }}
                    />
                    <label className="text-muted-foreground flex cursor-pointer items-center gap-1.5 pt-1 text-[11px]">
                      <input
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].isCurrent = e.target.checked;
                          setExperiences(updated);
                        }}
                      />
                      <span>Masih Bekerja di Posisi Ini</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">
                    Uraian Tanggung Jawab &amp; Pencapaian
                  </Label>
                  <Textarea
                    value={exp.description || ""}
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].description = e.target.value;
                      setExperiences(updated);
                    }}
                    placeholder="Jelaskan peran kerja harian atau capaian yang Anda raih..."
                    rows={2}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Tombol Simpan CV */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={isSaving || isUploading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Menyimpan Resume...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              <span>Simpan Seluruh Perubahan CV</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
