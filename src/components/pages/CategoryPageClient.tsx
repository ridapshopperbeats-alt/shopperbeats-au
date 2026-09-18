"use client";

import dynamic from "next/dynamic";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useDispatch } from "react-redux";



import { applyImageVariant } from "@/lib/utils/imageUtils";

import { Category, Filter, Product } from "@/types/product";


import "../../styles/Product.css";
import CategorySlider from "./CategorySlider";

import DynamicImportLoader from "@/components/ui/loaders/DynamicImportLoader";
import type { ProductDisplayProps } from "@/types/product";
import { useGetWishlistQuery } from "@/lib/redux/apis/cart-api";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { filterProductsByPriceRange, findCategoryPath, resolvePriceRange, SITE_URL, toSafeJsonLd } from "@/lib/utils/main-utils";
import { addBreadcrumb, setBreadcrumbs } from "@/lib/redux/slices/breadcrumb-slice";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { useGetProductsQuery } from "@/lib/redux/apis/products-api";
import Breadcrumb from "../common/Breadcrumb";
import type {
  CategoryPageClientProps,
  CategoryMobileFilterSheetProps,
  FilterComponentProps,
} from "@/types/product";






const Sidebar = dynamic<FilterComponentProps>(() => import("../product-listing/Sidebar") as Promise<{
  default: React.ComponentType<FilterComponentProps>;
}> , {
  loading: DynamicImportLoader,
});

const MobileFilterSheet = dynamic(
  () => import("../product-listing/MobileFilterSheet") as Promise<{
    default: React.ComponentType<CategoryMobileFilterSheetProps>;
  }>,
  { loading: DynamicImportLoader },
);

const ProductDisplay = dynamic<ProductDisplayProps>(
  () => import("@/components/product-listing/ProductDisplay"),
  { loading: DynamicImportLoader },
);


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

  const { data: wishlistData } = useGetWishlistQuery(undefined);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const [persistedFilters, setPersistedFilters] = useState<Filter[]>(filters);

  const prevSlugRef = useRef(slug);

  useEffect(() => {
    if (slug !== prevSlugRef.current) {
      setPersistedFilters(filters);
      prevSlugRef.current = slug;
      return;
    }

    if (filters?.length > persistedFilters.length) {
      // Holds the widest filter set seen so the sidebar does not collapse
      // while the next page is loading.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPersistedFilters(filters);
    }
  }, [filters, slug, persistedFilters.length]);

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

  const formatPriceRangeLabel = useCallback((value: string) => {
    if (value === "200+") return "$200 and Above";
    if (value === "0-50") return "Under $50";
    const [min, max] = value.split("-");
    return min && max ? `$${min} to $${max}` : value;
  }, []);

  const filterTags = useMemo(() => {
    const tags: { key: string; label: string; onRemove: () => void }[] = [];

    selectedCategories.forEach((cat) => {
      tags.push({
        key: `category-${cat}`,
        label: cat,
        onRemove: () => toggleSelectedCategory(cat),
      });
    });

    const customRangeKey = minPrice && maxPrice
      ? `${minPrice}-${maxPrice}`
      : minPrice
        ? `${minPrice}+`
        : maxPrice
          ? `0-${maxPrice}`
          : null;

    selectedPrices.forEach((price) => {
      tags.push({
        key: `price-${price}`,
        label: formatPriceRangeLabel(price),
        onRemove: () => {
          handlePriceChange(price);
          setMinPrice("");
          setMaxPrice("");
        },
      });
    });

    if ((minPrice || maxPrice) && !selectedPrices.includes(customRangeKey || "")) {
      tags.push({
        key: "price-range",
        label: `$${minPrice || 0} to $${maxPrice || "Any"}`,
        onRemove: () => {
          setMinPrice("");
          setMaxPrice("");
        },
      });
    }

    Object.entries(selectedFilters).forEach(([attribute, values]) => {
      values.forEach((value) => {
        tags.push({
          key: `${attribute}-${value}`,
          label: value,
          onRemove: () => handleFilterChange(attribute, value),
        });
      });
    });

    return tags;
  }, [
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
    formatPriceRangeLabel,
  ]);

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
    if (products?.length > 0 && allProducts.length === 0) {
      // Seeds the accumulator from the server-rendered first page.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllProducts(products);
    }
  }, [products, allProducts.length]);



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


  const { postcode } = useGlobalPostcode();

  const queryParams = useMemo(
    () => ({
      ...Object.fromEntries(searchParams.entries()),
      category_slug: slug,
      page: currentPage,
      limit: uiLimit,
      postcode,
    }),
    [searchParams, slug, currentPage, uiLimit, postcode],
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

  const prevFilterStringRef = useRef(currentFilterString);


  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;

    const limit = Number(searchParams.get("limit")) || 20;

    const filtersChanged = currentFilterString !== prevFilterStringRef.current;

    if (filtersChanged) {
      prevFilterStringRef.current = currentFilterString;

      setCurrentPage(1);

      setUiLimit(limit);

      setAllProducts([]);

      setIsLoadingNewFilter(true);

      return;
    }

    if (page !== currentPage) {
      // The URL is the source of truth for paging; mirror it into state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(page);
    }

    if (limit !== uiLimit) {
      setUiLimit(limit);
    }
  }, [searchParams, currentPage, uiLimit, currentFilterString]);


  useEffect(() => {
    if (!data) return;

    const incomingProducts = data?.data || [];

    // Replaces the accumulated list whenever a new query resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllProducts(incomingProducts);

    setIsLoadingNewFilter(false);
  }, [data]);


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
        image: sub.icon_url
          ? applyImageVariant(sub.icon_url, "public")
          : "/images/image-coming-soon.jpg",
        slug: sub.slug ?? sub.id,
        product_count: sub.product_count,
      })) || [],
    [category?.subcategories],
  );
console.log("sliderCategories", sliderCategories);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toSafeJsonLd({
            "@context": "https://schema.org",

            "@type": "ItemList",

            name: category?.name || slug,

            url: `${SITE_URL}/category/${slug}`,

            numberOfItems: products.length,

            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",

              position: index + 1,

              name: product.title,

              url: `${SITE_URL}/product/${product.unique_code || product.slug}`,
            })),
          }),
        }}
      />

      <div className="container">
        {sliderCategories.length > 0 && (
          <CategorySlider
            items={sliderCategories}
            onCategoryClick={(item) => dispatch(
              addBreadcrumb({
                name: item.title,
                path: `/category/${item.slug}`,
              })
            )}
            getHref={(item) => `/category/${item.slug}?${searchParams.toString()}`} title="Shop by Category"          />
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
              wishlistItems={wishlistData?.items ?? []}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(CategoryClient);