import { Product } from "@/types/product";

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

export const getProductPrice = (product: Product): number => {
  const raw = product.discounted_price ?? product.price ?? 0;
  return parseFloat(String(raw).replace(/[^0-9.]/g, "")) || 0;
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
