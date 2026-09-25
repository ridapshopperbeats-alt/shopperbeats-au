const buckets = new Map<string, { count: number; resetAt: number }>();

const MAX_BUCKETS = 10_000;

const PRUNE_INTERVAL_MS = 60_000;

let lastPruneAt = 0;

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
  windowMs: number,
): boolean {
  pruneExpired();

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (!bucket && buckets.size >= MAX_BUCKETS) {
      return true;
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0]?.trim();
    if (ip && isPlausibleIp(ip)) return ip;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp && isPlausibleIp(realIp)) return realIp;

  return "unknown";
}

function isPlausibleIp(value: string): boolean {
  if (value.length > 45) return false; // max IPv6 length
  // IPv4 or IPv6 characters only
  return /^[\d.a-fA-F:]+$/.test(value);
}
