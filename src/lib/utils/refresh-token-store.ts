// Temporary workaround: the auth service's refresh-token cookie is
// HttpOnly (unreadable from JS) and its own value has an un-stripped
// "Bearer " prefix that its refresh endpoint fails to parse (backend bug,
// reported separately). Until that's fixed server-side, we capture the
// *raw* refresh_token from the login/signup JSON response body (a
// separate, already-JS-readable field — not the cookie) and send it
// explicitly in the refresh request body instead of relying on the cookie.
//
// This deliberately reintroduces the JS-readable-refresh-token exposure
// (SEC-1) for this one value, as an accepted temporary tradeoff to keep
// refresh working — remove this file and its call sites once the backend
// fixes the cookie-parsing bug.
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
