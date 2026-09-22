import { afterEach, describe, expect, it } from "vitest";

import {
  clearRefreshToken,
  setRefreshToken,
  syncRefreshTokenCookie,
} from "../refresh-token-store";

const COOKIE = "refresh_token";

function readCookie(): string | null {
  const match = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${COOKIE}=`));

  return match ? decodeURIComponent(match.slice(COOKIE.length + 1)) : null;
}

afterEach(() => {
  clearRefreshToken();
  window.localStorage.clear();
});

describe("refresh_token cookie", () => {
  it("is written whenever the refresh token is stored", () => {
    setRefreshToken("refresh-abc");

    expect(readCookie()).toBe("refresh-abc");
  });

  it("stores the raw token, without a Bearer prefix", () => {
    setRefreshToken("Bearer refresh-abc");

    expect(readCookie()).toBe("refresh-abc");
  });

  it("is removed on sign-out", () => {
    setRefreshToken("refresh-abc");
    clearRefreshToken();

    expect(readCookie()).toBeNull();
  });

  describe("syncRefreshTokenCookie", () => {
    it("restores the cookie for a session that only has localStorage", () => {
      setRefreshToken("refresh-abc");
      document.cookie = `${COOKIE}=; Max-Age=0; Path=/`;
      expect(readCookie()).toBeNull();

      syncRefreshTokenCookie();

      expect(readCookie()).toBe("refresh-abc");
    });

    it("writes nothing when there is no session", () => {
      syncRefreshTokenCookie();

      expect(readCookie()).toBeNull();
    });

    it("leaves an existing cookie alone", () => {
      setRefreshToken("refresh-abc");

      syncRefreshTokenCookie();

      expect(readCookie()).toBe("refresh-abc");
    });
  });
});
