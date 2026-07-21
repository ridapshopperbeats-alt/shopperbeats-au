"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Category, Filter } from "@/types/product";

const derivePriceRangeFromUrl = (searchParams: URLSearchParams) => {
  const numericRange = (searchParams.get("price_ranges")?.split(",") || [])
    .filter(Boolean)
    .find((range) => /^\d+(\.\d+)?-\d+(\.\d+)?$/.test(range));

  if (numericRange) {
    const [min, max] = numericRange.split("-");
    return { min, max };
  }

  return {
    min: searchParams.get("min_price") || "",
    max: searchParams.get("max_price") || "",
  };
};

const deriveFiltersFromUrl = (searchParams: URLSearchParams) => {
  const filtersFromUrl: Record<string, string[]> = {};
  const shippingValues: string[] = [];

  searchParams.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === "fast_dispatch" && value === "true") {
      shippingValues.push("Fast Dispatch");
    } else if (lowerKey === "free_shipping" && value === "true") {
      shippingValues.push("Free Shipping");
    } else if (
      ![
        "min_price",
        "max_price",
        "sort_by",
        "categories",
        "price_ranges",
        "page",
        "limit",
        "q",
        "category_id",
        "category_slug",
        "fast_dispatch",
        "free_shipping",
        "shipping"
      ].includes(lowerKey)
    ) {
      filtersFromUrl[lowerKey] = value.split(",");
    }
  });

  if (shippingValues.length > 0) {
    filtersFromUrl["shipping"] = shippingValues;
  }

  return filtersFromUrl;
};

