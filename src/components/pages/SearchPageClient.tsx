

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumb-slice";
import { pushLoader, popLoader } from "@/lib/redux/slices/loader-slice";
import { useGetProductsQuery } from "@/lib/redux/apis/products-api";
import { Product, Filter } from "@/types/product";
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
import { buildFilterTags } from "@/lib/utils/filter-tags";


interface SearchPageClientProps {
  query: string;
  products: Product[];
  filters: Filter[];
  totalItems: number;
}

const SearchPageClient = ({
  query,
  products,
  filters,
  totalItems,
}: SearchPageClientProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [persistedFilters, setPersistedFilters] = useState<Filter[]>(filters);
  const [prevQuery, setPrevQuery] = useState(query);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setPersistedFilters(filters);
  } else if (filters && filters.length > 0 && filters.length > persistedFilters.length) {
    setPersistedFilters(filters);
  }

  useEffect(() => {
    dispatch(
      setBreadcrumbs([{ name: `Search: "${query}"`, path: `/search?q=${encodeURIComponent(query)}` }])
    );
  }, [query, dispatch]);

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
  } = useProductFilters(persistedFilters, undefined, {
    wrapNavigation: startTransition,
  });

  const handleSortChangeWithSkeleton = useCallback((value: string) => {
    handleSortChange(value);
  }, [handleSortChange]);

  const filterTags = useMemo(
    () =>
      buildFilterTags({
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
      }),
    [
      selectedCategories,
      selectedPrices,
      minPrice,
      maxPrice,
      selectedFilters,
      toggleSelectedCategory,
      handlePriceChange,
      handleFilterChange,
      setMinPrice,
      setMaxPrice,
    ],
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [uiLimit, setUiLimit] = useState(
    Number(searchParams.get("limit") || 20)
  );

  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const initialParams = useRef(searchParams.toString());
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (searchParams.toString() !== initialParams.current) {
      setHasChanged(true);
    }
  }, [searchParams]);

  const searchParamsObj = Object.fromEntries(searchParams.entries());
  delete searchParamsObj.q;

  const { data, isLoading, isFetching } = useGetProductsQuery({
    ...searchParamsObj,
    name: query,
    page: currentPage,
    limit: uiLimit,
  }, {
    skip: !query || !hasChanged,
    refetchOnMountOrArgChange: true,
  });

  const effectiveTotal = data?.total ?? totalItems;

  const isFilterFetching = isPending || (isFetching && allProducts.length === 0);
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

  const currentParams = new URLSearchParams(searchParams.toString());
  currentParams.delete("page");
  currentParams.delete("limit");
  const currentFilterString = currentParams.toString();
  const [prevFilterString, setPrevFilterString] = useState(currentFilterString);

  if (currentFilterString !== prevFilterString) {
    setPrevFilterString(currentFilterString);
    setCurrentPage(1);
    setUiLimit(Number(searchParams.get("limit")) || 20);
  } else {
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    if (page !== currentPage || limit !== uiLimit) {
      if (page === currentPage && limit > uiLimit) {
        setUiLimit(limit);
      } else {
        setCurrentPage(page);
        setUiLimit(limit);
      }
    }
  }

  const [prevData, setPrevData] = useState(data);


  if (data !== prevData) {
    setPrevData(data);
    if (data) {
      setAllProducts(data.data || []);
    }
  }


  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleItemsPerPageChange = (newUiLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newUiLimit.toString());
    const newPage = Math.max(1, Math.ceil(((currentPage - 1) * uiLimit + 1) / newUiLimit));
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLoadMore = () => {
    // Not used with traditional pagination
  };


  return (
    <>
      <div className="container" style={{ marginTop: "30px" }}>
        <div className="flex flex-col  relative lg:gap-6 lg:flex-row lg:items-start">

          <div className="hidden lg:block w-full lg:w-[280px] xl:w-[320px] shrink-0">
            <div className="sticky top-24">
              <Sidebar
                filters={persistedFilters}
                onClose={() => setIsSidebarOpen(false)}
                wrapNavigation={startTransition}
              />
            </div>
          </div>

          <MobileFilterSheet
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onClearAll={clearFilters}
            filters={persistedFilters}
            wrapNavigation={startTransition}
          />

          <div className="flex  w-full">
            <ProductDisplay
              products={allProducts}
              onToggleSidebar={toggleSidebar}
              totalItems={effectiveTotal}
              itemsPerPage={uiLimit}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              sortBy={sortBy}
              onSortChange={handleSortChangeWithSkeleton}
              tags={filterTags}
              onClearFilters={clearFilters}
              isLoading={
                isLoading || (isFetching && allProducts.length === 0)
              }
              onLoadMore={handleLoadMore}
              infiniteScroll={false}
              hasMore={false}
              isFetchingMore={isFetching && allProducts.length > 0}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(SearchPageClient);