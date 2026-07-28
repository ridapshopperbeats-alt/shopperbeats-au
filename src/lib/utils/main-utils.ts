import { Product, Variant, Category } from "@/types/product";
import { API_ENDPOINTS } from "@/lib/constants/api";

const baseUrl = API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL;

import { cache } from "react";
import { ContactContent } from "@/types/cms";
import { applyImageVariant } from "@/lib/utils/imageUtils";

// Safely serialize data for a `<script type="application/ld+json">` block.
// JSON.stringify leaves `<` unescaped, so a value containing `</script>`
// (e.g. a scraped/malicious product title) can break out of the script tag
// and inject arbitrary markup — escape it to a JSON-safe unicode sequence.
export function toSafeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// Extracts a human-readable message from an RTK Query error, falling back
// to `fallback` when the error has none (e.g. a network failure).
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as {
    data?: { message?: string; errors?: { message: string }[] };
    message?: string;
  };

  return (
    apiError?.data?.errors?.[0]?.message ||
    apiError?.data?.message ||
    apiError?.message ||
    fallback
  );
}

// Price formatting utilities
export const formatPrice = (
  price: number | string | undefined | null,
): string => {
  if (price === undefined || price === null || price === "") return "0";

  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price;

  if (Number.isNaN(numPrice)) return "0";

  return numPrice.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

// Format price with fixed 2 decimal places
export const formatPriceFixed2 = (
  price: number | string | undefined | null,
): string => {
  return Number(price).toFixed(2);
};

// Convert a Date object or string to YYYY-MM-DD format
export const toYYYYMMDD = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  if (typeof date === "string") return date;

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Format a date to a more readable format, e.g., "January 1, 2024"
export const formatReadableDate = (
  date: Date | string | null | undefined,
  locale: string = "en-US",
): string => {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Handle usa numbers utility
export const handleUSPhoneNumberChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  previousValue: string,
): { value: string; error: string | null } => {
  const value = event.target.value;

  // Allow only digits and +
  if (!/^[0-9+]*$/.test(value)) {
    return { value: previousValue, error: "Only numbers and '+' allowed" };
  }

  // Only one +
  if ((value.match(/\+/g) || []).length > 1) {
    return { value: previousValue, error: "Only one '+' allowed" };
  }

  // First character must be a digit or +
  if (
    value.length === 1 &&
    value !== "+" &&
    !/^[0-9]$/.test(value)
  ) {
    return { value: previousValue, error: "Must start with a digit or +1" };
  }

  // ===== LOCAL FORMAT (10 digits) =====
  if (!value.startsWith("+")) {
    if (value.length > 10) {
      return { value: previousValue, error: null };
    }

    return { value, error: null };
  }

  // ===== INTERNATIONAL FORMAT (+1XXXXXXXXXX) =====
  if (value.startsWith("+")) {
    // Allow typing + → +1 progressively
    if (value.length >= 2 && value[1] !== "1") {
      return { value: previousValue, error: "Must start with +1" };
    }

    // Maximum length: +1 + 10 digits = 12 characters
    if (value.length > 12) {
      return { value: previousValue, error: null };
    }

    return { value, error: null };
  }

  return { value, error: null };
};
// Validate Australian phone numbers with specific rules for local and international formats
export const handleAustralianPhoneNumberChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  previousValue: string,
): { value: string; error: string | null } => {
  const value = event.target.value;

  // Allow only digits and +
  if (!/^[0-9+]*$/.test(value)) {
    return { value: previousValue, error: "Only numbers and '+' allowed" };
  }

  // Only one +
  if ((value.match(/\+/g) || []).length > 1) {
    return { value: previousValue, error: "Only one '+' allowed" };
  }

  // First character must be 0 or +
  if (value.length === 1 && value !== "0" && value !== "+") {
    return { value: previousValue, error: "Must start with 04 or +61" };
  }

  // ===== LOCAL MOBILE FORMAT =====
  if (value.startsWith("0")) {
    // Allow typing 0 → 04 progressively
    if (value.length >= 2 && value[1] !== "4") {
      return {
        value: previousValue,
        error: "Australian mobile must start with 04",
      };
    }

    if (value.length > 10) {
      return { value: previousValue, error: null };
    }

    return { value, error: null };
  }

  // ===== INTERNATIONAL FORMAT =====
  if (value.startsWith("+")) {
    // Allow typing + → +6 → +61 progressively
    if (value.length >= 2 && value[1] !== "6") {
      return { value: previousValue, error: "Must start with +61" };
    }

    if (value.length >= 3 && value[2] !== "1") {
      return { value: previousValue, error: "Must start with +61" };
    }

    // After +61, next must be 4
    if (value.length >= 4 && value[3] !== "4") {
      return {
        value: previousValue,
        error: "Australian mobile must start with +614",
      };
    }

    if (value.length > 12) {
      return { value: previousValue, error: null };
    }

    return { value, error: null };
  }

  return { value, error: null };
};

