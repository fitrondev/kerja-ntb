# KERJANTB — STEP-BY-STEP IMPLEMENTATION ROADMAP & VIBE PROMPTS

**Tujuan:** Panduan langkah demi langkah (sprint roadmap) yang dirancang khusus untuk eksekusi terstruktur menggunakan AI Coding Assistant / Vibe Coding.

---

## Ringkasan Fase Pengerjaan

```
Fase 1: Setup Lingkungan, SumoPod MySQL & Clerk
  ↓
Fase 2: Design System, Brand Theme & Komponen Primitif
  ↓
Fase 3: Seeding Data 10 Kabupaten/Kota NTB & Kategori Pekerjaan
  ↓
Fase 4: Halaman Publik (Homepage, Search Engine /jobs, & Detail Lowongan)
  ↓
Fase 5: Autentikasi Clerk, Webhook Sync & Role RBAC
  ↓
Fase 6: Dashboard Pencari Kerja & Resume Builder (Multi-CV)
  ↓
Fase 7: Dashboard Perusahaan, Job Posting Wizard & Verifikasi NIB
  ↓
Fase 8: Integrasi SumoPod Object Storage (Upload File & Signed URLs)
  ↓
Fase 9: Dashboard Superadmin, Moderasi Lowongan & Penanganan Laporan
  ↓
Fase 10: SEO Google Jobs (JSON-LD), Audit Log & Production Optimization
```

---

## Detail Fase & Prompt Vibe Coding Siap Pakai

### Fase 1: Setup Lingkungan & Database SumoPod MySQL [SELESAI - ✅]

- **Tugas Utama:**
  1. [x] Jalankan script `./skill.sh` untuk menginstal seluruh dependency.
  2. [x] Buat file `prisma/schema.prisma` sesuai dengan `docs/database-schema.md`.
  3. [x] Konfigurasi connection string MySQL SumoPod di `.env`.
  4. [x] Jalankan migrasi schema dan generate Prisma client.
- **Contoh Prompt Vibe Coding:**
  > _"Siapkan setup Prisma dengan provider MySQL untuk SumoPod sesuai dengan skema di `docs/database-schema.md`. Buat singleton Prisma client di `src/lib/db/prisma.ts` dan pastikan konfigurasi connection pooling bekerja secara aman."_

---

### Fase 2: Design System & Komponen UI (shadcn radix-nova & OKLCH Theme) [SELESAI - ✅]

- **Tugas Utama:**
  1. [x] _Status:_ shadcn/ui telah diinisialisasi via preset `b2BVBXALw` (`radix-nova`) dengan CSS variables OKLCH di `src/app/globals.css`.
  2. [x] Tambahkan komponen UI shadcn yang dibutuhkan: `input select dialog card badge dropdown-menu tabs sheet separator skeleton avatar table`.
  3. [x] Buat layout publik utama: `Navbar` (menggunakan `bg-background/80 backdrop-blur border-border`, tombol CTA `bg-primary text-primary-foreground`), `Footer` (dengan daftar 10 daerah NTB), dan `MobileNav` (Sheet).
- **Contoh Prompt Vibe Coding:**
  > _"Buat komponen Navbar dan Footer profesional untuk KerjaNTB menggunakan komponen shadcn/ui dan token warna OKLCH dari globals.css. Tampilkan logo KerjaNTB, navigasi (Lowongan, Perusahaan, Kategori, Wilayah NTB), serta tombol CTA Masuk dan Pasang Lowongan. Gunakan utility classes semantik seperti 'bg-primary text-primary-foreground', 'border-border', dan 'text-muted-foreground'. Pastikan 100% responsif dengan Mobile Drawer Sheet."_

---

### Fase 3: Data Seeding 10 Kabupaten/Kota NTB & Kategori [SELESAI - ✅]

- **Tugas Utama:**
  1. [x] Buat script `prisma/seed.ts` yang mengisi 10 entitas wilayah resmi NTB.
  2. [x] Tambahkan minimal 12 kategori pekerjaan populer di NTB (Pariwisata/Hospitality, IT, Pertambangan, Perdagangan, Pendidikan, Kesehatan).
  3. [x] Tambahkan beberapa dummy lowongan kerja dan perusahaan untuk keperluan preview. Hubungkan script ke `package.json` (`bun run db:seed`).
- **Contoh Prompt Vibe Coding:**
  > _"Buat script seeding database di `prisma/seed.ts` yang menginputkan seluruh 10 Kabupaten/Kota di NTB dan 12 kategori lowongan kerja. Hubungkan script ke `package.json` agar dapat dijalankan via `bun run db:seed`."_

---

### Fase 4: Halaman Publik & Job Search Engine (`/loker`) [SELESAI - ✅]

