

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "../../constants/api";
import { createBaseQuery } from "./base-query";

import { OrderPayload, CreateOrderResponse, CancelOrderResponse, ReturnOrderPayload, OrderAPIResponse, ReturnOption, OrderActionResponse, AddReviewPayload, AddReviewResponse, ListOrdersParams } from "@/types/order";

const baseOrderQuery = createBaseQuery(API_ENDPOINTS.ORDER.BASE_URL);

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: baseOrderQuery,
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, OrderPayload>({
      query: (orderData) => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/create-orders`,
        method: "POST",
        body: orderData,
      }),
    }),

    getOrderById: builder.query<OrderAPIResponse, string>({
      query: (orderId: string) => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/get-order/${orderId}`,
        method: "GET",
      }),
    }),

    listOrders: builder.query<{ data: OrderAPIResponse[]; total_items: number }, ListOrdersParams>({
      query: (params) => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/list-orders`,
        method: "GET",
        params,
      }),
    }),
    cancelOrder: builder.mutation<CancelOrderResponse, { order_id: string; reason?: string }>({
      query: ({ order_id, reason }) => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/cancel-order/${order_id}`,
        method: "POST",
        body: reason ? { reason } : undefined,
      }),
    }),
    cancelOrderItem: builder.mutation<OrderActionResponse, { id: string | number; reason?: string }>({
      query: ({ id, reason }) => ({
         url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/cancel-order-item/${id}`,
        // url: API_ENDPOINTS.ORDER.CANCEL_ITEM(id),
        method: "PATCH",
        body: reason ? { reason } : undefined,
      }),
    }),
    getReturnOptions: builder.query<ReturnOption[], void>({
      query: () => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/return-reasons/active`,
        method: "GET",
      }),
    }),
    returnOrder: builder.mutation<OrderActionResponse, ReturnOrderPayload>({
      query: (body) => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/return-order/${body.order_id}`,
        method: "POST",
        body,
      }),
    }),
    returnOrderItem: builder.mutation<OrderActionResponse, ReturnOrderPayload>({
      query: (body) => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/return-order-item/${body.item_id}`,
        method: "POST",
        body,
      }),
    }),
    replaceOrder: builder.mutation<OrderActionResponse, ReturnOrderPayload>({
      query: (body) => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/return-order/${body.order_id}`,
        method: "POST",
        body,
      }),
    }),
    replaceOrderItem: builder.mutation<OrderActionResponse, ReturnOrderPayload>({
      query: (body) => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/replace-order-item/${body.item_id}`,
        method: "POST",
        body,
      }),
    }),
    calculateShipping: builder.mutation<
      {
        product_identifier: string;
        postcode: string;
        zone: string;
        shipping_type: string;
        shipping_cost: string;
        message: string;
      },
      { postcode: string; product_identifier?: string }
    >({
      query: ({ postcode, product_identifier }) => ({
        url:`${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/shipping-rules/calculate-shipping`,
        method: "GET",
        params: {
          postcode,
          ...(product_identifier ? { product_identifier } : {})
        },
      }),
    }),
    addReview: builder.mutation<AddReviewResponse, AddReviewPayload>({
      query: (body) => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/add-review`,
        method: "POST",
        body,
      }),
    }),
    retryPayment: builder.mutation<
      {
        order_id: string;
        shipping_cost: number;
        payment_id: string;
        client_secret: string;
        approval_url: string | null;
      },
      {
        order_id: string;
        payment_method: { type: string; provider: string };
      }
    >({
      query: ({ order_id, payment_method }) => ({
        url: `${process.env.NEXT_PUBLIC_API_URL_ORDER}/api/v1/orders/retry-payment/${order_id}`,
        method: "POST",
        body: { payment_method },
      }),
    }),
  }),
});

export const { useCreateOrderMutation, useListOrdersQuery, useGetOrderByIdQuery, useCancelOrderMutation, useCancelOrderItemMutation, useCalculateShippingMutation, useGetReturnOptionsQuery, useReturnOrderMutation, useReturnOrderItemMutation, useReplaceOrderMutation, useReplaceOrderItemMutation, useAddReviewMutation, useRetryPaymentMutation } = orderApi;
