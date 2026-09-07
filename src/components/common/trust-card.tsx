import * as React from "react";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TrustCardProps {
  /** Komponen icon Lucide */
  icon: LucideIcon;
  /** Kelas warna untuk wrapper icon (bg + text) */
  iconClassName?: string;
  /** Judul kartu */
  title: string;
  /** Deskripsi kartu */
  description: string;
  className?: string;
}

/**
 * Reusable trust/feature card dengan icon, judul, dan deskripsi.
 * Digunakan di Trust & Security section dan bagian serupa.
 */
export function TrustCard({
  icon: Icon,
  iconClassName = "bg-primary/10 text-primary",
  title,
  description,
  className,
}: TrustCardProps) {
  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardContent className="space-y-3 p-6">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            iconClassName
          )}
        >
          <Icon className="size-5" />
        </div>
        <h3 className="text-foreground text-lg font-bold">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
