const REFRESH_TOKEN_KEY = "sb_refresh_token";
const LAST_REFRESH_AT_KEY = "sb_refresh_last_at";
const LAST_ACCESS_TOKEN_KEY = "sb_refresh_last_access_token";

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token.replace(/^Bearer\s+/i, ""));
  } catch {
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearRefreshToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(LAST_REFRESH_AT_KEY);
    window.localStorage.removeItem(LAST_ACCESS_TOKEN_KEY);
  } catch {
  }
}

export function getLastRefreshAt(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(LAST_REFRESH_AT_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function setLastRefreshResult(accessToken: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_REFRESH_AT_KEY, String(Date.now()));
    window.localStorage.setItem(LAST_ACCESS_TOKEN_KEY, accessToken);
  } catch {
  }
}

export function getLastAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}
