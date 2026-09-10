"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { pushLoader, popLoader } from "@/lib/redux/slices/loader-slice";
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
        "shipping",
      ].includes(lowerKey)
    ) {
      filtersFromUrl[lowerKey.replace(/_/g, " ")] = value.split(",");
    }
  });

  if (shippingValues.length > 0) {
    filtersFromUrl["shipping"] = shippingValues;
  }

  return filtersFromUrl;
};

export const useProductFilters = (
  filters: Filter[],
  category?: Category | null,
  options?: { wrapNavigation?: (fn: () => void) => void },
) => {
  const optionsWrapNavigation = options?.wrapNavigation;
  const wrapNavigation = useCallback(
    (fn: () => void) => (optionsWrapNavigation ?? ((f: () => void) => f()))(fn),
    [optionsWrapNavigation],
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [brandSearch, setBrandSearch] = useState("");
  const [minPrice, setMinPrice] = useState(
    () => derivePriceRangeFromUrl(searchParams).min,
  );
  const [maxPrice, setMaxPrice] = useState(
    () => derivePriceRangeFromUrl(searchParams).max,
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || [],
  );
  const [selectedPrices, setSelectedPrices] = useState<string[]>(
    searchParams.get("price_ranges")?.split(",").filter(Boolean) || [],
  );
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >(() => deriveFiltersFromUrl(searchParams));
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "");

  const isInitialMount = useRef(true);

  const userInitiatedRef = useRef(false);
  const [isPendingApply, setIsPendingApply] = useState(false);

  const [isNavigationPending, setIsNavigationPending] = useState(false);

  useEffect(() => {
    if (!isNavigationPending) return;
    dispatch(pushLoader());

    // A navigation that never commits must not pin the overlay open forever.
    const safety = setTimeout(() => setIsNavigationPending(false), 15000);

    return () => {
      clearTimeout(safety);
      dispatch(popLoader());
    };
  }, [isNavigationPending, dispatch]);

  const [prevSearchParams, setPrevSearchParams] = useState(searchParams);
  const [isSyncingFromUrl, setIsSyncingFromUrl] = useState(false);

  if (prevSearchParams !== searchParams) {
    setPrevSearchParams(searchParams);
    setIsSyncingFromUrl(true);
    setIsNavigationPending(false);

    const { min, max } = derivePriceRangeFromUrl(searchParams);
    setMinPrice(min);
    setMaxPrice(max);
    setSelectedCategories(
      searchParams.get("categories")?.split(",").filter(Boolean) || [],
    );
    setSelectedPrices(
      searchParams.get("price_ranges")?.split(",").filter(Boolean) || [],
    );
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

  const q = searchParams.get("q");
  const categorySlug = searchParams.get("category_slug");
  const categoryId = searchParams.get("category_id");
  const currentLimit = searchParams.get("limit");

  const handleApplyFilters = useCallback(() => {
    const params = new URLSearchParams();

    // Only add the specific params we need
    if (q) params.set("q", q);
    if (categorySlug) params.set("category_slug", categorySlug);
    if (categoryId) params.set("category_id", categoryId);

    if (sortBy) params.set("sort_by", sortBy);

    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    if (minPrice || maxPrice) {
      if (minPrice) params.set("min_price", minPrice);
      if (maxPrice) params.set("max_price", maxPrice);
    } else if (selectedPrices.length > 0) {
      params.set("price_ranges", selectedPrices.join(","));
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
        params.set(attrKey.replace(/\s+/g, "_"), selectedFilters[attribute].join(","));
      }
    }

    if (currentLimit) {
      params.set("limit", currentLimit);
    }

    params.set("page", "1");

    const nextQueryString = params.toString();
    if (nextQueryString === searchParams.toString()) {
      // Nothing to navigate to — release the loader raised on click.
      setIsNavigationPending(false);
      return;
    }

    wrapNavigation(() => {
      router.push(`${pathname}?${nextQueryString}`, { scroll: false });
    });
  }, [
    wrapNavigation,
    router,
    pathname,
    searchParams,
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
    if (
      isInitialMount.current ||
      isSyncingFromUrl ||
      !userInitiatedRef.current
    ) {
      isInitialMount.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      userInitiatedRef.current = false;
      handleApplyFilters();
      setIsPendingApply(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    selectedCategories,
    selectedPrices,
    selectedFilters,
    sortBy,
    minPrice,
    maxPrice,
    isSyncingFromUrl,
    handleApplyFilters,
  ]);

  const handlePriceChange = (price: string) => {
    userInitiatedRef.current = true;
    setIsPendingApply(true);
    setIsNavigationPending(true);
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
      prev.includes(formattedPrice) ? [] : [formattedPrice],
    );
  };

  const handleFilterChange = (attribute: string, value: string) => {
    userInitiatedRef.current = true;
    setIsPendingApply(true);
    setIsNavigationPending(true);
    const attrKey = attribute.toLowerCase();
    setSelectedFilters((prev) => {
      const currentValues = prev[attrKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return { ...prev, [attrKey]: newValues };
    });
  };

  const handleSortChange = (value: string) => {
    userInitiatedRef.current = true;
    setIsPendingApply(true);
    setIsNavigationPending(true);
    setSortBy(value);
  };

  const handleCategoryChange = (categoryName: string) => {
    userInitiatedRef.current = true;
    setIsPendingApply(true);
    setIsNavigationPending(true);
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
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

    wrapNavigation(() => {
      router.push(
        `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
        { scroll: false },
      );
    });
  }, [wrapNavigation, q, categorySlug, categoryId, currentLimit, router, pathname]);

  const brandFilter = filters.find(
    (f) => f.attribute.toLowerCase() === "brand",
  );
  const priceFilter = filters.find(
    (f) => f.attribute.toLowerCase() === "price",
  );
  // Backend sends the category's actual bounds as PriceRange: ["35", "787"]
  const priceRangeFilter = filters.find(
    (f) => f.attribute.toLowerCase() === "pricerange",
  );
  const categoryFilter = filters.find(
    (f) => f.attribute.toLowerCase() === "category",
  );
  const specialOffersFilter = filters.find(
    (f) => f.attribute.toLowerCase() === "special offers",
  );
  // Prefer the curated "Color Family" list (15 values) over the raw "Color"
  // attribute, which the backend returns with well over a thousand values.
  const colorFilter =
    filters.find((f) => f.attribute.toLowerCase() === "color family") ??
    filters.find(
      (f) =>
        f.attribute.toLowerCase() === "colour" ||
        f.attribute.toLowerCase() === "color",
    );
  const sizeFilter = filters.find((f) => f.attribute.toLowerCase() === "size");

  const flattenCategories = (categories: Category[]): Category[] => {
    return categories.flatMap((cat) => [
      cat,
      ...(cat.subcategories ? flattenCategories(cat.subcategories) : []),
    ]);
  };

  const allCategories = category?.subcategories
    ? flattenCategories(category.subcategories)
    : [];

  const setMinPriceUserInitiated = useCallback((value: string) => {
    userInitiatedRef.current = true;
    setIsPendingApply(true);
    setMinPrice(value);
  }, []);

  const setMaxPriceUserInitiated = useCallback((value: string) => {
    userInitiatedRef.current = true;
    setIsPendingApply(true);
    setMaxPrice(value);
  }, []);

  return {
    brandSearch,
    setBrandSearch,
    minPrice,
    setMinPrice: setMinPriceUserInitiated,
    maxPrice,
    setMaxPrice: setMaxPriceUserInitiated,
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
    isPendingApply,
    brandFilter,
    priceFilter,
    priceRangeFilter,
    categoryFilter,
    specialOffersFilter,
    colorFilter,
    sizeFilter,
    allCategories,
  };
};
