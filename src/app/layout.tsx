import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";

import { Providers } from "@/components/providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KerjaNTB — Temukan Peluang Kerja di NTB",
  description:
    "Portal lowongan kerja resmi dan terpercaya untuk seluruh wilayah Nusa Tenggara Barat (Lombok & Sumbawa).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${inter.variable} h-full font-sans antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
        <ClerkProvider appearance={{ theme: shadcn }}>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
