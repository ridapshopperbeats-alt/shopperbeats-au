import { cache } from "react";
import CategoryPageClient from "@/components/pages/CategoryPageClient";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { Metadata } from "next";
import { ProductsResponse } from "@/types/product";
import { getMegaMenuData } from "@/lib/utils/get-mega-menu-data";
import { toSafeJsonLd } from "@/lib/utils/main-utils";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryDetails(slug);

  return {
    title: category?.name
      ? `${category.name} - Shopperbeats`
      : "Category - Shopperbeats",
    description:
      category?.description ||
      `Browse products in the ${category?.name || "selected"} category on Shopperbeats.`,
    openGraph: {
      title: category?.name
        ? `${category.name} - Shopperbeats`
        : "Category - Shopperbeats",
      description:
        category?.description ||
        `Browse products in the ${category?.name || "selected"} category on Shopperbeats.`,
      url: `https://shopperbeats.com/category/${slug}`,
      images: [
        {
          url: "https://shopperbeats.com/images/logo.svg", 
          alt: category?.name || "Shopperbeats Category",
        },
      ],
      siteName: "Shopperbeats",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: category?.name
        ? `${category.name} - Shopperbeats`
        : "Category - Shopperbeats",
      description:
        category?.description ||
        `Browse products in the ${category?.name || "selected"} category on Shopperbeats.`,
      images: ["https://shopperbeats.com/images/logo.svg"], 
    },
  };
}

const getCategoryDetails = cache(async (slug: string) => {
  const baseUrl = API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL;

  if (!baseUrl) {
    return null;
  }

  const findCategory = (cats: any[], targetSlug: string): any => {
    for (const cat of cats) {
      if (cat.slug === targetSlug) return cat;
      if (cat.subcategories?.length) {
        const found = findCategory(cat.subcategories, targetSlug);
        if (found) return found;
      }
    }
    return null;
  };

  try {
    const res = await fetch(
      `${baseUrl}${API_ENDPOINTS.CATEGORIES.BY_SLUG(slug)}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      return await res.json();
    }

    console.warn(`Failed to fetch category details directly (${res.status}). Attempting fallback to list...`);

    const listRes = await fetch(`${baseUrl}${API_ENDPOINTS.CATEGORIES.LIST}`, {
      next: { revalidate: 60 },
    });

    if (!listRes.ok) {
      console.warn("Failed to fetch category list for fallback:", listRes.status);
      return null;
    }

    const categories = await listRes.json();
    return findCategory(categories, slug);

  } catch (error) {
    console.warn("Error fetching category details:", error);
    return null;
  }
});

async function getProducts(
  categorySlug: string,
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<ProductsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set("category_slug", categorySlug);

  for (const key in searchParams) {
    const value = searchParams[key];
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, String(value));
      }
    }
  }

  if (searchParams.sort_by) {
    queryParams.set("sort_by", String(searchParams.sort_by));
  }

  if (!queryParams.has("page")) queryParams.set("page", "1");
  queryParams.set("limit", "20");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_PRODUCTS}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.LIST_PRODUCTS}?${queryParams.toString()}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await res.json();
    return { data: data.data, filters: data.filters, totalItems: data.total };
  } catch (error) {
    console.warn(error);
    return { data: [], filters: [], totalItems: 0 };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };

}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const [category, { data: products, filters, totalItems }, megaMenuData] =
    await Promise.all([
      getCategoryDetails(slug),
      getProducts(slug, resolvedSearchParams),
      getMegaMenuData(),
    ]);

  let sidebarFilters = filters;

  if (sidebarFilters.length === 0) {
    try {
      const fallbackRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_PRODUCTS}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.LIST_PRODUCTS}?limit=1`,
        {
          cache: "no-store",
        }
      );

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        sidebarFilters = fallbackData?.filters || [];
      }
    } catch (error) {
      console.warn("Failed to load fallback filters:", error);
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toSafeJsonLd({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: category?.name || slug,
            url: `/category/${slug}`,
            numberOfItems: products.length,
            itemListElement: products.map((product: any, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              name: product.title,
              url: `/product/${product.unique_code || product.slug}`,
            })),
          }),
        }}
      />
      <CategoryPageClient
        megaMenuData={megaMenuData}
        slug={slug}
        category={category}
        products={products}
        filters={sidebarFilters}
        totalItems={totalItems}
      />
    </>
  );
}

