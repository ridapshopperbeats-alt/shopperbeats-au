import { Product, Variant, Category } from "@/types/product";
import { API_ENDPOINTS } from "@/lib/constants/api";

const baseUrl = API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL;

import { cache } from "react";
import { applyImageVariant } from "@/lib/utils/imageUtils";
import { OrderStatusCode } from "@/types/order";
import { BadgeColor } from "@/components/common/StatusBadge";
import { CategoryItem } from "@/types/megamenu";

export function toSafeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const MAX_API_ERROR_MESSAGE_LENGTH = 200;
const LOOKS_INTERNAL_PATTERN = /\n|\r|Traceback|Exception|at \w+[.:]|\.(py|js|ts):\d+/;

function isSafeToDisplay(message: string): boolean {
  return (
    message.length > 0 &&
    message.length <= MAX_API_ERROR_MESSAGE_LENGTH &&
    !LOOKS_INTERNAL_PATTERN.test(message)
  );
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as {
    data?: { message?: string; errors?: { message: string }[] };
    message?: string;
  };

  const raw =
    apiError?.data?.errors?.[0]?.message ||
    apiError?.data?.message ||
    apiError?.message;

  return raw && isSafeToDisplay(raw) ? raw : fallback;
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
  previousValue: string
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
      return { value: previousValue, error: "Australian mobile must start with 04" };
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

type ImageLike = { image_url?: string; image_order?: number };

function pickBestImageUrl(images: ImageLike[]): string | undefined {
  return [...images]
    .filter((img) => !!img.image_url)
    .sort((a, b) => (a.image_order ?? 9999) - (b.image_order ?? 9999))[0]
    ?.image_url;
}

/**
 * Products that keep their photos on variants come back with an empty
 * product-level `images`, which used to drop straight to the placeholder here
 * while the detail page — reading the selected variant — showed the real photo.
 *
 * Checked only after the product's own images, unlike ProductGallery, which
 * starts from the variant the shopper picked. A listing card has no such
 * selection, so the product image stays the first choice wherever one exists.
 */
function pickVariantImageUrl(product: Product): string | undefined {
  for (const variant of product.variants ?? []) {
    const images = variant.images;

    if (typeof images === "string" && images) return images;
    if (Array.isArray(images)) {
      const found = pickBestImageUrl(images);
      if (found) return found;
    }
  }

  return undefined;
}

export function getImageUrl(product: Product, variant?: string): string {
  const fallback = "/images/image-coming-soon.jpg";

  if (typeof product.images === "string" && product.images) {
    return applyImageVariant(product.images, variant);
  }

  if (typeof product.thumbnail === "string" && product.thumbnail) {
    return applyImageVariant(product.thumbnail, variant);
  }

  if (Array.isArray(product.images)) {
    const productImage = pickBestImageUrl(product.images);
    if (productImage) return applyImageVariant(productImage, variant);
  }

  const variantImage = pickVariantImageUrl(product);
  if (variantImage) return applyImageVariant(variantImage, variant);

  return fallback;
}

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

type ReviewImageEntry =
  | string
  | { image_url?: string; url?: string }
  | null
  | undefined;

export function getReviewImage(review: {
  images?: ReviewImageEntry[] | null;
}): string {
  const fallback = "/images/image-coming-soon.jpg";

  if (Array.isArray(review.images) && review.images.length > 0) {
    const first = review.images[0];
    if (typeof first === "string" && first) return first;
    if (first && typeof first === "object") {
      return first.image_url || first.url || fallback;
    }
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

// Fetch raw categories from the API, with caching for 1 hour
export const getRawCategories = cache(async (): Promise<Category[]> => {
  const res = await fetch(`${baseUrl}${API_ENDPOINTS.CATEGORIES.LIST}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  return res.json();
});

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

export const ORDER_STATUS_LABELS: Record<OrderStatusCode, string> = {
  [OrderStatusCode.Confirmed]: "Confirmed",
  [OrderStatusCode.Shipped]: "Shipped",
  [OrderStatusCode.Delivered]: "Delivered",
  [OrderStatusCode.Cancelled]: "Cancelled",
  [OrderStatusCode.Pending]: "Pending",
  [OrderStatusCode.InProgress]: "In Progress",
  [OrderStatusCode.ReturnRequested]: "Return Requested",
  [OrderStatusCode.ReplacementRequested]: "Replacement Requested",
  [OrderStatusCode.Refunded]: "Refunded",
};

export const IN_TRANSIT_CODES = [
  OrderStatusCode.Confirmed,
  OrderStatusCode.Shipped,
  OrderStatusCode.Pending,
  OrderStatusCode.InProgress,
];

export const ORDER_STATUS_COLORS: Record<OrderStatusCode, BadgeColor> = {
  [OrderStatusCode.Confirmed]: BadgeColor.Blue,
  [OrderStatusCode.Shipped]: BadgeColor.Blue,
  [OrderStatusCode.Pending]: BadgeColor.Blue,
  [OrderStatusCode.InProgress]: BadgeColor.Blue,
  [OrderStatusCode.Delivered]: BadgeColor.Green,
  [OrderStatusCode.Cancelled]: BadgeColor.Red,
  [OrderStatusCode.ReturnRequested]: BadgeColor.Orange,
  [OrderStatusCode.ReplacementRequested]: BadgeColor.Orange,
  [OrderStatusCode.Refunded]: BadgeColor.Orange,
};
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shopperbeats.com";


  
  
  function sortCategories(categories: CategoryItem[]): CategoryItem[] {
    return categories
      .slice()
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      )
      .map((cat) => ({
        ...cat,
        subcategories: cat.subcategories
          ? sortCategories(cat.subcategories)
          : [],
      }));
  }
  
  export async function getCategoryData(
    parentSlug?: string
  ): Promise<CategoryItem[]> {
    const data = (await getRawCategories()) as unknown as CategoryItem[];
  
    // Sort full tree first
    const sortedData = sortCategories(data);
  
    if (!parentSlug) {
      return sortedData;
    }
  
    const findCategory = (
      categories: CategoryItem[],
      slug: string
    ): CategoryItem | null => {
      for (const cat of categories) {
        if (cat.slug === slug) return cat;
        if (cat.subcategories?.length) {
          const found = findCategory(cat.subcategories, slug);
          if (found) return found;
        }
      }
      return null;
    };
  
    const category = findCategory(sortedData, parentSlug);
  
    // Return already sorted subcategories
    return category?.subcategories || [];
  }

export interface PriceRange {
  min: number;
  max: number;
}

export const resolvePriceRange = (
  minPrice: string,
  maxPrice: string,
  selectedPrices: string[],
): PriceRange | null => {
  if (minPrice || maxPrice) {
    return {
      min: minPrice ? Number(minPrice) : 0,
      max: maxPrice ? Number(maxPrice) : Infinity,
    };
  }

  const preset = selectedPrices[0];
  if (!preset) return null;

  if (preset === "200+") return { min: 200, max: Infinity };
  if (preset === "0-50") return { min: 0, max: 50 };

  if (preset.endsWith("+")) {
    const min = Number(preset.slice(0, -1));
    return Number.isNaN(min) ? null : { min, max: Infinity };
  }

  const [min, max] = preset.split("-").map(Number);
  return Number.isNaN(min) || Number.isNaN(max) ? null : { min, max };
};

const toAmount = (raw: unknown): number =>
  parseFloat(String(raw ?? "").replace(/[^0-9.]/g, "")) || 0;

export const getProductPrice = (product: Product): number => {
  // The API sends discounted_price: 0 for products without a discount, so a
  // nullish check isn't enough — fall back to price whenever it isn't a real amount.
  const discounted = toAmount(product.discounted_price);

  return discounted > 0 ? discounted : toAmount(product.price);
};

export const filterProductsByPriceRange = (
  products: Product[],
  range: PriceRange | null,
): Product[] => {
  if (!range) return products;

  return products.filter((product) => {
    const price = getProductPrice(product);
    return price >= range.min && price <= range.max;
  });
};
const formatDeliveryDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const getHandlingDeliveryRange = (
  handlingTimeDays: number,
  handlingTimeMaxDays?: number | null,
): string => {
  const minDays = handlingTimeDays;
  const maxDays = handlingTimeMaxDays ?? handlingTimeDays;

  const today = new Date();

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + minDays);

  if (maxDays === minDays) {
    return formatDeliveryDate(minDate);
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDays);

  return `Estimated Delivery in  ${formatDeliveryDate(minDate)} - ${formatDeliveryDate(maxDate)}`;
};

export const getEstimatedDeliveryRange = (
  handlingTimeDays: number,
  handlingTimeMaxDays?: number | null,
) => getHandlingDeliveryRange(handlingTimeDays, handlingTimeMaxDays);