export const useProductFilters = (
  filters: Filter[],
  category?: Category | null
) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [brandSearch, setBrandSearch] = useState("");
  const [minPrice, setMinPrice] = useState(
    () => derivePriceRangeFromUrl(searchParams).min,
  );
  const [maxPrice, setMaxPrice] = useState(
    () => derivePriceRangeFromUrl(searchParams).max,
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );
  const [selectedPrices, setSelectedPrices] = useState<string[]>(
    searchParams.get("price_ranges")?.split(",").filter(Boolean) || []
  );
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >(() => deriveFiltersFromUrl(searchParams));
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "");

  const isInitialMount = useRef(true);

  // Sync filter state from the URL whenever `searchParams` changes. This is
  // React's "adjust state during render" pattern (rather than a useEffect)
  // so the sync happens in the same render pass instead of scheduling an
  // extra render via setState-in-effect. `useState` (rather than a ref)
  // tracks the previous `searchParams` and the "is syncing" flag, since refs
  // may not be read or written during render. `isSyncingFromUrl` lets the
  // effect below (which pushes user-driven filter changes back to the URL)
  // tell this render's state changes came from the URL, not from the user —
  // it's reset back to false asynchronously afterwards.
  const [prevSearchParams, setPrevSearchParams] = useState(searchParams);
  const [isSyncingFromUrl, setIsSyncingFromUrl] = useState(false);

  if (prevSearchParams !== searchParams) {
    setPrevSearchParams(searchParams);
    setIsSyncingFromUrl(true);

    const { min, max } = derivePriceRangeFromUrl(searchParams);
    setMinPrice(min);
    setMaxPrice(max);
    setSelectedCategories(searchParams.get("categories")?.split(",").filter(Boolean) || []);
    setSelectedPrices(searchParams.get("price_ranges")?.split(",").filter(Boolean) || []);
    setSortBy(searchParams.get("sort_by") || "");
    setSelectedFilters(deriveFiltersFromUrl(searchParams));
  }

  useEffect(() => {
    if (!isSyncingFromUrl) return;
    const timeoutId = setTimeout(() => {
      setIsSyncingFromUrl(false);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [isSyncingFromUrl]);

  const q = searchParams.get('q');
  const categorySlug = searchParams.get('category_slug');
  const categoryId = searchParams.get('category_id');
  const currentLimit = searchParams.get('limit');

  const handleApplyFilters = useCallback(() => {
    const params = new URLSearchParams();
    
    // Only add the specific params we need
    if (q) params.set('q', q);
    if (categorySlug) params.set('category_slug', categorySlug);
    if (categoryId) params.set('category_id', categoryId);

    if (sortBy) params.set("sort_by", sortBy);

    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    const customPriceRange = minPrice && maxPrice
      ? `${minPrice}-${maxPrice}`
      : minPrice
        ? `${minPrice}+`
        : maxPrice
          ? `0-${maxPrice}`
          : null;

    const priceRanges = customPriceRange ? [customPriceRange] : selectedPrices;

    if (priceRanges.length > 0) {
      params.set("price_ranges", priceRanges.join(","));
    }

    // Set all other filters
    for (const attribute in selectedFilters) {
      const attrKey = attribute.toLowerCase();
      if (attrKey === "shipping") {
        const values = selectedFilters[attribute];
        if (values.includes("Fast Dispatch")) {
          params.set("fast_dispatch", "true");
        }
        if (values.includes("Free Shipping")) {
          params.set("free_shipping", "true");
        }
      } else if (selectedFilters[attribute].length > 0) {
        params.set(attrKey, selectedFilters[attribute].join(","));
      }
    }

    if (currentLimit) {
      params.set('limit', currentLimit);
    }

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    router,
    pathname,
    q,
    categorySlug,
    categoryId,
    currentLimit,
    sortBy,
    minPrice,
    maxPrice,
    selectedCategories,
    selectedPrices,
    selectedFilters,
  ]);

  useEffect(() => {
    if (isInitialMount.current || isSyncingFromUrl) {
      isInitialMount.current = false;
      return;
    }
    handleApplyFilters();
  }, [selectedCategories, selectedPrices, selectedFilters, sortBy, minPrice, maxPrice, isSyncingFromUrl, handleApplyFilters]);


 const handlePriceChange = (price: string) => {
  let formattedPrice = price;

  if (price.toLowerCase().includes("under")) {
    formattedPrice = "0-50";
  } else if (price.toLowerCase().includes("and above")) {
    formattedPrice = "200+";
  } else {
    formattedPrice = price
      .replace(/\$/g, "")
      .replace(/\s*to\s*/gi, "-")
      .replace(/\s+/g, "");
  }

  setSelectedPrices((prev) =>
    prev.includes(formattedPrice) ? [] : [formattedPrice]
  );
};

  const handleFilterChange = (attribute: string, value: string) => {
    const attrKey = attribute.toLowerCase();
    setSelectedFilters((prev) => {
      const currentValues = prev[attrKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return { ...prev, [attrKey]: newValues };
    });
  };

  const handleSortChange = (value:string) => {
    setSortBy(value);
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

const clearFilters = useCallback(() => {
  setBrandSearch("");
  setMinPrice("");
  setMaxPrice("");
  setSelectedCategories([]);
  setSelectedPrices([]);
  setSelectedFilters({});
  setSortBy("");

  const params = new URLSearchParams();

  if (q) params.set("q", q);

  if (categorySlug) params.set("category_slug", categorySlug);

  if (categoryId) params.set("category_id", categoryId);

  params.set("page", "1");

  if (currentLimit) params.set("limit", currentLimit);

  router.push(
    `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
    { scroll: false }
  );
}, [q, categorySlug, categoryId, currentLimit, router, pathname]);

  const brandFilter = filters.find((f) => f.attribute.toLowerCase() === "brand");
  const priceFilter = filters.find((f) => f.attribute.toLowerCase() === "price");
  const categoryFilter = filters.find((f) => f.attribute.toLowerCase() === "category");
  const specialOffersFilter = filters.find((f) => f.attribute.toLowerCase() === "special offers");
  const colorFilter = filters.find((f) => f.attribute.toLowerCase() === "colour" || f.attribute.toLowerCase() === "color");
  const sizeFilter = filters.find((f) => f.attribute.toLowerCase() === "size");

  const flattenCategories = (categories: Category[]): Category[] => {
    return categories.flatMap(cat => [cat, ...(cat.subcategories ? flattenCategories(cat.subcategories) : [])]);
  };

  const allCategories = category?.subcategories
    ? flattenCategories(category.subcategories)
    : [];


  return {
    brandSearch,
    setBrandSearch,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedCategories,
    setSelectedCategories: handleCategoryChange,
    selectedPrices,
    handlePriceChange,
    selectedFilters,
    handleFilterChange,
    sortBy,
    handleSortChange,
    handleApplyFilters,
    clearFilters,
    brandFilter,
    priceFilter,
    categoryFilter,
    specialOffersFilter,
    colorFilter,
    sizeFilter,
    allCategories,
  };
};

