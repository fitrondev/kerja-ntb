"use client";

import * as React from "react";

import { CheckCircle2, Loader2, MapPin, Phone, Upload } from "lucide-react";
import { toast } from "sonner";

import { updateUserProfileAction } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useStorageUpload } from "@/hooks/use-storage-upload";

export interface ProfileFormProps {
  initialProfile?: {
    fullName?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    locationId?: string | null;
    address?: string | null;
    bio?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    website?: string | null;
    linkedIn?: string | null;
    github?: string | null;
  } | null;
  locations: Array<{ id: string; name: string }>;
  userEmail: string;
}

export function ProfileForm({
  initialProfile,
  locations,
  userEmail,
}: ProfileFormProps) {
  const [fullName, setFullName] = React.useState(
    initialProfile?.fullName || ""
  );
  const [avatarUrl, setAvatarUrl] = React.useState(
    initialProfile?.avatarUrl || ""
  );
  const [phone, setPhone] = React.useState(initialProfile?.phone || "");
  const [locationId, setLocationId] = React.useState(
    initialProfile?.locationId || ""
  );
  const [address, setAddress] = React.useState(initialProfile?.address || "");
  const [bio, setBio] = React.useState(initialProfile?.bio || "");
  const [dateOfBirth, setDateOfBirth] = React.useState(
    initialProfile?.dateOfBirth ? initialProfile.dateOfBirth.slice(0, 10) : ""
  );
  const [gender, setGender] = React.useState(initialProfile?.gender || "");
  const [website, setWebsite] = React.useState(initialProfile?.website || "");
  const [linkedIn, setLinkedIn] = React.useState(
    initialProfile?.linkedIn || ""
  );
  const [github, setGithub] = React.useState(initialProfile?.github || "");

  const [isSaving, setIsSaving] = React.useState(false);

  const { upload, isUploading } = useStorageUpload();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Mohon pilih berkas gambar (JPG/PNG/WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2 MB.");
      return;
    }

    const res = await upload(file, "AVATAR");
    const uploadedUrl = res?.fileUrl || res?.publicUrl;
    if (res && uploadedUrl) {
      setAvatarUrl(uploadedUrl);
      toast.success("Foto profil berhasil diunggah.");
    } else {
      toast.error("Gagal mengunggah foto ke penyimpanan.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Nama lengkap wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserProfileAction({
        fullName: fullName.trim(),
        avatarUrl,
        phone,
        locationId,
        address,
        bio,
        dateOfBirth,
        gender: (gender as "LAKI_LAKI" | "PEREMPUAN" | "LAINNYA") || undefined,
        website,
        linkedIn,
        github,
      });

      if (res.success) {
        toast.success("Profil Anda berhasil diperbarui!");
      } else {
        toast.error(res.error || "Gagal memperbarui profil.");
      }
    } catch {
      toast.error("Terjadi masalah koneksi. Silakan coba kembali.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = fullName
    ? fullName
        .split(" ")
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "NTB";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kartu Foto & Info Utama */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Foto Profil &amp; Data Pribadi
          </CardTitle>
          <CardDescription>
            Lengkapi profil Anda agar perusahaan di NTB dapat mengenal
            kualifikasi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="border-primary/20 size-20 border-2 shadow-sm">
              <AvatarImage
                src={avatarUrl}
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  className="relative gap-2 overflow-hidden"
                >
                  <Upload className="size-4" />
                  <span>
                    {isUploading ? "Mengunggah..." : "Unggah Foto Baru"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={isUploading}
                  />
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAvatarUrl("")}
                    className="text-destructive hover:text-destructive text-xs"
                  >
                    Hapus Foto
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground text-[11px]">
                Format didukung: PNG, JPG, WebP. Maksimal ukuran 2 MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Lalu Muhammad Iqbal"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Alamat Email (Akun Terdaftar)
              </Label>
              <Input
                id="email"
                value={userEmail}
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold">
                Nomor Telepon / WhatsApp
              </Label>
              <div className="relative">
                <Phone className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-semibold">
                Domisili Kabupaten/Kota di NTB
              </Label>
              <div className="relative">
                <MapPin className="text-primary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <select
                  id="location"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="border-input bg-background text-foreground h-10 w-full rounded-lg border pr-4 pl-9 text-xs focus-visible:ring-2 focus-visible:outline-hidden sm:text-sm"
                >
                  <option value="">Pilih Domisili Wilayah NTB</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth" className="text-xs font-semibold">
                Tanggal Lahir
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs font-semibold">
                Jenis Kelamin
              </Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="border-input bg-background text-foreground h-10 w-full rounded-lg border px-3 text-xs focus-visible:ring-2 focus-visible:outline-hidden sm:text-sm"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold">
              Alamat Domisili Lengkap
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-semibold">
              Tentang Saya (Bio Singkat)
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Perkenalkan latar belakang profesional, minat karir, atau keahlian utama Anda..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tautan & Portofolio */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Tautan Profesional &amp; Media Sosial
          </CardTitle>
          <CardDescription>
            Tautkan portofolio atau jejaring profesional Anda agar HRD dapat
            melihat karya Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs font-semibold">
                Website / Portofolio
              </Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://portofolio-anda.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="linkedIn" className="text-xs font-semibold">
                Profil LinkedIn
              </Label>
              <Input
                id="linkedIn"
                value={linkedIn}
                onChange={(e) => setLinkedIn(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="github" className="text-xs font-semibold">
                Profil GitHub / Dribbble
              </Label>
              <Input
                id="github"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tombol Simpan */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isSaving || isUploading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Menyimpan Profil...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              <span>Simpan Perubahan Profil</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
