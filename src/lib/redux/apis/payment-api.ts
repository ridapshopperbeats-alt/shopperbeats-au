import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "../../constants/api";
import { createBaseQuery } from "./base-query";
import { CapturePaymentResponse } from "@/types/cart";

const baseQuery = createBaseQuery(API_ENDPOINTS.PAYMENT.BASE_URL);

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery,
  endpoints: (builder) => ({
    initiatePayment: builder.mutation<
      {
        payment_id: string;
        client_secret: string;
        approval_url: string | null;
      },
      { order_id: string; provider: string }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.PAYMENT.INITIATE,
        method: "POST",
        body,
      }),
    }),
    capturePayment: builder.mutation<CapturePaymentResponse, { token: string }>(
      {
        query: ({ token }) => ({
          url: `${API_ENDPOINTS.PAYMENT.CAPTURE}?token=${token}`,
          method: "POST",
        }),
      },
    ),
  }),
});

export const { useInitiatePaymentMutation, useCapturePaymentMutation } =
  paymentApi;
