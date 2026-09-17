import { cookies } from "next/headers";
import ProductDetailClient from "@/components/pages/ProductDetailClient";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { Category, Product, ProductApiResponse } from "@/types/product";
import { ProductSEO } from "@/types/seo";
import NoProductsFound from "@/components/NoProductFound";
import { getMegaMenuData } from "@/lib/utils/get-mega-menu-data";

/**
 * get-product returns price, rrp_price and stock as null for every product,
 * while list-products carries them — so when the detail payload has no price,
 * look the same product up in the listing and borrow its pricing. Matched on
 * unique_code so a loose name search cannot attach the wrong product's price.
 * Drop this once get-product populates the fields itself.
 */
async function getPricingFallback(title?: string, uniqueCode?: string) {
  if (!title || !uniqueCode) return null;

  try {
    const url = `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.LIST_PRODUCTS}?name=${encodeURIComponent(title)}&limit=10`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;

    const body = await res.json();
    const list = body?.data ?? body?.products ?? [];
    if (!Array.isArray(list)) return null;

    return list.find((item) => item?.unique_code === uniqueCode) ?? null;
  } catch (error) {
    console.warn(`Pricing fallback failed for "${uniqueCode}":`, error);
    return null;
  }
}

async function getProduct(
  slug: string,
  cookieHeader?: string
): Promise<{ product: Product | null; setCookie?: string; seo?: ProductSEO }> {
  try {
    const url = `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.GET_PRODUCT}/${slug}`;

    const fetchWithCookie = (withCookie: boolean) => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (withCookie && cookieHeader) {
        headers["Cookie"] = cookieHeader;
      }
      return fetch(url, {
        headers,
        next: { revalidate: 300 },
      });
    };

    let res = await fetchWithCookie(true);

    if (res.status === 401 && cookieHeader) {
      res = await fetchWithCookie(false);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch product (status ${res.status})`);
    }

    const setCookie = res.headers.get("set-cookie") ?? undefined;

    const data: ProductApiResponse = await res.json();

    const pricing =
      data.price === null || data.price === undefined
        ? await getPricingFallback(data.title, data.unique_code)
        : null;

    const product = {
      id: data.id,
      unique_code: data.unique_code,
      title: data.title,
      description: data.description,
      slug: data.slug,
      stock: pricing?.stock ?? data.stock,
      price: pricing?.price ?? data.price,
      rrp_price: pricing?.rrp_price ?? data.rrp_price,
      key_features: data.key_features,
      brand_name: data.brand_name,
      handling_time_days: data.handling_time_days,
      handling_time_max_days: data.handling_time_max_days,
      height: data.height,
      weight: data.weight,
      length: data.length,
      width: data.width,
      care_instructions: data?.care_instructions,
      precautionary_note: data?.precautionary_note,
      warranty: data?.warranty,
      ships_from_location: data.ships_from_location,
      status: data.status,
      brand_id: data.brand_id,
      brand_slug: data.brand_slug,
      images: data.images?.length
        ? data.images
        : [
          { image_url: "/images/image-coming-soon.jpg", is_main: true },
          { image_url: "/images/image-coming-soon.jpg", is_main: false },
          { image_url: "/images/image-coming-soon.jpg", is_main: false },
          { image_url: "/images/image-coming-soon.jpg", is_main: false },
          { image_url: "/images/image-coming-soon.jpg", is_main: false },
          { image_url: "/images/image-coming-soon.jpg", is_main: false },
        ],
      discount_percentage: pricing?.discount_percentage ?? data.discount_percentage,
      discounted_price: pricing?.discounted_price ?? data.discounted_price,
      free_shipping: data.free_shipping,
      review_stats: data.review_stats,
      variants: data.variants,
      reviews: data.reviews,
      return: data.return_policy,
      category_id: data.category_id,
      fast_dispatch: data.fast_dispatch,
      sku: data.sku,
      bundle_group_code: data.bundle_group_code,
      bundle_products: data.bundle_products,
      promotion_name: data.promotion_name,
      vendor_id: data.vendor_id,
      tags: data.tags,
    };

    const seo = {
      page_title: data.seo?.page_title,
      meta_description: data.seo?.meta_description,
      meta_keywords: data.seo?.meta_keywords,
      canonical_url: data.seo?.canonical_url,
      url_handle: data.seo?.url_handle
    };

    return { product, setCookie, seo };
  } catch (error) {
    console.warn(`getProduct failed for slug "${slug}":`, error);
    return { product: null };
  }
}

async function getRecommendations(
  productId: string
): Promise<Product[] | null> {
  try {
    const res = await fetch(
      `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.RECOMMENDATION}?product_id=${productId}`, {
      next: {
        revalidate: 300,
      },
    }
    );

    if (!res.ok) {
      return [];
    }
    const data: ProductApiResponse[] = await res.json();

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      slug: item.slug,
      sku: item.sku,
      price: item.price,
      brand_name: item.brand_name,
      images: item.images,
      rrp_price: item.rrp_price,
      discount_percentage: item.discount_percentage,
      discounted_price: item.discounted_price,
      free_shipping: item.free_shipping,
      review_stats: item.review_stats,
      variants: item.variants,
      reviews: item.reviews,
      promotion_name: item.promotion_name,
      unique_code: item.unique_code,
      vendor_id: item.vendor_id,
      tags: item.tags,
    }));
  } catch {
    return [];
  }
}

async function getRecentlyViewed(cookieHeader?: string): Promise<Product[] | null> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    const res = await fetch(
      `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.RECENTLY_VIEWED}`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data ?? [];
  } catch {
    return null;
  }
}

async function getPopularProducts(): Promise<Product[] | null> {
  try {
    const res = await fetch(
      `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.HIGHLIGHTS}/popular`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    const items: ProductApiResponse[] = data?.products?.data || [];

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      slug: item.slug,
      price: item.price,
      rrp_price: item.rrp_price,
      brand_name: item.brand_name,
      image:
        item.images && item.images.length > 0
          ? item.images?.find((img) => img.is_main)?.image_url
          : "/images/image-coming-soon.jpg",

      discount_percentage: item.discount_percentage,
      discounted_price: item.discounted_price,
      free_shipping: item.free_shipping,
      review_stats: item.review_stats,
      variants: item.variants,
      reviews: item.reviews,
      sku: item.sku,
      unique_code: item.unique_code,
      promotion_name: item.promotion_name,
      vendor_id: item.vendor_id,
      tags: item.tags,
    }));
  } catch {
    return null;
  }
}

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const cookieStore = await cookies();
  const clientCookies = cookieStore.toString();

  const { product, seo } = await getProduct(slug, clientCookies);

  if (!product) {
    return <div className="py-10"><NoProductsFound /></div>;
  }

  const [recommendations, popularProducts, recentlyViewed, megaMenuData] = await Promise.all([
    product.id ? getRecommendations(product.id) : Promise.resolve(null),
    getPopularProducts(),
    getRecentlyViewed(clientCookies),
    getMegaMenuData(),
  ]);

  return (
    <ProductDetailClient
      product={product}
      seo={seo}
      recommendations={recommendations ?? []}
      popularProducts={popularProducts}
      recentlyViewed={recentlyViewed}
      megaMenuData={megaMenuData as Category[]}
      slug={slug}
    />
  );
}