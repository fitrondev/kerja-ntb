# 📋 KERJANTB — TASKLIST PENGERJAAN & SPRINT TRACKER

> **Status Proyek:** 🟡 In Active Development  
> **Target Rilis:** Q2 2026  
> **Tech Stack:** Next.js 16 (App Router) + React 19 + Bun 1.3 + MySQL (SumoPod) + Prisma 7 + SumoPod S3 + Clerk Auth + shadcn/ui (Tailwind v4 OKLCH)

---

## 📊 Ringkasan Progres Keseluruhan

| Fase        | Nama Modul / Fitur                                   |       Status        | Progress | Target Utama                                   |
| :---------- | :--------------------------------------------------- | :-----------------: | :------: | :--------------------------------------------- |
| **Fase 1**  | Inisialisasi Proyek, Database SumoPod & Prisma ORM   |  🟢 Selesai (95%)   |   95%    | Schema Prisma, Client Gen, DB Push             |
| **Fase 2**  | Design System, Layout Publik & Primitif UI (shadcn)  | 🟡 Dalam Pengerjaan |   60%    | 61 UI Components, Navbar, Footer NTB           |
| **Fase 3**  | Data Seeding (10 Daerah NTB & 12 Kategori Pekerjaan) |  🟡 Siap Eksekusi   |   70%    | Seed script dibuat, tinggal push & seed        |
| **Fase 4**  | Halaman Publik & Job Search Engine (`/jobs`)         |  ⚪ Belum Dimulai   |    0%    | Homepage Hero, Filter Multifaset, Detail Loker |
| **Fase 5**  | Autentikasi Clerk, Webhook Sync & RBAC Guard         |     🟡 Sebagian     |   30%    | Sign-in/Sign-up routes, Webhook sync MySQL     |
| **Fase 6**  | Dashboard Pencari Kerja & Resume Builder (Multi-CV)  |  ⚪ Belum Dimulai   |    0%    | ATS Profil, Lamaran Saya, Loker Tersimpan      |
| **Fase 7**  | Dashboard Perusahaan, Job Posting Wizard & NIB       |  ⚪ Belum Dimulai   |    0%    | Multi-step Form, Verifikasi NIB, ATS Pelamar   |
| **Fase 8**  | Integrasi SumoPod Object Storage (S3 API)            |  ⚪ Belum Dimulai   |    0%    | Presigned S3 Upload, Logo, CV, Dokumen NIB     |
| **Fase 9**  | Dashboard Superadmin & Moderasi Lowongan             |  ⚪ Belum Dimulai   |    0%    | Antrean Verifikasi Loker & NIB, Audit Log      |
| **Fase 10** | SEO Google Jobs (JSON-LD), Audit & Optimasi          |  ⚪ Belum Dimulai   |    0%    | Schema.org, Dynamic Sitemap, Production Build  |

---

## 🛠️ Detail Rincian Task per Fase

### Fase 1: Setup Lingkungan & Database SumoPod MySQL

- [x] Inisialisasi Next.js 16 dengan Bun runtime dan TypeScript strict mode
- [x] Konfigurasi Tailwind CSS v4 dengan variabel warna OKLCH di `src/app/globals.css`
- [x] Konfigurasi koneksi MySQL SumoPod di `.env` (`DATABASE_URL`)
- [x] Pembuatan skema relasional Prisma komprehensif di `prisma/schema.prisma`:
  - [x] Enum: `UserRole`, `JobType`, `WorkplaceType`, `ApplicationStatus`, `VerificationStatus`, dll.
  - [x] Model User, Account, Session, VerificationToken (NextAuth/Clerk compat)
  - [x] Model Profile, CompanyProfile, CompanyVerification (NIB)
  - [x] Model JobPosting, JobCategory, Location, JobApplication, JobSave
  - [x] Model Resume, ResumeEducation, ResumeExperience, ResumeSkill
  - [x] Model AuditLog, Report, Notification
- [x] Konfigurasi `prisma7.config.ts` untuk Prisma 7
- [x] Singleton Prisma Client di `src/lib/db/prisma.ts`
- [x] Generate Prisma Client (`bunx prisma generate`)
- [ ] **Push Skema ke SumoPod MySQL** (`bunx prisma db push`)
  > _Catatan:_ Gunakan `db push` karena user MySQL SumoPod tidak memiliki hak `CREATE DATABASE` untuk shadow database migrasi.

---

### Fase 2: Design System, Layout Publik & Primitif UI

