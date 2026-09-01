import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "../../constants/api";
import { Cart, PromoValidationResponse } from "@/types/cart";
import { WishlistItem, Wishlist, WishlistProductSnapshot } from "@/types/wishlist";
import { createBaseQuery } from "./base-query";

interface RemoveCouponResponse {
  success: boolean;
  message: string;
  new_total: number;
  cart_summary: {
    items_total: number;
    items_discount: number;
    subtotal: number;
    coupon_discount: number;
    shipping: number;
    tax: number;
    total_price: number;
    list_price_savings: number;
    item_promotion_savings: number;
    coupon_savings: number;
    total_saving: number;
  };
}

interface MoveWishlistToCartResponse {
  moved_items?: { product_id: string; variant_id?: string | null }[];
  failed_items?: {
    product_id: string;
    variant_id?: string | null;
    reason?: string;
  }[];
  message?: string;
}

const baseCartQuery = createBaseQuery(API_ENDPOINTS.CART.BASE_URL);
const baseWishlistQuery = createBaseQuery(API_ENDPOINTS.WISHLIST.BASE_URL);
const basePromoQuery = createBaseQuery(API_ENDPOINTS.CART.PROMO_BASE_URL);

// --- GUEST WISHLIST (localStorage-backed, used when the user isn't logged in) ---
const GUEST_WISHLIST_STORAGE_KEY = "guest_wishlist";

export interface GuestWishlistEntry {
  product_id: string;
  variant_id: string | null;
  snapshot?: WishlistProductSnapshot;
}

function isUserAuthenticated(api: { getState: () => unknown }): boolean {
  const state = api.getState() as { auth?: { isAuthenticated?: boolean } };
  return Boolean(state?.auth?.isAuthenticated);
}

export function readGuestWishlist(): GuestWishlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(items: GuestWishlistEntry[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_WISHLIST_STORAGE_KEY, JSON.stringify(items));
}

export function clearGuestWishlist(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_WISHLIST_STORAGE_KEY);
}

function guestWishlistToWishlist(items: GuestWishlistEntry[]): Wishlist {
  return {
    items: items.map((item) => {
      const snap = item.snapshot;
      const hasDiscount = Boolean(snap?.showWasPrice && snap?.wasPrice);

      return {
        product_id: item.product_id,
        product_name: snap?.title || "",
        title: snap?.title,
        variant_id: item.variant_id,
        is_active: true,
        brand_name: snap?.brand_name,
        thumbnail: snap?.image,
        price: snap?.mainPrice != null ? String(snap.mainPrice) : undefined,
        rrp_price: hasDiscount ? String(snap!.wasPrice) : undefined,
        discounted_price: hasDiscount ? snap!.mainPrice : undefined,
        discount_percentage: snap?.discountPercentage,
        unique_code: snap?.unique_code,
        promotion_name: snap?.promotion_name,
        stock: snap?.stock,
        available_stock: snap?.stock,
        tags: snap?.tags,
        vendor_id: snap?.vendor_id,
        ships_from_location: snap?.ships_from_location,
        handling_time_days: snap?.handling_time_days,
        handling_time_max_days: snap?.handling_time_max_days,
        variants: snap?.variants,
        review_stats: {
          average_rating: snap?.rating ?? 0,
          total_reviews: snap?.reviewCount ?? 0,
        },
        created_at: new Date().toISOString(),
      } as WishlistItem;
    }),
    total_items: items.length,
  };
}
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
      invalidatesTags: ["Cart"],
    }),

    removeCoupon: builder.mutation<RemoveCouponResponse, void>({
      queryFn: async (_arg, api, extraOptions) => {
        const result = await basePromoQuery(
          {
            url: API_ENDPOINTS.CART.REMOVE_COUPON,
            method: "DELETE",
          },
          api,
          extraOptions
        );

        if (result.error) return { error: result.error };
        return { data: result.data as RemoveCouponResponse };
      },
      invalidatesTags: ["Cart"],
    }),

    // --- WISHLIST ENDPOINTS USING baseWishlistQuery ---
    createWishlist: builder.mutation<
      Wishlist,
      { product_id: string; variant_id?: string; snapshot?: WishlistProductSnapshot }
    >({
      queryFn: async ({ product_id, variant_id, snapshot }, api, extraOptions) => {
        if (!isUserAuthenticated(api)) {
          const normalizedVariantId = variant_id ?? null;
          const current = readGuestWishlist();
          const alreadyExists = current.some(
            (item) =>
              item.product_id === product_id &&
              item.variant_id === normalizedVariantId
          );
          const updated = alreadyExists
            ? current
            : [...current, { product_id, variant_id: normalizedVariantId, snapshot }];
          writeGuestWishlist(updated);
          return { data: guestWishlistToWishlist(updated) };
        }

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
              draft.total_items = draft.items.length;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Wishlist"],
    }),
    getWishlist: builder.query<Wishlist, void>({
       queryFn: async (_arg, api, extraOptions) => {
         if (!isUserAuthenticated(api)) {
           return { data: guestWishlistToWishlist(readGuestWishlist()) };
         }

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
        if (!isUserAuthenticated(api)) {
          const normalizedVariantId = variant_id ?? null;
          const current = readGuestWishlist();
          const updated = current.filter(
            (item) =>
              !(
                item.product_id === product_id &&
                item.variant_id === normalizedVariantId
              )
          );
          writeGuestWishlist(updated);
          return { data: guestWishlistToWishlist(updated) };
        }

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
              draft.total_items = draft.items.length;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Wishlist"],
    }),
    moveWishlistToCart: builder.mutation<
      MoveWishlistToCartResponse,
      {
        items?: { product_id: string; variant_id?: string | null }[];
        postcode?: string | null;
        remove_from_wishlist?: boolean;
      } | void
    >({
      queryFn: async (arg, api, extraOptions) => {
        const result = await baseWishlistQuery(
          {
            url: API_ENDPOINTS.WISHLIST.MOVE_TO_CART,
            method: "POST",
            body: arg || {},
          },
          api,
          extraOptions
        );

        if (result.error) return { error: result.error };
        return { data: result.data as MoveWishlistToCartResponse };
      },
      invalidatesTags: ["Cart", "Wishlist"],
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
  useRemoveCouponMutation,
  useCreateWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useMoveWishlistToCartMutation,
  useClearCartMutation,
} = cartApi;
