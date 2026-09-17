import { afterEach, describe, expect, it } from "vitest";

import {
  clearRefreshToken,
  getLastAccessToken,
  getLastRefreshAt,
  getRefreshToken,
  setLastRefreshResult,
  setRefreshToken,
} from "../refresh-token-store";

afterEach(() => {
  window.localStorage.clear();
});

describe("refresh token store", () => {
  it("round-trips a refresh token", () => {
    setRefreshToken("refresh-abc");

    expect(getRefreshToken()).toBe("refresh-abc");
  });

  it("strips a Bearer prefix before storing", () => {
    setRefreshToken("Bearer refresh-abc");

    expect(getRefreshToken()).toBe("refresh-abc");
  });

  it("returns null before anything is stored", () => {
    expect(getRefreshToken()).toBeNull();
    expect(getLastAccessToken()).toBeNull();
    expect(getLastRefreshAt()).toBe(0);
  });

  it("records the access token and a timestamp on a successful refresh", () => {
    const before = Date.now();
    setLastRefreshResult("access-xyz");

    expect(getLastAccessToken()).toBe("access-xyz");
    expect(getLastRefreshAt()).toBeGreaterThanOrEqual(before);
  });

  // Sign-out has to drop all three keys, or the cooldown in base-query will
  // hand a stale token back to the next request.
  it("clears the refresh token, the timestamp and the cached access token", () => {
    setRefreshToken("refresh-abc");
    setLastRefreshResult("access-xyz");

    clearRefreshToken();

    expect(getRefreshToken()).toBeNull();
    expect(getLastAccessToken()).toBeNull();
    expect(getLastRefreshAt()).toBe(0);
  });
});
