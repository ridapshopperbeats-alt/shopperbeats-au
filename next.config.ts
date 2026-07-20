import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;