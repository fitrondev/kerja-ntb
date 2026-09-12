"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import {
  AtSign,
  Building2,
  Globe,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { upsertCompanyProfileAction } from "@/actions/company";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStorageUpload } from "@/hooks/use-storage-upload";

export interface CompanyProfileFormProps {
  initialCompany?: {
    id?: string;
    name?: string;
    industry?: string | null;
    companySize?: string | null;
    foundedYear?: number | null;
    locationId?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    linkedIn?: string | null;
    instagram?: string | null;
    description?: string | null;
    logoUrl?: string | null;
  } | null;
  locations: Array<{ id: string; name: string }>;
}

const COMPANY_SIZES = [
  "1 - 10 Karyawan",
  "11 - 50 Karyawan",
  "51 - 200 Karyawan",
  "201 - 500 Karyawan",
  "500+ Karyawan",
];

const INDUSTRIES = [
  "Pariwisata, Perhotelan & Kuliner",
  "Teknologi Informasi & Digital",
  "Pertanian, Peternakan & Kelautan",
  "Pertambangan, Energi & Migas",
  "Perdagangan, Retail & Distribusi",
  "Kesehatan, Farmasi & Medis",
  "Pendidikan, Pelatihan & Yayasan",
  "Konstruksi, Properti & Teknik",
  "Keuangan, Perbankan & Koperasi",
  "Transportasi, Logistik & Ekspedisi",
  "Jasa Konsultan & Profesional",
  "Lainnya",
];

