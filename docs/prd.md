# KERJANTB — PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Versi:** 2.0 (SumoPod MySQL & Object Storage Architecture)  
**Terakhir Diperbarui:** 2026-09-06  
**Status:** Approved for Implementation  
**Cakupan Wilayah:** Nusa Tenggara Barat (10 Kabupaten & Kota)

---

## 1. Product Overview & Executive Summary

**KerjaNTB** adalah platform job portal modern dan terpercaya khusus wilayah **Nusa Tenggara Barat (NTB)** yang mempertemukan para pencari kerja (job seekers), perusahaan lokal maupun nasional (companies/employers), dan penyedia kerja perorangan (individuals).

**Tagline Resmi:**

> _"Temukan Peluang Kerja di NTB — Cepat, Terpercaya, dan Tanpa Biaya Calo"_

### Cakupan Wilayah (10 Daerah Tingkat II NTB):

1. **Kota Mataram** (Pusat Pemerintahan & Komersial)
2. **Kabupaten Lombok Barat**
3. **Kabupaten Lombok Tengah** (Kawasan KEK Mandalika & Bandara BIZAM)
4. **Kabupaten Lombok Timur**
5. **Kabupaten Lombok Utara** (Kawasan Tiga Gili & Pariwisata)
6. **Kabupaten Sumbawa**
7. **Kabupaten Sumbawa Barat** (Kawasan Pertambangan & Industri)
8. **Kabupaten Dompu**
9. **Kabupaten Bima**
10. **Kota Bima**

### Tujuan Utama (Goals & Objectives):

1. **Mempercepat Penyerapan Tenaga Kerja Lokal NTB**: Menghubungkan pencari kerja lokal (baik fresh graduate maupun tenaga berpengalaman) dengan peluang riil di seluruh penjuru NTB.
2. **Standar Keamanan Tinggi (Anti-Fraud)**: Mengeliminasi lowongan fiktif, penipuan tiket transportasi, dan pungutan liar melalui sistem moderasi ketat (Superadmin review) dan verifikasi legalitas perusahaan (NIB & dokumen resmi).
3. **Mendukung UMKM & Perorangan**: Memberikan kesempatan kepada UMKM atau individu di NTB untuk memasang lowongan kerja secara gratis dan aman melalui alur verifikasi.
4. **Sistem Terverifikasi (Verified Employer Badge)**: Memberikan insentif kredibilitas bagi perusahaan resmi untuk mempublikasikan lowongan dengan alur otomatis (auto-publish) setelah terverifikasi.

---

## 2. User Personas & Core Roles

Sistem menerapkan **Role-Based Access Control (RBAC)** berbasis database dengan 3 tipe peran:

```
                  ┌──────────────────────────────┐
                  │           KERJANTB           │
                  └──────────────┬───────────────┘
          ┌──────────────────────┼──────────────────────┐
          ↓                      ↓                      ↓
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ INDIVIDUAL/USER  │   │     COMPANY      │   │    SUPERADMIN    │
├──────────────────┤   ├──────────────────┤   ├──────────────────┤
│ • Cari Lowongan  │   │ • Pasang Loker   │   │ • Review Loker   │
│ • Buat CV/Resume │   │ • Kelola Pelamar │   │ • Verifikasi NIB │
│ • Apply Pekerjaan│   │ • Ajukan Verif   │   │ • Tangani Report │
│ • Post Loker (PM)│   │ • Terverifikasi/ │   │ • Audit & Konten │
│                  │   │   Belum          │   │                  │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

### 1. INDIVIDUAL / PENCARI KERJA

- Dapat mencari, menyaring, dan menyimpan lowongan pekerjaan.
- Membangun profil profesional dan beberapa versi resume/CV.
- Melamar pekerjaan dengan resume dan cover letter terpilih.
- Memantau status lamaran secara real-time.
- _Opsi Khusus:_ Dapat memasang lowongan pekerjaan perorangan (misal: asisten rumah tangga, staf toko pribadi), namun **wajib melalui moderasi Superadmin** sebelum tayang.

### 2. COMPANY / PEMBERI KERJA (EMPLOYER)

- Mendaftar profil perusahaan lengkap (nama, deskripsi, industri, alamat NTB, kontak, logo).
- Mengajukan verifikasi resmi dengan mengunggah NIB (Nomor Induk Berusaha) dan dokumen legalitas.
- **Company Belum Terverifikasi**: Lowongan wajib direview oleh Superadmin (`PENDING_REVIEW`).
- **Company Terverifikasi (Verified)**: Lowongan langsung terpublikasi (`PUBLISHED`) secara instan setelah lolos validasi otomatis kata kunci/konten terlarang.
- Mengelola pelamar kerja (status: Applied, Reviewing, Shortlisted, Interview, Accepted, Rejected).

### 3. SUPERADMIN / MODERATOR

- Memiliki kontrol penuh atas platform via `/admin`.
- Melakukan review, persetujuan (Approve), penolakan (Reject dengan alasan tertulis), atau pembekuan (Pause/Remove) lowongan kerja.
- Memverifikasi berkas legalitas perusahaan (NIB/akta).
- Menindaklanjuti laporan pengguna (Report fraud, lowongan fiktif, permintaan uang).
- Memantau Audit Log atas setiap mutasi sensitif di sistem.
- Mengelola kategori lowongan, wilayah NTB, artikel blog edukasi karir, dan FAQ.

---

## 3. Technology Stack & SumoPod Infrastructure

Arsitektur sistem dibangun di atas fondasi performa tinggi, full-stack Next.js 16, database relasional **MySQL di SumoPod**, dan **SumoPod Object Storage** berbasis protokol S3.

| Komponen           | Teknologi Terpilih                                | Catatan Implementasi                                                                                     |
| :----------------- | :------------------------------------------------ | :------------------------------------------------------------------------------------------------------- |
| **Framework**      | Next.js 16+ (App Router)                          | Server Components, Server Actions, Route Handlers                                                        |
| **Bahasa**         | TypeScript (Strict Mode)                          | Zero `any` policy, strongly typed end-to-end                                                             |
| **Runtime & PM**   | Bun 1.3+ / Node.js 20+                            | Package manager cepat & kompatibilitas penuh                                                             |
| **UI Library**     | React 19 + shadcn/ui                              | Komponen modular, accessible (Radix UI), moderen                                                         |
| **Styling**        | Tailwind CSS v4 + shadcn/ui (`radix-nova` preset) | CSS Variables (OKLCH), Primary: `oklch(0.488 0.243 264.376)`, Accent/Chart: `oklch(0.845 0.143 164.978)` |
| **Database**       | **MySQL di SumoPod**                              | Relational DB, foreign keys, cascade, ACID transaction                                                   |
| **ORM**            | **Prisma ORM** (`mysql`)                          | Connection pool terkelola, type-safe queries, migration                                                  |
| **Object Storage** | **SumoPod Object Storage**                        | S3-Compatible API via `@aws-sdk/client-s3`                                                               |
| **Autentikasi**    | **Clerk Authentication**                          | Email/password, Google OAuth, Webhook sync ke DB                                                         |
| **Validasi Skema** | Zod v3                                            | Validasi ganda (Client-side & Server Actions)                                                            |
| **SEO & Schema**   | Next.js Metadata + JSON-LD                        | Standard Schema.org `JobPosting` untuk Google Jobs                                                       |

---

## 4. SumoPod Infrastructure & Integration Spec

### 4.1 Database: SumoPod MySQL

- Terhubung via connection string standar MySQL:
  `mysql://<USER>:<PASSWORD>@<SUMOPOD_HOST>:<PORT>/<DATABASE>?sslmode=require`
- Dikelola dengan Prisma ORM (`provider = "mysql"`).
- Strategi Indexing:
  - Composite Index pada tabel `Job`: `(status, locationId, categoryId)`, `(slug)`, `(salaryMin, salaryMax)`.
  - Composite Index pada tabel `Company`: `(slug)`, `(isVerified)`.
  - Foreign keys dengan `onDelete: Cascade` untuk relasi pemilik profil dan riwayat.

### 4.2 Object Storage: SumoPod S3-Compatible

- Protokol: AWS S3 Compatible API.
- File-file yang disimpan:
  1. **Public Assets (Akses Publik Langsung)**:
     - Avatar Pengguna (`/avatars/`)
     - Logo Perusahaan (`/logos/`)
     - Gambar Cover Blog (`/blog/`)
  2. **Private Assets (Presigned URL / Authenticated Route)**:
     - Dokumen CV & Resume Pelamar (`/resumes/`) — Max 5MB (PDF/DOCX)
     - Dokumen Verifikasi NIB & Legalitas (`/verifications/`) — Max 10MB (PDF/JPG/PNG)
- Keamanan Storage: Validasi magic byte / MIME type di sisi server, penamaan hash UUID agar tidak terjadi path traversal.

---

## 5. Design System & UI/UX Guidelines (shadcn Radix Nova & OKLCH Theme)

Desain mengusung estetika startup karir berkelas dunia yang bersih, profesional, terpercaya, dan bebas dari clutter marketplace, diimplementasikan menggunakan **shadcn/ui preset `radix-nova`** dan sistem warna **OKLCH** di `src/app/globals.css`.