- [x] Setup tema OKLCH semantic tokens (Primary, Secondary, Accent, Chart, Sidebar)
- [x] Pasang Providers global di `src/components/providers.tsx` (`ThemeProvider`, `TooltipProvider`, `Sonner Toaster`)
- [x] Instalasi komponen shadcn/ui radix-nova (Button, Input, Card, Badge, Dialog, Select, Dropdown, Table, Sheet, Sidebar, dll.)
- [ ] **Navbar Publik (`src/components/layout/navbar.tsx`)**:
  - [ ] Brand Logo KerjaNTB dengan badge wilayah "NTB"
  - [ ] Navigasi: Cari Lowongan, Perusahaan, Kategori, Tentang Kami
  - [ ] Action buttons: Theme Toggle, Masuk / Daftar (Clerk UserButton jika logged in)
  - [ ] Mobile responsive navigation drawer (Sheet)
- [ ] **Footer Publik (`src/components/layout/footer.tsx`)**:
  - [ ] Daftar link cepat ke 10 Kabupaten/Kota se-NTB
  - [ ] Tautan kategori populer di NTB (Pariwisata, Pertambangan, IT, dll.)
  - [ ] Legal disclaimer, copyright, dan kontak Disnakertrans/Layanan Pengaduan

---

### Fase 3: Data Seeding 10 Kabupaten/Kota NTB & Kategori

- [x] Buat script `prisma/seed.ts`
  - [x] 10 Daerah resmi NTB (Kota Mataram, Lombok Barat, Tengah, Timur, Utara, Sumbawa, Sumbawa Barat, Dompu, Bima, Kota Bima)
  - [x] 12 Kategori lowongan kerja lokal
- [ ] Tambahkan data dummy ke `seed.ts` untuk preview:
  - [ ] 2 Akun Perusahaan demo (misal: "PT Amman Mineral Nusa Tenggara", "Lombok Beach Resort")
  - [ ] 5-8 Contoh lowongan kerja aktif bervariasi lokasi & kategori
- [ ] Eksekusi seeding: `bun run prisma/seed.ts`
- [ ] Verifikasi data tersimpan via Prisma Studio (`bunx prisma studio`)

---

### Fase 4: Halaman Publik & Job Search Engine (`/jobs`)

- [ ] **Homepage (`src/app/(root)/page.tsx`)**:
  - [ ] Hero Section: Headline dampak lokal NTB + Quick Search bar (Kata Kunci + Dropdown 10 Wilayah NTB)
  - [ ] Badge Trust: "Platform Resmi Lowongan Terverifikasi NTB — Bebas Penipuan"
  - [ ] Grid Kategori Populer (Card dengan icon Lucide + jumlah loker aktif)
  - [ ] Section "Lowongan Terbaru di NTB" (Grid 6 loker teranyar)
  - [ ] Banner CTA untuk Pemberi Kerja / Perusahaan NTB
- [ ] **Halaman Pencarian Lowongan (`src/app/(root)/jobs/page.tsx`)**:
  - [ ] Search & Multi-facet Filter bar:
    - [ ] Keyword (q)
    - [ ] Wilayah (10 Kabupaten/Kota NTB)
    - [ ] Tipe Pekerjaan (Full-time, Part-time, Kontrak, Magang, Freelance)
    - [ ] Workplace Type (On-site, Hybrid, Remote)
    - [ ] Rentang Gaji (Min - Max IDR)
    - [ ] Tingkat Pendidikan & Pengalaman
  - [ ] Server Component data fetching dengan Prisma & pagination
  - [ ] Komponen `JobCard` (Logo perusahaan, badge Terverifikasi, gaji disembunyikan/tampil, lokasi, tag)
  - [ ] State kosong (Empty State) jika pencarian tidak ditemukan
- [ ] **Halaman Detail Lowongan (`src/app/(root)/jobs/[slug]/page.tsx`)**:
  - [ ] Header: Judul, Nama Perusahaan, Status Verifikasi NIB, Tanggal Tayang
  - [ ] Detail gaji, tipe kontrak, lokasi kantor di NTB, minimal pendidikan
  - [ ] Deskripsi lengkap & kualifikasi pekerjaan (Rich Text / Markdown render)
  - [ ] Sidebar CTA: Tombol "Lamar Sekarang", "Simpan Lowongan", "Bagikan"
  - [ ] Tombol "Laporkan Lowongan Mencurigakan" (Anti-penipuan)
  - [ ] Card Profil Perusahaan singkat + tautan loker lain dari perusahaan yang sama

---

### Fase 5: Autentikasi Clerk, Webhook Sync & Role RBAC

- [x] Route autentikasi Clerk (`/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]`)
- [x] Konfigurasi tipe global JWT Session Claims (`types/globals.d.ts` & `src/types/globals.d.ts`)
- [x] Helper Otorisasi & Guards RBAC (`src/lib/auth/rbac.ts`):
  - [x] `isAdminRole(role)`
  - [x] `checkRole(allowedRoles)`
  - [x] `requireRole(allowedRoles, redirectTo)`
