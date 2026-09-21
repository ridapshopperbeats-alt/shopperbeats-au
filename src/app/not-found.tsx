"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Replaces Next's default black 404 screen.
 *
 * It deliberately fetches nothing — an error page that depends on the API can
 * fail for the same reason the visitor is already stuck, so the header is just
 * the static logo rather than the full nav.
 *
 * The block below that echoed the attempted route is commented out; re-enabling
 * it needs `usePathname()` back, which is why this stays a client component.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full border-b border-[#ECECEC]">
        <div className="container flex items-center py-4">
          <Link href="/" aria-label="ShopperBeats home">
            <Image
              src="/images/logo.svg"
              alt="ShopperBeats"
              width={300}
              height={61}
              priority
              className="h-[34px] w-auto md:h-[40px]"
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[620px] text-center">
          <p className="font-extrabold leading-none text-[#01295F] text-[72px] md:text-[112px]">
            4<span className="text-[#FD151B]">0</span>4
          </p>

          <h1 className="mt-2 font-bold text-[#0B2B6F] text-[22px] md:text-[28px] leading-snug">
            This page doesn&apos;t exist
          </h1>

          <p className="mt-3 text-[#726969] fluid-text-sm leading-[24px]">
            We couldn&apos;t find anything at this address. It may have been
            moved or renamed, or the link you followed might be wrong.
          </p>

          {/* {pathname && (
            <p className="mt-5 inline-flex max-w-full items-center gap-2 rounded-[8px] border border-[#ECECEC] bg-[#FAFAFA] px-4 py-2.5">
              <span className="shrink-0 text-[12px] font-semibold uppercase tracking-wide text-[#A0A0A0]">
                Route
              </span>
              <code className="truncate text-[13px] font-semibold text-[#01295F]">
                {pathname}
              </code>
            </p>
          )} */}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/" className="btn btn-red btn-filled btn-sharp">
              Go to homepage
            </Link>
            <Link
              href="/all-categories"
              className="btn btn-red btn-outline btn-sharp"
            >
              Browse categories
            </Link>
          </div>

          <p className="mt-8 fluid-text-xs text-[#A0A0A0]">
            Still stuck?{" "}
            <Link href="/contact" className="font-semibold underline text-[#01295F]">
              Contact our team
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
