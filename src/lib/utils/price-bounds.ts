import { Filter } from "@/types/product";

const PRICE_PARAM_KEYS = ["price_ranges", "min_price", "max_price"];

const selectPriceRange = (filters: Filter[]) =>
  filters.find((filter) => filter.attribute.toLowerCase() === "pricerange");

export const withUnfilteredPriceBounds = async (
  filters: Filter[],
  baseUrl: string,
  queryParams: URLSearchParams,
  options?: {
    fetcher?: (url: string) => Promise<Response>;
    selectFilters?: (payload: unknown) => Filter[];
  },
): Promise<Filter[]> => {
  const hasPriceParam = PRICE_PARAM_KEYS.some((key) => queryParams.has(key));

  if (filters.length === 0 || !hasPriceParam) return filters;

  const boundsParams = new URLSearchParams(queryParams);
  PRICE_PARAM_KEYS.forEach((key) => boundsParams.delete(key));
  boundsParams.set("page", "1");
  boundsParams.set("limit", "1");

  try {
    const fetcher =
      options?.fetcher ?? ((url: string) => fetch(url, { cache: "no-store" }));
    const res = await fetcher(`${baseUrl}?${boundsParams.toString()}`);

    if (!res.ok) return filters;

    const payload: unknown = await res.json();
    const boundsFilters =
      options?.selectFilters?.(payload) ??
      (payload as { filters?: Filter[] })?.filters ??
      [];

    const unfilteredPriceRange = selectPriceRange(boundsFilters);

    if (!unfilteredPriceRange) return filters;

    return filters.map((filter) =>
      filter.attribute.toLowerCase() === "pricerange"
        ? unfilteredPriceRange
        : filter,
    );
  } catch (error) {
    console.warn("Failed to fetch unfiltered price bounds:", error);
    return filters;
  }
};
