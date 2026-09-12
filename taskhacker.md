# 🛡️ TASKHACKER.MD — Security Audit, Vulnerability Assessment & Hardening Checklist

> **Dokumen Audit Keamanan KerjaNTB**: Daftar celah keamanan potensial (_vulnerabilities & attack vectors_), analisis risiko peretasan (_threat modeling_), dan daftar status perbaikan (_hardening tasks_) yang telah diimplementasikan untuk melindungi data pengguna dan infrastruktur platform.

---

## 📊 Matriks Ringkasan Risiko & Celah Keamanan

| ID         | Celah / Vektor Serangan                                    | Kategori OWASP                          | Tingkat Risiko  |     Status     |
| :--------- | :--------------------------------------------------------- | :-------------------------------------- | :-------------: | :------------: |
| **SEC-01** | Eskalasi Hak Akses via Clerk `unsafe_metadata`             | Broken Access Control (A01)             | 🔴 **CRITICAL** | `[x] RESOLVED` |
| **SEC-02** | IDOR / Unduh Berkas Privat (CV & Dokumen NIB)              | Broken Object Authorization (A01)       | 🔴 **CRITICAL** | `[x] RESOLVED` |
| **SEC-03** | IDOR pada Endpoint Presigned S3 Upload                     | Broken Object Level Auth (A01)          |   🟠 **HIGH**   | `[x] RESOLVED` |
| **SEC-04** | Tanpa Rate Limiting (DoS & Spam Flooding)                  | Unrestricted Resource Consumption (A04) |   🟠 **HIGH**   | `[x] RESOLVED` |
| **SEC-05** | Absennya Security Headers & Proteksi Clickjacking          | Security Misconfiguration (A05)         |  🟡 **MEDIUM**  | `[x] RESOLVED` |
| **SEC-06** | Potensi Stored XSS via File Upload & SVG/HTML Spoofing     | Injection / XSS (A03)                   |  🟡 **MEDIUM**  | `[x] RESOLVED` |
| **SEC-07** | Risiko Open Redirect pada Parameter `redirect_url`         | Server-Side Request Forgery / Phishing  |  🟡 **MEDIUM**  | `[x] RESOLVED` |
| **SEC-08** | Kebocoran Data Sensitif Dokumen Perusahaan (Data Exposure) | Cryptographic / Privacy Failure (A02)   |   🟢 **LOW**    | `[x] RESOLVED` |

---

## 🔴 1. Tingkat Kritis (CRITICAL) — Wajib Segera Dibenahi

### 🎯 SEC-01: Eskalasi Hak Akses Admin melalui Manipulasi `unsafe_metadata` Clerk

