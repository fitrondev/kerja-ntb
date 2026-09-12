"use server";

import { revalidatePath } from "next/cache";

import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import {
  JobStatus,
  ReportStatus,
  UserRole,
  UserStatus,
  VerificationStatus,
} from "@/generated/prisma/enums";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";
import { getPresignedDownloadUrl } from "@/lib/storage/upload";

import type { ActionResponse } from "./types";

// =========================================================================
// 1. MANAJEMEN ROLE PENGGUNA (USER ROLE MANAGEMENT)
// =========================================================================

interface UpdateUserRoleParams {
  targetUserId: string;
  newRole: UserRole;
}

/**
 * Server Action untuk mengubah role akun pengguna di platform KerjaNTB.
 * Wajib dijalankan oleh akun dengan role SUPERADMIN.
 * Memperbarui data di MySQL via Prisma, mencatat AuditLog, dan menyinkronkan metadata ke Clerk.
 */
export async function updateUserRoleAction(
  params: UpdateUserRoleParams
): Promise<ActionResponse<{ role: UserRole }>> {
  try {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "SUPERADMIN") {
      return {
        success: false,
        error:
          "Akses ditolak. Hanya Superadmin yang memiliki otoritas untuk mengubah role pengguna.",
      };
    }

    const { targetUserId, newRole } = params;

    if (!targetUserId || !newRole) {
      return {
        success: false,
        error: "Parameter target pengguna atau role baru tidak valid.",
      };
    }

    // Validasi target user di database
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { company: true },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Pengguna tidak ditemukan dalam sistem.",
      };
    }

    const previousRole = targetUser.role;

    // Update role di MySQL via Prisma
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    // Jika role diubah menjadi COMPANY dan belum memiliki entitas Company, buatkan data awal
    if (newRole === "COMPANY" && !targetUser.company) {
      const emailPrefix = targetUser.email.split("@")[0];
      const companyName = `PT ${emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)} NTB`;
      const baseSlug = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      await prisma.company.create({
        data: {
          userId: targetUserId,
          name: companyName,
          slug,
        },
      });
    }

    // Catat ke AuditLog
    await createAuditLog({
      actorId: admin.id,
      actorRole: admin.role,
      action: "USER_ROLE_UPDATE",
      entityType: "User",
      entityId: targetUserId,
      metadata: {
        targetUserEmail: targetUser.email,
        previousRole,
        newRole,
      },
    });

    // Sinkronkan metadata role ke Clerk agar session JWT terbarui
    try {
      if (targetUser.clerkId && !targetUser.clerkId.startsWith("demo_clerk_")) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(targetUser.clerkId, {
          publicMetadata: {
            role: newRole,
          },
        });
      }
    } catch (clerkErr) {
      console.warn("[Clerk Metadata Sync Warning]:", clerkErr);
    }

    // Invalidate cache halaman dashboard
    revalidatePath("/dashboard/admin/pengguna");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { role: updatedUser.role },
    };
  } catch (error) {
    console.error("[updateUserRoleAction Error]:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan internal saat memperbarui role pengguna.",
    };
  }
}

// =========================================================================
// 2. MODERASI LOWONGAN (JOB MODERATION)
// =========================================================================

const rejectJobSchema = z.object({
  jobId: z.string().min(1, "ID lowongan wajib diisi."),
  rejectionReason: z
    .string()
    .min(
      10,
      "Alasan penolakan minimal 10 karakter agar informatif bagi perusahaan."
    )
    .max(1000, "Alasan penolakan maksimal 1000 karakter."),
});

/**
 * Menyetujui lowongan kerja (Approve).
 * Mengubah status menjadi PUBLISHED, mencatat reviewer admin, jejak audit, dan notifikasi.
 */