- **Status:** Selesai (Diadaptasi ke rute lokalisasi `/loker`)
- **Tugas Utama:**
  1. [x] **Hero Section di Homepage**: Input pencarian instan (kata kunci `q` & dropdown 10 Kab/Kota NTB terhubung langsung ke database via Prisma).
  2. [x] **Halaman `/loker` dengan URL-driven filter state**: Filter multifaset (`?q=&location=&type=&category=&workplace=&education=&salaryMin=&page=`), `ActiveFilterPills`, dan pagination responsif.
  3. [x] **Komponen `JobCard` modern**: Logo perusahaan, inisial fallback, badge Verified NIB, judul, nama perusahaan, gaji (IDR/dirahasiakan), tag lokasi NTB, tipe kerja, tag keahlian, dan tombol quick bookmark/simpan lowongan.
  4. [x] **Halaman detail `/loker/[slug]`**: Informasi deskripsi, tanggung jawab, syarat, benefit, keahlian, JSON-LD Schema.org JobPosting untuk Google Jobs, tombol Lamar Sekarang, tombol Simpan Lowongan interaktif (dengan fallback lokal & sinkronisasi DB), serta modal dialog Laporkan Lowongan (anti-penipuan & pungutan biaya terintegrasi ke Server Action dan tabel `Report`).
- **Contoh Prompt Vibe Coding:**
  > _"Bangun halaman `/loker` dengan fitur pencarian dan filter multifaset. Buat Server Component yang mengambil data lowongan aktif dari MySQL via Prisma dengan pagination, serta Client Component untuk kontrol filter interaktif."_

---

### Fase 5: Autentikasi Clerk & Sinkronisasi Pengguna [SELESAI - ✅]

- **Tugas Utama:**
  1. [x] Konfigurasi Clerk Middleware untuk rute privat (`/dashboard`, `/dashboard/employer`, `/dashboard/admin`).
  2. [x] Buat route handler `/api/webhooks/clerk` untuk menangkap event pendaftaran dan membuat record `User` di MySQL.
  3. [x] Buat helper otorisasi `getCurrentUser()` dan `checkRole()`.
- **Contoh Prompt Vibe Coding:**
  > _"Implementasikan Route Handler webhook Clerk di `/api/webhooks/clerk` menggunakan library `svix`. Simpan pengguna baru ke tabel `User` di MySQL dan berikan role `INDIVIDUAL` secara default."_

---

### Fase 6: Dashboard Pencari Kerja & Resume Builder [SELESAI - ✅]

- **Status:** Selesai (Rute terpadu `/dashboard/user`)
- **Tugas Utama:**
  1. [x] **Dashboard `/dashboard/user`**: Ringkasan metrik (lamaran terkirim, proses seleksi aktif, loker tersimpan, resume tersimpan), daftar lamaran terkini, dan pintasan lowongan tersimpan.
  2. [x] **Fitur Profil Pelamar (`/dashboard/user/profile`)**: Foto profil via SumoPod Object Storage S3, nama lengkap, kontak WhatsApp, domisili 10 Kab/Kota NTB, alamat lengkap, bio, tanggal lahir, gender, dan portofolio (Website, LinkedIn, GitHub). Didukung Server Action `updateUserProfileAction`.
  3. [x] **Resume Builder (`/dashboard/user/resume`)**: Penyusunan CV terstruktur dengan riwayat pendidikan, pengalaman kerja, ringkasan profesional, upload berkas CV PDF langsung ke SumoPod S3, serta pengelolaan multi-CV dan penetapan CV default. Didukung Server Actions `saveResumeAction`, `deleteResumeAction`, `setDefaultResumeAction`.
  4. [x] **Pelacak Lamaran & Loker Tersimpan (`/dashboard/user/applications` & `/dashboard/user/saved`)**: Tracking status lamaran dengan badge status visual (`APPLIED`, `REVIEWING`, `SHORTLISTED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`), aksi pembatalan lamaran (`withdrawJobApplicationAction`), dan manajemen daftar favorit loker.
  5. [x] **Alur Pelamaran Modal (`JobApplyModal`)**: Dialog pelamaran terintegrasi di `/loker/[slug]`, memungkinkan pemilihan CV dari Resume Builder atau upload file PDF baru, penulisan cover letter, dan pengiriman lamaran ke MySQL via `submitJobApplicationAction`.
- **Contoh Prompt Vibe Coding:**
  > _"Buat modul Resume Builder di `/dashboard/user/resume` yang memungkinkan pelamar menyusun informasi riwayat pendidikan, pengalaman kerja, dan keterampilan, serta menyimpan perubahan ke database MySQL via Server Action."_

---

### Fase 7: Dashboard Perusahaan & Multi-Step Job Posting [SELESAI - ✅]

