import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

// The allowlist lives in src/ so it stays next to the rest of the app config.
import { IMAGE_HOST_PATTERNS } from "./src/lib/constants/image-hosts";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/cart/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/cart/api/v1/cart/:path*`,
      },
      {
        source: "/api/v1/wishlist/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/cart/api/v1/wishlist/:path*`,
      },
      {
        source: "/api/v1/coupon/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/cart/api/v1/coupon/:path*`,
      },
      {
        source: "/api/v1/coupon-tracker/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/cart/api/v1/coupon-tracker/:path*`,
      },
      {
        source: "/api/v1/product/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/products/api/v1/product/:path*`,
      },
      // Homepage sections are read from the browser, so proxy them through the
      // Next server — the products API does not send CORS headers for this origin.
      // Must stay ahead of the /api/v1/:path* catch-all below.
      {
        source: "/api/v1/homepage/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL_PRODUCTS}/api/v1/homepage/:path*`,
      },
      {
        source: "/api/v1/order/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/orders/api/v1/:path*`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
      },
    ];
  },

  images: {
    qualities: [75, 100],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",

    remotePatterns: IMAGE_HOST_PATTERNS,
  },
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(nextConfig);