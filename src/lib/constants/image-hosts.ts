/**
 * Single source of truth for the image hosts `next/image` is allowed to load.
 * `next.config.ts` feeds this straight into `images.remotePatterns`.
 *
 * Product images come from whichever CDN a marketplace vendor happens to use,
 * so this list can never be complete. A host that is missing here throws from
 * `defaultLoader` during render and takes the whole page down with it, so a new
 * vendor CDN has to be added below before its products can be shown.
 */

export interface ImageHostPattern {
  protocol: "http" | "https";
  hostname: string;
}

export const IMAGE_HOST_PATTERNS: ImageHostPattern[] = [
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "imagedelivery.net" },
  { protocol: "https", hostname: "cdn.shopify.com" },
  { protocol: "https", hostname: "cdn.dropshipzone.com.au" },
  { protocol: "https", hostname: "bambury.com.au" },
  { protocol: "https", hostname: "www.uhp.com.au" },
  { protocol: "https", hostname: "www.kaleidoscope.com.au" },
  { protocol: "https", hostname: "www.jasnor.com.au" },
  { protocol: "https", hostname: "www.johncoproductions.com" },
  { protocol: "https", hostname: "image.vevor.com" },
  { protocol: "https", hostname: "assets.shopperbeats.cloud" },
  { protocol: "https", hostname: "media-prod-use-1.mirakl.net" },
  { protocol: "https", hostname: "assets.costway.com" },
  { protocol: "https", hostname: "dngnxcmxnkyl5.cloudfront.net" },
  { protocol: "https", hostname: "perfumesw.com" },
  { protocol: "https", hostname: "pim-hub.com" },
  { protocol: "https", hostname: "www.ccwholesaleclothing.com" },
  { protocol: "https", hostname: "img.fragrancex.com" },
  { protocol: "https", hostname: "www.ccdemostore.com" },
  { protocol: "https", hostname: "static.songmics.com" },
  { protocol: "https", hostname: "www.homeroots.co" },
  { protocol: "https", hostname: "img-us.aosomcdn.com" },
  { protocol: "https", hostname: "benzara.com" },
  { protocol: "https", hostname: "melrose.solovue.com" },
  { protocol: "https", hostname: "dropship.nearlynatural.com" },
  { protocol: "http", hostname: "www.fastfurnishings.com" },
  { protocol: "https", hostname: "www.wonatrading.com" },
  { protocol: "https", hostname: "marketplace.sspo.com" },
  // su-cdn serves the same images from img1..img9, so match the whole CDN.
  { protocol: "https", hostname: "**.su-cdn.com" },
  { protocol: "https", hostname: "www.greenlandhomefashions.com" },
];

/**
 * Deliberately narrower than Next's own wildcard matching: a host this returns
 * false for is merely rendered unoptimized, while a false positive would put
 * back the crash this exists to prevent.
 */
function hostnameMatches(pattern: string, hostname: string): boolean {
  if (pattern === hostname) return true;

  // "**.example.com" — any depth of subdomain.
  if (pattern.startsWith("**.")) {
    return hostname.endsWith(pattern.slice(2));
  }

  // "*.example.com" — exactly one subdomain level.
  if (pattern.startsWith("*.")) {
    const suffix = pattern.slice(1);
    if (!hostname.endsWith(suffix)) return false;
    return !hostname.slice(0, -suffix.length).includes(".");
  }

  return false;
}

/**
 * True when `next/image` can safely optimize this src. Local paths ("/images/…")
 * and static imports never need a remote pattern, so they always qualify.
 */
export function isOptimizableImageSrc(src: unknown): boolean {
  if (typeof src !== "string") return true;
  if (!src) return true;

  // Relative and data/blob sources bypass remote-pattern checks entirely.
  if (!/^https?:\/\//i.test(src)) return true;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }

  const protocol = url.protocol.replace(":", "");

  return IMAGE_HOST_PATTERNS.some(
    (pattern) =>
      pattern.protocol === protocol &&
      hostnameMatches(pattern.hostname, url.hostname),
  );
}