- **Status:** Selesai (Rute terpadu `/dashboard/employer`, `/dashboard/loker/baru`, `/dashboard/company`, `/dashboard/verification`, `/dashboard/employer/pelamar`)
- **Tugas Utama:**
  1. [x] **Dashboard `/dashboard/employer` & Manajemen Loker (`/dashboard/employer/loker`)**: Statistik lowongan aktif, pelamar baru, tabel filter loker dengan pause/publish/close status switch, delete modal, dan rute edit (`/dashboard/employer/loker/[id]/edit`).
  2. [x] **Multi-Step Job Posting Wizard (`/dashboard/loker/baru` & `/dashboard/employer/jobs/create`)**:
     - Step 1: Informasi Dasar (Judul, Kategori, 10 Kab/Kota NTB, Tipe Pekerjaan, Pengalaman)
     - Step 2: Kompensasi Gaji (UMP NTB 2026 check/banner, Min/Max/Tampilkan Gaji)
     - Step 3: Deskripsi & Fasilitas/Benefit
     - Step 4: Kualifikasi & Tag Keterampilan
     - Step 5: Metode Lamaran (Internal Platform vs External Link/Email) & Batas Waktu
     - Step 6: Live Mockup Card Preview & Aksi Publikasi
  3. [x] **Logika Moderasi Otomatis**: Jika perusahaan berstatus `isVerified = true` (atau verifikasi APPROVED), lowongan otomatis diterbitkan sebagai `PUBLISHED`. Jika belum terverifikasi, status otomatis `PENDING_REVIEW` dengan banner notifikasi moderasi admin.
  4. [x] **Profil Perusahaan & Pengajuan Verifikasi NIB (`/dashboard/company` & `/dashboard/verification`)**: Form profil perusahaan dengan upload logo SumoPod S3, form verifikasi NIB 13-digit dengan upload dokumen izin usaha PDF/JPG, dan pelacak status verifikasi (Pending/Approved/Rejected).
  5. [x] **ATS Employer Pelamar (`/dashboard/employer/pelamar`)**: Filter lowongan, tab status pelamar, preview resume/CV, tautan cepat WhatsApp, dan modal evaluasi status (Undang Interview, Tolak dengan alasan, Terpilih, Catatan HR internal). Didukung Server Action `updateEmployerApplicationStatusAction`.
- **Contoh Prompt Vibe Coding:**
  > _"Bangun Multi-step wizard untuk pasang lowongan di `dashboard/employer/jobs/create`. Gunakan Zod untuk memvalidasi tiap langkah. Terapkan logika status otomatis: PUBLISHED untuk perusahaan terverifikasi dan PENDING_REVIEW untuk perusahaan baru."_

---

### Fase 8: Integrasi SumoPod Object Storage [SELESAI - ✅]

- **Tugas Utama:**
  1. [x] Buat utilitas S3 Client di `src/lib/storage/s3.ts`.
  2. [x] Implementasikan helper presigned upload URL di `src/lib/storage/upload.ts`.
  3. [x] Hubungkan komponen upload avatar, logo perusahaan, dan berkas CV ke SumoPod S3.
- **Contoh Prompt Vibe Coding:**
  > _"Integrasikan SumoPod Object Storage menggunakan `@aws-sdk/client-s3`. Buat Server Action yang menghasilkan presigned PUT URL untuk upload file resume PDF langsung dari browser dan simpan path file ke database."_

---

### Fase 9: Dashboard Superadmin & Moderasi [SELESAI - ✅]

- **Tugas Utama:**
  1. [x] Halaman `/dashboard` dengan metrik jumlah lowongan pending, verifikasi pending, dan laporan baru.
  2. [x] Daftar review lowongan: Tombol Approve dan Reject (modal input alasan penolakan wajib).
  3. [x] Review verifikasi perusahaan: Verifikasi NIB dan preview dokumen legalitas privat via signed URL.
  4. [x] Manajemen laporan (Reports): Tindakan pause/remove job atau suspend user.
  5. [x] Pencatatan Audit Log pada setiap aksi admin.
- **Contoh Prompt Vibe Coding:**
  > _"Bangun halaman antrean moderasi lowongan di `dashboard/jobs/pending`. Buat tombol Approve dan Reject dengan konfirmasi dialog. Simpan setiap aksi admin ke dalam tabel `AuditLog` di MySQL."_

---

### Fase 10: SEO Google Jobs, Performance & Launch Prep [SELESAI - ✅]

- **Tugas Utama:**
  1. [x] Injeksi JSON-LD `JobPosting` pada setiap halaman lowongan.
  2. [x] Buat dynamic sitemap di `src/app/sitemap.ts` (mencakup seluruh jobs, categories, dan 10 locations NTB).
  3. [x] Optimasi performa gambar via `next/image` dengan domain remote SumoPod Storage.
  4. [x] Pengujian end-to-end skenario pelamaran kerja dan moderasi.
- **Contoh Prompt Vibe Coding:**
  > _"Buat script JSON-LD terstruktur sesuai standar Schema.org/JobPosting di halaman `/jobs/[slug]`. Buat pula generator `sitemap.ts` dinamis yang memetakan seluruh lowongan aktif dan halaman 10 kabupaten/kota NTB."_
