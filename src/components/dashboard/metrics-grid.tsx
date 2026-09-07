import * as React from "react";

import {
  Briefcase,
  CheckCircle2,
  FileCheck2,
  FileText,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Grid 4 kartu metrik ringkasan dashboard KerjaNTB.
 * Data bersifat statis (placeholder) hingga dihubungkan ke API.
 */
export function MetricsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Lowongan Aktif"
        value="142"
        icon={Briefcase}
        iconClass="bg-primary/10 text-primary"
        footer={
          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
            <TrendingUp className="size-3 text-emerald-600" />
            <span className="font-medium text-emerald-600">+12%</span> minggu
            ini di NTB
          </p>
        }
      />
      <MetricCard
        title="Lamaran Terkirim"
        value="4"
        icon={FileCheck2}
        iconClass="rounded-md bg-blue-500/10 p-2 text-blue-600"
        footer={
          <p className="text-muted-foreground mt-1 text-xs">
            1 Menunggu Interview
          </p>
        }
      />
      <MetricCard
        title="CV & Resume Aktif"
        value="2"
        icon={FileText}
        iconClass="rounded-md bg-purple-500/10 p-2 text-purple-600"
        footer={
          <p className="text-muted-foreground mt-1 text-xs">
            Versi IT &amp; Administrasi
          </p>
        }
      />
      <MetricCard
        title="Status Verifikasi NTB"
        icon={CheckCircle2}
        iconClass="rounded-md bg-emerald-500/10 p-2 text-emerald-600"
        footer={
          <p className="text-muted-foreground mt-1 text-xs">
            NIB Valid &amp; Terdaftar
          </p>
        }
        customValue={
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">Terverifikasi</span>
            <Badge
              variant="outline"
              className="border-emerald-500/40 text-[10px] text-emerald-600"
            >
              Resmi
            </Badge>
          </div>
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// MetricCard (sub-component lokal)
// ---------------------------------------------------------------------------

interface MetricCardProps {
  title: string;
  value?: string;
  customValue?: React.ReactNode;
  icon: React.ElementType;
  iconClass: string;
  footer?: React.ReactNode;
}

function MetricCard({
  title,
  value,
  customValue,
  icon: Icon,
  iconClass,
  footer,
}: MetricCardProps) {
  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <div className={`rounded-md p-2 ${iconClass}`}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        {customValue ?? <div className="text-2xl font-bold">{value}</div>}
        {footer}
      </CardContent>
    </Card>
  );
}
