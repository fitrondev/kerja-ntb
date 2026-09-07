"use client";

import * as React from "react";

import { toast } from "sonner";

import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardPage() {
  const handleTestToast = (type: "success" | "info" | "warning") => {
    if (type === "success") {
      toast.success("Lowongan Berhasil Disimpan!", {
        description: "Lowongan telah ditambahkan ke daftar bookmark Anda.",
      });
    } else if (type === "info") {
      toast.info("Verifikasi Profil NTB", {
        description: "Lengkapi NIB perusahaan untuk verifikasi otomatis.",
      });
    } else {
      toast.warning("Batas Waktu Lamaran", {
        description: "Ada 1 lowongan yang akan ditutup dalam 24 jam.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <MetricsGrid />

      {/* Interactive Controls Showcase */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">
            Aksi &amp; Notifikasi Interaktif (Sonner + Tooltips)
          </CardTitle>
          <CardDescription>
            Uji coba integrasi sistem notifikasi Sonner dan komponen Tooltip
            shadcn/ui.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {[
            { type: "success" as const, label: "Test Toast Berhasil", tooltip: "Memicu notifikasi sukses via Sonner" },
            { type: "info" as const, label: "Test Toast Info", tooltip: "Memicu notifikasi informasi via Sonner", variant: "secondary" as const },
            { type: "warning" as const, label: "Test Toast Peringatan", tooltip: "Memicu notifikasi peringatan via Sonner", variant: "outline" as const },
          ].map(({ type, label, tooltip, variant }) => (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <Button
                  variant={variant ?? "default"}
                  size="sm"
                  onClick={() => handleTestToast(type)}
                >
                  {label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
