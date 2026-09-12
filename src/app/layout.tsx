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

const defaultBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://kerjantb.com";

export const metadata: Metadata = {
  metadataBase: new URL(defaultBaseUrl),
  title: {
    default: "KerjaNTB — Portal Lowongan Kerja Nusa Tenggara Barat",
    template: "%s | KerjaNTB",
  },
  description:
    "Portal bursa kerja resmi dan terpercaya se-Nusa Tenggara Barat. Temukan ribuan peluang karir di 10 Kabupaten/Kota se-Lombok dan Sumbawa.",
  keywords: [
    "lowongan kerja NTB",
    "loker Mataram",
    "loker Lombok",
    "loker Sumbawa",
    "karir NTB",
    "kerja NTB",
    "loker Bima",
    "loker Lombok Timur",
    "bursa kerja NTB",
    "lowongan kerja resmi",
  ],
  authors: [{ name: "Tim KerjaNTB", url: defaultBaseUrl }],
  creator: "KerjaNTB",
  publisher: "KerjaNTB",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: defaultBaseUrl,
    title: "KerjaNTB — Portal Lowongan Kerja Nusa Tenggara Barat",
    description:
      "Portal bursa kerja resmi & terpercaya se-Nusa Tenggara Barat (Lombok & Sumbawa).",
    siteName: "KerjaNTB",
  },
  twitter: {
    card: "summary_large_image",
    title: "KerjaNTB — Portal Lowongan Kerja Nusa Tenggara Barat",
    description:
      "Cari dan lamar lowongan kerja terverifikasi di 10 Kabupaten/Kota se-NTB.",
  },
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
