"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumb-slice";
import { useGetWishlistQuery } from "@/lib/redux/apis/cart-api";
import { useGetProductsQuery } from "@/lib/redux/apis/products-api";
import { Filter, Product } from "@/types/product";
import Sidebar from "../productListing/Sidebar";
import MobileFilterSheet from "../productListing/MobileFilterSheet";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import ProductDisplay from "../productListing/ProductDisplay";
import { buildFilterTags } from "@/lib/utils/filter-tags";
import "../../styles/Product.css";
import Breadcrumb from "../ui/Breadcrumb";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  image_url: string | null;
  is_active: boolean;
  total_products: number;
  active_products: number;
  inactive_products: number;
}

interface BrandPageClientProps {
  brandId: string;
  brand: Brand;
  products: Product[];
  filters: Filter[];
  totalItems: number;
}

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

  useGetWishlistQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
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
  } = useProductFilters(persistedFilters, brand);

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

  const CHUNK_SIZE = 20;

  const currentPage = Number(searchParams.get("page")) || 1;

  const uiLimit = Number(searchParams.get("limit") || 100);

  const calculateStartFetchingPage = (uiPage: number, limit: number) => {
    const offset = (uiPage - 1) * limit;
    return Math.floor(offset / CHUNK_SIZE) + 1;
  };

  const [fetchingPage, setFetchingPage] = useState(
    calculateStartFetchingPage(
      Number(searchParams.get("page")) || 1,
      Number(searchParams.get("limit") || 100),
    ),
  );

  const [prevPage, setPrevPage] = useState(currentPage);
  const [prevUiLimitTracked, setPrevUiLimitTracked] = useState(uiLimit);

  if (currentPage !== prevPage || uiLimit !== prevUiLimitTracked) {
    const isOnlyLimitIncrease =
      currentPage === prevPage && uiLimit > prevUiLimitTracked;

    if (!isOnlyLimitIncrease) {
      setFetchingPage(calculateStartFetchingPage(currentPage, uiLimit));
    }

    setPrevPage(currentPage);
    setPrevUiLimitTracked(uiLimit);
  }

  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const initialParams = useRef(searchParams.toString());
  const initialFetchingPage = useRef(fetchingPage);
  const [hasChanged, setHasChanged] = useState(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("limit");
    return params.toString().length > 0;
  });
  const [hasMoreFromApi, setHasMoreFromApi] = useState(true);

  useEffect(() => {
    if (
      searchParams.toString() !== initialParams.current ||
      fetchingPage !== initialFetchingPage.current
    ) {
      setHasChanged(true);
    }
  }, [searchParams, fetchingPage]);

  const { data, isLoading, isFetching } = useGetProductsQuery(
    {
      ...Object.fromEntries(searchParams.entries()),
      brand_slug: brandId,
      page: fetchingPage,
      limit: CHUNK_SIZE,
    },
    {
      skip: !brandId || !hasChanged,
      refetchOnMountOrArgChange: true,
    },
  );

  const effectiveTotal = data?.total ?? totalItems;

  useEffect(() => {}, [isFetching, data]);

  const [prevProductSyncDeps, setPrevProductSyncDeps] = useState({
    data,
    fetchingPage,
    currentPage,
    uiLimit,
  });
  const productSyncDepsChanged =
    data !== prevProductSyncDeps.data ||
    fetchingPage !== prevProductSyncDeps.fetchingPage ||
    currentPage !== prevProductSyncDeps.currentPage ||
    uiLimit !== prevProductSyncDeps.uiLimit;

  if (productSyncDepsChanged) {
    setPrevProductSyncDeps({ data, fetchingPage, currentPage, uiLimit });

    if (data) {
      const currentProducts = data.data || [];
      const startFetching = calculateStartFetchingPage(currentPage, uiLimit);

      setHasMoreFromApi(currentProducts.length >= CHUNK_SIZE);

      if (fetchingPage === startFetching) {
        setAllProducts(currentProducts);
      } else if (fetchingPage > startFetching) {
        setAllProducts((prev) => {
          const newProducts = currentProducts.filter(
            (p) => !prev.some((existing) => existing.id === p.id),
          );
          return [...prev, ...newProducts];
        });
      }
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
    const newPage = Math.max(
      1,
      Math.ceil(((currentPage - 1) * uiLimit + 1) / newUiLimit),
    );
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLoadMore = () => {
    if (
      allProducts.length < uiLimit &&
      allProducts.length < effectiveTotal &&
      !isFetching
    ) {
      setFetchingPage((prev) => prev + 1);
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: brand?.name || brandId,
            url: `/brand/${brandId}`,
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
            />
          </div>

          <MobileFilterSheet
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onClearAll={clearFilters}
            filters={persistedFilters}
            category={brand}
          />

          <div className="flex w-full">
            <ProductDisplay
              products={allProducts}
              totalItems={effectiveTotal}
              itemsPerPage={uiLimit}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              categoryName={brand?.name}
              tags={filterTags}
              onClearFilters={clearFilters}
              isLoading={isLoading && allProducts.length === 0}
              onLoadMore={handleLoadMore}
              infiniteScroll={true}
              hasMore={
                allProducts.length < uiLimit &&
                allProducts.length < effectiveTotal &&
                hasMoreFromApi
              }
              isFetchingMore={isFetching && allProducts.length > 0}
              onToggleSidebar={toggleSidebar}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandPageClient;