### Sistem Warna & Token Semantik (OKLCH Color Space):

- **Primary Brand Token (`--primary`):**
  - Light Mode: `oklch(0.488 0.243 264.376)` (Modern Electric Cobalt Blue)
  - Dark Mode: `oklch(0.424 0.199 265.638)`
  - Foreground (`--primary-foreground`): `oklch(0.97 0.014 254.604)`
  - _Fungsi:_ Tombol CTA utama (Lamar Sekarang, Pasang Loker), badge status primer, dan link navigasi aktif.
- **NTB Trust / Verified & Charts Token (`--chart-1`):**
  - Nilai: `oklch(0.845 0.143 164.978)` (Vibrant Emerald / Mint Green — Hue 165°)
  - Charts 2–5: Gradasi teal-emerald (`oklch(0.696 0.17 162.48)` s.d. `oklch(0.432 0.095 166.913)`)
  - _Fungsi:_ Badge Perusahaan Terverifikasi NTB (Verified Employer), grafik analytics dashboard, dan indikator keberhasilan.
- **Background & Card Surface:**
  - Light Mode: `--background: oklch(1 0 0)` (Pure Clean White) & `--card: oklch(1 0 0)`
  - Dark Mode: `--background: oklch(0.145 0 0)` (Deep Slate Black) & `--card: oklch(0.205 0 0)`
- **Text & Foreground:**
  - Light Mode: `--foreground: oklch(0.145 0 0)` (High Contrast Dark Slate) & `--muted-foreground: oklch(0.556 0 0)`
  - Dark Mode: `--foreground: oklch(0.985 0 0)` (Clean White) & `--muted-foreground: oklch(0.708 0 0)`
- **Destructive / Alert Token (`--destructive`):**
  - Light: `oklch(0.577 0.245 27.325)` / Dark: `oklch(0.704 0.191 22.216)` (Rose/Red)
  - _Fungsi:_ Aksi hapus, penolakan lowongan, tombol laporan (Report), dan pembatalan lamaran.
- **Border, Input & Ring:**
  - `--border`: `oklch(0.922 0 0)` (Light) / `oklch(1 0 0 / 10%)` (Dark)
  - `--input`: `oklch(0.922 0 0)` (Light) / `oklch(1 0 0 / 15%)` (Dark)
  - `--ring`: `oklch(0.708 0 0)` (Light) / `oklch(0.556 0 0)` (Dark)

### Radius & Border System:

- **Base Radius (`--radius`):** `0.625rem` (10px).
- **Radius Scales:**
  - `--radius-sm`: `calc(var(--radius) * 0.6)` (6px) — untuk badge & chips kecil
  - `--radius-md`: `calc(var(--radius) * 0.8)` (8px) — untuk input text & dropdown
  - `--radius-lg`: `var(--radius)` (10px) — standar tombol & modal
  - `--radius-xl` s.d. `--radius-4xl`: `calc(var(--radius) * 1.4)` s.d. `2.6` — untuk kartu lowongan & card container

### Sidebar Dedicated Theme (`--sidebar`):

