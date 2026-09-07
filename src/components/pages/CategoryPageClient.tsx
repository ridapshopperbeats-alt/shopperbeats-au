"use client";

import dynamic from "next/dynamic";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useTransition,
} from "react";

import { usePathname, useSearchParams } from "next/navigation";

import { useDispatch } from "react-redux";

import {
  setBreadcrumbs,
  addBreadcrumb,
} from "@/lib/redux/slices/breadcrumb-slice";
import { pushLoader, popLoader } from "@/lib/redux/slices/loader-slice";

import { findCategoryPath } from "@/lib/utils/main-utils";

import { Category, Filter, Product } from "@/types/product";

import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { API_ENDPOINTS } from "@/lib/constants/api";

import "../../styles/Product.css";
import CategorySlider from "./CategorySlider";
import Breadcrumb from "../common/Breadcrumb";
import DynamicImportLoader from "@/components/ui/loaders/DynamicImportLoader";
import {
  resolvePriceRange,
  filterProductsByPriceRange,
} from "@/lib/utils/price-filter";
import { buildFilterTags } from "@/lib/utils/filter-tags";
import { applyImageVariant } from "@/lib/utils/imageUtils";

const Sidebar = dynamic(() => import("../product-listing/Sidebar"), {
  loading: DynamicImportLoader,
});

const MobileFilterSheet = dynamic(
  () => import("../product-listing/MobileFilterSheet"),
  { loading: DynamicImportLoader },
);

const ProductDisplay = dynamic(
  () => import("../product-listing/ProductDisplay"),
  { loading: DynamicImportLoader },
);

interface CategoryPageClientProps {
  slug: string;
  category: Category;
  products: Product[];
  filters: Filter[];
  totalItems: number;
  megaMenuData: Category[];
}

