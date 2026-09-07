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

### Fase 1: Setup Lingkungan & Database SumoPod MySQL

- **Tugas Utama:**
  1. Jalankan script `./skill.sh` untuk menginstal seluruh dependency.
  2. Buat file `prisma/schema.prisma` sesuai dengan `docs/database-schema.md`.
  3. Konfigurasi connection string MySQL SumoPod di `.env`.
  4. Jalankan migrasi schema dan generate Prisma client.
- **Contoh Prompt Vibe Coding:**
  > _"Siapkan setup Prisma dengan provider MySQL untuk SumoPod sesuai dengan skema di `docs/database-schema.md`. Buat singleton Prisma client di `src/lib/db/prisma.ts` dan pastikan konfigurasi connection pooling bekerja secara aman."_

---

### Fase 2: Design System & Komponen UI (shadcn radix-nova & OKLCH Theme)

- **Tugas Utama:**
  1. _Status:_ shadcn/ui telah diinisialisasi via preset `b2BVBXALw` (`radix-nova`) dengan CSS variables OKLCH di `src/app/globals.css`.
  2. Tambahkan komponen UI shadcn yang dibutuhkan: `bunx --bun shadcn@latest add input select dialog card badge dropdown-menu tabs sheet separator skeleton avatar table`.
  3. Buat layout publik utama: `Navbar` (menggunakan `bg-background/80 backdrop-blur border-border`, tombol CTA `bg-primary text-primary-foreground`), `Footer` (dengan daftar 10 daerah NTB), dan `MobileNav` (Sheet).
- **Contoh Prompt Vibe Coding:**
  > _"Buat komponen Navbar dan Footer profesional untuk KerjaNTB menggunakan komponen shadcn/ui dan token warna OKLCH dari globals.css. Tampilkan logo KerjaNTB, navigasi (Lowongan, Perusahaan, Kategori, Wilayah NTB), serta tombol CTA Masuk dan Pasang Lowongan. Gunakan utility classes semantik seperti 'bg-primary text-primary-foreground', 'border-border', dan 'text-muted-foreground'. Pastikan 100% responsif dengan Mobile Drawer Sheet."_

---

### Fase 3: Data Seeding 10 Kabupaten/Kota NTB & Kategori

- **Tugas Utama:**
  1. Buat script `prisma/seed.ts` yang mengisi 10 entitas wilayah resmi NTB.
  2. Tambahkan minimal 12 kategori pekerjaan populer di NTB (Pariwisata/Hospitality, IT, Pertambangan, Perdagangan, Pendidikan, Kesehatan).
  3. Tambahkan beberapa dummy lowongan kerja dan perusahaan untuk keperluan preview.
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

### Fase 5: Autentikasi Clerk & Sinkronisasi Pengguna

- **Tugas Utama:**
  1. Konfigurasi Clerk Middleware untuk rute privat (`/dashboard`, `/employer`, `/admin`).
  2. Buat route handler `/api/webhooks/clerk` untuk menangkap event pendaftaran dan membuat record `User` di MySQL.
  3. Buat helper otorisasi `getCurrentUser()` dan `checkRole()`.
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

### Fase 7: Dashboard Perusahaan & Multi-Step Job Posting

- **Tugas Utama:**
  1. Dashboard `dashboard/employer` (statistik pelamar baru, lowongan aktif).
  2. Multi-step form pembuatan lowongan:
     - Step 1: Informasi Dasar
     - Step 2: Kompensasi Gaji
     - Step 3: Deskripsi & Tanggung Jawab
     - Step 4: Kualifikasi & Pendidikan
     - Step 5: Metode Lamaran
     - Step 6: Preview & Submit
  3. Logika Moderasi: Jika perusahaan berstatus `isVerified = true`, lowongan langsung `PUBLISHED`. Jika belum, masuk ke `PENDING_REVIEW`.
  4. Form pengajuan verifikasi NIB dan upload dokumen legalitas.
- **Contoh Prompt Vibe Coding:**
  > _"Bangun Multi-step wizard untuk pasang lowongan di `dashboard/employer/jobs/create`. Gunakan Zod untuk memvalidasi tiap langkah. Terapkan logika status otomatis: PUBLISHED untuk perusahaan terverifikasi dan PENDING_REVIEW untuk perusahaan baru."_

---

### Fase 8: Integrasi SumoPod Object Storage

- **Tugas Utama:**
  1. Buat utilitas S3 Client di `src/lib/storage/s3.ts`.
  2. Implementasikan helper presigned upload URL di `src/lib/storage/upload.ts`.
  3. Hubungkan komponen upload avatar, logo perusahaan, dan berkas CV ke SumoPod S3.
- **Contoh Prompt Vibe Coding:**
  > _"Integrasikan SumoPod Object Storage menggunakan `@aws-sdk/client-s3`. Buat Server Action yang menghasilkan presigned PUT URL untuk upload file resume PDF langsung dari browser dan simpan path file ke database."_

---

### Fase 9: Dashboard Superadmin & Moderasi

- **Tugas Utama:**
  1. Halaman `/dashboard` dengan metrik jumlah lowongan pending, verifikasi pending, dan laporan baru.
  2. Daftar review lowongan: Tombol Approve dan Reject (modal input alasan penolakan wajib).
  3. Review verifikasi perusahaan: Verifikasi NIB dan preview dokumen legalitas privat via signed URL.
  4. Manajemen laporan (Reports): Tindakan pause/remove job atau suspend user.
  5. Pencatatan Audit Log pada setiap aksi admin.
- **Contoh Prompt Vibe Coding:**
  > _"Bangun halaman antrean moderasi lowongan di `dashboard/jobs/pending`. Buat tombol Approve dan Reject dengan konfirmasi dialog. Simpan setiap aksi admin ke dalam tabel `AuditLog` di MySQL."_

---

### Fase 10: SEO Google Jobs, Performance & Launch Prep

- **Tugas Utama:**
  1. Injeksi JSON-LD `JobPosting` pada setiap halaman lowongan.
  2. Buat dynamic sitemap di `src/app/sitemap.ts` (mencakup seluruh jobs, categories, dan 10 locations NTB).
  3. Optimasi performa gambar via `next/image` dengan domain remote SumoPod Storage.
  4. Pengujian end-to-end skenario pelamaran kerja dan moderasi.
- **Contoh Prompt Vibe Coding:**
  > _"Buat script JSON-LD terstruktur sesuai standar Schema.org/JobPosting di halaman `/jobs/[slug]`. Buat pula generator `sitemap.ts` dinamis yang memetakan seluruh lowongan aktif dan halaman 10 kabupaten/kota NTB."_
