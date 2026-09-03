import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/cart/:path*",
        destination: "https://api-us.shopperbeats.cloud/cart/api/v1/cart/:path*",
      },
      {
        source: "/api/v1/wishlist/:path*",
        destination: "https://api-us.shopperbeats.cloud/cart/api/v1/wishlist/:path*",
      },
      {
        source: "/api/v1/coupon/:path*",
        destination: "https://api-us.shopperbeats.cloud/cart/api/v1/coupon/:path*",
      },
      {
        source: "/api/v1/coupon-tracker/:path*",
        destination: "https://api-us.shopperbeats.cloud/cart/api/v1/coupon-tracker/:path*",
      },
      {
        source: "/api/v1/order/:path*",
        destination: "https://api-us.shopperbeats.cloud/orders/api/v1/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: "https://api-us.shopperbeats.cloud/api/v1/:path*",
      },
    ];
  },
  images: {
    qualities: [75, 100],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
        hostname: "assets.shopperbeats.cloud",
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
      {
        protocol: "https",
        hostname: "media-prod-use-1.mirakl.net",
      },
      {
        protocol: "https",
        hostname: "assets.costway.com",
      },
      {
        protocol: "https",
        hostname: "dngnxcmxnkyl5.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "perfumesw.com",
      },
      {
        protocol: "https",
        hostname: "pim-hub.com",
      },
      {
        protocol: "https",
        hostname: "www.ccwholesaleclothing.com",
      },
      {
        protocol: "https",
        hostname: "www.ccwholesaleclothing.com",
      },
      {
        protocol: "https",
        hostname: "www.ccwholesaleclothing.com",
      },
      {
        protocol: "https",
        hostname: "img.fragrancex.com",
      },
      {
        protocol: "https",
        hostname: "www.ccdemostore.com",
      },
      {
        protocol: "https",
        hostname: "static.songmics.com",
      },
      {
        protocol: "https",
        hostname: "www.homeroots.co",
      },
      {
        protocol: "https",
        hostname: "img-us.aosomcdn.com",
      },
      {
        protocol: "https",
        hostname: "benzara.com",
      },
      {
        protocol: "https",
        hostname: "melrose.solovue.com",
      },
      {
        protocol: "https",
        hostname: "dropship.nearlynatural.com",
      },
      {
        protocol: "http",
        hostname: "www.fastfurnishings.com",
      },
    ],
  },
};

export default nextConfig;