# KerjaNTB — Job Portal Nusa Tenggara Barat

> Platform pencarian lowongan kerja terpercaya khusus wilayah Nusa Tenggara Barat (10 Kabupaten & Kota) — Cepat, Bebas Biaya Calo, dan Terverifikasi Resmi.

---

## 🛠️ Tech Stack & Arsitektur

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React 19, Server Components & Actions)
- **Database:** **MySQL di SumoPod** via [Prisma ORM](https://www.prisma.io/)
- **Object Storage:** **SumoPod Object Storage** (S3-Compatible API via `@aws-sdk/client-s3`)
- **Autentikasi & RBAC:** [Clerk](https://clerk.com/) (`SUPERADMIN`, `COMPANY`, `INDIVIDUAL`)
- **Styling & Design System:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (`radix-nova` preset)
- **Color System:** CSS Variables berbasis **OKLCH** di `src/app/globals.css`
  - Primary: `oklch(0.488 0.243 264.376)` (Modern Electric Cobalt)
  - Verified NTB / Chart: `oklch(0.845 0.143 164.978)` (Emerald Green)
- **Validasi:** [Zod](https://zod.dev/) (Client & Server-side validation)

---

## 📚 Dokumentasi Lengkap Proyek (`docs/`)

Seluruh dokumentasi teknis, perancangan, dan panduan vibe coding tersedia di direktori `docs/` dan root:

- [TASKLIST.md](TASKLIST.md) — 📋 **Tasklist & Sprint Tracker Pengerjaan (Live Checklist)**

1. [docs/prd.md](docs/prd.md) — Product Requirements Document (PRD) KerjaNTB v2.0
2. [docs/architecture.md](docs/architecture.md) — Spesifikasi Arsitektur Sistem & Data Flow
3. [docs/database-schema.md](docs/database-schema.md) — Skema Lengkap Prisma MySQL (18+ Model & Indexes)
4. [docs/storage-sumopod.md](docs/storage-sumopod.md) — Panduan Integrasi SumoPod S3 Object Storage
5. [docs/vibe-coding-rules.md](docs/vibe-coding-rules.md) — Standar & Aturan Coding untuk AI Assistant
6. [docs/task-roadmap.md](docs/task-roadmap.md) — Roadmap 10 Fase Pengerjaan & Prompt Siap Pakai
7. [docs/skills-setup.md](docs/skills-setup.md) — Rekomendasi 10 Agent Skills dari [skills.sh](https://www.skills.sh/)

---

## 🚀 Memulai Proyek

### 1. Jalankan Setup Script

```bash
# Menginstal dependency & Agent Skills
bash skill.sh
```

### 2. Konfigurasi Environment

Salin `.env.example` ke `.env` dan masukkan kredensial SumoPod MySQL & S3 serta Clerk:

```bash
cp .env.example .env
```

### 3. Migrasi Database

```bash
bunx prisma db push
# atau
bunx prisma migrate dev --name init_schema
```

### 4. Jalankan Server Development

```bash
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.
