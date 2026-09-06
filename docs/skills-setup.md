# REKOMENDASI SKILL DARI SKILLS.SH UNTUK KERJANTB

**Direktori Resmi:** [https://www.skills.sh/](https://www.skills.sh/)  
**Fungsi:** AI Agent Skills adalah kapabilitas prosedural yang dapat diinstal ke dalam AI coding agent (Antigravity, Claude Code, Cursor, Windsurf, Copilot, dll.) menggunakan perintah `npx skills add <package>` agar AI memahami standar arsitektur, desain, dan performa tinggi secara otomatis.

---

## 1. Daftar Rekomendasi Skill Resmi dari skills.sh

Berikut adalah kurasi skill terbaik di **[skills.sh](https://www.skills.sh/)** yang paling relevan dan wajib diinstal untuk proyek **KerjaNTB** (Next.js 16, MySQL SumoPod, SumoPod Object Storage, Clerk Auth, dan Tailwind v4/shadcn):

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SKILLS.SH RECOMMENDED PACK                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 1. vercel-labs/agent-skills/vercel-react-best-practices (React 19 & Next.js)   │
│ 2. vercel-labs/skills/find-skills                       (Discovery Agent)       │
│ 3. anthropics/skills/frontend-design                    (High-End UI Quality)   │
│ 4. site/uizze.com/anti-ui-slop                          (Anti Generic Design)   │
│ 5. vercel-labs/agent-skills/web-design-guidelines       (Accessibility & UX)    │
│ 6. mattpocock/skills/domain-modeling                    (MySQL & Prisma Modeling│
│ 7. mattpocock/skills/improve-codebase-architecture      (Clean Architecture)    │
│ 8. mattpocock/skills/grill-me                           (Requirement Interview) │
│ 9. mattpocock/skills/tdd                                (Test-Driven Flow)      │
│ 10. google-labs-code/stitch-skills                      (shadcn/ui Composition) │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Rincian & Alasan Pemilihan Setiap Skill

### ⚡ Kategori 1: Next.js 16, React 19 & Performance

#### 1. `vercel-labs/agent-skills/vercel-react-best-practices`

- **Perintah Instalasi:**
  ```bash
  npx skills add vercel-labs/agent-skills/vercel-react-best-practices
  ```
- **Alasan untuk KerjaNTB:**
  Proyek ini menggunakan Next.js 16 dan React 19. Skill resmi dari tim Vercel Labs ini mengajari AI agar:
  - Menguasai pola asynchronous Server Components (`await params`, `await searchParams`).
  - Menggunakan Server Actions untuk mutasi data tanpa memicu re-render yang boros.
  - Memisahkan logic client dan server secara ketat.

#### 2. `vercel-labs/skills/find-skills`

- **Perintah Instalasi:**
  ```bash
  npx skills add vercel-labs/skills/find-skills
  ```
- **Alasan untuk KerjaNTB:**
  Merupakan skill #1 di leaderboard skills.sh. Memungkinkan AI agent mencari dan menginstal skill spesifik lainnya dari direktori skills.sh secara otomatis di tengah sesi coding jika dibutuhkan tools tambahan.

---

### 🎨 Kategori 2: Desain UI, Estetika & Anti "AI Slop"

#### 3. `anthropics/skills/frontend-design`

- **Perintah Instalasi:**
  ```bash
  npx skills add anthropics/skills/frontend-design
  ```
- **Alasan untuk KerjaNTB:**
  Dibuat resmi oleh tim Anthropic. Menghindari tampilan website yang membosankan dan generik. Menginstruksikan AI untuk membangun layout portal kerja NTB yang berkelas, dinamis, memiliki micro-interactions halus, dan mengaplikasikan token tema OKLCH (`--primary: oklch(0.488 0.243 264.376)` Electric Cobalt dan `--chart-1: oklch(0.845 0.143 164.978)` Emerald NTB).

#### 4. `site/uizze.com/anti-ui-slop`

- **Perintah Instalasi:**
  ```bash
  npx skills add site/uizze.com/anti-ui-slop
  ```
- **Alasan untuk KerjaNTB:**
  Skill populer untuk membasmi "AI slop" (desain murahan khas generator AI seperti font default kaku, padding sembarangan, dan kontras rendah). Menjamin tampilan kartu lowongan, badge perusahaan terverifikasi, dan dashboard pelamar terlihat seperti produk startup komersial level produksi.

#### 5. `vercel-labs/agent-skills/web-design-guidelines`

- **Perintah Instalasi:**
  ```bash
  npx skills add vercel-labs/agent-skills/web-design-guidelines
  ```
- **Alasan untuk KerjaNTB:**
  Memandu AI menerapkan standar aksesibilitas WCAG AA, navigasi keyboard ramah disabilitas, hirarki heading SEO semantic HTML5, serta layout responsif yang nyaman digunakan di smartphone warga NTB.

---

### 🏗️ Kategori 3: Arsitektur Data, Database Modeling & Clean Code

#### 6. `mattpocock/skills/domain-modeling`

- **Perintah Instalasi:**
  ```bash
  npx skills add mattpocock/skills/domain-modeling
  ```
- **Alasan untuk KerjaNTB:**
  Sangat krusial untuk perancangan **MySQL di SumoPod**. KerjaNTB memiliki 18+ entitas saling berelasi (`User`, `Company`, `Job`, `CompanyVerification`, `Application`, `Resume`, `Report`, dll.). Skill ini memandu AI dalam mendefinisikan relasi foreign key, validasi state enum, dan integritas data ACID agar tidak ada data yatim (orphaned records).

#### 7. `mattpocock/skills/improve-codebase-architecture`

- **Perintah Instalasi:**
  ```bash
  npx skills add mattpocock/skills/improve-codebase-architecture
  ```
- **Alasan untuk KerjaNTB:**
  Menjaga arsitektur kode tetap terisolasi dengan rapi: memisahkan Server Actions (`src/actions/`), database client singleton (`src/lib/db/`), storage client (`src/lib/storage/`), dan UI components modular.

#### 8. `mattpocock/skills/grill-me`

- **Perintah Instalasi:**
  ```bash
  npx skills add mattpocock/skills/grill-me
  ```
- **Alasan untuk KerjaNTB:**
  AI akan secara aktif "mewawancarai" Anda mengenai skenario tepi (_edge cases_) sebelum menulis kode. Sangat berguna saat merancang alur moderasi lowongan, verifikasi NIB perusahaan, dan penanganan laporan penipuan.

#### 9. `mattpocock/skills/tdd`

- **Perintah Instalasi:**
  ```bash
  npx skills add mattpocock/skills/tdd
  ```
- **Alasan untuk KerjaNTB:**
  Memandu pembuatan automated unit test untuk fitur krusial: kalkulasi filter gaji lowongan, alur transisi status lamaran (`APPLIED` ➔ `REVIEWING` ➔ `ACCEPTED`), dan otorisasi role Superadmin.

---

### 🧩 Kategori 4: shadcn/ui & UI Components

#### 10. `google-labs-code/stitch-skills`

- **Perintah Instalasi:**
  ```bash
  npx skills add google-labs-code/stitch-skills
  ```
- **Alasan untuk KerjaNTB:**
  Panduan integrasi komponen shadcn/ui berbasis Radix UI dan Tailwind CSS. Mengajarkan AI cara meng-compose komponen UI (Modal Dialog, Dropdown, Tabs, Sheet Mobile Drawer) tanpa merusak file primitif dasar.

---

## 3. Perintah Instalasi Sekaligus (Batch Command)

Anda dapat menginstal seluruh rekomendasi skill dari **skills.sh** di atas sekaligus dengan menjalankan perintah berikut di terminal:

```bash
npx skills add \
  vercel-labs/agent-skills/vercel-react-best-practices \
  vercel-labs/skills/find-skills \
  anthropics/skills/frontend-design \
  site/uizze.com/anti-ui-slop \
  vercel-labs/agent-skills/web-design-guidelines \
  mattpocock/skills/domain-modeling \
  mattpocock/skills/improve-codebase-architecture \
  mattpocock/skills/grill-me \
  mattpocock/skills/tdd \
  google-labs-code/stitch-skills
```

---

## 4. Dependencies Proyek Tambahan (NPM / Bun)

Selain Agent Skills di atas, proyek KerjaNTB membutuhkan dependencies berikut:

```bash
bun add @prisma/client @clerk/nextjs @aws-sdk/client-s3 @aws-sdk/s3-request-presigner zod lucide-react clsx tailwind-merge class-variance-authority date-fns slugify sonner svix
bun add -d prisma
```

Semua perintah di atas telah diintegrasikan langsung ke dalam script [skill.sh](file:///d:/kerja-ntb/skill.sh).
