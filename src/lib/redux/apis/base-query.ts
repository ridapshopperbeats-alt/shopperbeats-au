import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { prepareAuthHeaders } from "./prepare-auth-headers";

// Plain credentialed base query — there is no 401-triggered token refresh
// here. The auth cookie manages the session; sign-out only happens via the
// explicit logout action (useLogoutMutation).
export const createBaseQuery = (
  baseUrl: string
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  return fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: prepareAuthHeaders,
  });
};