export async function approveJobAction(
  jobId: string
): Promise<ActionResponse<{ jobId: string; status: JobStatus }>> {
  try {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "SUPERADMIN") {
      return {
        success: false,
        error:
          "Akses ditolak. Otoritas Superadmin diperlukan untuk memoderasi lowongan.",
      };
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        creator: true,
      },
    });

    if (!job) {
      return {
        success: false,
        error: "Lowongan kerja tidak ditemukan.",
      };
    }

    const now = new Date();
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.PUBLISHED,
        rejectionReason: null,
        reviewedByAdminId: admin.id,
        reviewedAt: now,
      },
    });

    // Catat ke AuditLog
    await createAuditLog({
      actorId: admin.id,
      actorRole: admin.role,
      action: "JOB_APPROVE",
      entityType: "Job",
      entityId: jobId,
      metadata: {
        jobTitle: job.title,
        companyName: job.company?.name || null,
        companyId: job.companyId,
        previousStatus: job.status,
      },
    });

    // Buat notifikasi untuk pembuat lowongan
    try {
      await prisma.notification.create({
        data: {
          userId: job.creatorId,
          title: "Lowongan Disetujui & Dipublikasikan 🎉",
          message: `Lowongan kerja "${job.title}" telah disetujui oleh tim kurator dan kini tayang aktif di bursa KerjaNTB.`,
          type: "JOB_APPROVED",
          linkUrl: `/loker/${job.slug}`,
        },
      });
    } catch (notifErr) {
      console.warn("[approveJobAction Notification Warning]:", notifErr);
    }

    revalidatePath("/dashboard/admin/moderasi");
    revalidatePath("/dashboard/admin/loker");
    revalidatePath("/dashboard/admin");
    revalidatePath(`/loker/${job.slug}`);
    revalidatePath("/loker");

    return {
      success: true,
      data: { jobId: updatedJob.id, status: updatedJob.status },
    };
  } catch (error) {
    console.error("[approveJobAction Error]:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menyetujui lowongan kerja.",
    };
  }
}

/**
 * Menolak lowongan kerja (Reject) dengan alasan penolakan wajib.
 * Mengubah status menjadi REJECTED, mencatat reviewer admin, jejak audit, dan feedback notifikasi.
 */
export async function rejectJobAction(params: {
  jobId: string;
  rejectionReason: string;
}): Promise<ActionResponse<{ jobId: string; status: JobStatus }>> {
  try {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "SUPERADMIN") {
      return {
        success: false,
        error:
          "Akses ditolak. Otoritas Superadmin diperlukan untuk memoderasi lowongan.",
      };
    }

    const parsed = rejectJobSchema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ||
          "Input penolakan lowongan tidak valid.",
      };
    }

    const { jobId, rejectionReason } = parsed.data;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        creator: true,
      },
    });

    if (!job) {
      return {
        success: false,
        error: "Lowongan kerja tidak ditemukan.",
      };
    }

    const now = new Date();
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.REJECTED,
        rejectionReason: rejectionReason.trim(),
        reviewedByAdminId: admin.id,
        reviewedAt: now,
      },
    });

    // Catat ke AuditLog
    await createAuditLog({
      actorId: admin.id,
      actorRole: admin.role,
      action: "JOB_REJECT",
      entityType: "Job",
      entityId: jobId,
      metadata: {
        jobTitle: job.title,
        companyName: job.company?.name || null,
        companyId: job.companyId,
        rejectionReason: rejectionReason.trim(),
        previousStatus: job.status,
      },
    });

    // Buat notifikasi untuk pembuat lowongan dengan alasan penolakan
    try {
      await prisma.notification.create({
        data: {
          userId: job.creatorId,
          title: "Lowongan Belum Dapat Dipublikasikan",
          message: `Lowongan kerja "${job.title}" memerlukan perbaikan sebelum dapat dipublikasikan. Alasan: "${rejectionReason.trim()}". Silakan sunting lowongan Anda di dashboard.`,
          type: "JOB_REJECTED",
          linkUrl: `/dashboard/employer/jobs`,
        },
      });
    } catch (notifErr) {
      console.warn("[rejectJobAction Notification Warning]:", notifErr);
    }

    revalidatePath("/dashboard/admin/moderasi");
    revalidatePath("/dashboard/admin/loker");
    revalidatePath("/dashboard/admin");
    revalidatePath(`/loker/${job.slug}`);
    revalidatePath("/loker");

    return {
      success: true,
      data: { jobId: updatedJob.id, status: updatedJob.status },
    };
  } catch (error) {
    console.error("[rejectJobAction Error]:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menolak lowongan kerja.",
    };
  }
}

