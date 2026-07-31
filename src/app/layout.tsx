import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import StoreProvider from "../lib/redux/store-provider";
import { SEOProvider } from "@/contexts/SEOContext";
import GlobalLoader from "@/components/ui/loaders/GlobalLoader";
import RouteChangeLoader from "@/components/ui/loaders/RouteChangeLoader";

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
  title: "ShopperBeats",
  description: "Shopperbeats - Your One-Stop Online Shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&v=beta`}
          strategy="afterInteractive"
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
