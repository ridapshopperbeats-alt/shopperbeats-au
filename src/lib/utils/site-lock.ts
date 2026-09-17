/**
 * Site-wide password gate.
 *
 * Every route is locked behind a single shared password until the visitor
 * enters it once. The password is intentionally a plain static value for now
 * (overridable with SITE_ACCESS_PASSWORD) and the whole gate is switched off
 * unless SITE_LOCK_ENABLED="true" is set, without touching any code.
 */

export const SITE_LOCK_COOKIE = "sb_site_access";

/** Value stored in the cookie once the password has been accepted. */
export const SITE_LOCK_TOKEN = "granted";

/** Static password for now. */
export const SITE_LOCK_PASSWORD =
  process.env.SITE_ACCESS_PASSWORD || "Shopper$9090";

/** Gate is off by default; set SITE_LOCK_ENABLED="true" to switch it back on. */
export const SITE_LOCK_ENABLED = process.env.SITE_LOCK_ENABLED === "true";

export const SITE_LOCK_PATH = "/site-access";
export const SITE_LOCK_API_PATH = "/api/site-access";

/** 30 days. */
export const SITE_LOCK_MAX_AGE = 60 * 60 * 24;