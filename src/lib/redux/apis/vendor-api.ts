import { createApi } from "@reduxjs/toolkit/query/react";
import { VendorRequestPayload, VendorRequestResponse } from "@/types/cart";
import { createBaseQuery } from "./base-query";

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery: createBaseQuery(process.env.NEXT_PUBLIC_API_URL_USERS || ""),
  endpoints: (builder) => ({
    createVendorRequest: builder.mutation<VendorRequestResponse, VendorRequestPayload>({
      query: (body) => ({
        url: "admin/api/vendor/request",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateVendorRequestMutation } = vendorApi;
