const ACCESS_TOKEN_COOKIE = "access_token";
// Short-lived JWT; kept in a JS-readable cookie (not HttpOnly) purely so it
// survives a page reload — it's read back into Redux and sent as a Bearer
// header on cart/wishlist requests that expect it (see prepare-auth-headers).
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24;

export function setAccessTokenCookie(token: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; Max-Age=${ACCESS_TOKEN_MAX_AGE}; Path=/; SameSite=Strict${secure}`;
}

export function getAccessTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearAccessTokenCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Max-Age=0; Path=/; SameSite=Strict`;
}
