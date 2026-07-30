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


let pendingRefresh: Promise<boolean> | null = null;

function refreshAccessToken(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<boolean> {
  if (!pendingRefresh) {
    const refresh_token = getRefreshToken();
    if (!refresh_token) {
      // Expected for guests / logged-out sessions — not an actual error, so
      // this shouldn't trip Next's console.error dev overlay.
      console.warn("No refresh_token cookie found; cannot refresh access token.");
      return Promise.resolve(false);
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
          console.error("Refresh token request failed:", result.error);
          clearRefreshToken();
          return false;
        }

        const data = result.data as { access_token?: string; response?: { access_token?: string } } | undefined;
        const newAccessToken = data?.access_token || data?.response?.access_token;
        if (!newAccessToken) {
          console.error("Refresh token response missing access_token:", result.data);
          clearRefreshToken();
          return false;
        }

        api.dispatch(setAccessToken(newAccessToken));
        setAccessTokenCookie(newAccessToken);
        return true;
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
      const refreshed = await refreshAccessToken(api, extraOptions);

      if (refreshed) {
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        clearAccessTokenCookie();
        api.dispatch(logout());
        return result;
      }
    }

    return result;
  };
};


