const REFRESH_TOKEN_COOKIE = "refresh_token";
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setRefreshToken(token: string): void {
  if (typeof document === "undefined") return;
  const rawToken = token.replace(/^Bearer\s+/i, "");
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(rawToken)}; Max-Age=${REFRESH_TOKEN_MAX_AGE}; Path=/; SameSite=Strict${secure}`;
}

export function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${REFRESH_TOKEN_COOKIE}=([^;]*)`)
  );
  if (!match) return null;
  return decodeURIComponent(match[1]).replace(/^Bearer\s+/i, "");
}

export function clearRefreshToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; Max-Age=0; Path=/; SameSite=Strict`;
}
