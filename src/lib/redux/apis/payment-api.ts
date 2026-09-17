import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "../../constants/api";
import { createBaseQuery } from "./base-query";
import { CapturePaymentResponse } from "@/types/cart";

// Shares the same 401-refresh-then-logout flow as every other API slice
// (previously this had its own bespoke handler that skipped the refresh
// attempt and never cleared the access/refresh token cookies on logout).
const baseQuery = createBaseQuery(API_ENDPOINTS.PAYMENT.BASE_URL);

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery,
  endpoints: (builder) => ({
    initiatePayment: builder.mutation<
      { payment_id: string; client_secret: string; approval_url: string | null },
      { order_id: string; provider: string }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.PAYMENT.INITIATE,
        method: "POST",
        body,
      }),
    }),
    capturePayment: builder.mutation<CapturePaymentResponse, { token: string }>({
      // NOTE: kept as a query param intentionally — the backend contract for
      // this endpoint is unconfirmed, and this is the live payment-capture
      // path. Switching to a POST body here without backend sign-off risks
      // breaking checkout if the server only reads `token` from the query
      // string. Flagged in the audit as a query-param token leak (server
      // access logs / Referer) — revisit once the backend team confirms it
      // also accepts `{ token }` in the body.
      query: ({ token }) => ({
        url: `${API_ENDPOINTS.PAYMENT.CAPTURE}?token=${token}`,
        method: "POST",
      }),
    }),
  }),
});

export const { useInitiatePaymentMutation, useCapturePaymentMutation } = paymentApi;