- [x] Panel Manajemen Role Pengguna RBAC (`/admin`):
  - [x] Server Action ubah & hapus role (`src/app/admin/_actions.ts`)
  - [x] Komponen pencarian pengguna (`src/app/admin/SearchUsers.tsx`)
  - [x] Halaman dashboard proteksi Admin (`src/app/admin/page.tsx`)
- [x] **Clerk Webhook Handler (`src/app/api/webhooks/route.ts` & `/api/webhooks/clerk`)**:
  - [x] Validasi signature webhook via `@clerk/nextjs/webhooks` / `svix` (`CLERK_WEBHOOK_SIGNING_SECRET`)
  - [x] Event `user.created`: Sinkronisasi otomatis ke tabel `User` & `Profile` MySQL (default role: `INDIVIDUAL`)
  - [x] Event `user.updated`: Update nama, avatar URL, email, dan metadata role
  - [x] Event `user.deleted`: Deaktivasi akun (`DEACTIVATED`) di MySQL
- [x] Helper sinkronisasi profil user aktif ke database MySQL (`getCurrentUser()`) dengan auto-sync fallback
- [ ] Role Selection onboarding: Modal/Halaman bagi user baru untuk memilih apakah Pencari Kerja atau Perusahaan

---

### Fase 6: Dashboard Pencari Kerja (`/dashboard`)

- [x] Setup layout dashboard dengan `AppSidebar` di `src/app/(dashboard)/layout.tsx`
- [ ] **Overview Pencari Kerja (`/dashboard`)**:
  - [ ] Kartu metrik: Jumlah Lamaran Terkirim, Diproses, Wawancara, Ditolak
  - [ ] Tabel status lamaran terbaru dengan badge status real-time
  - [ ] Daftar lowongan yang disimpan (Bookmarked Jobs)
- [ ] **Profil & Resume Builder (`/dashboard/resume`)**:
  - [ ] Form data pribadi (Headline, Ringkasan, Kontak, Nomor WA)
  - [ ] Sub-form Riwayat Pendidikan (Sekolah/Universitas, Gelar, Tahun)
  - [ ] Sub-form Pengalaman Kerja (Perusahaan, Posisi, Deskripsi)
  - [ ] Tag Keahlian / Skills input
  - [ ] Opsi Upload File CV PDF langsung (tersambung ke SumoPod Storage)
- [ ] **Modal Lamar Pekerjaan**:
  - [ ] Pilihan CV: Gunakan Resume Profil atau Upload CV khusus
  - [ ] Textarea Cover Letter / Catatan untuk HR
  - [ ] Server Action kirim lamaran & validasi duplikasi lamaran

---

### Fase 7: Dashboard Perusahaan (`/employer`)

- [ ] **Setup Halaman & Guard Perusahaan (`/employer`)**:
  - [ ] Cek status profil perusahaan: Jika belum lengkap, redirect ke onboarding form
- [ ] **Profil Perusahaan & Pengajuan Verifikasi NIB (`/employer/verification`)**:
  - [ ] Input NIB (Nomor Induk Berusaha), Nama Legalitas PT/CV/Usaha
  - [ ] Upload scan dokumen NIB / SIUP ke folder privat SumoPod S3
  - [ ] Status badge verifikasi: `PENDING_REVIEW`, `VERIFIED`, `REJECTED`
- [ ] **Wizard Pembuatan Lowongan Kerja Multi-Step (`/employer/jobs/create`)**:
  - [ ] Step 1: Judul Posisi, Kategori, Wilayah NTB, Workplace Type
  - [ ] Step 2: Rentang Gaji (IDR) & Kebijakan Tampilkan Gaji
  - [ ] Step 3: Deskripsi Pekerjaan, Tanggung Jawab
  - [ ] Step 4: Persyaratan Kualifikasi & Pendidikan Minimal
  - [ ] Step 5: Tipe Pelamaran (Melalui Portal KerjaNTB / Email / Link Luar)
  - [ ] Step 6: Review & Submit
  - [ ] _Business Logic:_ Jika perusahaan sudah `VERIFIED`, status otomatis `PUBLISHED`. Jika belum, masuk antrean `PENDING_REVIEW`.
- [ ] **Manajemen Lowongan (`/employer/jobs`)**:
  - [ ] Daftar loker aktif, draft, ditutup
  - [ ] Tombol edit, pause/tutup lowongan, duplikat
