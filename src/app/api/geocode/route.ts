import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!apiKey) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data, { status: response.ok ? 200 : response.status });
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
