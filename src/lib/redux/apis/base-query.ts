import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "../../constants/api";
import { logout, setAccessToken } from "../slices/auth-slice";
import { clearRefreshToken, getRefreshToken, setRefreshToken } from "@/lib/utils/refresh-token-store";


const refreshBaseQuery = fetchBaseQuery({
  baseUrl: API_ENDPOINTS.AUTH.BASE_URL_CLIENT,
  credentials: "include",
});


type RefreshOutcome = "refreshed" | "invalid" | "transient";

let pendingRefresh: Promise<RefreshOutcome> | null = null;

const REFRESH_COOLDOWN_MS = 5000;


let lastRefreshAt = 0;

function refreshAccessToken(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<RefreshOutcome> {
 
  if (Date.now() - lastRefreshAt < REFRESH_COOLDOWN_MS) {
    const hasToken = !!getAccessTokenCookie();
    if (hasToken) {
      return Promise.resolve("refreshed");
    }
  }

  if (!pendingRefresh) {
    const storedRefreshToken = getRefreshToken();

    pendingRefresh = Promise.resolve(
      refreshBaseQuery(
        {
          url: API_ENDPOINTS.AUTH.REFRESH_TOKEN,
          method: "POST",
          body: storedRefreshToken ? { refresh_token: storedRefreshToken } : {},
        },
        api,
        extraOptions,
      ),
    )
      .then((result) => {
        if (result.error) {
          const status = result.error.status;
          // Anything else (network error, timeout, 5xx) is transient.
          if (status === 401 || status === 403) {
            console.warn("Refresh token rejected by server:", result.error);
            clearRefreshToken();
            api.dispatch(logout());
            return "invalid" as const;
          }
          console.warn("Refresh token request failed (transient, session kept):", result.error);
          return "transient" as const;
        }

        const data = result.data as
          | {
              access_token?: string;
              refresh_token?: string;
              response?: string | { access_token?: string; refresh_token?: string };
            }
          | undefined;
        const responseField = data?.response;
        const newAccessToken =
          data?.access_token ||
          (typeof responseField === "string" ? responseField : responseField?.access_token);
        const newRefreshToken =
          data?.refresh_token ||
          (typeof responseField === "string" ? undefined : responseField?.refresh_token);

        setLastRefreshAt(Date.now());
        if (newAccessToken) {
          api.dispatch(setAccessToken(newAccessToken));
        }
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        return "refreshed" as const;
      })
      .finally(() => {
        pendingRefresh = null;
      });
  }

  return pendingRefresh;
}

export function triggerSilentRefresh(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: (action: any) => unknown,
): Promise<RefreshOutcome> {
  return refreshAccessToken(
    { getState: () => ({}), dispatch } as unknown as Parameters<BaseQueryFn>[1],
    {},
  );
}

function isAuthRequiredError(error: FetchBaseQueryError | undefined): boolean {
  if (!error) return false;
  if (error.status === 401 || error.status === 403) return true;
  const data = error.data as { detail?: { code?: string } } | undefined;
  return data?.detail?.code === "AUTH_REQUIRED";
}

export const createBaseQuery = (
  baseUrl: string,
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    credentials: "include",
  });

  return async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (isAuthRequiredError(result.error)) {
      const outcome = await refreshAccessToken(api, extraOptions);

      if (outcome === "refreshed") {
        result = await rawBaseQuery(args, api, extraOptions);
      } else if (outcome === "invalid") {
        return result;
      } else {
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


