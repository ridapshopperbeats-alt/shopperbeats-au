"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled root error, digest:", error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="py-20 px-5 text-center font-[family-name:sans-serif]">
          <h2>Something went wrong</h2>
          <p className="mt-3 mx-0 mb-7">
            We hit an unexpected error loading the site. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#FD151B] text-white border-none rounded-[4px] cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
