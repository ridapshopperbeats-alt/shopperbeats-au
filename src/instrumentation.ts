/**
 * Next's fetch cache stores the upstream body still Brotli-compressed while
 * dropping the `content-encoding` header, so a cache *hit* hands the route the
 * raw compressed bytes and `res.json()` dies on them:
 *
 *   SyntaxError: Unexpected token '', "d3|}5"... is not valid JSON
 *
 * A cache miss is fine - undici decompresses that response itself - which is why
 * the app works right after the cache is wiped and breaks once entries land. The
 * entries persist in `.next/dev/cache/fetch-cache` (dev) and `.next/cache/fetch-cache`
 * (build + start), and the running server also holds them in memory, so deleting
 * the files is not enough on its own.
 *
 * Asking the upstream for an uncompressed response means there is nothing left to
 * decompress, so whatever lands in the cache is already plain JSON. Only requests
 * that actually enter the cache are touched; every other fetch (Stripe, SendGrid,
 * geocode, anything client-side) keeps negotiating compression as before.
 *
 * Remove this once the cache round-trips `content-encoding` correctly.
 */
export async function register() {
  // `register()` also runs for the edge runtime, which has its own fetch and does
  // not share this cache.
  if (process.env.NEXT_RUNTIME === "edge") return;

  const baseFetch = globalThis.fetch;

  globalThis.fetch = function fetchWithoutCachedCompression(
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    const isCached =
      init?.next !== undefined || init?.cache === "force-cache";

    if (!isCached) return baseFetch(input, init);

    // `init.headers` replaces a Request's own headers wholesale, so seed from the
    // Request when the caller did not pass any of its own.
    const headers = new Headers(
      init.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    headers.set("Accept-Encoding", "identity");

    return baseFetch(input, { ...init, headers });
  };
}
