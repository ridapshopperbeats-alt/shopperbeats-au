import { afterEach, describe, expect, it } from "vitest";

import { prepareAuthHeaders } from "../prepare-auth-headers";

const LAST_ACCESS_TOKEN_KEY = "sb_refresh_last_access_token";

function headersFor(state: unknown) {
  return prepareAuthHeaders(new Headers(), { getState: () => state });
}

afterEach(() => {
  window.localStorage.clear();
});

describe("prepareAuthHeaders", () => {
  it("sends the token held in the store", () => {
    const headers = headersFor({ auth: { accessToken: "store-token" } });

    expect(headers.get("authorization")).toBe("Bearer store-token");
  });

  it("strips a Bearer prefix already on the token instead of doubling it", () => {
    const headers = headersFor({ auth: { accessToken: "Bearer store-token" } });

    expect(headers.get("authorization")).toBe("Bearer store-token");
  });

  it("falls back to the last refreshed token when the store is empty", () => {
    window.localStorage.setItem(LAST_ACCESS_TOKEN_KEY, "persisted-token");

    const headers = headersFor({ auth: { accessToken: null } });

    expect(headers.get("authorization")).toBe("Bearer persisted-token");
  });

  it("prefers the store over the persisted copy", () => {
    window.localStorage.setItem(LAST_ACCESS_TOKEN_KEY, "stale-token");

    const headers = headersFor({ auth: { accessToken: "fresh-token" } });

    expect(headers.get("authorization")).toBe("Bearer fresh-token");
  });

  it("sends no authorization header when there is no token anywhere", () => {
    expect(headersFor({ auth: { accessToken: null } }).has("authorization")).toBe(
      false,
    );
  });

  // The API answers an absent header with "Not Token to verify user", so an
  // unshaped state must not turn into a literal "Bearer undefined".
  it("sends no header for a state without an auth slice", () => {
    expect(headersFor({}).has("authorization")).toBe(false);
    expect(headersFor(undefined).has("authorization")).toBe(false);
  });
});
