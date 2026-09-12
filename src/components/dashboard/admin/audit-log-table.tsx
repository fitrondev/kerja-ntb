"use client";

import { useMemo, useState } from "react";

import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCode,
  Filter,
  Globe,
  Monitor,
  Search,
  Shield,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface SerializedAuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      avatarUrl: string | null;
    } | null;
  };
}

interface AuditLogTableProps {
  initialLogs: SerializedAuditLog[];
}

export function AuditLogTable({ initialLogs }: AuditLogTableProps) {
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<SerializedAuditLog | null>(
    null
  );

  const entityCounts = useMemo(() => {
    const counts = {
      total: initialLogs.length,
      Job: 0,
      CompanyVerification: 0,
      Report: 0,
      User: 0,
    };
    for (const log of initialLogs) {
      if (log.entityType in counts) {
        counts[log.entityType as keyof typeof counts]++;
      }
    }
    return counts;
  }, [initialLogs]);

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      if (entityFilter !== "ALL" && log.entityType !== entityFilter)
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchEmail = log.actor.email.toLowerCase().includes(q);
        const matchName =
          log.actor.profile?.fullName.toLowerCase().includes(q) || false;
        const matchEntity = log.entityType.toLowerCase().includes(q);
        const matchEntityId = log.entityId.toLowerCase().includes(q);
        const matchIp = log.ipAddress?.toLowerCase().includes(q) || false;
        return (
          matchAction ||
          matchEmail ||
          matchName ||
          matchEntity ||
          matchEntityId ||
          matchIp
        );
      }

      return true;
    });
  }, [initialLogs, entityFilter, searchQuery]);

  const getActionBadge = (action: string) => {
    if (action.includes("APPROVE") || action === "COMPANY_VERIFY") {
      return (
        <Badge
          variant="secondary"
          className="border-0 bg-emerald-500/15 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2 className="mr-1 size-3" />
          {action}
        </Badge>
      );
    }
    if (
      action.includes("REJECT") ||
      action.includes("REMOVE") ||
      action.includes("SUSPEND")
    ) {
      return (
        <Badge variant="destructive" className="text-[11px] font-semibold">
          <XCircle className="mr-1 size-3" />
          {action}
        </Badge>
      );
    }
    if (action.includes("PAUSE") || action.includes("DISMISS")) {
      return (
        <Badge
          variant="secondary"
          className="border-0 bg-amber-500/15 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
        >
          <Clock className="mr-1 size-3" />
          {action}
        </Badge>
      );
    }
    if (action.includes("ROLE")) {
      return (
        <Badge
          variant="secondary"
          className="border-0 bg-purple-500/15 text-[11px] font-semibold text-purple-700 dark:text-purple-400"
        >
          <Shield className="mr-1 size-3" />
          {action}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[11px]">
        {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="border-border bg-card flex flex-wrap items-center gap-1.5 rounded-xl border p-1">
          <Button
            size="sm"
            variant={entityFilter === "ALL" ? "default" : "ghost"}
            onClick={() => setEntityFilter("ALL")}
            className="h-8 text-xs font-semibold"
          >
            <span>Semua Entitas ({entityCounts.total})</span>
          </Button>
          <Button
            size="sm"
            variant={entityFilter === "Job" ? "default" : "ghost"}
            onClick={() => setEntityFilter("Job")}
            className="h-8 text-xs font-semibold"
          >
            <span>Lowongan ({entityCounts.Job})</span>
          </Button>
          <Button
            size="sm"
            variant={
              entityFilter === "CompanyVerification" ? "default" : "ghost"
            }
            onClick={() => setEntityFilter("CompanyVerification")}
            className="h-8 text-xs font-semibold"
          >
            <span>Verifikasi NIB ({entityCounts.CompanyVerification})</span>
          </Button>
          <Button
            size="sm"
            variant={entityFilter === "Report" ? "default" : "ghost"}
            onClick={() => setEntityFilter("Report")}
            className="h-8 text-xs font-semibold"
          >
            <span>Laporan ({entityCounts.Report})</span>
          </Button>
          <Button
            size="sm"
            variant={entityFilter === "User" ? "default" : "ghost"}
            onClick={() => setEntityFilter("User")}
            className="h-8 text-xs font-semibold"
          >
            <span>Pengguna ({entityCounts.User})</span>
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Cari aksi, admin, IP, entitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Log Items */}
      {filteredLogs.length === 0 ? (
        <Card className="border-border">
          <CardContent className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center text-xs">
            <Activity className="text-muted-foreground mb-2 size-10" />
            <p className="text-foreground text-sm font-bold">
              Belum Ada Catatan Jejak Audit
            </p>
            <p className="mt-1 max-w-sm">
              Setiap tindakan persetujuan, penolakan, sanksi laporan, dan
              perubahan role akan otomatis tercatat di sini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <Card
              key={log.id}
              className="border-border/80 hover:border-primary/40 transition-all hover:shadow-xs"
            >
              <CardContent className="p-3.5 sm:p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getActionBadge(log.action)}

                      <Badge variant="outline" className="text-[10px]">
                        Entitas: {log.entityType}
                      </Badge>

                      <span className="text-muted-foreground font-mono text-xs">
                        #{log.entityId.slice(0, 10)}...
                      </span>
                    </div>

                    <div className="text-muted-foreground flex flex-wrap items-center gap-2.5 pt-0.5 text-xs">
                      <span className="text-foreground font-semibold">
                        Admin: {log.actor.profile?.fullName || log.actor.email}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="text-muted-foreground size-3" />
                        <span>{log.createdAt}</span>
                      </span>
                      {log.ipAddress && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Globe className="text-muted-foreground size-3" />
                            <span>IP: {log.ipAddress}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tombol Inspect Metadata */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedLog(log)}
                      className="text-muted-foreground h-7 gap-1 text-xs font-semibold"
                    >
                      <Eye className="size-3" />
                      <span>Lihat Rincian</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOG RINCIAN AUDIT LOG & METADATA */}
      {/* ========================================================================= */}
      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <DialogContent className="max-w-lg">
          {selectedLog && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold">
                    Rincian Jejak Audit
                  </DialogTitle>
                  {getActionBadge(selectedLog.action)}
                </div>
                <DialogDescription className="text-xs">
                  ID Catatan: {selectedLog.id} • Dicatat pada{" "}
                  {selectedLog.createdAt}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="border-border bg-muted/20 space-y-2 rounded-xl border p-3">
                  <div className="border-border/50 flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">Aktor Admin:</span>
                    <span className="text-foreground font-semibold">
                      {selectedLog.actor.profile?.fullName ||
                        selectedLog.actor.email}{" "}
                      ({selectedLog.actorRole})
                    </span>
                  </div>
                  <div className="border-border/50 flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">Tipe Entitas:</span>
                    <span className="text-foreground font-semibold">
                      {selectedLog.entityType}
                    </span>
                  </div>
                  <div className="border-border/50 flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">ID Entitas:</span>
                    <span className="text-foreground font-mono">
                      {selectedLog.entityId}
                    </span>
                  </div>
                  <div className="border-border/50 flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">Alamat IP:</span>
                    <span className="text-foreground font-mono">
                      {selectedLog.ipAddress || "-"}
                    </span>
                  </div>
                  <div className="pt-0.5">
                    <span className="text-muted-foreground block">
                      User-Agent:
                    </span>
                    <p className="text-foreground/80 mt-0.5 font-mono text-[11px] break-all">
                      {selectedLog.userAgent || "-"}
                    </p>
                  </div>
                </div>

                {/* Metadata JSON Viewer */}
                <div>
                  <div className="text-foreground mb-1 flex items-center gap-1.5 font-bold">
                    <FileCode className="text-primary size-3.5" />
                    <span>Metadata Perubahan:</span>
                  </div>
                  <pre className="border-border bg-card text-foreground max-h-56 overflow-auto rounded-xl border p-3 font-mono text-[11px] leading-relaxed">
                    {selectedLog.metadata
                      ? JSON.stringify(selectedLog.metadata, null, 2)
                      : "Tidak ada metadata tambahan."}
                  </pre>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                  className="text-xs"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
