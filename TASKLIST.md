# 📋 KERJANTB — TASKLIST PENGERJAAN & SPRINT TRACKER

> **Status Proyek:** 🟢 Selesai (100% - Ready for Launch)  
> **Target Rilis:** Q2 2026  
> **Tech Stack:** Next.js 16 (App Router) + React 19 + Bun 1.3 + MySQL (SumoPod) + Prisma 7 + SumoPod S3 + Clerk Auth + shadcn/ui (Tailwind v4 OKLCH)

---

## 📊 Ringkasan Progres Keseluruhan

| Fase        | Nama Modul / Fitur                                   |   Status   | Progress | Target Utama                                   |
| :---------- | :--------------------------------------------------- | :--------: | :------: | :--------------------------------------------- |
| **Fase 1**  | Inisialisasi Proyek, Database SumoPod & Prisma ORM   | 🟢 Selesai |   100%   | Schema Prisma, Client Gen, DB Push             |
| **Fase 2**  | Design System, Layout Publik & Primitif UI (shadcn)  | 🟢 Selesai |   100%   | 62 UI Components, Navbar, Footer NTB           |
| **Fase 3**  | Data Seeding (10 Daerah NTB & 12 Kategori Pekerjaan) | 🟢 Selesai |   100%   | 10 Daerah, 12 Kategori, 5 PT, 8 Loker NTB      |
| **Fase 4**  | Halaman Publik & Job Search Engine (`/loker`)        | 🟢 Selesai |   100%   | Homepage Hero, Filter Multifaset, Detail Loker |
| **Fase 5**  | Autentikasi Clerk, Webhook Sync & RBAC Guard         | 🟢 Selesai |   100%   | Sign-in/Sign-up routes, Webhook sync MySQL     |
| **Fase 6**  | Dashboard Pencari Kerja & Resume Builder (Multi-CV)  | 🟢 Selesai |   100%   | ATS Profil, Lamaran Saya, Loker Tersimpan      |
| **Fase 7**  | Dashboard Perusahaan, Job Posting Wizard & NIB       | 🟢 Selesai |   100%   | Multi-step Form, Verifikasi NIB, ATS Pelamar   |
| **Fase 8**  | Integrasi SumoPod Object Storage (S3 API)            | 🟢 Selesai |   100%   | Presigned S3 Upload, Logo, CV, Dokumen NIB     |
| **Fase 9**  | Dashboard Superadmin & Moderasi Lowongan             | 🟢 Selesai |   100%   | Antrean Verifikasi Loker & NIB, Audit Log      |
| **Fase 10** | SEO Google Jobs (JSON-LD), Audit & Optimasi          | 🟢 Selesai |   100%   | Schema.org, Dynamic Sitemap, Production Build  |

---

## 🛠️ Detail Rincian Task per Fase

### Fase 1: Setup Lingkungan & Database SumoPod MySQL

- [x] Inisialisasi Next.js 16 dengan Bun runtime dan TypeScript strict mode
- [x] Konfigurasi Tailwind CSS v4 dengan variabel warna OKLCH di `src/app/globals.css`
- [x] Konfigurasi koneksi MySQL SumoPod di `.env` (`DATABASE_URL`)
- [x] Pembuatan skema relasional Prisma komprehensif di `prisma/schema.prisma`:
  - [x] Enum: `UserRole`, `JobType`, `WorkplaceType`, `ApplicationStatus`, `VerificationStatus`, dll.
  - [x] Model User, Profile, Company, CompanyVerification (NIB)
  - [x] Model Job, JobCategory, Location, JobSkill, Skill
  - [x] Model Application, SavedJob, Resume, Education, Experience
  - [x] Model AuditLog, Report, Notification, BlogPost, FAQ
- [x] Konfigurasi `prisma7.config.ts` untuk Prisma 7
- [x] Singleton Prisma Client di `src/lib/db/prisma.ts`
- [x] Generate Prisma Client (`bunx prisma generate`)
- [x] **Push Skema ke SumoPod MySQL** (`bunx prisma db push`)

---

### Fase 2: Design System, Layout Publik & Primitif UI

