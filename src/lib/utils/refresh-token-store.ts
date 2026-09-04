const REFRESH_TOKEN_KEY = "sb_refresh_token";

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
  } catch {
  }
}
