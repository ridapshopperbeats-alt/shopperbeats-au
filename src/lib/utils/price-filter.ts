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
