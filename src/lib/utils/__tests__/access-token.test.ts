import { afterEach, describe, expect, it } from "vitest";

import {
  clearAccessTokenCookie,
  getAccessTokenCookie,
  setAccessTokenCookie,
} from "../access-token";

function clearAllCookies() {
  for (const entry of document.cookie.split(";")) {
    const name = entry.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
  }
}

afterEach(clearAllCookies);

describe("access token cookie", () => {
  it("round-trips a token", () => {
    setAccessTokenCookie("header.payload.signature");

    expect(getAccessTokenCookie()).toBe("header.payload.signature");
  });

  it("stores the raw token when handed one with a Bearer prefix", () => {
    setAccessTokenCookie("Bearer header.payload.signature");

    expect(getAccessTokenCookie()).toBe("header.payload.signature");
  });

  it("survives characters that need url-encoding", () => {
    setAccessTokenCookie("a+b/c=d");

    expect(getAccessTokenCookie()).toBe("a+b/c=d");
  });

  it("returns null when no cookie is set", () => {
    expect(getAccessTokenCookie()).toBeNull();
  });

  it("clears the cookie on sign-out", () => {
    setAccessTokenCookie("header.payload.signature");
    clearAccessTokenCookie();

    expect(getAccessTokenCookie()).toBeNull();
  });

  // The middleware guards /user/* on the presence of this cookie, so it must
  // not be confused by another cookie whose name merely ends the same way.
  it("does not read a different cookie with a similar name", () => {
    document.cookie = "my_access_token=someone-elses-value; Path=/";

    expect(getAccessTokenCookie()).toBeNull();
  });
});
