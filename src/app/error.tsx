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
    console.error("Unhandled page error:", error.message, "digest:", error.digest, error.stack);
  }, [error]);

  return (
    <div className="container !px-5 min-[1440px]:!px-10 py-20 text-center">
      <h2>Something went wrong</h2>
      <p className="mt-3 mx-0 mb-7">
        We hit an unexpected error loading this page. Please try again.
      </p>
      <div className="flex gap-4 justify-center">
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
