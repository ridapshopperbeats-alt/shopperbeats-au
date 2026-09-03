import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import StoreProvider from "../lib/redux/store-provider";
import { SEOProvider } from "@/contexts/SEOContext";
import GlobalLoader from "@/components/ui/loaders/GlobalLoader";
import RouteChangeLoader from "@/components/ui/loaders/RouteChangeLoader";
import { SITE_URL } from "@/lib/utils/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ShopperBeats",
    template: "%s | ShopperBeats",
  },
  description: "Shopperbeats - Your One-Stop Online Shop",
  keywords: [
    "ShopperBeats",
    "online shopping",
    "online store",
    "furniture",
    "fashion",
    "home and garden",
    "electronics",
    "kids toys",
    "health and beauty",
    "sport & outdoor",
    "mobile"
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ShopperBeats",
    title: "ShopperBeats",
    description: "Shopperbeats - Your One-Stop Online Shop",
    images: [
      {
        url: "/images/logo.svg",
        alt: "ShopperBeats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopperBeats",
    description: "Shopperbeats - Your One-Stop Online Shop",
    images: ["/images/logo.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en">
      <head>
        {nonce && <meta name="csp-nonce" content={nonce} />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&v=beta&loading=async`}
          strategy="afterInteractive"
          nonce={nonce}
        />
        <StoreProvider>
          <SEOProvider>{children}</SEOProvider>
          <RouteChangeLoader />
          <GlobalLoader />
        </StoreProvider>
      </body>
    </html>
  );
}
