import { NextResponse } from "next/server";

import {
  SITE_LOCK_COOKIE,
  SITE_LOCK_MAX_AGE,
  SITE_LOCK_PASSWORD,
  SITE_LOCK_TOKEN,
} from "@/lib/utils/site-lock";

export async function POST(request: Request) {
  let password = "";

  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body?.password === "string") password = body.password;
  } catch {
    password = "";
  }

  if (password !== SITE_LOCK_PASSWORD) {
    return NextResponse.json(
      { success: false, message: "Incorrect password. Please try again." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: SITE_LOCK_COOKIE,
    value: SITE_LOCK_TOKEN,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SITE_LOCK_MAX_AGE,
  });

  return response;
}