- Sidebar Dashboard Employer & Admin memiliki token terisolasi: `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, dan `--sidebar-ring`.

### Typography & Pointer Interaction:

- Font Body: `var(--font-sans)` (Geist Sans / Inter / System Sans)
- Font Monospace: `var(--font-geist-mono)`
- Font Heading: `var(--font-heading)`
- Pointer Rule: `button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; }`
- Responsive: Mobile-first dengan bottom navigation atau responsive drawer pada layar kecil.
- Interaksi: Skeleton loading pada setiap kartu lowongan, toast notifications (Sonner), dan micro-transitions yang halus.
- Empty States bermakna: Tidak pernah menampilkan layar kosong tanpa pesan panduan dan Call-to-Action (CTA).

---

## 6. Public Pages & Information Architecture

Struktur rute publik teroptimasi penuh untuk SEO:

```
/                            -> Homepage (Hero, Quick Search, Lowongan Terbaru, Kategori, 10 Kab/Kota)
/jobs                        -> Pencarian & Filter Lowongan Kerja Komprehensif
/jobs/[slug]                 -> Halaman Detail Lowongan Kerja (JSON-LD JobPosting)
/companies                   -> Direktori Perusahaan di NTB
/companies/[slug]            -> Profil Publik Perusahaan & Lowongan Aktif Mereka
/categories                  -> Indeks Kategori Pekerjaan
/categories/[slug]           -> Halaman Kurasi Pekerjaan Berdasarkan Kategori
/locations                   -> Direktori 10 Kabupaten/Kota NTB
/locations/[slug]            -> Halaman Pekerjaan per Wilayah (e.g. /locations/mataram)
/about                       -> Visi, Misi, dan Edukasi Keamanan KerjaNTB
/faq                         -> Tanya Jawab untuk Pencari Kerja & Perusahaan
/blog                        -> Artikel Tips Karir, Panduan CV, & Wawancara
/blog/[slug]                 -> Halaman Artikel Karir Lengkap
```

---

## 7. Job Search & Filtering Engine (`/jobs`)

Halaman pencarian lowongan kerja didukung oleh URL query parameter state yang sinkron dan ramah SEO (misal: `/jobs?q=frontend&location=mataram&type=FULL_TIME`):

### Parameter Filter:

1. **Keyword (`q`):** Mencari pada Judul Lowongan, Deskripsi, Nama Perusahaan, dan Tag Skills.
2. **Kabupaten/Kota (`location`):** Dropdown/multiselect 10 wilayah resmi NTB.
3. **Kategori Pekerjaan (`category`):** IT, Pariwisata/Hospitality, Pertambangan, Kesehatan, Pendidikan, dll.
4. **Tipe Pekerjaan (`type`):** Full-time, Part-time, Kontrak, Magang/Internship, Freelance.
5. **Sistem Kerja (`workplace`):** On-site, Hybrid, Remote.
6. **Rentang Gaji (`salaryMin`, `salaryMax`):** Slider/input nominal Rupiah, toggle lowongan dengan gaji tertera.
7. **Pendidikan Minimal (`education`):** Tanpa Syarat, SMA/SMK, D3, D4/S1, S2, S3.
8. **Pengalaman Kerja (`experience`):** Fresh Graduate, < 1 tahun, 1–3 tahun, 3–5 tahun, 5+ tahun.
9. **Perusahaan Terverifikasi Saja (`verifiedOnly`):** Checkbox khusus untuk lowongan berbadge hijau.

---

## 8. Job Lifecycle & Moderation Rules

Semua lowongan di dalam sistem mengikuti siklus hidup (_job lifecycle_) terstruktur:

```
                  ┌─────────────────┐
                  │      DRAFT      │
                  └────────┬────────┘
                           │ Submit for review
                           ↓
                  ┌─────────────────┐
                  │ PENDING_REVIEW  │ <── (Individual / Unverified Company)
                  └────────┬────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │ (Superadmin Action)               │ (Superadmin Action)
         ↓                                   ↓
