import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <StoreProvider>
          <SEOProvider>{children}</SEOProvider>
          <RouteChangeLoader />
          <GlobalLoader />
        </StoreProvider>
      </body>
    </html>
  );
}
