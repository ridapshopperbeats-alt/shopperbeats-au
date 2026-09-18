"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  setBreadcrumbs,
} from "@/lib/redux/slices/breadcrumb-slice";
import { pushLoader, popLoader } from "@/lib/redux/slices/loader-slice";
import { useGetWishlistQuery } from "@/lib/redux/apis/cart-api";
import { useGetProductsQuery } from "@/lib/redux/apis/products-api";
import { filterProductsByPriceRange, findCategoryPath, getProductPrice, resolvePriceRange } from "@/lib/utils/main-utils";
import { Filter, Product } from "@/types/product";
import dynamic from "next/dynamic";
import DynamicImportLoader from "@/components/ui/loaders/DynamicImportLoader";
import { useProductFilters } from "@/lib/hooks/use-product-filters";

const Sidebar = dynamic(() => import("../product-listing/Sidebar"), {
  loading: DynamicImportLoader,
});

const MobileFilterSheet = dynamic(
  () => import("../product-listing/MobileFilterSheet"),
  { loading: DynamicImportLoader }
);

const ProductDisplay = dynamic(
  () => import("../product-listing/ProductDisplay"),
  { loading: DynamicImportLoader }
);
import NoProductsFound from "../NoProductFound";
import { buildFilterTags, formatPriceRangeLabel } from "@/lib/utils/filter-tags";
import "../../styles/Product.css";
import type { ProductListingClientProps } from "@/types/product";

const ProductListingClient = ({
  slug,
  category,
  products,
  filters,
  totalItems,
  megaMenuData,
}: ProductListingClientProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const wishlistItems = useMemo(
    () =>
      (wishlistData?.items ?? []).map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
      })),
    [wishlistData],
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => { setIsSidebarOpen((prev) => !prev); }, []);

  const [persistedFilters, setPersistedFilters] = useState<Filter[]>(filters);
  const [prevSlug, setPrevSlug] = useState(slug);

  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setPersistedFilters(filters);
  } else if (filters && filters.length > 0 && filters.length > persistedFilters.length) {
    setPersistedFilters(filters);
  }

  const [isPending, startTransition] = useTransition();

  const {
    sortBy,
    handleSortChange,
    selectedFilters,
    handleFilterChange,
    selectedCategories,
    setSelectedCategories: toggleSelectedCategory,
    selectedPrices,
    handlePriceChange,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    clearFilters,
    isPendingApply,
  } = useProductFilters(persistedFilters, category, {
    wrapNavigation: startTransition,
  });

  const handleClearAllFilters = () => {
    setSelectedCategorySlugs([]);
    setSelectedPriceRange(null);
    clearFilters();
  };

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [uiLimit, setUiLimit] = useState(
    Number(searchParams.get("limit") || 20)
  );

  const [renderingLimit, setRenderingLimit] = useState(uiLimit);

  const initialParamsRef = useRef(searchParams.toString());
  const [hasChangedFromInitial, setHasChangedFromInitial] = useState(false);

  useEffect(() => {
    if (searchParams.toString() !== initialParamsRef.current) {
      setHasChangedFromInitial(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!megaMenuData?.length || !slug) return;

    const hierarchy = findCategoryPath(megaMenuData, slug);

    if (hierarchy) {
      dispatch(setBreadcrumbs(hierarchy));
    } else {
      dispatch(
        setBreadcrumbs([
          {
            name: category?.name || slug,
            path: `/product-listing/${slug}`,
          },
        ])
      );
    }
  }, [slug, megaMenuData, category?.name, dispatch]);

  const isHighlight = [
    "best-sellers",
    "top-rated",
    "trending-deals",
    "clearance",
    "new-releases",
    "hot-deals",
    "popular",
    "today-s-deal",
    "whats-on-sale",
  ].includes(slug);

  const currentParams = new URLSearchParams(searchParams.toString());
  currentParams.delete("page");
  currentParams.delete("limit");

  const queryObject: Record<string, string | number> = {};
  currentParams.forEach((value, key) => {
    queryObject[key] = value;
  });

  queryObject.page = currentPage;
  queryObject.limit = uiLimit;

  const { data: rtkData, isLoading: rtkIsLoading, isFetching: rtkIsFetching } = useGetProductsQuery(
    queryObject,
    {
      skip: isHighlight || !hasChangedFromInitial,
    }
  );

  const isFilterFetching = !isHighlight && (rtkIsFetching || isPendingApply || isPending);
  const wasFilterFetchingRef = useRef(false);

  useEffect(() => {
    if (isFilterFetching && !wasFilterFetchingRef.current) {
      wasFilterFetchingRef.current = true;
      dispatch(pushLoader());
    } else if (!isFilterFetching && wasFilterFetchingRef.current) {
      wasFilterFetchingRef.current = false;
      dispatch(popLoader());
    }
  }, [isFilterFetching, dispatch]);

  useEffect(() => {
    return () => {
      if (wasFilterFetchingRef.current) {
        wasFilterFetchingRef.current = false;
        dispatch(popLoader());
      }
    };
  }, [dispatch]);

  const apiProducts = rtkData?.data || products;

  const extractedCategories = useMemo(() => {
    if (!products || products.length === 0) return [];

    const categoryMap = new Map<string, { name: string; slug: string; count: number }>();

    products.forEach((product) => {
      const categoryName = product.category_name || product.category;
      const categorySlug = product.category_slug || categoryName?.toLowerCase().replace(/\s+/g, "-");

      if (categoryName && categorySlug) {
        const existing = categoryMap.get(categorySlug);
        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(categorySlug, { name: categoryName, slug: categorySlug, count: 1 });
        }
      }
    });

    return Array.from(categoryMap.values());
  }, [products]);