// =========================================================================
// 3. VERIFIKASI PERUSAHAAN & NIB (COMPANY VERIFICATION)
// =========================================================================

const rejectVerificationSchema = z.object({
  verificationId: z.string().min(1, "ID verifikasi wajib diisi."),
  rejectionReason: z
    .string()
    .min(10, "Alasan penolakan verifikasi NIB minimal 10 karakter.")
    .max(1000, "Alasan penolakan verifikasi maksimal 1000 karakter."),
});

/**
 * Menyetujui verifikasi legalitas NIB perusahaan.
 * Mengubah status verifikasi menjadi APPROVED, mengaktifkan isVerified pada Company,
 * mencatat jejak audit, dan mengirimkan notifikasi.
 */
export async function approveCompanyVerificationAction(
  verificationId: string
): Promise<ActionResponse<{ verificationId: string; companyId: string }>> {
  try {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "SUPERADMIN") {
      return {
        success: false,
        error:
          "Akses ditolak. Otoritas Superadmin diperlukan untuk verifikasi NIB.",
      };
    }

    const verification = await prisma.companyVerification.findUnique({
      where: { id: verificationId },
      include: {
        company: {
          include: { user: true },
        },
      },
    });

    if (!verification) {
      return {
        success: false,
        error: "Data pengajuan verifikasi perusahaan tidak ditemukan.",
      };
    }

    const now = new Date();

    // Jalankan update CompanyVerification & Company dalam 1 transaksi
    await prisma.$transaction([
      prisma.companyVerification.update({
        where: { id: verificationId },
        data: {
          status: VerificationStatus.APPROVED,
          rejectionReason: null,
          reviewedByAdminId: admin.id,
          reviewedAt: now,
        },
      }),
      prisma.company.update({
        where: { id: verification.companyId },
        data: {
          isVerified: true,
        },
      }),
    ]);

    // Catat ke AuditLog
    await createAuditLog({
      actorId: admin.id,
      actorRole: admin.role,
      action: "COMPANY_VERIFY",
      entityType: "CompanyVerification",
      entityId: verificationId,
      metadata: {
        companyId: verification.companyId,
        companyName: verification.company.name,
        legalName: verification.legalName,
        nib: verification.nib,
      },
    });

    // Kirim notifikasi selamat ke pemilik perusahaan
    try {
      await prisma.notification.create({
        data: {
          userId: verification.company.userId,
          title: "Verifikasi Perusahaan Resmi Disetujui 🛡️",
          message: `Selamat! Pengajuan verifikasi legalitas NIB ${verification.company.name} telah disetujui. Akun Anda kini resmi memiliki Badge Terverifikasi NTB.`,
          type: "VERIFICATION",
          linkUrl: `/perusahaan/${verification.company.slug}`,
        },
      });
    } catch (notifErr) {
      console.warn(
        "[approveCompanyVerificationAction Notification Warning]:",
        notifErr
      );
    }

    revalidatePath("/dashboard/admin/verifikasi");
    revalidatePath("/dashboard/admin/perusahaan");
    revalidatePath("/dashboard/admin");
    revalidatePath(`/perusahaan/${verification.company.slug}`);
    revalidatePath("/dashboard/verification");
    revalidatePath("/dashboard/employer");

    return {
      success: true,
      data: { verificationId, companyId: verification.companyId },
    };
  } catch (error) {
    console.error("[approveCompanyVerificationAction Error]:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menyetujui pengajuan verifikasi NIB.",
    };
  }
}

