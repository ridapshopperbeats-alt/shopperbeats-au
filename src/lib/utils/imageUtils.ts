import { Product, Variant } from "@/types/product";

const CLOUDFLARE_IMAGE_HOSTS = ["imagedelivery.net", "assets.shopperbeats.cloud"];
const CDN_BASE_URL = "https://assets.shopperbeats.cloud/images";

export function applyImageVariant(url: string, variant?: string): string {
  if (!CLOUDFLARE_IMAGE_HOSTS.some((host) => url.includes(host))) return url;

  const effectiveVariant = variant || "public";

  try {
    const parsed = new URL(url);
    const [, imageId] = parsed.pathname.split("/").filter(Boolean);

    if (!imageId) return url;

    return `${CDN_BASE_URL}/${imageId}/${effectiveVariant}`;
  } catch {
    return url;
  }
}

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
      .filter(img => !!img.image_url)
      .sort((a, b) => (a.image_order ?? 9999) - (b.image_order ?? 9999));

    if (sortedImages.length > 0) {
      return applyImageVariant(sortedImages[0].image_url, variant);
    }

    return fallback;
  }

  return fallback;
}



export function getVariantImage(variant: Variant, variantName?: string): string {
  const fallback = "/images/image-coming-soon.jpg";

  if (!variant.images) return fallback;
  if (typeof variant.images === "string" && variant.images) {
    return applyImageVariant(variant.images, variantName);
  }

  if (Array.isArray(variant.images) && variant.images.length > 0) {
    const sortedImages = [...variant.images]
      .filter(img => !!img.image_url)
      .sort((a, b) => (a.image_order ?? 9999) - (b.image_order ?? 9999));

    if (sortedImages.length > 0) {
      return applyImageVariant(sortedImages[0].image_url, variantName);
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

