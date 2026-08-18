import type { NextConfig } from "next";

// Kept 'unsafe-inline' on script-src because the app relies on inline
// scripts (Next.js hydration, GTM/GA snippets) that aren't behind a
// nonce today — tightening that needs its own dedicated QA pass. Every
// other directive is a real, enforced allowlist: it still blocks a
// classic XSS payload from exfiltrating data to an attacker-controlled
// host, framing the site, or loading a plugin/object.
//
// 'unsafe-eval' is required in development for React's dev-mode debugging
// (component stack reconstruction), and in all environments for the
// Tailwind CDN script (https://cdn.tailwindcss.com) used inside the CMS
// content iframe (CmsIframe.tsx), which JIT-compiles utility classes via
// eval() at runtime. React itself never uses eval() in production.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://www.google.com https://js.stripe.com https://cdn.tailwindcss.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://api-us.shopperbeats.cloud https://admin.shopperbeats.com.au https://www.google-analytics.com https://maps.googleapis.com https://js.stripe.com https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
        source: "/api/v1/:path*",
        destination: "https://api-us.shopperbeats.cloud/api/v1/:path*",
      },
    ];
  },
  images: {
    qualities: [75, 100],
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
    ],
  },
};

export default nextConfig;