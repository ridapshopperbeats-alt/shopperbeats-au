import { Product, Variant } from "@/types/product";

export function getImageUrl(product: Product): string {
  const fallback = "/images/image-coming-soon.jpg";

  if (typeof product.images === "string" && product.images) {
    return product.images;
  }

  if (typeof product.thumbnail === "string" && product.thumbnail) {
    return product.thumbnail;
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    const sortedImages = [...product.images]
      .filter(img => !!img.image_url)
      .sort((a, b) => (a.image_order ?? 9999) - (b.image_order ?? 9999));

    if (sortedImages.length > 0) {
      return sortedImages[0].image_url;
    }

    return fallback;
  }

  return fallback;
}



export function getVariantImage(variant: Variant): string {
  const fallback = "/images/image-coming-soon.jpg";

  if (!variant.images) return fallback;
  if (typeof variant.images === "string" && variant.images) {
    return variant.images;
  }

  if (Array.isArray(variant.images) && variant.images.length > 0) {
    const sortedImages = [...variant.images]
      .filter(img => !!img.image_url)
      .sort((a, b) => (a.image_order ?? 9999) - (b.image_order ?? 9999));

    if (sortedImages.length > 0) {
      return sortedImages[0].image_url;
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

