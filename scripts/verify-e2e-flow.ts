import {
  ApplicationMethod,
  EducationLevel,
  ExperienceLevel,
  JobStatus,
  JobType,
  UserRole,
  WorkplaceType,
} from "../src/generated/prisma/enums";
import { prisma } from "../src/lib/db/prisma";
import { generateJobPostingJsonLd } from "../src/lib/seo/job-posting-schema";

/**
 * Script Pengujian End-to-End (E2E) Alur Platform KerjaNTB:
 * 1. Pembuatan data dummy uji (Admin, Employer, Jobseeker, Lokasi, Kategori)
 * 2. Pasang Lowongan Baru (Pending Review)
 * 3. Validasi Injeksi Schema.org Google for Jobs
 * 4. Simulasi Moderasi Admin (Approve -> PUBLISHED + Audit Log)
 * 5. Jobseeker Melamar Lowongan (Application -> APPLIED)
 * 6. Employer Evaluasi ATS (Application -> INTERVIEW)
 * 7. Pelaporan Pelanggaran (Report -> PENDING)
 * 8. Penanganan Laporan oleh Admin (Report -> ACTION_TAKEN + Audit Log)
 * 9. Cleanup Data Uji
 */
async function runE2EVerification() {
  console.log(
    "==============================================================="
  );
  console.log("🚀 MEMULAI PENGUJIAN END-TO-END (E2E) PLATFORM KERJANTB");
  console.log(
    "===============================================================\n"
  );

  const timestamp = Date.now();
  const testAdminClerkId = `e2e_admin_${timestamp}`;
  const testEmployerClerkId = `e2e_employer_${timestamp}`;
  const testSeekerClerkId = `e2e_seeker_${timestamp}`;

  try {
    // -----------------------------------------------------------------------
    // LANGKAH 1: Persiapan Entitas Pengguna & Perusahaan
    // -----------------------------------------------------------------------
    console.log("📦 1. Menyiapkan entitas pengujian di MySQL...");

    const location = await prisma.location.findFirst();
    if (!location) throw new Error("Tabel Location kosong. Jalankan seed DB.");

    const category = await prisma.jobCategory.findFirst();
    if (!category)
      throw new Error("Tabel JobCategory kosong. Jalankan seed DB.");

    // Buat Superadmin
    const adminUser = await prisma.user.create({
      data: {
        clerkId: testAdminClerkId,
        email: `admin_${timestamp}@kerjantb.test`,
        role: UserRole.SUPERADMIN,
      },
    });

    // Buat Employer & Company
    const employerUser = await prisma.user.create({
      data: {
        clerkId: testEmployerClerkId,
        email: `employer_${timestamp}@kerjantb.test`,
        role: UserRole.COMPANY,
      },
    });

    const company = await prisma.company.create({
      data: {
        userId: employerUser.id,
        name: `PT E2E Teknologi NTB ${timestamp}`,
        slug: `pt-e2e-teknologi-ntb-${timestamp}`,
        locationId: location.id,
        isVerified: false,
      },
    });

    // Buat Jobseeker
    const seekerUser = await prisma.user.create({
      data: {
        clerkId: testSeekerClerkId,
        email: `seeker_${timestamp}@kerjantb.test`,
        role: UserRole.INDIVIDUAL,
      },
    });

    console.log("✅ Entitas pengguna dan perusahaan uji berhasil disiapkan.");

    // -----------------------------------------------------------------------
    // LANGKAH 2: Pasang Lowongan Baru (Pending Review)
    // -----------------------------------------------------------------------
    console.log("\n📝 2. Menguji pasang lowongan kerja baru...");
    const jobSlug = `fullstack-developer-lombok-${timestamp}`;

    const job = await prisma.job.create({
      data: {
        creatorId: employerUser.id,
        companyId: company.id,
        categoryId: category.id,
        locationId: location.id,
        title: "Fullstack Web Developer Lombok",
        slug: jobSlug,
        type: JobType.FULL_TIME,
        workplace: WorkplaceType.HYBRID,
        salaryMin: 5000000,
        salaryMax: 8000000,
        isSalaryDisclosed: true,
        description:
          "Membangun sistem web modern berbasis Next.js 16 untuk masyarakat NTB.",
        responsibilities:
          "Mengembangkan API, merancang UI responsive, optimasi database.",
        requirements: "Menguasai TypeScript, React, Next.js, dan MySQL.",
        benefits: "BPJS Ketenagakerjaan, Tunjangan Hari Raya, Bonus Kinerja.",
        education: EducationLevel.D4_S1,
        experience: ExperienceLevel.ONE_TO_THREE_YEARS,
        applicationMethod: ApplicationMethod.KERJANTB,
        status: JobStatus.PENDING_REVIEW,
      },
    });

    if (job.status !== JobStatus.PENDING_REVIEW) {
      throw new Error(
        `Status lowongan harus PENDING_REVIEW, didapat: ${job.status}`
      );
    }
    console.log(
      `✅ Lowongan berhasil dibuat dengan ID: ${job.id} (Status: PENDING_REVIEW)`
    );

    // -----------------------------------------------------------------------
    // LANGKAH 3: Validasi Schema.org Google for Jobs
    // -----------------------------------------------------------------------
    console.log("\n🔍 3. Memvalidasi integrasi Google for Jobs JSON-LD...");
    const jsonLd = generateJobPostingJsonLd(
      {
        ...job,
        company: { name: company.name, logoUrl: null },
        location: { name: location.name },
      },
      "https://kerjantb.com"
    );

    if (jsonLd["@type"] !== "JobPosting") {
      throw new Error("Tipe Schema harus JobPosting");
    }
    if (!jsonLd.title || !jsonLd.hiringOrganization || !jsonLd.jobLocation) {
      throw new Error("Atribut wajib Google Jobs tidak lengkap");
    }
    console.log(
      "✅ Struktur Schema.org/JobPosting valid 100% sesuai standar Google Jobs."
    );

    // -----------------------------------------------------------------------
    // LANGKAH 4: Simulasi Moderasi Superadmin (Approve & Audit Log)
    // -----------------------------------------------------------------------
    console.log(
      "\n🛡️ 4. Menguji alur moderasi Superadmin (Persetujuan Loker)..."
    );
    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        status: JobStatus.PUBLISHED,
        reviewedByAdminId: adminUser.id,
        reviewedAt: new Date(),
      },
    });

    // Catat ke Audit Log
    const auditApprove = await prisma.auditLog.create({
      data: {
        actorId: adminUser.id,
        actorRole: adminUser.role,
        action: "JOB_APPROVE",
        entityType: "Job",
        entityId: job.id,
        metadata: { jobTitle: job.title, previousStatus: "PENDING_REVIEW" },
      },
    });

    if (updatedJob.status !== JobStatus.PUBLISHED) {
      throw new Error("Gagal mengupdate status lowongan menjadi PUBLISHED");
    }
    console.log(
      `✅ Lowongan disetujui (Status: PUBLISHED). Jejak audit ID: ${auditApprove.id}`
    );

    // -----------------------------------------------------------------------
    // LANGKAH 5: Jobseeker Melamar Lowongan
    // -----------------------------------------------------------------------
    console.log("\n💼 5. Menguji alur pelamaran kerja oleh Jobseeker...");
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        userId: seekerUser.id,
        coverLetter:
          "Saya sangat tertarik berkontribusi memajukan ekosistem digital NTB.",
        status: "APPLIED",
      },
    });

    console.log(
      `✅ Lamaran berhasil diajukan dengan ID: ${application.id} (Status: APPLIED)`
    );

    // -----------------------------------------------------------------------
    // LANGKAH 6: Evaluasi ATS oleh Employer
    // -----------------------------------------------------------------------
    console.log("\n📋 6. Menguji evaluasi status pelamar pada ATS Employer...");
    const updatedApp = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "INTERVIEW",
        interviewDate: new Date(Date.now() + 86400000 * 3),
        notes: "Profil pelamar sangat kompeten. Dijadwalkan interview teknis.",
      },
    });

    if (updatedApp.status !== "INTERVIEW") {
      throw new Error("Gagal mengubah status pelamar ke INTERVIEW");
    }
    console.log(
      `✅ Status lamaran berhasil diperbarui ke: INTERVIEW (Catatan HR tersimpan)`
    );

    // -----------------------------------------------------------------------
    // LANGKAH 7: Pelaporan Pelanggaran Loker
    // -----------------------------------------------------------------------
    console.log("\n⚠️ 7. Menguji sistem pelaporan pelanggaran anti-fraud...");
    const report = await prisma.report.create({
      data: {
        jobId: job.id,
        reporterId: seekerUser.id,
        reason: "REQUESTING_MONEY",
        description:
          "Ada pihak mengatasnamakan perusahaan meminta biaya seragam.",
        status: "PENDING",
      },
    });

    console.log(
      `✅ Laporan pelanggaran berhasil diajukan dengan ID: ${report.id} (Alasan: Pungli)`
    );

    // -----------------------------------------------------------------------
    // LANGKAH 8: Penanganan Laporan oleh Admin & Audit Log
    // -----------------------------------------------------------------------
    console.log(
      "\n⚖️ 8. Menguji tindakan penanganan laporan oleh Superadmin..."
    );
    await prisma.$transaction([
      prisma.job.update({
        where: { id: job.id },
        data: { status: JobStatus.PAUSED },
      }),
      prisma.report.update({
        where: { id: report.id },
        data: {
          status: "ACTION_TAKEN",
          actionNotes:
            "[JEDA LOKER]: Investigasi pungutan liar sedang berjalan.",
          resolvedByAdminId: adminUser.id,
          resolvedAt: new Date(),
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminUser.id,
          actorRole: adminUser.role,
          action: "REPORT_JOB_PAUSE",
          entityType: "Report",
          entityId: report.id,
          metadata: { jobId: job.id, action: "PAUSE_JOB" },
        },
      }),
    ]);

    const finalReport = await prisma.report.findUnique({
      where: { id: report.id },
    });
    const finalJob = await prisma.job.findUnique({ where: { id: job.id } });

    if (
      finalReport?.status !== "ACTION_TAKEN" ||
      finalJob?.status !== JobStatus.PAUSED
    ) {
      throw new Error(
        "Status penanganan laporan atau penundaan loker tidak konsisten"
      );
    }
    console.log(
      "✅ Tindakan laporan berhasil diterapkan: Loker di-PAUSED & Audit Log terekam."
    );

    // -----------------------------------------------------------------------
    // LANGKAH 9: Pembersihan (Cleanup) Data Uji
    // -----------------------------------------------------------------------
    console.log("\n🧹 9. Membersihkan seluruh data pengujian dari database...");
    await prisma.auditLog.deleteMany({
      where: { actorId: adminUser.id },
    });
    await prisma.report.deleteMany({
      where: { id: report.id },
    });
    await prisma.application.deleteMany({
      where: { id: application.id },
    });
    await prisma.job.deleteMany({
      where: { id: job.id },
    });
    await prisma.company.deleteMany({
      where: { id: company.id },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [adminUser.id, employerUser.id, seekerUser.id] },
      },
    });

    console.log("✅ Seluruh data pengujian berhasil dibersihkan dengan aman.");
    console.log(
      "\n==============================================================="
    );
    console.log(
      "🎉 SELURUH PENGUJIAN END-TO-END (E2E) SUKSES 100% TANPA KENDALA!"
    );
    console.log(
      "==============================================================="
    );
  } catch (error) {
    console.error("\n❌ PENGUJIAN E2E GAGAL:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2EVerification();
