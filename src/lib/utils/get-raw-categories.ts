import { cache } from "react";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { Category } from "@/types/product";

const baseUrl = API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL;

export const getRawCategories = cache(async (): Promise<Category[]> => {
  const res = await fetch(`${baseUrl}${API_ENDPOINTS.CATEGORIES.LIST}`, {
    next: { revalidate: 3600 }, // categories rarely change — cache 1 hour
  });

  if (!res.ok) return [];

  return res.json();
});