- **Lokasi Berkas:** [`src/lib/auth/clerk-sync.ts`](file:///d:/kerja-ntb/src/lib/auth/clerk-sync.ts)
- **Mekanisme Celah:**
  Fungsi sinkronisasi user membaca role dengan urutan:

  ```typescript
  const role =
    extractRoleFromMetadata(data.public_metadata) ??
    extractRoleFromMetadata(data.unsafe_metadata);
  ```

  Pada arsitektur Clerk, `unsafe_metadata` **dapat diedit langsung dari browser klien oleh pengguna biasa** melalui SDK frontend Clerk (`user.update({ unsafeMetadata: { role: 'SUPERADMIN' } })`).

- **Skenario Peretasan:**
  1. Peretas mendaftar sebagai pengguna baru biasa (`INDIVIDUAL`).
  2. Dari console browser, peretas mengirimkan payload update metadata `unsafe_metadata: { role: "SUPERADMIN" }`.
  3. Saat event webhook `user.updated` masuk atau fungsi on-the-fly sync terpanggil, backend membaca `unsafe_metadata` dan menetapkan role user di MySQL menjadi `SUPERADMIN`.
  4. Peretas kini memiliki kontrol penuh atas seluruh lowongan, laporan, dan dokumen verifikasi perusahaan di NTB.
- **Tugas Perbaikan (Hardening Tasks):**
  - [x] Hapus sepenuhnya pembacaan role dari `unsafe_metadata` atau `unsafeMetadata`.
  - [x] Role HANYA boleh dibaca dari `public_metadata` (yang terproteksi dan hanya bisa diubah via Clerk Backend Secret Key).
  - [x] Jika `public_metadata.role` kosong, secara _fail-secure_ tetapkan default ke `UserRole.INDIVIDUAL`.

---

### 🎯 SEC-02: IDOR (Insecure Direct Object Reference) pada Pengambilan Berkas Privat

- **Lokasi Berkas:** [`src/app/api/storage/file/[...key]/route.ts`](file:///d:/kerja-ntb/src/app/api/storage/file/[...key]/route.ts)
- **Mekanisme Celah:**
  Pada route handler `/api/storage/file/[...key]`, pengecekan berkas privat sebelumnya hanya memvalidasi apakah ada user yang sedang login tanpa memeriksa kepemilikan dokumen.
- **Skenario Peretasan:**
  1. Peretas login dengan akun pelamar biasa mana saja.
  2. Peretas melakukan _path enumeration_ atau menebak pola UUID berkas:
     `/api/storage/file/verifications/comp_123/nib-legal.pdf` atau
     `/api/storage/file/resumes/user_456/cv-rahasia.pdf`.
  3. Karena peretas terautentikasi (`userId` tidak null), API langsung menyajikan berkas CV pribadi pelamar lain atau dokumen legalitas NIB perusahaan lain tanpa memverifikasi kepemilikan.
- **Tugas Perbaikan (Hardening Tasks):**
  - [x] Tambahkan validasi kepemilikan objek (Object-Level Authorization) via `canAccessStorageFile`:
    - Untuk berkas `resumes/`: Hanya izinkan jika `userId` adalah pemilik CV, ATAU employer yang menerima lamaran kerja dari pelamar tersebut, ATAU user ber-role `SUPERADMIN`.
    - Untuk berkas `verifications/`: Hanya izinkan jika `userId` adalah pemilik `companyId` bersangkutan, ATAU user ber-role `SUPERADMIN`.
  - [x] Kembalikan `403 Forbidden` jika pengguna tidak memiliki hak akses sah terhadap entitas berkas tersebut.

---

## 🟠 2. Tingkat Tinggi (HIGH) — Celah Eksploitasi Sumber Daya & Manipulasi Data

### 🎯 SEC-03: IDOR pada Endpoint Pembuatan Presigned Upload URL

- **Lokasi Berkas:** [`src/app/api/storage/presign/route.ts`](file:///d:/kerja-ntb/src/app/api/storage/presign/route.ts) & [`src/actions/storage.ts`](file:///d:/kerja-ntb/src/actions/storage.ts)
- **Mekanisme Celah:**
  Endpoint menerima `companyId` dari body request tanpa memverifikasi apakah `userId` pemanggil adalah pemilik dari perusahaan tersebut.
- **Skenario Peretasan:**
  Peretas dapat memasukkan `companyId` milik instansi lain (misal PT Bank NTB Syariah) dan meminta presigned URL untuk menimpa logo resmi atau menyusupkan dokumen verifikasi palsu ke dalam direktori perusahaan korban.
- **Tugas Perbaikan (Hardening Tasks):**
  - [x] Validasi relasi database: Jalankan query `prisma.company.findFirst({ where: { id: targetCompanyId, userId: user.id } })` sebelum menerbitkan presigned URL bertipe `LOGO` atau `VERIFICATION`.
  - [x] Tolak penerbitan presigned URL jika user bukan pemilik perusahaan atau bukan Superadmin.
  - [x] Batasi kategori `BLOG` hanya untuk `SUPERADMIN`.

---

### 🎯 SEC-04: Ketiadaan Rate Limiting pada Endpoint Publik & Server Actions

- **Lokasi Berkas:** [`src/lib/security/rate-limit.ts`](file:///d:/kerja-ntb/src/lib/security/rate-limit.ts), [`src/app/(root)/loker/page.tsx`](<file:///d:/kerja-ntb/src/app/(root)/loker/page.tsx>), [`src/actions/application.ts`](file:///d:/kerja-ntb/src/actions/application.ts), [`src/actions/jobs.ts`](file:///d:/kerja-ntb/src/actions/jobs.ts)
- **Mekanisme Celah:**
  Sebelumnya tidak ada pembatasan jumlah request per IP/akun (Rate Limiting).
- **Skenario Peretasan:**
  1. **Database DoS**: Botnet mengirimkan ribuan request pencarian kompleks per detik sehingga koneksi database mengalami _exhaustion_.
  2. **Spam Lamaran**: Bot melamar ke seluruh lowongan kerja dengan ribuan lamaran palsu, merusak data ATS pemberi kerja.
  3. **Laporan Palsu Massal**: Bot memanggil `submitJobReportAction` untuk membombardir antrean moderasi Superadmin.
  4. **Storage Exhaustion**: Bot meminta presigned URL upload secara berulang untuk memenuhi kuota bucket S3.
- **Tugas Perbaikan (Hardening Tasks):**
  - [x] Pasang rate limiting berbasis sliding window dengan cleanup memori otomatis (`checkRateLimit`).
  - [x] Batasi pencarian publik: Maksimal 60 request/menit per IP.
  - [x] Batasi pelamaran kerja: Maksimal 10 lamaran per jam per akun.
  - [x] Batasi pelaporan loker: Maksimal 5 laporan per 15 menit per akun.
  - [x] Batasi permintaan presigned upload: Maksimal 20 request per menit per akun.

---

## 🟡 3. Tingkat Menengah (MEDIUM) — Konfigurasi & Pertahanan Tambahan

### 🎯 SEC-05: Absennya Security Headers HTTP (Clickjacking & XSS Protection)

- **Lokasi Berkas:** [`next.config.ts`](file:///d:/kerja-ntb/next.config.ts)
- **Mekanisme Celah:**
  Server tidak mengirimkan header proteksi keamanan browser standar.
- **Skenario Peretasan:**
  - **Clickjacking**: Penyerang membuat web jebakan dan memuat halaman KerjaNTB (`/dashboard/user` atau `/dashboard/verification`) dalam iframe transparan. Korban tertipu mengklik tombol aksi tanpa sadar (_UI redressing_).
  - **MIME Sniffing**: Browser mengeksekusi berkas yang diunggah karena ketiadaan `X-Content-Type-Options: nosniff`.
- **Tugas Perbaikan (Hardening Tasks):**
  - [x] Tambahkan konfigurasi `headers()` di `next.config.ts`:
    - `X-Frame-Options: DENY`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

### 🎯 SEC-06: Validasi Ekstensi & MIME Berkas pada Upload S3 (Stored XSS)

- **Lokasi Berkas:** [`src/lib/storage/upload.ts`](file:///d:/kerja-ntb/src/lib/storage/upload.ts), [`src/app/api/storage/file/[...key]/route.ts`](file:///d:/kerja-ntb/src/app/api/storage/file/[...key]/route.ts)
- **Mekanisme Celah:**
  Penyerang dapat memalsukan MIME type saat mengirim file script/SVG berbahaya yang berisi skrip `<script>alert(document.cookie)</script>`.
- **Tugas Perbaikan (Hardening Tasks):**
  - [x] Selalu sajikan berkas dokumen privat dengan header `Content-Disposition: attachment; filename="..."` sehingga browser dipaksa mengunduh dan bukan me-render HTML/SVG inline.
  - [x] Blokir unggahan bertipe `.svg` dan MIME `image/svg+xml`, HTML, atau skrip pada seluruh kategori berkas.
  - [x] Terapkan validasi `allowedExtensions` ketat (`.pdf`, `.doc`, `.docx`, `.jpg`, `.jpeg`, `.png`, `.webp`).

---

### 🎯 SEC-07: Validasi Ketat Parameter `redirect_url` (Open Redirect Phishing)

- **Lokasi Berkas:** [`src/lib/security/redirect.ts`](file:///d:/kerja-ntb/src/lib/security/redirect.ts), [`src/app/sign-in/[[...sign-in]]/page.tsx`](file:///d:/kerja-ntb/src/app/sign-in/[[...sign-in]]/page.tsx), [`src/app/sign-up/[[...sign-up]]/page.tsx`](file:///d:/kerja-ntb/src/app/sign-up/[[...sign-up]]/page.tsx)
- **Mekanisme Celah:**
  Jika parameter `?redirect_url=` tidak divalidasi, penyerang dapat menyematkan URL domain luar untuk phising.
- **Tugas Perbaikan (Hardening Tasks):**
  - [x] Buat helper validasi `getSafeRedirectUrl(url: string)`:
    - Hanya izinkan URL internal yang diawali karakter tunggal `/` (contoh: `/dashboard/user`).
    - Tolak URL yang diawali `//`, `/\\`, protokol `http://`, `https://`, atau `javascript:`.
  - [x] Pasang sanitasi pada halaman `/sign-in` dan `/sign-up`.

---

## 🟢 4. Tingkat Rendah (LOW) — Privasi & Minimasi Data

### 🎯 SEC-08: Pencegahan Kebocoran Nomor Telepon & NIB Perusahaan di Endpoint Publik

- **Lokasi Berkas:** [`src/lib/db/queries.ts`](file:///d:/kerja-ntb/src/lib/db/queries.ts)
- **Mekanisme Celah:**
  Query Prisma yang menyertakan relasi `verification` berisiko membocorkan nomor induk legalitas jika diekspos secara utuh ke publik.
- **Tugas Perbaikan (Hardening Tasks):**
  - [x] Masking nomor NIB pada `getJobBySlug` (format `9120******345`) sehingga aman dari bot scraper legalitas perusahaan.
  - [x] Pastikan field sensitif seperti `taxId` (NPWP), `phone`, `email`, dan `documentUrl` NIB HANYA dapat diakses oleh Superadmin di `/dashboard/admin/*`.

---

## 📋 Checklist Eksekusi Penguatan Keamanan (Sprint Hardening)

- [x] **Sprint 1 (Immediate Fixes):**
  - [x] Perbaiki logika role Clerk di `src/lib/auth/clerk-sync.ts` (Hapus ketergantungan pada `unsafe_metadata`).
  - [x] Tambahkan verifikasi kepemilikan di `/api/storage/file/[...key]/route.ts` dan `/api/storage/presign/route.ts`.
  - [x] Tambahkan HTTP Security Headers di `next.config.ts`.
- [x] **Sprint 2 (Defense in Depth):**
  - [x] Pasang mekanisme Rate Limiting pada API dan Server Actions kritis.
  - [x] Terapkan header `Content-Disposition: attachment` untuk berkas PDF/dokumen di storage handler.
  - [x] Audit sanitasi parameter `redirect_url` pada auth flow.
- [x] **Sprint 3 (Penetration Testing & Review):**
  - [x] Uji coba simulasi otorisasi lintas akun (Cross-account IDOR protection).
  - [x] Validasi bahwa role `SUPERADMIN` tidak dapat diperoleh via manipulasi metadata klien.
