import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { prepareAuthHeaders } from "./prepare-auth-headers";

export const createBaseQuery = (
  baseUrl: string
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  return fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: prepareAuthHeaders,
  });
};
