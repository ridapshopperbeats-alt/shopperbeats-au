import { NextRequest, NextResponse } from "next/server";
import { getClientIp, isRateLimited } from "@/lib/utils/rate-limit";

const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_PRECISION = 4; 

type CacheEntry = { data: unknown; expiresAt: number };
const cache = new Map<string, CacheEntry>();

function isValidCoordinate(value: string | null, min: number, max: number): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = isValidCoordinate(searchParams.get("lat"), -90, 90);
  const lng = isValidCoordinate(searchParams.get("lng"), -180, 180);

  if (lat === null || lng === null) {
    return NextResponse.json({ results: [], error: "Invalid coordinates" }, { status: 400 });
  }

  const clientIp = getClientIp(request.headers);
  if (isRateLimited(`geocode:${clientIp}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ results: [], error: "Too many requests" }, { status: 429 });
  }

  const cacheKey = `${lat.toFixed(CACHE_PRECISION)},${lng.toFixed(CACHE_PRECISION)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data, { status: 200 });
  }

  const apiKey = process.env.NEXT_GEOLOCATION_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) {
      cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return NextResponse.json(data, { status: response.ok ? 200 : response.status });
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
