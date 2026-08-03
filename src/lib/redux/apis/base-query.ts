import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "../../constants/api";
import { clearRefreshToken, getRefreshToken } from "@/lib/utils/refresh-token-cokkie";
import { clearAccessTokenCookie, setAccessTokenCookie } from "@/lib/utils/access-token";
import { logout, setAccessToken } from "../slices/auth-slice";
import { prepareAuthHeaders } from "./prepare-auth-headers";


const refreshBaseQuery = fetchBaseQuery({
  baseUrl: API_ENDPOINTS.AUTH.BASE_URL,
  credentials: "include",
});


// "refreshed": got a new access token, safe to retry the original request.
// "invalid": the backend definitively rejected the refresh token (401/403)
// or there simply isn't one — the session really is over, log out.
// "transient": the refresh call itself failed (network blip, 5xx, timeout).
// This is NOT proof the session is invalid, so the session is left alone —
// only this one request fails, instead of silently wiping the whole login.
type RefreshOutcome = "refreshed" | "invalid" | "transient";

let pendingRefresh: Promise<RefreshOutcome> | null = null;

function refreshAccessToken(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<RefreshOutcome> {
  if (!pendingRefresh) {
    const refresh_token = getRefreshToken();
    if (!refresh_token) {
      // Expected for guests / logged-out sessions — not an actual error, so
      // this shouldn't trip Next's console.error dev overlay.
      console.warn("No refresh_token cookie found; cannot refresh access token.");
      return Promise.resolve("invalid");
    }

    pendingRefresh = Promise.resolve(
      refreshBaseQuery(
        {
          url: API_ENDPOINTS.AUTH.REFRESH_TOKEN,
          method: "POST",
          body: { refresh_token },
        },
        api,
        extraOptions,
      ),
    )
      .then((result) => {
        if (result.error) {
          const status = result.error.status;
          // Only a definitive rejection from the server means the refresh
          // token is actually invalid/expired — end the session for that.
          // Anything else (network error, timeout, 5xx) is transient.
          if (status === 401 || status === 403) {
            console.warn("Refresh token rejected by server:", result.error);
            clearRefreshToken();
            return "invalid" as const;
          }
          console.warn("Refresh token request failed (transient, session kept):", result.error);
          return "transient" as const;
        }

        const data = result.data as { access_token?: string; response?: { access_token?: string } } | undefined;
        const newAccessToken = data?.access_token || data?.response?.access_token;
        if (!newAccessToken) {
          console.warn("Refresh token response missing access_token:", result.data);
          clearRefreshToken();
          return "invalid" as const;
        }

        api.dispatch(setAccessToken(newAccessToken));
        setAccessTokenCookie(newAccessToken);
        return "refreshed" as const;
      })
      .finally(() => {
        pendingRefresh = null;
      });
  }

  return pendingRefresh;
}

export const createBaseQuery = (
  baseUrl: string,
  prepareHeaders: typeof prepareAuthHeaders = prepareAuthHeaders
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders,
  });

  return async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      const outcome = await refreshAccessToken(api, extraOptions);

      if (outcome === "refreshed") {
        result = await rawBaseQuery(args, api, extraOptions);
      } else if (outcome === "invalid") {
        clearAccessTokenCookie();
        api.dispatch(logout());
        return result;
      } else {
        // "transient": don't log the user out over a refresh hiccup. Mark
        // the error as non-401 so callers (e.g. getUserDetails) that treat a
        // 401 as "session is dead" don't mistakenly flip the UI to logged
        // out — this request just failed once, the session itself is fine.
        return {
          error: {
            status: "CUSTOM_ERROR",
            error: "auth-refresh-transient-failure",
            data: result.error?.data,
          },
        };
      }
    }

    return result;
  };
};


