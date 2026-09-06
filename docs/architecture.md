# KERJANTB — SYSTEM ARCHITECTURE SPECIFICATION

**Versi:** 2.0 (SumoPod Cloud Stack)  
**Target Platform:** Next.js 16 (App Router), MySQL di SumoPod, SumoPod S3 Object Storage, Clerk Auth

---

## 1. High-Level Architecture Diagram

```
                                  ┌─────────────────────────────┐
                                  │      PENGGUNA (CLIENT)      │
                                  │   Desktop / Tablet / Mobile │
                                  └──────────────┬──────────────┘
                                                 │ HTTPS
                                                 ↓
                                  ┌─────────────────────────────┐
                                  │       NEXT.JS 16 APP        │
                                  │  (Vercel / Node.js Server)  │
                                  └──────┬───────────────┬──────┘
                                         │               │
                 ┌───────────────────────┘               └───────────────────────┐
                 │                                                               │
                 ↓                                                               ↓
┌─────────────────────────────────┐                             ┌─────────────────────────────────┐
│           CLERK AUTH            │                             │           PRISMA ORM            │
│  • Identity Management          │                             │  • Connection Pool (MySQL)      │
│  • OAuth (Google, Email OTP)    │                             │  • Relational Type-Safe Client  │
│  • JWT Sessions & Middleware    │                             └────────────────┬────────────────┘
└────────────────┬────────────────┘                                              │
                 │ Webhook Sync                                                  │ TCP/SSL (Port 3306)
                 ↓                                                               ↓
┌─────────────────────────────────┐                             ┌─────────────────────────────────┐
│     USER SYNC ROUTE HANDLER     │                             │      SUMOPOD MANAGED MYSQL      │
│     /api/webhooks/clerk         ├────────────────────────────>│  • 18+ Relational Tables        │
└─────────────────────────────────┘                             │  • Composite Indexes            │
                                                                │  • Foreign Keys & Cascades      │
                                                                └─────────────────────────────────┘

                                 UPLOAD / DOWNLOAD FLOW
                                           │
                                           ↓
                        ┌─────────────────────────────────────┐
                        │      SUMOPOD OBJECT STORAGE         │
                        │        (S3-Compatible API)          │
                        ├─────────────────────────────────────┤
                        │ • Public Assets: /avatars, /logos   │
                        │ • Private Assets: /resumes, /docs   │
                        │ • Presigned Signed URLs (AWS SDK)   │
                        └─────────────────────────────────────┘
```

---

## 2. Component Layer & Next.js 16 Patterns

Proyek KerjaNTB dibangun mengikuti standar arsitektur modern Next.js 16:

### 2.1 Server Components (Default)

Digunakan untuk 85%+ halaman untuk rendering cepat, SEO maksimal, dan zero client bundle:

- Halaman Publik: `/`, `/jobs`, `/jobs/[slug]`, `/companies/[slug]`, `/locations/[slug]`.
- Dashboard Layout & Overview Data Display.
- Akses langsung ke database via Prisma Client tanpa memerlukan layer REST API internal.

### 2.2 Client Components (`"use client"`)

Hanya digunakan pada bagian yang membutuhkan interaktivitas browser:

- Form Multi-step (Post Job Wizard, Profile Editor, Resume Builder).
- Dynamic Filter controls di `/jobs` (slider gaji, selector dropdown interaktif).
- Action buttons interaktif (Tombol Simpan, Like, Modal Konfirmasi, Upload file).
- Toast notification listeners (Sonner).

### 2.3 Server Actions (`"use server"`)

Seluruh mutasi data (Create, Update, Delete) ditangani via Server Actions:

- Standar return format Server Action:
  ```typescript
  type ActionResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  };
  ```
- Otorisasi server-side otomatis dengan memeriksa session Clerk dan role pengguna di database.
- Validasi data input ketat menggunakan schema **Zod**.
- Cache revalidation otomatis via `revalidatePath()` atau `revalidateTag()`.

---

## 3. SumoPod MySQL Architecture & Connection Management

### 3.1 Connection Pooling

Karena Next.js berjalan di lingkungan serverless atau containerized Node.js, Prisma Client diinisialisasi sebagai singleton untuk mencegah kebocoran koneksi (_connection exhaustion_):

