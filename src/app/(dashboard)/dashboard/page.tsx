"use client";

import * as React from "react";

import Link from "next/link";

import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileCheck2,
  FileText,
  MapPin,
  PlusCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
      {/* Welcome Banner */}
      <div className="from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden rounded-xl bg-gradient-to-r p-6 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <Badge
            variant="secondary"
            className="border-0 bg-white/20 text-white hover:bg-white/30"
          >
            Portal Karir NTB Terpercaya
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Selamat Datang di KerjaNTB
          </h1>
          <p className="text-primary-foreground/85 text-sm sm:text-base">
            Pusat peluang karir terverifikasi di 10 Kabupaten/Kota se-Nusa
            Tenggara Barat. Kelola profil, lamaran kerja, atau pasang lowongan
            untuk perusahaan Anda.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="text-primary bg-white font-medium hover:bg-white/90"
            >
              <Link href="/dashboard/jobs/new">
                <PlusCircle className="mr-1.5 size-4" />
                Pasang Lowongan Baru
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-primary-foreground/10 border-white/30 text-white hover:bg-white/20"
            >
              <Link href="/jobs">
                <ArrowUpRight className="mr-1.5 size-4" />
                Eksplor Lowongan NTB
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Lowongan Aktif
            </CardTitle>
            <div className="bg-primary/10 text-primary rounded-md p-2">
              <Briefcase className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <TrendingUp className="size-3 text-emerald-600" />
              <span className="font-medium text-emerald-600">+12%</span> minggu
              ini di NTB
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Lamaran Terkirim
            </CardTitle>
            <div className="rounded-md bg-blue-500/10 p-2 text-blue-600">
              <FileCheck2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-muted-foreground mt-1 text-xs">
              1 Menunggu Interview
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              CV & Resume Aktif
            </CardTitle>
            <div className="rounded-md bg-purple-500/10 p-2 text-purple-600">
              <FileText className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Versi IT & Administrasi
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Status Verifikasi NTB
            </CardTitle>
            <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Terverifikasi</span>
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-[10px] text-emerald-600"
              >
                Resmi
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              NIB Valid & Terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Controls Showcase (Sonner & Tooltips) */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">
            Aksi & Notifikasi Interaktif (Sonner + Tooltips)
          </CardTitle>
          <CardDescription>
            Uji coba integrasi sistem notifikasi Sonner dan komponen Tooltip
            shadcn/ui.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleTestToast("success")}
              >
                Test Toast Berhasil
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Memicu notifikasi sukses via Sonner</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleTestToast("info")}
              >
                Test Toast Info
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Memicu notifikasi informasi via Sonner</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestToast("warning")}
              >
                Test Toast Peringatan
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Memicu notifikasi peringatan via Sonner</p>
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    </div>
  );
}