- [x] Setup tema OKLCH semantic tokens (Primary, Secondary, Accent, Chart, Sidebar)
- [x] Pasang Providers global di `src/components/providers.tsx` (`ThemeProvider`, `TooltipProvider`, `Sonner Toaster`)
- [x] Instalasi komponen shadcn/ui radix-nova (Button, Input, Card, Badge, Dialog, Select, Dropdown, Table, Sheet, Sidebar, dll.)
- [x] Standardisasi kontainer section dengan `SectionContainer` (`src/components/layout/section-container.tsx` & `.section-container`)
- [x] Komponen badge kepercayaan NTB `VerifiedBadge` (`src/components/ui/verified-badge.tsx`)
- [x] **Navbar Publik (`src/components/layout/navbar.tsx`)**:
  - [x] Brand Logo KerjaNTB dengan badge wilayah "NTB"
  - [x] Navigasi: Cari Lowongan, Perusahaan, Kategori, Wilayah NTB, Tentang Kami
  - [x] Action buttons: Theme Toggle, Pasang Lowongan, Masuk / Daftar (Clerk UserButton jika logged in)
  - [x] Mobile responsive navigation drawer (Sheet) di `src/components/layout/mobile-nav.tsx`
- [x] **Footer Publik (`src/components/layout/footer.tsx`)**:
  - [x] Daftar link cepat ke 10 Kabupaten/Kota se-NTB

---

### Fase 3: Data Seeding 10 Kabupaten/Kota NTB & Kategori

- [x] Buat script seeding di `prisma/seed.ts`:
  - [x] 10 Kabupaten/Kota resmi di NTB (Mataram, Lombok Barat, Tengah, Timur, Utara, Sumbawa, Sumbawa Barat, Dompu, Bima, Kota Bima)
  - [x] 12 Kategori lowongan kerja lokal
- [x] Tambahkan data dummy ke `seed.ts` untuk preview:
  - [x] 5 Akun Perusahaan demo (PT Amman Mineral, Katamaran Resort, Bank NTB Syariah, Sasak Digital, Agro Sentra Dompu)
  - [x] 8 Contoh lowongan kerja aktif bervariasi lokasi se-NTB & kategori
- [x] Eksekusi seeding: `bun run prisma/seed.ts`
- [x] Verifikasi data tersimpan via query database

---

### Fase 4: Halaman Publik & Job Search Engine (`/loker`)

- [x] **Homepage (`src/app/(root)/page.tsx`)**:
  - [x] Hero Section: Headline dampak lokal NTB + Quick Search bar (Kata Kunci + Dropdown 10 Wilayah NTB)
  - [x] Badge Trust: "Platform Resmi Lowongan Terverifikasi NTB — Bebas Penipuan"
  - [x] Grid Kategori Populer (Card dengan icon Lucide + jumlah loker aktif)
  - [x] Section "Lowongan Terbaru di NTB" (Grid 6 loker teranyar terhubung langsung ke Prisma)
  - [x] Banner CTA untuk Pemberi Kerja / Perusahaan NTB
- [x] **Halaman Pencarian Lowongan (`src/app/(root)/loker/page.tsx`)**:
  - [x] Search & Multi-facet Filter bar (Keyword, Wilayah, Kategori, Tipe Kerja, Workplace, Gaji, Pendidikan)
  - [x] Server Component data fetching dengan Prisma & pagination
  - [x] Komponen `JobCard` (Logo perusahaan, badge Terverifikasi NIB, rentang gaji, lokasi NTB, skills)
  - [x] Komponen `JobFilters` & mobile drawer `JobFilterDrawer`
  - [x] State kosong (`JobEmptyState`) jika pencarian tidak ditemukan
- [x] **Halaman Detail Lowongan (`src/app/(root)/loker/[slug]/page.tsx`)**:
  - [x] Header: Judul, Nama Perusahaan, Status Verifikasi NIB, Tanggal Tayang & Deadline
  - [x] Key metrics: Gaji, Tipe Kontrak, Lokasi Kantor di NTB, Minimal Pendidikan, Pengalaman
  - [x] Deskripsi lengkap, tanggung jawab, kualifikasi, benefit, dan skill pills
  - [x] Fast Apply Section (Mendukung Platform KerjaNTB, Email HRD, dan Website Perusahaan)
  - [x] Peringatan Keamanan Anti-Penipuan KerjaNTB
  - [x] Profil Singkat Perusahaan + Lowongan Serupa di NTB
  - [x] JSON-LD Google Jobs Schema (`schema.org/JobPosting`) untuk SEO optimal

---

### Fase 5: Autentikasi Clerk, Webhook Sync & Role RBAC

- [x] Route autentikasi Clerk (`/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]`)
- [x] Konfigurasi tipe global JWT Session Claims (`types/globals.d.ts` & `src/types/globals.d.ts`)
- [x] Helper Otorisasi & Guards RBAC (`src/lib/auth/rbac.ts`):
  - [x] `isAdminRole(role)`
  - [x] `checkRole(allowedRoles)`
  - [x] `requireRole(allowedRoles, redirectTo)`