/**
 * Menolak pengajuan verifikasi NIB perusahaan dengan alasan wajib.
 */
export async function rejectCompanyVerificationAction(params: {
  verificationId: string;
  rejectionReason: string;
}): Promise<ActionResponse<{ verificationId: string; companyId: string }>> {
  try {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "SUPERADMIN") {
      return {
        success: false,
        error:
          "Akses ditolak. Otoritas Superadmin diperlukan untuk verifikasi NIB.",
      };
    }

    const parsed = rejectVerificationSchema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ||
          "Input penolakan verifikasi tidak valid.",
      };
    }

    const { verificationId, rejectionReason } = parsed.data;

    const verification = await prisma.companyVerification.findUnique({
      where: { id: verificationId },
      include: {
        company: {
          include: { user: true },
        },
      },
    });

    if (!verification) {
      return {
        success: false,
        error: "Data pengajuan verifikasi perusahaan tidak ditemukan.",
      };
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.companyVerification.update({
        where: { id: verificationId },
        data: {
          status: VerificationStatus.REJECTED,
          rejectionReason: rejectionReason.trim(),
          reviewedByAdminId: admin.id,
          reviewedAt: now,
        },
      }),
      prisma.company.update({
        where: { id: verification.companyId },
        data: {
          isVerified: false,
        },
      }),
    ]);

    // Catat ke AuditLog
    await createAuditLog({
      actorId: admin.id,
      actorRole: admin.role,
      action: "COMPANY_REJECT",
      entityType: "CompanyVerification",
      entityId: verificationId,
      metadata: {
        companyId: verification.companyId,
        companyName: verification.company.name,
        legalName: verification.legalName,
        nib: verification.nib,
        rejectionReason: rejectionReason.trim(),
      },
    });

    // Kirim notifikasi perbaikan ke pemilik perusahaan
    try {
      await prisma.notification.create({
        data: {
          userId: verification.company.userId,
          title: "Pengajuan Verifikasi NIB Memerlukan Perbaikan",
          message: `Pengajuan verifikasi NIB untuk ${verification.company.name} ditolak. Alasan: "${rejectionReason.trim()}". Silakan unggah dokumen yang valid di dashboard verifikasi.`,
          type: "VERIFICATION",
          linkUrl: `/dashboard/verification`,
        },
      });
    } catch (notifErr) {
      console.warn(
        "[rejectCompanyVerificationAction Notification Warning]:",
        notifErr
      );
    }

    revalidatePath("/dashboard/admin/verifikasi");
    revalidatePath("/dashboard/admin/perusahaan");
    revalidatePath("/dashboard/admin");
    revalidatePath(`/perusahaan/${verification.company.slug}`);
    revalidatePath("/dashboard/verification");
    revalidatePath("/dashboard/employer");

    return {
      success: true,
      data: { verificationId, companyId: verification.companyId },
    };
  } catch (error) {
    console.error("[rejectCompanyVerificationAction Error]:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menolak pengajuan verifikasi NIB.",
    };
  }
}

/**
 * Menghasilkan presigned GET download/preview URL aman dari SumoPod S3
 * untuk berkas legalitas privat NIB.
 */