- [ ] **Applicant Tracking System Sederhana (`/employer/jobs/[id]/applicants`)**:
  - [ ] Daftar pelamar per lowongan
  - [ ] Preview CV pelamar / download dokumen
  - [ ] Update status lamaran: `REVIEWED`, `SHORTLISTED`, `INTERVIEWED`, `REJECTED`, `ACCEPTED`
  - [ ] Kirim catatan balasan / feedback

---

### Fase 8: Integrasi SumoPod Object Storage (S3 API)

- [ ] Client S3 SumoPod di `src/lib/storage/s3.ts` menggunakan `@aws-sdk/client-s3`
- [ ] Endpoint / Server Action Presigned URL di `src/actions/storage.ts`:
  - [ ] Generate presigned PUT URL untuk upload langsung dari browser (tanpa beban server Next.js)
  - [ ] Generate presigned GET URL untuk file privat (dokumen legalitas NIB & CV pelamar)
- [ ] Integrasi upload:
  - [ ] Upload Avatar User (Folder public: `avatars/`)
  - [ ] Upload Logo Perusahaan (Folder public: `logos/`)
  - [ ] Upload CV Pelamar PDF (Folder private: `resumes/`)
  - [ ] Upload Berkas NIB Perusahaan (Folder private: `verifications/`)

---

### Fase 9: Dashboard Superadmin & Moderasi (`/admin`)

- [ ] Layout khusus Admin dengan proteksi ketat `UserRole.SUPERADMIN`
- [ ] **Overview Admin (`/admin`)**:
  - [ ] Statistik total pengguna, lowongan aktif, perusahaan terdaftar, loker pending
- [ ] **Antrean Moderasi Lowongan (`/admin/jobs/pending`)**:
  - [ ] List lowongan baru dari perusahaan belum terverifikasi
  - [ ] Aksi: Setujui (`PUBLISHED`) atau Tolak (`REJECTED` dengan alasan wajib)
  - [ ] Catat aksi ke tabel `AuditLog`
- [ ] **Antrean Verifikasi Perusahaan (`/admin/verifications`)**:
  - [ ] Periksa nomor NIB dan dokumen legalitas via signed URL S3
  - [ ] Aksi: Berikan Centang Terverifikasi (`VERIFIED`) atau Tolak (`REJECTED`)
- [ ] **Pusat Pengaduan & Laporan (`/admin/reports`)**:
  - [ ] Daftar laporan penipuan loker dari masyarakat
  - [ ] Aksi: Suspend Akun, Take-down Lowongan, atau Tandai Selesai

---

### Fase 10: SEO Google Jobs, Performance & Launch Readiness

- [ ] Metadata dinamis & OpenGraph tags di setiap halaman
- [ ] JSON-LD Structured Data Schema.org `JobPosting` di `/jobs/[slug]` (agar lowongan otomatis terindeks di Google for Jobs Indonesia)
- [ ] Generator `sitemap.ts` dinamis:
  - [ ] Seluruh lowongan berstatus `PUBLISHED`
  - [ ] Halaman kategori & 10 Kabupaten/Kota NTB
- [ ] Audit Keamanan & Strict Rules:
  - [ ] Pastikan tidak ada `any` di codebase TypeScript
  - [ ] Validasi seluruh input form via Zod schema
  - [ ] Uji performa build: `bun run build`
  - [ ] Uji formatting: `bun run format:check`

---

## 💻 Panduan Perintah Eksekusi Harian

```bash
# 1. Menjalankan server dev lokal
bun run dev

# 2. Sinkronisasi perubahan schema Prisma ke SumoPod DB (Gunakan ini, BUKAN prisma migrate)
bunx prisma db push

# 3. Generate ulang Prisma client setelah ubah schema
bunx prisma generate

# 4. Jalankan seeding data awal (10 Daerah & Kategori)
bun run prisma/seed.ts

# 5. Cek data database via browser
bunx prisma studio

# 6. Jalankan pengecekan TypeScript & Build produksi
bun run build

# 7. Format kode otomatis sesuai standar Prettier
bun run format
```

---

## 📌 Catatan Teknis Penting

1. **Kenapa `bunx prisma db push` bukan `migrate dev`?**
   User database MySQL di SumoPod tidak diberi privilege `CREATE DATABASE`, sehingga Prisma gagal membuat shadow database. `prisma db push` langsung menyesuaikan tabel target tanpa shadow DB.
2. **Next.js 16 Breaking Changes:**
   `params` dan `searchParams` pada `page.tsx` wajib di-`await` sebagai `Promise`.
3. **No Binary in DB:**
   Seluruh file gambar dan PDF wajib melalui direct upload presigned URL ke SumoPod S3. Database hanya menyimpan URL/Object Key.
