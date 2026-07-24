import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://preprod.shopperbeats.com.au/api/v1/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "cdn.dropshipzone.com.au",
      },
      {
        protocol: "https",
        hostname: "bambury.com.au",
      },
      {
        protocol: "https",
        hostname: "www.uhp.com.au",
      },
      {
        protocol: "https",
        hostname: "www.kaleidoscope.com.au",
      },
      {
        protocol: "https",
        hostname: "www.jasnor.com.au",
      },
      {
        protocol: "https",
        hostname: "www.johncoproductions.com",
      },
      {
        protocol: "https",
        hostname: "image.vevor.com",
      },
      {
        protocol: "https",
        hostname: "assets.shopperbeats.cloud",
      },
    ],
  },
};

export default nextConfig;