export function CompanyProfileForm({
  initialCompany,
  locations,
}: CompanyProfileFormProps) {
  const router = useRouter();

  const [name, setName] = React.useState(initialCompany?.name || "");
  const [industry, setIndustry] = React.useState(
    initialCompany?.industry || ""
  );
  const [companySize, setCompanySize] = React.useState(
    initialCompany?.companySize || ""
  );
  const [foundedYear, setFoundedYear] = React.useState<string>(
    initialCompany?.foundedYear ? String(initialCompany.foundedYear) : ""
  );
  const [locationId, setLocationId] = React.useState(
    initialCompany?.locationId || (locations[0]?.id ?? "")
  );
  const [address, setAddress] = React.useState(initialCompany?.address || "");
  const [phone, setPhone] = React.useState(initialCompany?.phone || "");
  const [email, setEmail] = React.useState(initialCompany?.email || "");
  const [website, setWebsite] = React.useState(initialCompany?.website || "");
  const [linkedIn, setLinkedIn] = React.useState(
    initialCompany?.linkedIn || ""
  );
  const [instagram, setInstagram] = React.useState(
    initialCompany?.instagram || ""
  );
  const [description, setDescription] = React.useState(
    initialCompany?.description || ""
  );
  const [logoUrl, setLogoUrl] = React.useState(initialCompany?.logoUrl || "");

  const [isSaving, setIsSaving] = React.useState(false);
  const { upload, isUploading } = useStorageUpload();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Mohon pilih berkas gambar logo (PNG/JPG/WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran berkas logo maksimal 2 MB.");
      return;
    }

    const res = await upload(file, "LOGO", initialCompany?.id);
    const uploadedUrl = res?.fileUrl || res?.publicUrl;
    if (res && uploadedUrl) {
      setLogoUrl(uploadedUrl);
      toast.success("Logo perusahaan berhasil diunggah!");
    } else {
      toast.error("Gagal mengunggah logo ke penyimpanan.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama perusahaan wajib diisi.");
      return;
    }

    if (!industry.trim()) {
      toast.error("Bidang industri perusahaan wajib dipilih.");
      return;
    }

    if (!locationId) {
      toast.error("Pilih salah satu Kabupaten/Kota domisili di NTB.");
      return;
    }

    if (!address.trim()) {
      toast.error("Alamat kantor perusahaan wajib diisi.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      toast.error("Deskripsi perusahaan minimal 10 karakter.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await upsertCompanyProfileAction({
        name: name.trim(),
        industry: industry.trim(),
        companySize: companySize || undefined,
        foundedYear: foundedYear ? parseInt(foundedYear, 10) : undefined,
        locationId,
        address: address.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        linkedIn: linkedIn.trim() || undefined,
        instagram: instagram.trim() || undefined,
        description: description.trim(),
        logoUrl: logoUrl.trim() || undefined,
      });

      if (res.success) {
        toast.success("Profil perusahaan berhasil disimpan!");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menyimpan profil perusahaan.");
      }
    } catch {
      toast.error("Terjadi kendala sistem saat menyimpan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kartu Identitas & Logo */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold sm:text-lg">
            Identitas Perusahaan
          </CardTitle>
          <CardDescription>
            Informasi umum mengenai nama merek usaha dan logo resmi perusahaan
            di NTB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="border-border bg-muted/40 size-20 rounded-2xl border sm:size-24">
              <AvatarImage
                src={logoUrl || undefined}
                alt={name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-2xl text-xl font-bold">
                {name ? (
                  name.slice(0, 2).toUpperCase()
                ) : (
                  <Building2 className="text-muted-foreground size-8" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  className="relative overflow-hidden text-xs"
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="mr-1.5 size-3.5" />
                      <span>Unggah Logo Perusahaan</span>
                    </>
                  )}
                </Button>
                {logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogoUrl("")}
                    className="text-muted-foreground hover:text-destructive text-xs"
                  >
                    Hapus Logo
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground text-[11px]">
                Format file didukung: PNG, JPG, WebP. Maksimal 2 MB. Disarankan
                berbentuk rasio 1:1.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-xs font-semibold">
                Nama Perusahaan / Usaha{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: PT Rinjani Digital NTB"
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="company-industry"
                className="text-xs font-semibold"
              >
                Sektor Industri <span className="text-destructive">*</span>
              </Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="company-industry" className="text-xs">
                  <SelectValue placeholder="Pilih sektor industri..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind} className="text-xs">
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-size" className="text-xs font-semibold">
                Skala Jumlah Karyawan
              </Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger id="company-size" className="text-xs">
                  <SelectValue placeholder="Pilih skala karyawan..." />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size} className="text-xs">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="company-founded"
                className="text-xs font-semibold"
              >
                Tahun Berdiri
              </Label>
              <Input
                id="company-founded"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                placeholder="Contoh: 2021"
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lokasi & Kontak Perusahaan */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold sm:text-lg">
            Domisili Kantor &amp; Kontak Resmi
          </CardTitle>
          <CardDescription>
            Wilayah penempatan kantor operasional di NTB dan kontak yang dapat
            dihubungi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="company-location"
                className="text-xs font-semibold"
              >
                Wilayah Kabupaten / Kota NTB{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="company-location" className="text-xs">
                  <SelectValue placeholder="Pilih wilayah NTB..." />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id} className="text-xs">
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-phone" className="text-xs font-semibold">
                Nomor Telepon / WhatsApp
              </Label>
              <div className="relative">
                <Phone className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                <Input
                  id="company-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="pl-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-email" className="text-xs font-semibold">
                Email Rekrutmen / Operasional
              </Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                <Input
                  id="company-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hrd@perusahaan.co.id"
                  className="pl-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="company-website"
                className="text-xs font-semibold"
              >
                Website Resmi Perusahaan
              </Label>
              <div className="relative">
                <Globe className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                <Input
                  id="company-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://perusahaan.co.id"
                  className="pl-8 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-address" className="text-xs font-semibold">
              Alamat Lengkap Kantor di NTB{" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="text-muted-foreground absolute top-3 left-3 size-3.5" />
              <Textarea
                id="company-address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Pejanggik No. 45, Cakranegara, Kota Mataram, Nusa Tenggara Barat"
                required
                className="pl-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="company-linkedin"
                className="text-xs font-semibold"
              >
                Tautan LinkedIn (Opsional)
              </Label>
              <div className="relative">
                <Link2 className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                <Input
                  id="company-linkedin"
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  placeholder="https://linkedin.com/company/nama-perusahaan"
                  className="pl-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="company-instagram"
                className="text-xs font-semibold"
              >
                Instagram (Opsional)
              </Label>
              <div className="relative">
                <AtSign className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                <Input
                  id="company-instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@nama_perusahaan"
                  className="pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deskripsi & Budaya Perusahaan */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold sm:text-lg">
            Tentang Perusahaan &amp; Budaya Kerja
          </CardTitle>
          <CardDescription>
            Jelaskan profil usaha, visi, misi, dan lingkungan kerja untuk
            menarik minat talenta lokal NTB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label
            htmlFor="company-description"
            className="text-xs font-semibold"
          >
            Deskripsi Profil Perusahaan{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="company-description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tuliskan latar belakang perusahaan, produk/jasa yang ditawarkan, serta gambaran budaya kerja perusahaan Anda..."
            required
            className="text-xs"
          />
          <p className="text-muted-foreground text-[11px]">
            Minimal 10 karakter. Informasi ini akan ditampilkan di halaman
            publik setiap lowongan pekerjaan Anda.
          </p>
        </CardContent>
      </Card>

      {/* Tombol Simpan */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={isSaving || isUploading}
          className="rounded-xl px-6 font-semibold"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              <span>Menyimpan Profil...</span>
            </>
          ) : (
            <span>Simpan Profil Perusahaan</span>
          )}
        </Button>
      </div>
    </form>
  );
}
