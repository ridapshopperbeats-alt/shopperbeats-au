const REFRESH_TOKEN_KEY = "sb_refresh_token";
const LAST_REFRESH_AT_KEY = "sb_refresh_last_at";
const LAST_ACCESS_TOKEN_KEY = "sb_refresh_last_access_token";

/**
 * The middleware guards /user/* on cookies, but the durable proof of a session
 * is this refresh token — and middleware cannot read localStorage. So mirror it
 * into the refresh_token cookie the guard already looks for, otherwise a
 * signed-in visitor gets bounced to /login the moment the shorter-lived
 * access_token cookie lapses.
 */
const REFRESH_TOKEN_COOKIE = "refresh_token";
const REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function cookieSuffix(): string {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; SameSite=Strict${secure}`;
}

function writeRefreshTokenCookie(token: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}; Max-Age=${REFRESH_TOKEN_COOKIE_MAX_AGE}${cookieSuffix()}`;
}

function deleteRefreshTokenCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; Max-Age=0${cookieSuffix()}`;
}

/**
 * Restores the cookie for a session that signed in before it existed, so those
 * visitors keep their access to /user/* without having to sign in again.
 */
export function syncRefreshTokenCookie(): void {
  if (typeof document === "undefined") return;

  const token = getRefreshToken();
  const alreadySet = document.cookie
    .split(";")
    .some((entry) => entry.trim().startsWith(`${REFRESH_TOKEN_COOKIE}=`));

  if (token && !alreadySet) writeRefreshTokenCookie(token);
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    const rawToken = token.replace(/^Bearer\s+/i, "");
    window.localStorage.setItem(REFRESH_TOKEN_KEY, rawToken);
    writeRefreshTokenCookie(rawToken);
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
    deleteRefreshTokenCookie();
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
