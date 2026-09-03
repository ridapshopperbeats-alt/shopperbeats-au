/**
 * In-memory rate limiter with expiry pruning.
 *
 * NOTE: This rate limiter is per-instance. On Cloud Run with autoscaling,
 * each instance holds its own map, so effective limits scale with instance
 * count. For stricter guarantees consider Memorystore / Redis or
 * Cloud Armor rate-limiting rules at the edge.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

/** Maximum number of tracked buckets to prevent memory-pressure attacks. */
const MAX_BUCKETS = 10_000;

/** Minimum interval (ms) between pruning passes to avoid excessive iteration. */
const PRUNE_INTERVAL_MS = 60_000;

let lastPruneAt = 0;

/**
 * Remove all expired buckets from the map.
 * Runs at most once per PRUNE_INTERVAL_MS to keep overhead negligible.
 */
function pruneExpired(): void {
  const now = Date.now();
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  pruneExpired();

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // Safety cap: if the map is already at capacity and this is a new key,
    // reject the request to avoid unbounded growth.
    if (!bucket && buckets.size >= MAX_BUCKETS) {
      return true;
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

/**
 * Extract the real client IP from request headers.
 *
 * Behind Google Cloud Run's load balancer the x-forwarded-for header looks
 * like:  "client, <intermediate proxies…>, <google-lb>"
 *
 * We take the **first** (left-most) entry which is the original client IP
 * appended by the first trusted proxy.  The previous implementation used
 * .pop() (the last entry), which returned the LB's own IP — causing all
 * users to share a single rate-limit bucket.
 *
 * The value is also validated to look like a plausible IP address to prevent
 * spoofed garbage from becoming a map key.
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the left-most (first) IP — the real client behind Google LB.
    const ip = forwardedFor.split(",")[0]?.trim();
    if (ip && isPlausibleIp(ip)) return ip;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp && isPlausibleIp(realIp)) return realIp;

  return "unknown";
}

/**
 * Basic sanity check so that spoofed header values (arbitrary long strings,
 * scripts, etc.) don't become map keys and waste memory.
 * Accepts IPv4 and IPv6 addresses.
 */
function isPlausibleIp(value: string): boolean {
  if (value.length > 45) return false; // max IPv6 length
  // IPv4 or IPv6 characters only
  return /^[\d.a-fA-F:]+$/.test(value);
}
