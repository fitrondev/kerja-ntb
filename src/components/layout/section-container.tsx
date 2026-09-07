import * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "header" | "footer" | "main" | "nav" | "aside";
  children: React.ReactNode;
  containerClassName?: string;
  fullWidth?: boolean;
}

/**
 * Komponen pembungkus SectionContainer standar KerjaNTB.
 *
 * - Secara default (`fullWidth={false}`), menerapkan `.section-container` langsung pada elemen utama.
 * - Jika `fullWidth={true}`, elemen luar merentang penuh (`w-full`) dan isi konten dibungkus oleh `.section-container`.
 */
export function SectionContainer({
  as: Component = "section",
  children,
  className,
  containerClassName,
  fullWidth = false,
  ...props
}: SectionContainerProps) {
  if (fullWidth) {
    return (
      <Component className={cn("w-full", className)} {...props}>
        <div className={cn("section-container", containerClassName)}>
          {children}
        </div>
      </Component>
    );
  }

  return (
    <Component className={cn("section-container", className)} {...props}>
      {children}
    </Component>
  );
}
