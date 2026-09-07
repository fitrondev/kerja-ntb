import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kencana.basic.box.cloudeka.id",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/logo.webp",
        destination: "/api/storage/file/Logo/logo.webp",
      },
      {
        source: "/Logo/logo.webp",
        destination: "/api/storage/file/Logo/logo.webp",
      },
    ];
  },
};

export default nextConfig;