const CategoryClient = ({
  slug,
  category,
  products,
  filters,
  totalItems,
  megaMenuData,
}: CategoryPageClientProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const [persistedFilters, setPersistedFilters] = useState<Filter[]>(filters);

  const [prevSlug, setPrevSlug] = useState(slug);

  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setPersistedFilters(filters);
  } else if (filters?.length > persistedFilters.length) {
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
  } = useProductFilters(persistedFilters, category, {
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

  const handleSortChangeWithSkeleton = useCallback(
    (value: string) => {
      handleSortChange(value);
    },
    [handleSortChange],
  );

  const currentPage = Number(searchParams.get("page")) || 1;

  const uiLimit = Number(searchParams.get("limit")) || 20;

  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [effectiveTotal, setEffectiveTotal] = useState(totalItems);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Page the products in state belong to
  const [loadedKey, setLoadedKey] = useState(`${currentPage}-${uiLimit}`);
  const inFlightKeyRef = useRef<string | null>(null);

  // A fresh server render (filter change / reload) replaces the list
  const [prevProducts, setPrevProducts] = useState(products);

  if (prevProducts !== products) {
    setPrevProducts(products);
    setAllProducts(products);
    setEffectiveTotal(totalItems);
    setLoadedKey(`${currentPage}-${uiLimit}`);
  }

  const fetchProducts = useCallback(
    async (page: number, limit: number, key: string) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set("category_slug", slug);
      params.set("page", String(page));
      params.set("limit", String(limit));

      // price filtering happens on the client
      ["price_ranges", "min_price", "max_price"].forEach((param) =>
        params.delete(param),
      );

      inFlightKeyRef.current = key;
      setIsLoadingPage(true);

      try {
        const res = await fetch(
          `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BASE_URL}/${API_ENDPOINTS.PRODUCTS.LIST_PRODUCTS}?${params.toString()}`,
        );

        if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);

        const data = await res.json();

        setAllProducts(data?.data ?? []);
        setEffectiveTotal(Number(data?.total ?? 0));
        setLoadedKey(key);
      } catch (error) {
        console.warn("Failed to load products:", error);
      } finally {
        inFlightKeyRef.current = null;
        setIsLoadingPage(false);
      }
    },
    [searchParams, slug],
  );

  // Fetch whenever the page / limit in the URL is not what we already have
  useEffect(() => {
    const key = `${currentPage}-${uiLimit}`;

    if (key === loadedKey || key === inFlightKeyRef.current) return;

    fetchProducts(currentPage, uiLimit, key);
  }, [currentPage, uiLimit, loadedKey, fetchProducts]);

  useEffect(() => {
    if (!isPending && !isLoadingPage) return;
    dispatch(pushLoader());
    return () => {
      dispatch(popLoader());
    };
  }, [isPending, isLoadingPage, dispatch]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage) return;

      window.scrollTo({ top: 0, behavior: "smooth" });

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));

      window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    },
    [currentPage, pathname, searchParams],
  );

  const handleItemsPerPageChange = useCallback(
    (newUiLimit: number) => {
      if (newUiLimit === uiLimit) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", String(newUiLimit));
      params.set(
        "page",
        String(
          Math.max(1, Math.ceil(((currentPage - 1) * uiLimit + 1) / newUiLimit)),
        ),
      );

      window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    },
    [currentPage, uiLimit, pathname, searchParams],
  );

  const activePriceRange = useMemo(
    () => resolvePriceRange(minPrice, maxPrice, selectedPrices),
    [minPrice, maxPrice, selectedPrices],
  );

  const priceFilteredProducts = useMemo(
    () => filterProductsByPriceRange(allProducts, activePriceRange),
    [allProducts, activePriceRange],
  );

  useEffect(() => {
    if (!megaMenuData?.length || !slug) return;

    const hierarchy = findCategoryPath(megaMenuData, slug);

    if (hierarchy) {
      dispatch(setBreadcrumbs(hierarchy));
    } else {
      dispatch(
        setBreadcrumbs([
          {
            name: category?.name || "Category",
            path: `/category/${slug}`,
          },
        ]),
      );
    }
  }, [slug, megaMenuData, category?.name, dispatch]);

  const handleLoadMore = useCallback(() => { }, []);

  // -----------------------------
  // SLIDER
  // -----------------------------

  const sliderCategories = useMemo(
    () =>
      category?.subcategories?.map((sub: Category) => {
        const rawImage = sub.image_url || sub.icon_url;
        return {
          title: sub.name,
          image: rawImage
            ? applyImageVariant(rawImage, "public")
            : "/images/image-coming-soon.jpg",
          slug: sub.slug ?? sub.id,
          product_count: sub.product_count,
        };
      }) || [],
    [category?.subcategories],
  );

  // console.log("category.subcategories (raw):", category?.subcategories);
  // console.log("sliderCategories (mapped for CategorySlider):", sliderCategories);

  return (
    <>
      <div className="container">
        {sliderCategories.length > 0 && (
          <CategorySlider
            title="Top  Categories"
            titleClassName=""
            items={sliderCategories}
            onCategoryClick={(item) =>
              dispatch(
                addBreadcrumb({
                  name: item.title,
                  path: `/category/${item.slug}`,
                }),
              )
            }
            getHref={(item) =>
              `/category/${item.slug}?${searchParams.toString()}`
            }
          />
        )}

        <Breadcrumb />
        <div className="flex flex-col  relative lg:gap-6 lg:flex-row lg:items-start">
          <div
            className="hidden lg:block shrink-0 lg:w-[300px] xl:w-[300px] filter-sidebar-sticky no-scrollbar"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            <Sidebar
              filters={persistedFilters}
              category={category}
              onClose={() => setIsSidebarOpen(false)}
              wrapNavigation={startTransition}
            />
          </div>

          <MobileFilterSheet
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onClearAll={clearFilters}
            filters={persistedFilters}
            category={category}
            wrapNavigation={startTransition}
          />

          <div className="flex w-full">
            <ProductDisplay
              products={priceFilteredProducts}
              onToggleSidebar={toggleSidebar}
              totalItems={effectiveTotal}
              itemsPerPage={uiLimit}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              sortBy={sortBy}
              onSortChange={handleSortChangeWithSkeleton}
              categoryName={category?.name}
              tags={filterTags}
              onClearFilters={clearFilters}
              isLoading={isLoadingPage || (isPending && allProducts.length === 0)}
              onLoadMore={handleLoadMore}
              infiniteScroll={false}
              hasMore={false}
              isFetchingMore={isPending && allProducts.length > 0}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(CategoryClient);
