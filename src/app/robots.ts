import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kerjantb.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/loker", "/loker/*"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/sign-in",
          "/sign-in/*",
          "/sign-up",
          "/sign-up/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