┌─────────────────┐                 ┌─────────────────┐
│    REJECTED     │                 │    APPROVED     │
│ (Wajib Alasan)  │                 └────────┬────────┘
└────────┬────────┘                          │ Auto / Scheduled
         │ Edit & Resubmit                   ↓
         └─────────────────────────>┌─────────────────┐ <── (Verified Company: Auto)
                                    │    PUBLISHED    │
                                    └────────┬────────┘
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             ↓                               ↓                               ↓
    ┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
    │     PAUSED      │             │     EXPIRED     │             │     REMOVED     │
    │ (By Employer)   │             │ (Lewat Deadline)│             │ (By Admin/Report│
    └─────────────────┘             └─────────────────┘             └─────────────────┘
```

### Logika Penerbitan Lowongan:

1. **Perusahaan Terverifikasi (`Company.isVerified = true`)**:
   - Begitu lowongan dibuat, sistem menjalankan validasi otomatis (cek blacklisted words, link judi/phishing).
   - Jika bersih, status langsung menjadi `PUBLISHED`.
   - Superadmin tetap dapat mengaudit, mempause, atau menghapus lowongan jika ada indikasi pelanggaran.
2. **Perusahaan Belum Terverifikasi & Akun Individu**:
   - Lowongan berstatus `PENDING_REVIEW`.
   - Wajib ditinjau secara manual oleh Superadmin sebelum dipublikasikan ke publik.
   - Penolakan lowongan wajib mencatat: `rejectionReason`, `reviewedByAdminId`, dan `reviewedAt`.

---

## 9. Company Verification System

Perusahaan dapat mengajukan lencana **Verified Employer (✓ Perusahaan Terverifikasi)** untuk meningkatkan kepercayaan pelamar kerja:

### Berkas & Informasi Pengajuan:

- Nama Legal Perusahaan (PT/CV/Firma/Yayasan/UD).
- NIB (Nomor Induk Berusaha) 13 digit resmi OSS.
- Surat Izin Usaha / NPWP Perusahaan.
- Dokumen pendukung diunggah ke SumoPod Object Storage (private bucket).
- Alamat kantor fisik di NTB, nomor telepon kantor, dan domain email resmi (jika ada).

### Alur Verifikasi Superadmin:

- Admin memeriksa validitas NIB dan kesesuaian data melalui portal OSS/Kemenkumham.
- Pilihan keputusan: **Approve** (badge aktif seketika) atau **Reject** (catatan kekurangan dokumen dikirim ke employer).

---

## 10. Application & Resume Builder System

### Multi-Resume Support:

- Pengguna dapat membuat dan menyimpan hingga 3 versi resume di platform atau mengunggah berkas PDF/DOCX (disimpan di SumoPod Object Storage).
- Data resume terstruktur: Informasi kontak, Ringkasan profesional, Riwayat pendidikan, Pengalaman kerja, Keterampilan (Skills), Sertifikasi, dan Tautan Portofolio.

### Alur Melamar Lowongan (`/jobs/[slug]`):

1. Pengguna mengklik tombol **Lamar Sekarang**.
2. Memilih salah satu resume tersimpan atau unggah file CV terbaru.
3. Mengisi Cover Letter (Surat Pengantar singkat).
4. Konfirmasi data dan submit.
5. Status lamaran berganti secara dinamis:
   `APPLIED` ➔ `REVIEWING` ➔ `SHORTLISTED` ➔ `INTERVIEW` ➔ `ACCEPTED` / `REJECTED` / `WITHDRAWN`.
6. Notifikasi otomatis dikirimkan ke pelamar pada setiap perubahan status.

---

## 11. Trust, Safety & Report Engine

Keamanan adalah pilar utama KerjaNTB. Di setiap halaman lowongan tersedia tombol **Laporkan Lowongan**.

### Kategori Laporan (`ReportReason`):

- `FRAUD`: Indikasi penipuan lowongan atau pengalihan ke grup WhatsApp tak dikenal.
- `REQUESTING_MONEY`: Lowongan meminta uang pendaftaran, biaya seragam, atau pemesanan tiket travel.
- `FAKE_JOB`: Perusahaan atau alamat kantor fiktif.
- `MISLEADING_INFORMATION`: Gaji atau syarat tidak sesuai dengan realitas.
- `SPAM`: Konten berulang atau promosi produk terselubung.
- `ILLEGAL_CONTENT`: Konten melanggar hukum RI (perjudian, pornografi, obat-obatan terlarang).
- `DISCRIMINATION`: Diskriminasi SARA yang melanggar norma ketenagakerjaan.
- `OTHER`: Alasan lainnya.

Tindakan Admin: Memberikan peringatan, menurunkan lowongan (`REMOVED`), atau membekukan akun (`SUSPENDED`).

---

## 12. SEO, Localized Content & JobPosting Schema

Setiap lowongan kerja secara otomatis menginjeksi metadata standar Google Jobs (`Schema.org/JobPosting`):

```json
{
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "Frontend Developer",
  "description": "<p>Deskripsi pekerjaan lengkap...</p>",
  "identifier": {
    "@type": "PropertyValue",
    "name": "PT Digital Lombok",
    "value": "JOB-12345"
  },
  "datePosted": "2026-09-06T08:00:00.000Z",
  "validThrough": "2026-10-06T23:59:59.000Z",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "PT Digital Lombok",
    "sameAs": "https://ptdigitallombok.co.id",
    "logo": "https://storage.sumopod.com/kerja-ntb/logos/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kota Mataram",
      "addressRegion": "Nusa Tenggara Barat",
      "addressCountry": "ID"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "IDR",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 4000000,
      "maxValue": 6000000,
      "unitText": "MONTH"
    }
  }
}
```

---

## 13. Non-Functional Requirements & Security

1. **Keamanan Autentikasi**: Menggunakan Clerk session tokens, disinkronkan ke database MySQL melalui Clerk Webhook (`user.created`, `user.updated`, `user.deleted`).
2. **Otorisasi Server-Side**: Semua Server Actions memverifikasi `auth().userId` dan mencocokkan peran database sebelum mutasi data dilakukan.
3. **Perlindungan Upload SumoPod**: File upload divalidasi MIME type dan ekstensi (hanya `.pdf`, `.docx` untuk CV; `.png`, `.jpg`, `.webp` untuk gambar).
4. **Audit Trail Komprehensif**: Model `AuditLog` mencatat `actorId`, `actorRole`, `action`, `entityType`, `entityId`, dan `metadata` untuk seluruh tindakan admin dan moderasi.
5. **Aksesibilitas & Kecepatan**: Target Web Vitals LCP < 1.8 detik, skoring Lighthouse Accessibility minimal 95 (WCAG AA).
