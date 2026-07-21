"use client";

import dynamic from "next/dynamic";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useDispatch } from "react-redux";

import {
  setBreadcrumbs,
  addBreadcrumb,
} from "@/lib/redux/slices/breadcrumb-slice";

import { useGetProductsQuery } from "@/lib/redux/apis/products-api";

import { findCategoryPath } from "@/lib/utils/main-utils";

import { Category, Filter, Product } from "@/types/product";

import { useProductFilters } from "@/lib/hooks/use-product-filters";

import "../../styles/Product.css";
import CategorySlider from "./CategorySlider";
import Breadcrumb from "../common/Breadcrumb";
import DynamicImportLoader from "@/components/ui/loaders/DynamicImportLoader";
import { resolvePriceRange, filterProductsByPriceRange } from "@/lib/utils/price-filter";
import { buildFilterTags } from "@/lib/utils/filter-tags";



const Sidebar = dynamic(() => import("../productListing/Sidebar"), {
  loading: DynamicImportLoader,
});

const MobileFilterSheet = dynamic(
  () => import("../productListing/MobileFilterSheet"),
  { loading: DynamicImportLoader },
);

const ProductDisplay = dynamic(
  () => import("../productListing/ProductDisplay"),
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
  const router = useRouter();
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
  } = useProductFilters(persistedFilters, category);

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


  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const limitFromUrl = Number(searchParams.get("limit")) || 20;

  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const [uiLimit, setUiLimit] = useState(limitFromUrl);



  const [allProducts, setAllProducts] = useState<Product[]>([]);

  if (products?.length > 0 && allProducts.length === 0) {
    setAllProducts(products);
  }

  const activePriceRange = useMemo(
    () => resolvePriceRange(minPrice, maxPrice, selectedPrices),
    [minPrice, maxPrice, selectedPrices],
  );

  const priceFilteredProducts = useMemo(
    () => filterProductsByPriceRange(allProducts, activePriceRange),
    [allProducts, activePriceRange],
  );

  const [isLoadingNewFilter, setIsLoadingNewFilter] = useState(false);

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


  const queryParams = useMemo(
    () => ({
      ...Object.fromEntries(searchParams.entries()),
      category_slug: slug,
      page: currentPage,
      limit: uiLimit,
    }),
    [searchParams, slug, currentPage, uiLimit],
  );

  const { data, isLoading, isFetching } = useGetProductsQuery(queryParams, {
    skip: !slug,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const effectiveTotal = data?.total ?? totalItems;


  const currentFilterString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("page");
    params.delete("limit");

    return params.toString();
  }, [searchParams]);

  const [prevFilterString, setPrevFilterString] = useState(currentFilterString);

  if (currentFilterString !== prevFilterString) {
    setPrevFilterString(currentFilterString);

    setCurrentPage(1);
    setUiLimit(limitFromUrl);
    setAllProducts([]);
    setIsLoadingNewFilter(true);
  } else {
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }

    if (limitFromUrl !== uiLimit) {
      setUiLimit(limitFromUrl);
    }
  }

  const [prevQueryData, setPrevQueryData] = useState(data);

  if (data !== prevQueryData) {
    setPrevQueryData(data);

    if (data) {
      setAllProducts(data.data || []);
      setIsLoadingNewFilter(false);
    }
  }


  const handlePageChange = useCallback(
    (page: number) => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      const params = new URLSearchParams(searchParams.toString());

      params.set("page", page.toString());

      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
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

      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams, currentPage, uiLimit],
  );

  const handleLoadMore = useCallback(() => {
  }, []);

  // -----------------------------
  // SLIDER
  // -----------------------------

  const sliderCategories = useMemo(
    () =>
      category?.subcategories?.map((sub: Category) => ({
        title: sub.name,
        image: sub.icon_url || "/images/image-coming-soon.jpg",
        slug: sub.slug ?? sub.id,
        product_count: sub.product_count,
      })) || [],
    [category?.subcategories],
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",

            "@type": "ItemList",

            name: category?.name || slug,

            url: `/category/${slug}`,

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
            />
          </div>

          <MobileFilterSheet
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onClearAll={clearFilters}
            filters={persistedFilters}
            category={category}
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
              isLoading={
                isLoading ||
                (isFetching && allProducts.length === 0) ||
                isLoadingNewFilter
              }
              onLoadMore={handleLoadMore}
              infiniteScroll={false}
              hasMore={false}
              isFetchingMore={
                (isFetching && allProducts.length > 0) || isLoadingNewFilter
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(CategoryClient);
