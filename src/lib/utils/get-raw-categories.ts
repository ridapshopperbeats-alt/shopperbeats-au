import { cache } from "react";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { Category } from "@/types/product";

const baseUrl = API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL;

/**
 * Single source of truth for the category tree.
 *
 * Wrapped in React's `cache()` so that all callers within one request
 * (mega menu, footer, category slider, etc.) share ONE network call
 * instead of each hitting `/list-category` separately. The Next.js Data
 * Cache (revalidate) handles reuse across requests.
 */
export const getRawCategories = cache(async (): Promise<Category[]> => {
  const res = await fetch(`${baseUrl}${API_ENDPOINTS.CATEGORIES.LIST}`, {
    next: { revalidate: 3600 }, // categories rarely change — cache 1 hour
  });

  if (!res.ok) return [];

  return res.json();
});
