import { API_ENDPOINTS } from "@/lib/constants/api";
import { Product } from "@/types/product";

const baseUrl = API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL;

async function fetchTrending(limit: number): Promise<Product[]> {
  const res = await fetch(
    `${baseUrl}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.TRENDING_PRODUCTS}?limit=${limit}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return [];

  const data = await res.json();

  // trending-products wraps results in `items`
  return data?.items ?? data?.data ?? [];
}

/**
 * Fetches products for the homepage "Trending Products" section.
 *
 * NOTE: `trending-products` currently returns 0 items in preprod, so we fall
 * back to `list-products` (page 2, to differ from Best Sellers) so the section
 * still renders. Remove the fallback once trending is populated.
 */
export async function getTrendingProducts(limit = 10): Promise<Product[]> {
  const trending = await fetchTrending(limit);
  if (trending.length > 0) return trending;

  const res = await fetch(
    `${baseUrl}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.LIST_PRODUCTS}?limit=${limit}&page=2`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return [];

  const data = await res.json();

  return data?.data ?? [];
}