export async function getSecureVerificationDocUrlAction(
  verificationId: string
): Promise<ActionResponse<{ downloadUrl: string; isPdf: boolean }>> {
  try {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "SUPERADMIN") {
      return {
        success: false,
        error:
          "Akses ditolak. Dokumen legalitas privat hanya dapat dibuka oleh Superadmin.",
      };
    }

    const verification = await prisma.companyVerification.findUnique({
      where: { id: verificationId },
      select: { documentUrl: true },
    });

    if (!verification || !verification.documentUrl) {
      return {
        success: false,
        error: "Berkas dokumen verifikasi tidak ditemukan.",
      };
    }

    const docPath = verification.documentUrl;
    let downloadUrl: string;

    // Jika documentUrl adalah path storage /api/storage/file/{key} atau raw key
    if (docPath.includes("/api/storage/file/")) {
      const storageKey = docPath.split("/api/storage/file/")[1];
      try {
        downloadUrl = await getPresignedDownloadUrl(storageKey, 900); // 15 menit
      } catch {
        downloadUrl = docPath;
      }
    } else if (docPath.startsWith("verifications/")) {
      downloadUrl = await getPresignedDownloadUrl(docPath, 900);
    } else {
      downloadUrl = docPath;
    }

    const isPdf =
      docPath.toLowerCase().endsWith(".pdf") ||
      downloadUrl.toLowerCase().includes(".pdf");

    return {
      success: true,
      data: { downloadUrl, isPdf },
    };
  } catch (error) {
    console.error("[getSecureVerificationDocUrlAction Error]:", error);
    return {
      success: false,
      error: "Gagal menghasilkan tautan dokumen privat aman.",
    };
  }
}

// =========================================================================
// 4. PENANGANAN LAPORAN PELANGGARAN & ANTI-FRAUD (REPORT RESOLUTION)
// =========================================================================

export type ReportActionType =
  "PAUSE_JOB" | "REMOVE_JOB" | "SUSPEND_USER" | "DISMISS" | "MARK_REVIEWED";

const resolveReportSchema = z.object({
  reportId: z.string().min(1, "ID laporan wajib diisi."),
  actionType: z.enum([
    "PAUSE_JOB",
    "REMOVE_JOB",
    "SUSPEND_USER",
    "DISMISS",
    "MARK_REVIEWED",
  ]),
  actionNotes: z
    .string()
    .min(5, "Catatan penanganan laporan wajib minimal 5 karakter.")
    .max(2000, "Catatan penanganan maksimal 2000 karakter."),
});

/**
 * Menindaklanjuti laporan pelanggaran lowongan/pengguna dari pelapor.
 * Mendukung tindakan: Pause Loker, Remove Loker, Suspend Pengguna, Dismiss, atau Review.
 */
