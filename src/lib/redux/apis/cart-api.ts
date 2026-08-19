import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "../../constants/api";
import { Cart, PromoValidationResponse } from "@/types/cart";
import { WishlistItem, Wishlist } from "@/types/wishlist";
import { createBaseQuery } from "./base-query";

const baseCartQuery = createBaseQuery(API_ENDPOINTS.CART.BASE_URL);
const baseWishlistQuery = createBaseQuery(API_ENDPOINTS.WISHLIST.BASE_URL);
const basePromoQuery = createBaseQuery(API_ENDPOINTS.CART.PROMO_BASE_URL);
export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: baseCartQuery,
  tagTypes: ["Cart", "Wishlist"],
  endpoints: (builder) => ({
    getCart: builder.query<Cart, { postcode?: string } | void>({
      query: (params) => ({
        url: API_ENDPOINTS.CART.GET,
        ...(params?.postcode && { params: { postcode: params.postcode } })
      }),
      providesTags: ["Cart"],
    }),
    addToCart: builder.mutation<
      Cart,
      { productId?: string; quantity?: number; variant_id?: string; vendor_id?: string; items?: Array<{ product_id: string; quantity: number; variant_id?: string; vendor_id?: string }>; postcode?: string }
    >({
      query: ({ productId, quantity, variant_id, vendor_id, items, postcode }) => ({
        url: API_ENDPOINTS.CART.ADD,
        method: "POST",
        body: {
          items: items || [{ product_id: productId, quantity, ...(variant_id ? { variant_id } : {}), ...(vendor_id ? { vendor_id } : {}) }],
          ...(postcode && { postcode })
        },
      }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: builder.mutation<Cart, { cartId: string }>({
      query: ({ cartId }) => ({
        url: API_ENDPOINTS.CART.CLEAR,
        method: "DELETE",
        params: { cart_id: cartId },
      }),
      invalidatesTags: ["Cart"],
    }),


    updateCartItemQuantity: builder.mutation<
      Cart,
      { product_id: string; quantity: number; variant_id?: string; postcode?: string }
    >({
      query: ({ product_id, quantity, variant_id, postcode }) => ({
        url: API_ENDPOINTS.CART.UPDATE,
        method: "PUT",
        params: { product_id, quantity, ...(variant_id ? { variant_id } : {}), ...(postcode ? { postcode } : {}) },
      }),
      invalidatesTags: ["Cart"],
    }),

    removeFromCart: builder.mutation<
      Cart,
      { product_id: string; variant_id?: string }
    >({
      query: ({ product_id, variant_id }) => ({
        url: API_ENDPOINTS.CART.REMOVE,
        method: "DELETE",
        params: {
          product_id,
          ...(variant_id ? { variant_id } : {}),
        },
      }),
      invalidatesTags: ["Cart"],
    }),

    checkDelivery: builder.mutation<
      {
        deliverable: boolean;
        message?: string;
      },
      string
    >({
      query: (pincode) => ({
        url: API_ENDPOINTS.CART.CHECK_DELIVERY,
        method: "GET",
        params: { pincode },
      }),
    }),
    validatePromoCode: builder.mutation<
      PromoValidationResponse,
      { coupon_code: string; cart_id: string; user_id?: string; order_id?: string; post_code?: string }
    >({
      queryFn: async ({ coupon_code, cart_id = "", user_id = "", order_id = "", post_code = "" }, api, extraOptions) => {
        const result = await basePromoQuery(
          {
            url: API_ENDPOINTS.CART.VALIDATE,
            method: "POST",
            body: { coupon_code, cart_id, user_id, order_id, post_code },
          },
          api,
          extraOptions
        );

        if (result.error) return { error: result.error };
        return { data: result.data as PromoValidationResponse };
      },
    }),

    // --- WISHLIST ENDPOINTS USING baseWishlistQuery ---
    createWishlist: builder.mutation<
      Wishlist,
      { product_id: string; variant_id?: string }
    >({
      queryFn: async ({ product_id, variant_id }, api, extraOptions) => {
        const result = await baseWishlistQuery(
          {
            url: API_ENDPOINTS.WISHLIST.CREATE,
            method: "POST",
            body: { product_id, variant_id },
          },
          api,
          extraOptions
        );

        if (result.error) return { error: result.error };
        return { data: result.data as Wishlist };
      },
      async onQueryStarted(
        { product_id, variant_id },
        { dispatch, queryFulfilled }
      ) {
        const productId = product_id;
        const variantId: string | null = variant_id ?? null;
        const patch = dispatch(
          cartApi.util.updateQueryData("getWishlist", undefined, (draft) => {
            if (draft?.items) {
              draft.items.push({
                product_id: productId,
                variant_id: variantId,
                created_at: new Date().toISOString(),
              } as WishlistItem);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    getWishlist: builder.query<Wishlist, void>({
       queryFn: async (_arg, api, extraOptions) => {
         const result = await baseWishlistQuery(
           {
             url: API_ENDPOINTS.WISHLIST.GET,
             method: "GET",
           },
           api,
           extraOptions
         );

         if (result.error) return { error: result.error };
         const data = result.data as Wishlist | Wishlist[];

         // Handle case where API returns empty array or null
         if (!data || (Array.isArray(data) && data.length === 0)) {
           return { data: { items: [], total_items: 0 } };
         }

         // If the data is already the Wishlist object (with items), return it
         if (!Array.isArray(data) && data.items) {
           return { data };
         }

         return { data: (data as Wishlist[])[0] };
       },
       providesTags: ["Wishlist"],
     }),
    removeFromWishlist: builder.mutation<
      Wishlist,
      { product_id: string; variant_id?: string }
    >({
      queryFn: async ({ product_id, variant_id }, api, extraOptions) => {
        const result = await baseWishlistQuery(
          {
            url: API_ENDPOINTS.WISHLIST.REMOVE,
            method: "DELETE",
            params: {
              product_id,
              ...(variant_id ? { variant_id } : {}),
            },
          },
          api,
          extraOptions
        );
        if (result.error) return { error: result.error };
        return { data: result.data as Wishlist };
      },
      async onQueryStarted(
        { product_id, variant_id },
        { dispatch, queryFulfilled }
      ) {
        const normalizedVariantId: string | null = variant_id ?? null;
        const patch = dispatch(
          cartApi.util.updateQueryData("getWishlist", undefined, (draft) => {
            if (draft?.items) {
              draft.items = draft.items.filter(
                (item) =>
                  !(item.product_id === product_id && item.variant_id === normalizedVariantId)
              );
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});


export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemQuantityMutation,
  useRemoveFromCartMutation,
  useCheckDeliveryMutation,
  useValidatePromoCodeMutation,
  useCreateWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useClearCartMutation,
} = cartApi;
