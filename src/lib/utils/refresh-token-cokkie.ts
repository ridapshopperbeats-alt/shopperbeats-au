const REFRESH_TOKEN_COOKIE = "refresh_token";
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export function setRefreshToken(token: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}; Max-Age=${REFRESH_TOKEN_MAX_AGE}; Path=/; SameSite=Strict${secure}`;
}

export function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${REFRESH_TOKEN_COOKIE}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearRefreshToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; Max-Age=0; Path=/; SameSite=Strict`;
}
