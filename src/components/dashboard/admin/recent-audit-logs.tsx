import Link from "next/link";

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RecentAuditLogItem {
  id: string;
  action: string;
  entityType: string;
  actorEmail: string;
  actorName: string | null;
  createdAt: string;
}

interface RecentAuditLogsProps {
  logs: RecentAuditLogItem[];
}

export function RecentAuditLogs({ logs }: RecentAuditLogsProps) {
  const getBadge = (action: string) => {
    if (action.includes("APPROVE") || action === "COMPANY_VERIFY") {
      return (
        <Badge
          variant="secondary"
          className="border-0 bg-emerald-500/15 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2 className="mr-1 size-2.5" />
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
        <Badge variant="destructive" className="text-[10px] font-semibold">
          <XCircle className="mr-1 size-2.5" />
          {action}
        </Badge>
      );
    }
    if (action.includes("PAUSE") || action.includes("DISMISS")) {
      return (
        <Badge
          variant="secondary"
          className="border-0 bg-amber-500/15 text-[10px] font-semibold text-amber-700 dark:text-amber-400"
        >
          <Clock className="mr-1 size-2.5" />
          {action}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px]">
        {action}
      </Badge>
    );
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Activity className="text-primary size-4.5" />
            <span>Jejak Audit Aktivitas Admin</span>
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            Riwayat keputusan moderasi, verifikasi, dan penanganan laporan
            terbaru.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs">
          <Link href="/dashboard/admin/audit-log" className="gap-1">
            <span>Lihat Semua</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {logs.length === 0 ? (
          <div className="border-border/60 text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center text-xs">
            <Activity className="text-muted-foreground mb-1.5 size-7" />
            <span className="text-foreground font-semibold">
              Belum Ada Aktivitas
            </span>
            <span>
              Aksi moderasi dan administrasi akan tercatat secara otomatis.
            </span>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="border-border/60 hover:bg-muted/30 flex items-center justify-between rounded-xl border p-3 transition-colors"
            >
              <div className="min-w-0 space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  {getBadge(log.action)}
                  <span className="text-muted-foreground text-xs">
                    pada entitas <strong>{log.entityType}</strong>
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
                  <span>Oleh: {log.actorName || log.actorEmail}</span>
                  <span>•</span>
                  <span>{log.createdAt}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
