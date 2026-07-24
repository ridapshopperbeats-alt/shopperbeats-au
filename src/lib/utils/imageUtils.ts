import { Product, Variant } from "@/types/product";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function applyImageVariant(url: string, variant?: string): string {
  if (!variant || !url.includes("imagedelivery.net")) return url;

  const lastSegment = url.split("/").pop() ?? "";
  const result = UUID_PATTERN.test(lastSegment)
    ? `${url}/${variant}`
    : url.replace(/\/[^/]+$/, `/${variant}`);

  return result;
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