- [x] Panel Manajemen Role Pengguna RBAC (`/dashboard/admin/pengguna`):
  - [x] Server Action ubah role pengguna (`updateUserRoleAction`)
  - [x] Komponen interaktif manajemen role (`UserRoleManagement`)
- [x] **Clerk Webhook Handler (`src/app/api/webhooks/route.ts` & `/api/webhooks/clerk`)**:
  - [x] Validasi signature webhook via `@clerk/nextjs/webhooks` / `svix`
  - [x] Event `user.created`: Sinkronisasi otomatis ke tabel `User` & `Profile` MySQL (default role: `INDIVIDUAL`)
  - [x] Event `user.updated`: Update nama, avatar URL, email, dan metadata role
  - [x] Event `user.deleted`: Deaktivasi akun (`DEACTIVATED`) di MySQL
- [x] Helper sinkronisasi profil user aktif ke database MySQL (`getCurrentUser()`) dengan auto-sync fallback
- [x] Clerk Middleware / Proxy (`src/proxy.ts`) melindungi seluruh rute `/dashboard(.*)`

---

### Fase 6: Dashboard Pencari Kerja & Resume Builder

- [x] Setup layout dashboard terpadu dengan `AppSidebar` di `src/app/(dashboard)/layout.tsx`
- [x] **Overview Pencari Kerja (`/dashboard/user`)**:
  - [x] Kartu metrik: Jumlah Lamaran Terkirim, Diproses, Wawancara, Ditolak
  - [x] Tabel status lamaran terbaru dengan badge status real-time
  - [x] Daftar lowongan yang disimpan (Bookmarked Jobs)
- [x] **Profil & Resume Builder (`/dashboard/user/profile` & `/dashboard/user/resume`)**:
  - [x] Form data pribadi (Headline, Ringkasan, Kontak, Nomor WA)
  - [x] Sub-form Riwayat Pendidikan (Sekolah/Universitas, Gelar, Tahun)
  - [x] Sub-form Pengalaman Kerja (Perusahaan, Posisi, Deskripsi)
  - [x] Tag Keahlian / Skills input
  - [x] Opsi Upload File CV PDF langsung tersambung ke SumoPod S3 Private
- [x] **Modal Lamar Pekerjaan (`JobApplyModal`)**:
  - [x] Pilihan CV: Gunakan Resume Profil atau Upload CV khusus
  - [x] Textarea Cover Letter / Catatan untuk HR
  - [x] Server Action kirim lamaran & validasi duplikasi lamaran

---

### Fase 7: Dashboard Perusahaan & Multi-Step Job Posting

- [x] **Setup Halaman & Guard Perusahaan (`/dashboard/employer`)**:
  - [x] Cek status profil perusahaan dan role guard `COMPANY` / `SUPERADMIN`
- [x] **Profil Perusahaan & Pengajuan Verifikasi NIB (`/dashboard/company` & `/dashboard/verification`)**:
  - [x] Input NIB (13 digit angka), Nama Legalitas PT/CV/Usaha
  - [x] Upload scan dokumen NIB / SIUP ke SumoPod S3 Private
  - [x] Status badge verifikasi: `PENDING`, `APPROVED`, `REJECTED`
- [x] **Wizard Pembuatan Lowongan Kerja Multi-Step (`/dashboard/loker/baru` & `/dashboard/employer/jobs/create`)**:
  - [x] Step 1: Judul Posisi, Kategori, Wilayah NTB, Workplace Type
  - [x] Step 2: Rentang Gaji (IDR) & Kebijakan Tampilkan Gaji (UMP NTB 2026 check)
  - [x] Step 3: Deskripsi Pekerjaan, Tanggung Jawab
  - [x] Step 4: Persyaratan Kualifikasi & Pendidikan Minimal
  - [x] Step 5: Tipe Pelamaran (Melalui Portal KerjaNTB / Email / Link Luar)
  - [x] Step 6: Live Mockup Card Preview & Aksi Publikasi
  - [x] _Business Logic:_ Jika perusahaan sudah terverifikasi (`isVerified = true`), status otomatis `PUBLISHED`. Jika belum, masuk antrean `PENDING_REVIEW`.
- [x] **Manajemen Lowongan (`/dashboard/employer/loker`)**:
  - [x] Daftar loker aktif, pending, ditutup
  - [x] Tombol edit (`/dashboard/employer/loker/[id]/edit`), switch status, delete modal
