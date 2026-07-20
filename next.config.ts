import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "cdn.shopperbeats.com.au",
      },
      {
        protocol: "https",
        hostname: "**.shopperbeats.com.au",
      },
      {
        protocol: "https",
        hostname: "www.jasnor.com.au",
      },
    ],
  },
};

export default nextConfig;