export async function resolveReportAction(params: {
  reportId: string;
  actionType: ReportActionType;
  actionNotes: string;
}): Promise<ActionResponse<{ reportId: string; status: ReportStatus }>> {
  try {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "SUPERADMIN") {
      return {
        success: false,
        error:
          "Akses ditolak. Otoritas Superadmin diperlukan untuk menindak laporan.",
      };
    }

    const parsed = resolveReportSchema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ||
          "Input penanganan laporan tidak valid.",
      };
    }

    const { reportId, actionType, actionNotes } = parsed.data;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        job: {
          include: {
            creator: true,
            company: true,
          },
        },
        reporter: true,
      },
    });

    if (!report) {
      return {
        success: false,
        error: "Data laporan tidak ditemukan.",
      };
    }

    const now = new Date();
    let newReportStatus: ReportStatus = ReportStatus.ACTION_TAKEN;

    switch (actionType) {
      case "PAUSE_JOB": {
        // Jeda lowongan agar tidak muncul di publik sementara
        await prisma.$transaction([
          prisma.job.update({
            where: { id: report.jobId },
            data: { status: JobStatus.PAUSED },
          }),
          prisma.report.update({
            where: { id: reportId },
            data: {
              status: ReportStatus.ACTION_TAKEN,
              actionNotes: `[JEDA LOKER]: ${actionNotes.trim()}`,
              resolvedByAdminId: admin.id,
              resolvedAt: now,
            },
          }),
        ]);

        await createAuditLog({
          actorId: admin.id,
          actorRole: admin.role,
          action: "REPORT_JOB_PAUSE",
          entityType: "Report",
          entityId: reportId,
          metadata: {
            jobId: report.jobId,
            jobTitle: report.job.title,
            actionNotes: actionNotes.trim(),
          },
        });
        break;
      }

      case "REMOVE_JOB": {
        // Hapus/cabut publikasi lowongan pelanggar
        await prisma.$transaction([
          prisma.job.update({
            where: { id: report.jobId },
            data: { status: JobStatus.REMOVED },
          }),
          prisma.report.update({
            where: { id: reportId },
            data: {
              status: ReportStatus.ACTION_TAKEN,
              actionNotes: `[HAPUS LOKER]: ${actionNotes.trim()}`,
              resolvedByAdminId: admin.id,
              resolvedAt: now,
            },
          }),
        ]);

        await createAuditLog({
          actorId: admin.id,
          actorRole: admin.role,
          action: "REPORT_JOB_REMOVE",
          entityType: "Report",
          entityId: reportId,
          metadata: {
            jobId: report.jobId,
            jobTitle: report.job.title,
            actionNotes: actionNotes.trim(),
          },
        });
        break;
      }

      case "SUSPEND_USER": {
        // Suspend akun pemilik lowongan dan cabut semua lokernya
        const targetUserId = report.job.creatorId;

        await prisma.$transaction([
          prisma.user.update({
            where: { id: targetUserId },
            data: { status: UserStatus.SUSPENDED },
          }),
          prisma.job.update({
            where: { id: report.jobId },
            data: { status: JobStatus.REMOVED },
          }),
          prisma.report.update({
            where: { id: reportId },
            data: {
              status: ReportStatus.ACTION_TAKEN,
              actionNotes: `[SUSPEND AKUN]: ${actionNotes.trim()}`,
              resolvedByAdminId: admin.id,
              resolvedAt: now,
            },
          }),
        ]);

        await createAuditLog({
          actorId: admin.id,
          actorRole: admin.role,
          action: "REPORT_USER_SUSPEND",
          entityType: "Report",
          entityId: reportId,
          metadata: {
            suspendedUserId: targetUserId,
            suspendedUserEmail: report.job.creator.email,
            jobId: report.jobId,
            actionNotes: actionNotes.trim(),
          },
        });
        break;
      }

      case "DISMISS": {
        newReportStatus = ReportStatus.DISMISSED;
        await prisma.report.update({
          where: { id: reportId },
          data: {
            status: ReportStatus.DISMISSED,
            actionNotes: `[DIABAIKAN]: ${actionNotes.trim()}`,
            resolvedByAdminId: admin.id,
            resolvedAt: now,
          },
        });

        await createAuditLog({
          actorId: admin.id,
          actorRole: admin.role,
          action: "REPORT_DISMISS",
          entityType: "Report",
          entityId: reportId,
          metadata: {
            jobId: report.jobId,
            actionNotes: actionNotes.trim(),
          },
        });
        break;
      }

      case "MARK_REVIEWED": {
        newReportStatus = ReportStatus.REVIEWED;
        await prisma.report.update({
          where: { id: reportId },
          data: {
            status: ReportStatus.REVIEWED,
            actionNotes: `[DITINJAU]: ${actionNotes.trim()}`,
            resolvedByAdminId: admin.id,
            resolvedAt: now,
          },
        });

        await createAuditLog({
          actorId: admin.id,
          actorRole: admin.role,
          action: "REPORT_REVIEW",
          entityType: "Report",
          entityId: reportId,
          metadata: {
            jobId: report.jobId,
            actionNotes: actionNotes.trim(),
          },
        });
        break;
      }
    }

    revalidatePath("/dashboard/admin/laporan");
    revalidatePath("/dashboard/admin/moderasi");
    revalidatePath("/dashboard/admin/loker");
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      data: { reportId, status: newReportStatus },
    };
  } catch (error) {
    console.error("[resolveReportAction Error]:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal memproses tindakan terhadap laporan.",
    };
  }
}
