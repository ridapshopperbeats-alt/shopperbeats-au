const ACCESS_TOKEN_COOKIE = "access_token";
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24;

export function setAccessTokenCookie(token: string): void {
  if (typeof document === "undefined") return;
  const rawToken = token.replace(/^Bearer\s+/i, "");
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(rawToken)}; Max-Age=${ACCESS_TOKEN_MAX_AGE}; Path=/; SameSite=Strict${secure}`;
}

export function getAccessTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE}=([^;]*)`)
  );
  if (!match) return null;
  return decodeURIComponent(match[1]).replace(/^Bearer\s+/i, "");
}

export function clearAccessTokenCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Max-Age=0; Path=/; SameSite=Strict`;
}
