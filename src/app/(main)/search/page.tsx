
import SearchPageClient from "@/components/pages/SearchPageClient";
import Breadcrumb from "@/components/common/Breadcrumb";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { Product, ProductsResponse } from "@/types/product";
import type { Metadata } from "next";
import "../../../styles/Product.css";
import { toSafeJsonLd } from "@/lib/utils/main-utils";

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  return {
    title: `Search results for "${query}" - Shopperbeats`,
    description: `Find the best deals on ${query} at Shopperbeats.`,
    openGraph: {
      title: `Search results for "${query}" - Shopperbeats`,
      description: `Find the best deals on ${query} at Shopperbeats.`,
      url: `https://shopperbeats.com/search?q=${query}`,
      images: [
        {
          url: "https://shopperbeats.com/images/logo.svg",
          alt: `Search results for "${query}"`,
        },
      ],
      siteName: "Shopperbeats",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Search results for "${query}" - Shopperbeats`,
      description: `Find the best deals on ${query} at Shopperbeats.`,
      images: ["https://shopperbeats.com/images/logo.svg"],
    },
  };
}

async function getProducts(
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<ProductsResponse> {
  const queryParams = new URLSearchParams();

  for (const key in searchParams) {
    const value = searchParams[key];
    if (value !== undefined) {
      if (["price_ranges", "min_price", "max_price"].includes(key.toLowerCase())) continue;
      if (key === "q") {
        queryParams.append("name", String(value));
      } else {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v));
        } else {
          queryParams.append(key, String(value));
        }
      }
    }
  }

  if (searchParams.sort_by) {
    queryParams.set("sort_by", String(searchParams.sort_by));
  }

  if (!queryParams.has("page")) queryParams.set("page", "1");
  if (!queryParams.has("limit")) queryParams.set("limit", "20");

  try {
    const res = await fetch(
      `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.LIST_PRODUCTS}?${queryParams.toString()}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await res.json();
    return { data: data.data, filters: data.filters, totalItems: data.total };
  } catch (error) {
    console.error(error);
    return { data: [] as (Product & { attributes: { name: string; value: string; }[]; })[], filters: [], totalItems: 0 };
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

  const { data: products, filters, totalItems } = await getProducts(
    resolvedSearchParams
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toSafeJsonLd({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Search results for "${query}"`,
            url: `/search?q=${query}`,
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
      <Breadcrumb />
      <SearchPageClient
        query={query}
        products={products}
        filters={filters}
        totalItems={totalItems}
      />
    </>
  );
}
