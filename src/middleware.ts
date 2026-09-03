import { NextRequest, NextResponse } from "next/server";

const GUEST_ALLOWED_PATHS = ["/user/wishlist", "/user/logout"];

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://www.google.com https://js.stripe.com https://cdn.tailwindcss.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api-us.shopperbeats.cloud https://admin.shopperbeats.com.au https://www.google-analytics.com https://maps.googleapis.com https://places.googleapis.com https://js.stripe.com https://api.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

function applyAuthGuard(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/user")) return null;
  if (GUEST_ALLOWED_PATHS.includes(pathname)) return null;

  const hasSession =
    request.cookies.has("access_token") || request.cookies.has("refresh_token");

  if (hasSession) return null;

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest) {
  const authRedirect = applyAuthGuard(request);
  if (authRedirect) return authRedirect;

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