const extractedBrands = useMemo(() => {
  if (!products || products.length === 0) return [];

  const brandMap = new Map<string, { name: string; slug: string; count: number }>();

  products.forEach((product) => {
    const p = product as Product & {
      brand?: string;
      manufacturer?: string;
      brand_title?: string;
    };
    const brandName = p?.brand_name || p?.brand || p?.manufacturer || p?.brand_title;

    if (!brandName) return;

    const slug = brandName.toLowerCase().replace(/\s+/g, "-");

    const existing = brandMap.get(slug);

    if (existing) {
      existing.count++;
    } else {
      brandMap.set(slug, {
        name: brandName,
        slug,
        count: 1,
      });
    }
  });

  return Array.from(brandMap.values());
}, [products]);

  // Highlight pages (What's On Sale / Clearance) filter client-side, so the
  // category picks are held as a list — selecting several narrows to the union
  // of those categories, the same way the sidebar's other filters behave.
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>([]);

  const productMatchesCategorySlug = (product: Product, slug: string) => {
    const productCategorySlug = product.category_slug?.toLowerCase();
    const productCategoryName =
      product.category_name?.toLowerCase() || product.category?.toLowerCase();

    return (
      productCategorySlug === slug.toLowerCase() ||
      productCategoryName === slug.toLowerCase().replace(/-/g, " ")
    );
  };
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);

  const filterTags = useMemo(() => {
    const tags = buildFilterTags({
      selectedCategories,
      toggleSelectedCategory,
      selectedPrices,
      handlePriceChange,
      minPrice,
      maxPrice,
      setMinPrice,
      setMaxPrice,
      selectedFilters,
      handleFilterChange,
    });

    selectedCategorySlugs.forEach((slug) => {
      const categoryName =
        extractedCategories.find((cat) => cat.slug === slug)?.name || slug;

      tags.push({
        key: `highlight-category-${slug}`,
        label: categoryName,
        onRemove: () =>
          setSelectedCategorySlugs((prev) => prev.filter((s) => s !== slug)),
      });
    });

    if (selectedPriceRange) {
      tags.push({
        key: `highlight-price-${selectedPriceRange}`,
        label: formatPriceRangeLabel(selectedPriceRange),
        onRemove: () => setSelectedPriceRange(null),
      });
    }

    return tags;
  }, [
    selectedCategories,
    selectedCategorySlugs,
    extractedCategories,
    selectedPrices,
    selectedPriceRange,
    minPrice,
    maxPrice,
    selectedFilters,
    toggleSelectedCategory,
    handlePriceChange,
    handleFilterChange,
    setMinPrice,
    setMaxPrice,
  ]);

  const activePriceRange = useMemo(
    () => resolvePriceRange(minPrice, maxPrice, selectedPrices),
    [minPrice, maxPrice, selectedPrices],
  );

  const filteredProducts = useMemo(() => {
    let result = apiProducts;

    if (selectedCategorySlugs.length > 0) {
      result = result.filter((product) =>
        selectedCategorySlugs.some((slug) =>
          productMatchesCategorySlug(product, slug),
        ),
      );
    }

    if (selectedPriceRange) {
      result = result.filter((product) => {
        const price = parseFloat(product.price?.replace(/[^0-9.]/g, "") || "0");
        const discountedPrice = product.discounted_price || price;

        if (selectedPriceRange === "0-50") {
          return discountedPrice <= 50;
        } else if (selectedPriceRange === "200+") {
          return discountedPrice >= 200;
        } else {
          const [min, max] = selectedPriceRange.split("-").map(Number);
          return discountedPrice >= min && discountedPrice <= max;
        }
      });
    }

    return isHighlight ? filterProductsByPriceRange(result, activePriceRange) : result;
  }, [apiProducts, selectedCategorySlugs, selectedPriceRange, activePriceRange, isHighlight]);

  const effectiveTotal = isHighlight
    ? filteredProducts.length
    : (rtkData?.total ?? totalItems);

  const priceFilteredApiProducts = useMemo(
    () => (isHighlight ? filterProductsByPriceRange(apiProducts, activePriceRange) : apiProducts),
    [apiProducts, activePriceRange, isHighlight],
  );

  const productsForPriceCount = useMemo(() => {
    let result = apiProducts;

    if (selectedCategorySlugs.length > 0) {
      result = result.filter((product) =>
        selectedCategorySlugs.some((slug) =>
          productMatchesCategorySlug(product, slug),
        ),
      );
    }

    return result;
  }, [apiProducts, selectedCategorySlugs]);

  const priceCounts = useMemo(() => {
    const counts = {
      under50: 0,
      between50and100: 0,
      between100and200: 0,
      above200: 0,
    };

    productsForPriceCount.forEach((product) => {
      const price = getProductPrice(product);


      if (price <= 50) {
        counts.under50++;
      } else if (price <= 100) {
        counts.between50and100++;
      } else if (price <= 200) {
        counts.between100and200++;
      } else {
        counts.above200++;
      }
    });

    return counts;
  }, [productsForPriceCount]);

  const displayProducts = isHighlight ? filteredProducts.slice(0, renderingLimit) : priceFilteredApiProducts.slice(0, renderingLimit);

  const handlePageChange = (page: number) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    if (isHighlight) {
      setCurrentPage(page);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    router.push(
      `${pathname}?${params.toString()}`,
      { scroll: false }
    );
  };

  const handleItemsPerPageChange = (newUiLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newUiLimit.toString());
    const newPage = Math.max(1, Math.ceil(((currentPage - 1) * uiLimit + 1) / newUiLimit));
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentFilterString = currentParams.toString();
  const [prevFilterString, setPrevFilterString] = useState(currentFilterString);

  if (currentFilterString !== prevFilterString) {
    setPrevFilterString(currentFilterString);
    const limit = Number(searchParams.get("limit")) || 20;
    setCurrentPage(1);
    setUiLimit(limit);
    setRenderingLimit(limit);
  } else if (!isHighlight) {
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    if (page !== currentPage || limit !== uiLimit) {
      if (page === currentPage && limit > uiLimit) {
        setUiLimit(limit);
      } else {
        setCurrentPage(page);
        setUiLimit(limit);
        setRenderingLimit(limit);
      }
    }
  }

  const handleLoadMore = () => {
    if (renderingLimit < uiLimit && renderingLimit < apiProducts.length) {
      setRenderingLimit(prev => Math.min(prev + uiLimit, uiLimit, apiProducts.length));
    }
  };

  // null clears every pick ("All Categories"); a slug toggles just that one.
  const handleCategorySelect = (categorySlug: string | null) => {
    if (categorySlug === null) {
      setSelectedCategorySlugs([]);
      return;
    }

    setSelectedCategorySlugs((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((slug) => slug !== categorySlug)
        : [...prev, categorySlug],
    );
  };

  const handlePriceSelect = (priceRange: string | null) => {
    setSelectedPriceRange(priceRange);
  };

  return (
    <>
        <div className="flex  flex-col mb-10 relative gap-6 lg:flex-row lg:items-start">
          <div
            className="hidden lg:block shrink-0 lg:w-[300px] xl:w-[320px] filter-sidebar-sticky no-scrollbar"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            {persistedFilters.length > 0 && (
              <Sidebar
                filters={persistedFilters}
                category={category}
                onClose={() => setIsSidebarOpen(false)}
                extractedCategories={
                  isHighlight ? extractedCategories : undefined
                }
                selectedCategorySlugs={selectedCategorySlugs}
                onCategorySelect={handleCategorySelect}
                selectedPriceRange={
                  isHighlight ? selectedPriceRange : undefined
                }
                onPriceSelect={
                  isHighlight ? handlePriceSelect : undefined
                }
                isHighlightPage={isHighlight}
                priceCounts={
                  isHighlight ? priceCounts : undefined
                }
                onClearAllFilters={handleClearAllFilters}
                extractedBrands={extractedBrands}
                slug={slug}
                wrapNavigation={startTransition}
              />
            )}
          </div>

          {persistedFilters.length > 0 && (
            <MobileFilterSheet
              open={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onClearAll={handleClearAllFilters}
              filters={persistedFilters}
              category={category}
              extractedCategories={isHighlight ? extractedCategories : undefined}
              selectedCategorySlugs={selectedCategorySlugs}
              onCategorySelect={handleCategorySelect}
              selectedPriceRange={isHighlight ? selectedPriceRange : undefined}
              onPriceSelect={isHighlight ? handlePriceSelect : undefined}
              wrapNavigation={startTransition}
              isHighlightPage={isHighlight}
              priceCounts={isHighlight ? priceCounts : undefined}
              extractedBrands={extractedBrands}
              slug={slug}
            />
          )}

          {!rtkIsLoading &&
          displayProducts.length === 0 &&
          (selectedCategorySlugs.length > 0 || selectedPriceRange) ? (
            <NoProductsFound
              title="No Products"
              titleSpan="Found"
              subTitle="Try selecting a different category or price range, or explore all products."
            />
          ) : (
            <ProductDisplay
              products={displayProducts}
              onToggleSidebar={toggleSidebar}
              totalItems={effectiveTotal}
              itemsPerPage={uiLimit}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              categoryName={category?.name}
              isLoading={!isHighlight && (rtkIsLoading || rtkIsFetching)}
              onLoadMore={handleLoadMore}
              infiniteScroll={false}
              hasMore={renderingLimit < uiLimit && renderingLimit < apiProducts.length}
              isFetchingMore={!isHighlight && rtkIsFetching}
              hideSortAndPagination={slug === "personalized" || slug === "recently-viewed"}
              tags={filterTags}
              onClearFilters={handleClearAllFilters}
              wishlistItems={wishlistItems}
            />
          )}
        </div>
    </>
  );
};

export default React.memo(ProductListingClient);