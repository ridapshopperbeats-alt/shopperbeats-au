

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumb-slice";
import { useGetProductsQuery } from "@/lib/redux/apis/products-api";
import { Product, Filter } from "@/types/product";
import Sidebar from "../productListing/Sidebar";
import MobileFilterSheet from "../productListing/MobileFilterSheet";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import ProductDisplay from "../productListing/ProductDisplay";


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

  // Adjust persistedFilters during render (React's "adjusting state when a
  // prop changes" pattern, using state instead of a ref since refs cannot be
  // read/written during render) instead of inside a useEffect, to avoid an
  // extra cascading render.
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

  const { sortBy, handleSortChange } = useProductFilters(persistedFilters);

  const handleSortChangeWithSkeleton = useCallback((value: string) => {
    handleSortChange(value);
  }, [handleSortChange]);

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
  const [hasChanged, setHasChanged] = useState(false);

  // NOTE: this condition compares searchParams.toString() to itself, so it
  // is always false and setHasChanged(true) never actually runs here today.
  // This mirrors the pre-existing (likely unintentional) behavior exactly;
  // preserved as-is per the no-behavior-change requirement, just moved out
  // of a useEffect body and into render (which is legal since the branch is
  // unreachable, so there is no risk of a render loop).
  if (searchParams.toString() !== searchParams.toString()) {
    setHasChanged(true);
  }

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



  const currentParams = new URLSearchParams(searchParams.toString());
  currentParams.delete("page");
  currentParams.delete("limit");
  const currentFilterString = currentParams.toString();
  const [prevFilterString, setPrevFilterString] = useState(currentFilterString);

  // Adjust page/limit state during render in response to URL changes,
  // instead of inside a useEffect, to avoid an extra cascading render.
  // Uses state (not a ref) to track the previous filter string since refs
  // cannot be read/written during render.
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

  // Adjust allProducts during render when a new query result comes in,
  // instead of inside a useEffect, to avoid an extra cascading render.
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Search results for "${query}"`,
            url: `/search?q=${query}`,
            numberOfItems: products.length,
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: product.title,
              url: `/product/${product.unique_code || product.slug}`,
            })),
          }),
        }}
      />

      <div className="container" style={{ marginTop: "30px" }}>
        <div className="flex flex-col mb-40 relative lg:gap-6 lg:flex-row lg:items-start">

          <div className="hidden lg:block w-full lg:w-[280px] xl:w-[320px] shrink-0">
            <div className="sticky top-24">
              <Sidebar
                filters={persistedFilters}
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
          </div>

          <MobileFilterSheet
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            filters={persistedFilters}
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

export default SearchPageClient;