// Get the main image URL for a product, with a fallback if no images are available.
// `variant` is an optional Cloudflare Images variant name (e.g. "plpcard") applied
// via `applyImageVariant` to request an appropriately sized/cropped rendition.
export function getImageUrl(product: Product, variant?: string): string {
  const fallback = "/images/image-coming-soon.jpg";

  if (typeof product.images === "string" && product.images) {
    return applyImageVariant(product.images, variant);
  }

  if (typeof product.thumbnail === "string" && product.thumbnail) {
    return applyImageVariant(product.thumbnail, variant);
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    const sortedImages = [...product.images]
      .filter((img) => !!img.image_url)
      .sort((a, b) => (a.image_order ?? 9999) - (b.image_order ?? 9999));

    if (sortedImages.length > 0) {
      return applyImageVariant(sortedImages[0].image_url, variant);
    }

    return fallback;
  }

  return fallback;
}

// Get the main image URL for a product variant, with a fallback if no images are available
export function getVariantImage(variant: Variant, imageVariant?: string): string {
  const fallback = "/images/image-coming-soon.jpg";

  if (!variant.images) return fallback;
  if (typeof variant.images === "string" && variant.images) {
    return applyImageVariant(variant.images, imageVariant);
  }

  if (Array.isArray(variant.images) && variant.images.length > 0) {
    const sortedImages = [...variant.images]
      .filter((img) => !!img.image_url)
      .sort((a, b) => (a.image_order ?? 9999) - (b.image_order ?? 9999));

    if (sortedImages.length > 0) {
      return applyImageVariant(sortedImages[0].image_url, imageVariant);
    }

    return fallback;
  }

  return fallback;
}

export function getReviewImage(review: { images?: string[] | null }): string {
  const fallback = "/images/image-coming-soon.jpg";

  if (Array.isArray(review.images) && review.images.length > 0) {
    return review.images[0];
  }

  return fallback;
}

// Recursively find the path to a category by its ID or slug, returning an array of category names and paths
export function findCategoryPath(
  categories: Category[],
  targetId: string,
  path: { name: string; path: string }[] = [],
): { name: string; path: string }[] | null {
  for (const category of categories) {
    const currentPath = [
      ...path,
      {
        name: category.name,
        path: `/category/${category.slug ?? category.id}`,
      },
    ];

    // Match by slug (URL param) OR by id (legacy)
    if (category.slug === targetId || category.id === targetId) {
      return currentPath;
    }

    // Recursively search deeper levels (UNLIMITED)
    if (category.subcategories && category.subcategories.length > 0) {
      const found = findCategoryPath(
        category.subcategories,
        targetId,
        currentPath,
      );
      if (found) return found;
    }
  }

  return null;
}

// Fetch best-selling products from the API, with a default limit of 10
export async function getBestSellers(limit = 10): Promise<Product[]> {
  const res = await fetch(
    `${baseUrl}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.LIST_PRODUCTS}?limit=${limit}`,
    { next: { revalidate: 60 } },
  );

  if (!res.ok) return [];

  const data = await res.json();

  return data?.data ?? [];
}

