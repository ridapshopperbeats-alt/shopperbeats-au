"use client";

import React, { useState, useEffect, useCallback, useMemo, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumb-slice";
import { useGetWishlistQuery } from "@/lib/redux/apis/cart-api";
import { Filter } from "@/types/product";
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
import "../../styles/Product.css";
import Breadcrumb from "../common/Breadcrumb";
import type { BrandPageClientProps } from "@/types/product";



const BrandPageClient = ({
  brandId,
  brand,
  products,
  filters,
  totalItems,
}: BrandPageClientProps) => {
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
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const [persistedFilters, setPersistedFilters] = useState<Filter[]>(filters);
  const [prevBrandId, setPrevBrandId] = useState(brandId);

  if (brandId !== prevBrandId) {
    setPrevBrandId(brandId);
    setPersistedFilters(filters);
  } else if (filters && filters.length > persistedFilters.length) {
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
  } = useProductFilters(persistedFilters, brand, {
    wrapNavigation: startTransition,
  });

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

  useEffect(() => {
    if (brand) {
      dispatch(
        setBreadcrumbs([{ name: brand.name, path: `/brand/${brandId}` }]),
      );
    }
  }, [brand, brandId, dispatch]);

  const currentPage = Number(searchParams.get("page")) || 1;
  const uiLimit = Number(searchParams.get("limit")) || 20;

  const handlePageChange = useCallback(
    (page: number) => {
      window.scrollTo({ top: 0, behavior: "smooth" });

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams, startTransition],
  );

  const handleItemsPerPageChange = useCallback(
    (newUiLimit: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", newUiLimit.toString());

      const newPage = Math.max(
        1,
        Math.ceil(((currentPage - 1) * uiLimit + 1) / newUiLimit),
      );
      params.set("page", newPage.toString());

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams, currentPage, uiLimit, startTransition],
  );

  const handleLoadMore = useCallback(() => {}, []);

  return (
    <>
      <div className="banner-bg ">
        <div className="content-inner">
          <h2 className="brandName">{brand?.name || ""}</h2>
        </div>
      </div>
      <div className="container">
        <Breadcrumb />
        <div className="flex flex-col relative lg:gap-6 lg:flex-row lg:items-start">
          <div className="hidden lg:block filter-sidebar-sticky shrink-0 lg:w-[300px] xl:w-[320px] no-scrollbar">
            <Sidebar
              filters={persistedFilters}
              category={brand}
              onClose={() => setIsSidebarOpen(false)}
              wrapNavigation={startTransition}
            />
          </div>

          <MobileFilterSheet
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onClearAll={clearFilters}
            filters={persistedFilters}
            category={brand}
            wrapNavigation={startTransition}
          />

          <div className="flex w-full mb-6 lg:mb-0">
            <ProductDisplay
              products={products}
              totalItems={totalItems}
              itemsPerPage={uiLimit}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              categoryName={brand?.name}
              tags={filterTags}
              onClearFilters={clearFilters}
              isLoading={isPending && products.length === 0}
              onLoadMore={handleLoadMore}
              infiniteScroll={false}
              hasMore={false}
              isFetchingMore={isPending && products.length > 0}
              onToggleSidebar={toggleSidebar}
              wishlistItems={wishlistItems}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(BrandPageClient);