```typescript
// src/lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 3.2 Konfigurasi URL Koneksi SumoPod

```env
DATABASE_URL="mysql://<user>:<password>@<sumopod_host>:3306/<database>?connection_limit=10&sslmode=require"
```

### 3.3 Penanganan Transaksi & Integritas Relasional

- Operasi kompleks (seperti membuat lowongan dengan tag skill, atau mengirim lamaran kerja yang mengubah riwayat pelamar) dibungkus menggunakan `prisma.$transaction([ ... ])` untuk menjamin integritas data ACID.
- Menggunakan foreign key relasional MySQL sejati dengan aturan `onDelete: Cascade` pada sub-entitas (misal: profil, pendidikan, dan pengalaman pengguna) dan `onDelete: Restrict` pada data sensitif (misal: lamaran kerja dan laporan audit).

---

## 4. SumoPod Object Storage Architecture (S3 Protocol)

SumoPod Object Storage mendukung protokol standar AWS S3. Integrasi dilakukan menggunakan package resmi `@aws-sdk/client-s3` dan `@aws-sdk/s3-request-presigner`.

### 4.1 Bucket Structure & Kebijakan Akses

```
sumopod-kerja-ntb-bucket/
├── public/
│   ├── avatars/          (Foto profil pengguna)
│   ├── logos/            (Logo perusahaan - PNG, JPG, WebP)
│   └── blog/             (Cover artikel & ilustrasi)
└── private/
    ├── resumes/          (File CV pelamar - PDF/DOCX)
    └── verifications/    (Dokumen NIB/Akta legalitas - PDF/JPG)
```

### 4.2 Alur Upload Berkas (Direct to SumoPod via Presigned URL)

```
[ Browser / Client ]              [ Next.js Server Action ]          [ SumoPod S3 Storage ]
        │                                    │                                 │
        │ 1. Request Upload URL              │                                 │
        ├───────────────────────────────────>│                                 │
        │    (filename, contentType, size)   │ 2. Validasi MIME & Size         │
        │                                    │ 3. Generate Presigned PUT URL   │
        │                                    ├────────────────────────────────>│
        │ 4. Kembalikan Presigned URL        │<────────────────────────────────┤
        │<───────────────────────────────────┤                                 │
        │                                                                      │
        │ 5. Upload File Langsung (PUT Binary)                                 │
        ├─────────────────────────────────────────────────────────────────────>│
        │                                                                      │
        │ 6. Simpan Metadata Path File ke MySQL via Server Action              │
        ├───────────────────────────────────>│                                 │
```

**Keuntungan Alur Ini:**

1. Menghemat bandwidth server Next.js (server tidak membengkak karena buffer file besar).
2. Upload lebih cepat dan tidak memicu limit payload serverless (4.5MB).
3. Berkas privat tidak dapat diakses tanpa token/presigned GET URL berdurasi terbatas (misal: berlaku 15 menit).

---

## 5. Clerk Authentication & MySQL User Synchronization

### 5.1 Alur Autentikasi Pengguna

1. Pengguna login/register melalui komponen Clerk (`<SignIn />`, `<SignUp />`, atau Google OAuth).
2. Clerk menghasilkan JWT session token yang divalidasi oleh Next.js Middleware (`clerkMiddleware()`).
3. Pada event pendaftaran pertama kali, Clerk mengirimkan event webhook `user.created` ke endpoint Next.js `/api/webhooks/clerk`.
4. Endpoint webhook memverifikasi signature webhook (via `svix`) dan membuat record `User` di SumoPod MySQL.

### 5.2 Mapping Role (RBAC)

Role disimpan pada database MySQL (`User.role`) dengan enum:

- `INDIVIDUAL`: Default untuk pendaftar umum.
- `COMPANY`: Diberikan saat pengguna menyelesaikan onboarding profil perusahaan.
- `SUPERADMIN`: Ditetapkan secara manual melalui seed database atau admin panel.

---

## 6. Keamanan Data & Proteksi Serangan

1. **SQL Injection Prevention**: Prisma ORM menggunakan prepared statements dan parameterized queries secara native pada seluruh query MySQL.
2. **XSS & Content Security**: Sanitasi konten deskripsi lowongan menggunakan library terpercaya (misal: `sanitize-html`) sebelum disimpan ke database.
3. **MIME Sniffing Prevention**: Pemeriksaan ekstensi dan MIME type berkas sebelum presigned URL dikeluarkan.
4. **Rate Limiting**: Diterapkan pada rute sensitif (melamar pekerjaan, pelaporan lowongan, dan submit form) menggunakan algoritma token bucket.
5. **Private Access Control**: File resume CV pelamar hanya dapat diakses oleh:
   - Pemilik resume itu sendiri.
   - Perusahaan pemberi kerja pemilik lowongan yang dilamar.
   - Superadmin KerjaNTB.
