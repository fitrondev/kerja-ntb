import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import {
  AuditLogTable,
  SerializedAuditLog,
} from "@/components/dashboard/admin/audit-log-table";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Jejak Audit Sistem (Audit Log) | KerjaNTB",
  description:
    "Rekam jejak seluruh keputusan administratif dan aksi moderasi Superadmin pada platform KerjaNTB.",
};

export default async function AdminAuditLogPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const serializedLogs: SerializedAuditLog[] = logs.map((log) => ({
    id: log.id,
    actorId: log.actorId,
    actorRole: log.actorRole,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: log.metadata ? (log.metadata as Record<string, unknown>) : null,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: new Date(log.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    actor: {
      id: log.actor.id,
      email: log.actor.email,
      profile: log.actor.profile
        ? {
            fullName: log.actor.profile.fullName,
            avatarUrl: log.actor.profile.avatarUrl,
          }
        : null,
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Jejak Audit Sistem (Audit Log)
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Transparansi tata kelola dan arsip kepatuhan atas seluruh tindakan
            moderasi lowongan, verifikasi NIB, penegakan sanksi laporan, dan
            perubahan role akun.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/admin">
            <ArrowLeft className="mr-1.5 size-4" />
            <span>Kembali ke Panel Admin</span>
          </Link>
        </Button>
      </div>

      <AuditLogTable initialLogs={serializedLogs} />
    </div>
  );
}