- [x] **Applicant Tracking System (ATS) (`/dashboard/employer/pelamar`)**:
  - [x] Daftar pelamar per lowongan
  - [x] Preview CV pelamar / link dokumen S3
  - [x] Evaluasi status lamaran: `APPLIED`, `REVIEWING`, `SHORTLISTED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`
  - [x] Kirim catatan internal / feedback HR

---

### Fase 8: Integrasi SumoPod Object Storage (S3 API)

- [x] Client S3 SumoPod di `src/lib/storage/s3.ts` menggunakan `@aws-sdk/client-s3`
- [x] Helper presigned URL di `src/lib/storage/upload.ts` & `src/actions/storage.ts`:
  - [x] Presigned PUT URL untuk upload langsung dari browser (tanpa beban server Next.js)
  - [x] Presigned GET URL untuk file privat (dokumen legalitas NIB & CV pelamar)
  - [x] Streaming proxy route di `/api/storage/file/[...key]` dengan kontrol otentikasi
- [x] Integrasi upload terverifikasi:
  - [x] Upload Avatar User (Folder public: `avatars/`)
  - [x] Upload Logo Perusahaan (Folder public: `logos/`)
  - [x] Upload CV Pelamar PDF (Folder private: `resumes/`)
  - [x] Upload Berkas NIB Perusahaan (Folder private: `verifications/`)

---

### Fase 9: Dashboard Superadmin & Moderasi

- [x] Layout khusus Superadmin dengan proteksi `UserRole.SUPERADMIN`
- [x] **Overview Admin (`/dashboard/admin`)**:
  - [x] Metrik riil total pengguna, lowongan aktif, perusahaan terdaftar, loker pending, NIB pending, laporan pending
  - [x] Widget aktivitas rekam jejak audit terkini (`RecentAuditLogs`)
- [x] **Antrean Moderasi Lowongan (`/dashboard/admin/moderasi`)**:
  - [x] Filter tab: Pending Review, Published, Rejected, Semua
  - [x] Modal preview rincian lengkap pekerjaan
  - [x] Tombol Approve (terbitkan ke publik + notifikasi)
  - [x] Tombol Reject dengan modal alasan penolakan wajib (min 10 karakter)
- [x] **Antrean Verifikasi Perusahaan (`/dashboard/admin/verifikasi`)**:
  - [x] Validasi visual 13 digit NIB OSS
  - [x] Preview dokumen legalitas privat via signed URL SumoPod S3 (`getSecureVerificationDocUrlAction`)
  - [x] Aksi Verifikasi (Centang Biru NTB) atau Tolak dengan alasan wajib
- [x] **Pusat Pengaduan & Laporan (`/dashboard/admin/laporan`)**:
  - [x] Daftar laporan anti-fraud dari masyarakat
  - [x] Aksi: Jeda Lowongan (`PAUSE_JOB`), Hapus Lowongan (`REMOVE_JOB`), Suspend Akun (`SUSPEND_USER`), Dismiss, atau Review
- [x] **Jejak Audit Sistem (`src/lib/audit.ts` & `/dashboard/admin/audit-log`)**:
  - [x] Helper `createAuditLog` mencatat setiap aksi administratif (aktor, IP, user-agent, target, metadata)
  - [x] Halaman dedicated tabel audit log dengan inspeksi metadata JSON

---

### Fase 10: SEO Google Jobs, Performance & Launch Readiness

- [x] Generator Schema.org `JobPosting` terstruktur resmi Google for Jobs di `src/lib/seo/job-posting-schema.ts`
- [x] Injeksi JSON-LD pada setiap halaman lowongan `/loker/[slug]`
- [x] Metadata dinamis, OpenGraph, dan Twitter Card
- [x] Generator dynamic sitemap di `src/app/sitemap.ts` (mencakup seluruh jobs, 10 kab/kota NTB, kategori)
- [x] File `src/app/robots.ts` mengarahkan crawler ke sitemap.xml dan memproteksi rute privat
- [x] Optimasi performa gambar via `next/image` dengan domain remote SumoPod Storage, Clerk, dan Google di `next.config.ts`
- [x] Penggantian raw `<img>` menjadi `<Image>` pada seluruh kartu lowongan dan header detail
- [x] Suite pengujian end-to-end programatik di `scripts/verify-e2e-flow.ts` (sukses 100%)
- [x] Audit Keamanan & Strict Rules:
  - [x] Nol penggunaan `any` di seluruh codebase TypeScript
  - [x] Validasi input Zod schema pada seluruh Server Actions
  - [x] Build produksi: `bun run build` lolos tanpa error
  - [x] Formatting: `bun run format:check` lolos tanpa error
