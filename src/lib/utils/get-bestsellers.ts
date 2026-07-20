import { API_ENDPOINTS } from "@/lib/constants/api";
import { Product } from "@/types/product";

const baseUrl = API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL;

export async function getBestSellers(limit = 10): Promise<Product[]> {
  const res = await fetch(
    `${baseUrl}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.LIST_PRODUCTS}?limit=${limit}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return [];

  const data = await res.json();

  return data?.data ?? [];
}
