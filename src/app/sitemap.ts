import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils/site-url";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { getRawCategories } from "@/lib/utils/get-raw-categories";
import { Brand, Category, Product } from "@/types/product";

export const revalidate = 3600;

const STATIC_ROUTES = [
  "",
  "/abouts",
  "/all-categories",
  "/brand",
  "/cms/faq",
  "/cms/intellectual-property-complaints",
  "/cms/return-refunds",
  "/contact",
  "/faq",
  "/payment-policy",
  "/privacy-policy",
  "/products",
  "/return-and-warranty",
  "/sell_on_shopperbeats",
  "/shipping-delivery",
  "/shop-with-peace",
];

const PRODUCT_PAGE_LIMIT = 100;
const MAX_PRODUCT_PAGES = 5; // caps the sitemap at ~500 products, and worst-case (all timeouts) build time
const FETCH_TIMEOUT_MS = 5000; // keeps a slow/unreachable API from stalling the build

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("sitemap fetch timed out")), ms),
    ),
  ]);
}

function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [
    category,
    ...(category.subcategories ? flattenCategories(category.subcategories) : []),
  ]);
}

async function getCategoryEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const categories = await withTimeout(getRawCategories(), FETCH_TIMEOUT_MS);
    return flattenCategories(categories)
      .filter((category) => category.slug)
      .map((category) => ({
        url: `${SITE_URL}/category/${category.slug}`,
        changeFrequency: "daily",
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

async function getBrandEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}/${API_ENDPOINTS.PRODUCTS.BRANDS_LIST}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
    );
    if (!res.ok) return [];

    const json = await res.json();
    const brands: Brand[] = Array.isArray(json) ? json : (json?.data ?? []);

    return brands
      .filter((brand) => brand.id)
      .map((brand) => ({
        url: `${SITE_URL}/brand/${brand.id}`,
        changeFrequency: "weekly",
        priority: 0.6,
      }));
  } catch {
    return [];
  }
}

async function getProductEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  try {
    for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
      const res = await fetch(
        `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.LIST_PRODUCTS}?page=${page}&limit=${PRODUCT_PAGE_LIMIT}`,
        { next: { revalidate: 3600 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
      );
      if (!res.ok) break;

      const json = await res.json();
      const products: Product[] = json?.data ?? [];
      if (products.length === 0) break;

      for (const product of products) {
        const slug = product.unique_code || product.id;
        if (!slug) continue;

        entries.push({
          url: `${SITE_URL}/product/${slug}`,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }

      if (products.length < PRODUCT_PAGE_LIMIT) break;
    }
  } catch {
    return entries;
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categoryEntries, brandEntries, productEntries] = await Promise.all([
    getCategoryEntries(),
    getBrandEntries(),
    getProductEntries(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...brandEntries, ...productEntries];
}
