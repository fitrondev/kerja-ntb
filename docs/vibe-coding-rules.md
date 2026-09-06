# KERJANTB — VIBE CODING & AGENT DEVELOPMENT RULES

**Tujuan:** Panduan dan aturan wajib bagi AI Coding Assistant (Antigravity, Cursor, Claude Code, GitHub Copilot) dan pengembang dalam memprogram codebase KerjaNTB.  
**Standar Kualitas:** Enterprise Grade, Strict TypeScript, Next.js 16 App Router, Tailwind CSS v4, MySQL via Prisma.

---

## 1. Aturan Emas (Golden Rules)

1. **JANGAN PERNAH MENGGUNAKAN `any`**: Seluruh variabel, fungsi, props, dan return types wajib memiliki tipe data TypeScript eksplisit.
2. **NEXT.JS 16 ASYNC CONVENTIONS**:
   - `params` dan `searchParams` pada Halaman (`page.tsx`) dan Layout (`layout.tsx`) adalah `Promise`! Selalu gunakan `await params` dan `await searchParams`.
   - `cookies()` dan `headers()` dari `next/headers` bersifat asynchronous: `const cookieStore = await cookies();`.
3. **SERVER FIRST BY DEFAULT**:
   - Jadikan setiap komponen sebagai Server Component secara default.
   - Tambahkan direktif `'use client'` HANYA jika komponen membutuhkan state (`useState`, `useEffect`), event listener interaktif, atau browser API.
4. **TIDAK ADA QUERY DATABASE DI CLIENT**:
   - Database MySQL (SumoPod) HANYA boleh diakses melalui Server Components atau Server Actions di dalam direktori `src/actions/` atau `src/lib/db/`.
5. **STANDAR SERVER ACTION RESPONSE**:
   - Seluruh mutasi data via Server Actions wajib mengembalikan format terstandarisasi:
     ```typescript
     export type ActionResponse<T = unknown> = {
       success: boolean;
       data?: T;
       error?: string;
       fieldErrors?: Record<string, string[]>;
     };
     ```
6. **VALIDASI GANDA DENGAN ZOD**:
   - Setiap form wajib divalidasi di sisi client (untuk UX instan) dan divalidasi ulang di Server Action menggunakan Zod schema sebelum data menyentuh database.
7. **JANGAN SIMPAN BINARY DI DATABASE**:
   - Foto profil, logo perusahaan, CV/resume, dan dokumen legalitas WAJIB disimpan di **SumoPod Object Storage**. Database hanya menyimpan path atau URL.

---

## 2. Struktur Direktori Proyek

```
d:/kerja-ntb/
├── docs/                   # Seluruh spesifikasi & arsitektur proyek
├── prisma/
│   ├── schema.prisma       # Skema Prisma untuk MySQL di SumoPod
│   └── seed.ts             # Data seed untuk 10 Kab/Kota NTB & Kategori
├── public/                 # Aset statis favicon & ilustrasi default
├── src/
│   ├── app/
│   │   ├── (auth)/         # Halaman Sign In / Sign Up (Clerk)
│   │   ├── (public)/       # Homepage, /jobs, /companies, /locations, /blog
│   │   ├── dashboard/      # Dashboard Pencari Kerja (Individual)
│   │   ├── employer/       # Dashboard Perusahaan (Company)
│   │   ├── admin/          # Dashboard Superadmin & Moderasi
│   │   ├── api/            # Route Handlers (e.g. Webhook Clerk, Upload URL)
│   │   ├── globals.css     # Tailwind CSS v4 & theme variables
│   │   └── layout.tsx      # Root Layout & Clerk Provider
│   ├── components/
│   │   ├── ui/             # Komponen primitif shadcn/ui (Button, Dialog, Input)
│   │   ├── jobs/           # Komponen JobCard, JobFilters, JobDetail
│   │   ├── companies/      # CompanyCard, VerifiedBadge
│   │   ├── layout/         # Navbar, Footer, MobileNav
│   │   └── shared/         # EmptyState, LoadingSkeleton, ConfirmModal
│   ├── lib/
│   │   ├── db/             # Prisma client instance singleton
│   │   ├── auth/           # Helper sesi Clerk & verifikasi role DB
│   │   ├── storage/        # SumoPod S3 Client & Upload helpers
│   │   ├── validations/    # Zod schemas (JobSchema, ProfileSchema, dll)
│   │   └── utils.ts        # Helper cn(), formatCurrencyRupiah(), formatDate()
│   ├── actions/            # Server Actions mutasi data
│   │   ├── jobs.ts
│   │   ├── applications.ts
│   │   ├── companies.ts
│   │   └── admin.ts
│   ├── types/              # Definisi interface & types global
│   └── constants/          # Daftar 10 Kab/Kota NTB, opsi filter, opsi edukasi
```

