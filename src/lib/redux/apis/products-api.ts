import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "../../constants/api";
import { Brand, Product } from "@/types/product";
import {
  ImageUploadResponse,
  ProductHighlightsResponse,
  SearchSuggestionsResponse,
} from "@/types/api";
import { createBaseQuery } from "./base-query";

export const productsApi = createApi({
  reducerPath: "productsApi",

  baseQuery: createBaseQuery(API_ENDPOINTS.PRODUCTS.PRODUCT_BASE_URL_CLIENT),

  tagTypes: ["Brands"],

  endpoints: (builder) => ({
    getBrands: builder.query<Brand[], void>({
      query: () => ({
        url: `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}/${API_ENDPOINTS.PRODUCTS.BRANDS_LIST}`,
        credentials: "include",
      }),
      providesTags: ["Brands"],
    }),

    getPopularProducts: builder.query<{ data: Product[] }, void>({
      query: () => API_ENDPOINTS.PRODUCTS.POPULAR,
    }),

    getTrendingProducts: builder.query<{ data: Product[] }, void>({
      query: () => API_ENDPOINTS.PRODUCTS.TRENDING_PRODUCTS,
    }),

    getRecentlyViewed: builder.query<Product[], void>({
      query: () => API_ENDPOINTS.PRODUCTS.RECENTLY_VIEWED,
    }),

    getRecommendations: builder.query<{ data: Product[] }, {
      product_id?: string;
      category_name?: string;
      brand_name?: string;
      product_name?: string;
    }>({
      query: (params) => {
        let url = `${process.env.NEXT_PUBLIC_API_URL_PRODUCTS}/api/v1/product/recommendations`;
        const searchParams = new URLSearchParams();
        
        if (params.product_id) searchParams.append("product_id", params.product_id);
        if (params.category_name) searchParams.append("category_name", params.category_name);
        if (params.brand_name) searchParams.append("brand_name", params.brand_name);
        if (params.product_name) searchParams.append("product_name", params.product_name);
        
        if (searchParams.toString()) {
          url += `?${searchParams.toString()}`;
        }
        
        return url;
      },
    }),

    searchProducts: builder.query<{ data: Product[] }, string>({
      query: (name) =>
        `${process.env.NEXT_PUBLIC_API_URL_PRODUCTS}/api/v1/product/list-products?name=${name}`,
    }),

    getProducts: builder.query<
      { data: Product[]; total: number; limit: number },
      {
        sort_by?: string;
        min_price?: string;
        max_price?: string;
        categories?: string;
        price_ranges?: string;
        category_slug?: string;
        page?: number;
        limit?: number;
        [key: string]: string | number | undefined;
      }
    >({
      query: ({
        sort_by,
        min_price,
        max_price,
        categories,
        price_ranges,
        category_slug,
        page = 1,
        limit = 10,
        ...otherFilters
      }) => {
        let url = `${process.env.NEXT_PUBLIC_API_URL_PRODUCTS}/api/v1/product/list-products`;

        const params = new URLSearchParams();

        if (sort_by) params.append("sort_by", sort_by);

        if (min_price) params.append("min_price", min_price);

        if (max_price) params.append("max_price", max_price);

        if (categories) {
          params.append(
            "categories",
            categories.replace(/(^|\S)\s*\(\d+\)/g, "$1")
          );
        }

        if (price_ranges) {
          params.append(
            "price_ranges",
            price_ranges.replace(/(^|\S)\s*\(\d+\)/g, "$1")
          );
        }

        if (category_slug) {
          params.append("category_slug", category_slug);
        }

        params.append("page", page.toString());
        params.append("limit", limit.toString());

        for (const key in otherFilters) {
          if (otherFilters[key]) {
            if (key.toLowerCase() === "shipping") {
              const val = String(otherFilters[key]).toLowerCase();

              params.append(
                "free_shipping",
                val.includes("free shipping") ? "true" : "false"
              );

              params.append(
                "fast_dispatch",
                val.includes("fast dispatch") ? "true" : "false"
              );
            } else {
              params.append(key, otherFilters[key] as string);
            }
          }
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        return url;
      },
    }),

    getProductBySlug: builder.query<Product, string>({
      query: (slug) =>
        `${API_ENDPOINTS.PRODUCTS.GET_PRODUCT}/${slug}`,
    }),

    uploadAnyImage: builder.mutation<ImageUploadResponse, FormData>({
      query: (formData) => ({
        url: API_ENDPOINTS.PRODUCTS.UPLOAD_ANY_IMAGE,
        method: "POST",
        body: formData,
      }),
    }),

    getSearchSuggestions: builder.query<SearchSuggestionsResponse, string>({
      query: (q) =>
        `${process.env.NEXT_PUBLIC_API_URL_PRODUCTS}/api/v1/search/suggest?q=${encodeURIComponent(q)}&limit=15`,
    }),
  }),
});

export const highlightsApi = createApi({
  reducerPath: "highlightsApi",

  baseQuery: createBaseQuery(process.env.NEXT_PUBLIC_API_URL || ""),

  endpoints: (builder) => ({
    getProductHighlights: builder.query<
      ProductHighlightsResponse,
      string
    >({
      query: (idOrSlug) =>
        `${API_ENDPOINTS.PRODUCTS.HIGHLIGHTS}/${idOrSlug}`,
    }),
  }),
});

export const {
  useSearchProductsQuery,
  useGetProductsQuery,
  useGetPopularProductsQuery,
  useGetTrendingProductsQuery,
  useGetRecentlyViewedQuery,
  useGetRecommendationsQuery,
  useGetBrandsQuery,
  useGetProductBySlugQuery,
  useUploadAnyImageMutation,
  useGetSearchSuggestionsQuery
} = productsApi;

export const { useGetProductHighlightsQuery } = highlightsApi;
