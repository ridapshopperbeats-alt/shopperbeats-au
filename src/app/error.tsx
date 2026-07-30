"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log only enough to correlate with server-side logs (Next.js attaches
    // a `digest` to the matching server log entry) — never the raw message
    // or stack, which can echo backend internals to the browser console.
    console.error("Unhandled page error, digest:", error.digest);
  }, [error]);

  return (
    <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
      <h2>Something went wrong</h2>
      <p style={{ margin: "12px 0 28px" }}>
        We hit an unexpected error loading this page. Please try again.
      </p>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        <button type="button" className="btn btn-red btn-filled btn-sharp" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className="btn btn-red btn-outline btn-sharp">
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