// Fetch raw categories from the API, with caching for 1 hour
export const getRawCategories = cache(async (): Promise<Category[]> => {
  const res = await fetch(`${baseUrl}${API_ENDPOINTS.CATEGORIES.LIST}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  return res.json();
});

// Fetch trending products from the API, with a fallback to list-products if trending is empty
async function fetchTrending(limit: number): Promise<Product[]> {
  const res = await fetch(
    `${baseUrl}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.TRENDING_PRODUCTS}?limit=${limit}`,
    { next: { revalidate: 60 } },
  );

  if (!res.ok) return [];

  const data = await res.json();

  // trending-products wraps results in `items`
  return data?.items ?? data?.data ?? [];
}

export async function getTrendingProducts(limit = 10): Promise<Product[]> {
  const trending = await fetchTrending(limit);
  if (trending.length > 0) return trending;

  const res = await fetch(
    `${baseUrl}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.LIST_PRODUCTS}?limit=${limit}&page=2`,
    { next: { revalidate: 60 } },
  );

  if (!res.ok) return [];

  const data = await res.json();

  return data?.data ?? [];
}

// Get product details utilities
export const getPriceDetails = (product: Product, variant?: Variant | null) => {
  // Base price (if variant has price → override)
  const price = Number.parseFloat(
    String(variant?.price ?? product?.variant_price ?? product?.price ?? "0"),
  );

  // RRP price from variant OR product (skip if null)
  const RRP = variant?.rrp_price
    ? Number.parseFloat(String(variant.rrp_price))
    : product.rrp_price
      ? Number.parseFloat(String(product.rrp_price))
      : 0;

  // Discounted price ALWAYS comes from product
  const discounted = Number.parseFloat(String(product.discounted_price ?? 0));

  const effectiveDiscountPrice =
    discounted > 0
      ? discounted
      : RRP > 0 && RRP > price
        ? price
        : RRP > 0
          ? RRP
          : price;

  const hasDiscount = RRP > 0 && effectiveDiscountPrice < RRP;

  const discountPercentage =
    hasDiscount && RRP > 0 ? ((RRP - effectiveDiscountPrice) / RRP) * 100 : 0;

  const saveAmount =
    hasDiscount && RRP > 0
      ? Number((RRP - effectiveDiscountPrice).toFixed(2))
      : 0;

  const showWasPrice = hasDiscount; // show WAS price only if price was reduced

  return {
    mainPrice: effectiveDiscountPrice,
    wasPrice: RRP,
    hasDiscount,
    showWasPrice,
    saveAmount,
    discountPercentage,
  };
};

// transform product data for frontend display, including price details and image URLs
export function transformProductData(products: Product[]) {
  return products.map((product) => {
    const priceInfo = getPriceDetails(product);

    return {
      ...product,
      unique_code: product.unique_code,
      mainPrice: priceInfo.mainPrice,
      wasPrice: priceInfo.wasPrice,
      showWasPrice: priceInfo.showWasPrice,
      discountPercentage: priceInfo.discountPercentage,
      saveAmount: priceInfo.saveAmount,
      image: getImageUrl(product, "plpcard"),
      promotion_name: product.promotion_name,
      rating: product.review_stats?.average_rating ?? 0,
      reviewCount: product.review_stats?.total_reviews ?? 0,
    };
  });
}

// Sidebar links for user account navigation
export const sidebarLinks = [
  { href: "/user/personal-information", label: "Personal Information" },
  { href: "/user/orders", label: "My Orders" },
  { href: "/user/addresses", label: "Manage Address" },
  { href: "/user/wishlist", label: "Wishlist" },
  { href: "/user/change-password", label: "Change Password" },
  { href: "/user/logout", label: "Logout" },
];

// Sample product object for testing or demonstration purposes
export const product = {
  product_id: "123",
  name: "Premium Cotton T-Shirt",
  title: "Premium Cotton T-Shirt",
  image:
    "https://img.magnific.com/free-photo/white-pillow_1203-3025.jpg?t=st=1778047813~exp=1778051413~hmac=2150a9c02752a2cf913690bf042debd24effff5b618cb9651d74f89e071c3c6a&w=1480",
  quantity: 1,
  size: "M",
  color: "Black",

  variant_attributes: [
    { name: "Size", value: "M" },
    { name: "Colour", value: "Black" },
    { name: "Fabric", value: "Cotton" },
  ],
};

export const fieldLabels: Record<string, string> = {
  email: "Email",
  firstName: "First name",
  lastName: "Last name",
  phone: "Phone",
  country: "Country",
  address: "Address",
  city: "City",
  state: "State",
  postcode: "Postcode",
  billingCountry: "Billing country",
  billingFirstName: "Billing first name",
  billingLastName: "Billing last name",
  billingAddress: "Billing address",
  billingCity: "Billing city",
  billingState: "Billing state",
  billingPostcode: "Billing postcode",
  billingPhone: "Billing phone",
  paymentMethod: "Payment method",
};


// JSON-like data
export const contactData: ContactContent = {
  title: "Have a question, or want an update on your order?",
  description: [
    "Our team of happily helpful Experts is readily available to assist you, no matter how you choose to get in touch with us.",
    "We strive to respond promptly within 24-48 hours. During peak times, there may be a slight delay. Rest assured, we are committed to addressing your inquiries quickly.",
  ],
  contactBlocks: [
    {
      icon: "/images/cms/location.svg",
      label: "Address",
      value: "Truganina 3029, Victoria, Australia",
    },
    {
      icon: "/images/cms/clock.svg",
      label: "Working Hours",
      value: {
        weekdays: "9:00am - 5:00pm",
        weekends: "Closed",
      },
    },
  ],
};

// Falls back to the production domain when NEXT_PUBLIC_SITE_URL isn't set,
// so behavior is unchanged for existing deployments that haven't added it
// yet — but staging/preprod can now emit correct canonicals by setting it.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shopperbeats.com";
