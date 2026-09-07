import * as React from "react";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionHeaderAction {
  href: string;
  label: string;
}

export interface SectionHeaderProps {
  /** Teks label badge kecil di atas judul */
  label: string | React.ReactNode;
  /** Judul utama section (h2) */
  title: string | React.ReactNode;
  /** Deskripsi / subtitle section */
  description?: string;
  /** Penyelarasan konten: 'left' atau 'center' */
  align?: "left" | "center";
  /** Warna badge: 'primary' (default) atau 'chart' (emerald) */
  labelVariant?: "primary" | "chart";
  /** Tombol CTA opsional di kanan (atau bawah jika center) */
  action?: SectionHeaderAction;
  className?: string;
}

/**
 * Reusable section header dengan badge label, judul, deskripsi,
 * dan tombol CTA opsional. Digunakan di seluruh sections homepage.
 */
export function SectionHeader({
  label,
  title,
  description,
  align = "left",
  labelVariant = "primary",
  action,
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  const badgeClassName =
    labelVariant === "chart"
      ? "bg-chart-1/10 text-chart-1 border-chart-1/20 text-xs font-semibold tracking-wider uppercase"
      : "bg-primary/10 text-primary border-primary/20 text-xs font-semibold tracking-wider uppercase";

  return (
    <div
      className={cn(
        "flex gap-4",
        isCenter
          ? "flex-col items-center text-center"
          : "flex-col justify-between sm:flex-row sm:items-end",
        className,
      )}
    >
      <div className={cn("space-y-1", isCenter && "max-w-2xl")}>
        <Badge variant="outline" className={badgeClassName}>
          {label}
        </Badge>
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      {action && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-1.5 self-start sm:self-auto"
        >
          <Link href={action.href}>
            <span>{action.label}</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