---

## 3. Aturan Desain & Styling (Tailwind CSS v4 & shadcn/ui OKLCH Theme)

Styling proyek KerjaNTB dikonfigurasi melalui **shadcn/ui preset `radix-nova`** dengan CSS variables berbasis **OKLCH** di `src/app/globals.css`:

- **DILARANG MENGGUNAKAN HARDCODED HEX COLOR**:
  - Jangan gunakan arbitrary class seperti `bg-[#1447E6]` atau `text-[#10B981]`.
  - Seluruh komponen WAJIB menggunakan utility class semantik Tailwind yang terhubung ke CSS variables.
- **Daftar Token Semantik Wajib Digunakan:**
  - **Tombol Utama & Aksen Brand:** `bg-primary text-primary-foreground hover:bg-primary/90` (menggunakan token `oklch(0.488 0.243 264.376)`).
  - **Badge Perusahaan Terverifikasi NTB & Sukses:** `text-chart-1` atau `bg-chart-1/10 text-chart-1 border-chart-1/20` (menggunakan token emerald `oklch(0.845 0.143 164.978)`).
  - **Permukaan Kartu & Container:** `bg-card text-card-foreground border-border`.
  - **Tombol Sekunder / Tag Kategori:** `bg-secondary text-secondary-foreground hover:bg-secondary/80`.
  - **Teks Pendukung / Sub-info:** `text-muted-foreground`.
  - **Aksi Bahaya / Laporkan Lowongan:** `bg-destructive text-white hover:bg-destructive/90` atau `text-destructive`.
  - **Sidebar Dashboard (Employer & Admin):** `bg-sidebar text-sidebar-foreground border-sidebar-border`.
- **Radius & Sudut Komponen:**
  - Gunakan scale radius resmi: `rounded-sm` (6px), `rounded-md` (8px), `rounded-lg` (10px, base radius), `rounded-xl` (14px), atau `rounded-2xl` (18px untuk modal/kartu besar).
- **Pointer Cursor Rule:**
  - Telah diset secara global: `button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; }`. Pastikan setiap elemen interaktif memiliki role atau tag semantik yang benar.
- **Micro-Interactions**:
  - Tombol dan kartu lowongan wajib memiliki efek interaktif halus: `hover:shadow-md hover:border-primary/40 transition-all duration-200 active:scale-[0.98]`.
- **Loading & Empty State Wajib**:
  - Gunakan skeleton komponen shadcn: `<Skeleton className="h-24 w-full rounded-xl" />`.
  - Jika hasil pencarian nihil, gunakan komponen `<EmptyState />` dengan instruksi pemulihan pencarian.

---

## 4. Keamanan & Role-Based Access Control (RBAC)

Setiap Server Action yang melakukan operasi data wajib diawali dengan verifikasi identitas dan role:

```typescript
// Contoh implementasi otorisasi di Server Action
"use server";

import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db/prisma";

export async function approveJobAction(jobId: string) {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Unauthorized: Harap login terlebih dahulu",
    };
  }

  // Cek role pengguna di database MySQL
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (user?.role !== "SUPERADMIN") {
    return {
      success: false,
      error: "Forbidden: Hanya Superadmin yang berhak melakukan review",
    };
  }

  // Lanjutkan mutasi data...
}
```

---

## 5. Standar SEO NTB & Google Jobs

Setiap halaman detail pekerjaan (`/jobs/[slug]`) wajib:

1. Menghasilkan metadata dinamis via `generateMetadata()` dengan judul:  
   `[Posisi] di [Nama Perusahaan] - [Lokasi NTB] | KerjaNTB`.
2. Menyematkan script JSON-LD terstruktur (`JobPosting`) yang mencakup `title`, `hiringOrganization`, `jobLocation` (spesifik salah satu dari 10 Kabupaten/Kota NTB), `baseSalary`, dan `employmentType`.
