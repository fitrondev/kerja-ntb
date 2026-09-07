import * as React from "react";

import { FileCheck2, ShieldCheck, Users } from "lucide-react";

import { TrustCard } from "@/components/common/trust-card";
import { SectionContainer } from "@/components/layout/section-container";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    iconClassName: "bg-chart-1/10 text-chart-1",
    title: "Verifikasi Perusahaan & NIB",
    description:
      "Setiap entitas usaha yang memasang lowongan melalui proses pemeriksaan Nomor Induk Berusaha (NIB) resmi untuk mencegah loker fiktif atau penipuan.",
  },
  {
    icon: FileCheck2,
    iconClassName: "bg-primary/10 text-primary",
    title: "100% Gratis Tanpa Pungli",
    description:
      "Proses melamar pekerjaan di KerjaNTB sepenuhnya cuma-cuma. Kami menindak tegas siapapun yang memungut biaya tes atau tiket perjalanan.",
  },
  {
    icon: Users,
    iconClassName: "bg-secondary text-secondary-foreground",
    title: "Dukungan Talenta Lokal NTB",
    description:
      "Dirancang khusus untuk memajukan perekonomian daerah dengan memprioritaskan putra-putri NTB pada kesempatan kerja strategis di daerah asalnya.",
  },
] as const;

/**
 * Trust & Security section homepage.
 * Menampilkan 3 pilar utama KerjaNTB: Verifikasi NIB, Gratis, dan Talenta Lokal.
 */
export function TrustSection() {
  return (
    <SectionContainer
      as="section"
      fullWidth
      className="border-border bg-muted/30 border-t py-16 sm:py-20"
    >
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        {TRUST_ITEMS.map((item) => (
          <TrustCard
            key={item.title}
            icon={item.icon}
            iconClassName={item.iconClassName}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </SectionContainer>
  );
}
