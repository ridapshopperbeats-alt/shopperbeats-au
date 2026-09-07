"use client";

import { useEffect } from "react";

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
        <div style={{ padding: "80px 20px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>Something went wrong</h2>
          <p style={{ margin: "12px 0 28px" }}>
            We hit an unexpected error loading the site. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 24px",
              background: "#FD151B",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
