"use client";

import dynamic from "next/dynamic";

import React, { useState, useEffect, useMemo, useCallback } from "react";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useDispatch } from "react-redux";

import {
  setBreadcrumbs,
  addBreadcrumb,
} from "@/lib/redux/slices/breadcrumb-slice";

import { Product } from "@/types/product";

import { useProductFilters } from "@/lib/hooks/use-product-filters";

import "../../styles/Product.css";
import StaticTopCategoriesSlider from "./StaticTopCategoriesSlider";
import Breadcrumb from "../common/Breadcrumb";
import DynamicImportLoader from "@/components/ui/loaders/DynamicImportLoader";
import {
  resolvePriceRange,
  filterProductsByPriceRange,
  getProductPrice,
} from "@/lib/utils/price-filter";
import { buildFilterTags } from "@/lib/utils/filter-tags";
import Link from "next/link";
import {
  staticCategory,
  staticFilters,
  staticProducts,
  staticMegaMenuCategories,
  findStaticCategoryBySlug,
  getStaticProductsForCategory,
} from "@/lib/utils/staticCategoryData";
import type { Filter } from "@/types/product";

const Sidebar = dynamic(() => import("../product-listing/Sidebar"), {
  loading: DynamicImportLoader,
});

const MobileFilterSheet = dynamic(
  () => import("../product-listing/MobileFilterSheet"),
  { loading: DynamicImportLoader },
);

const StaticProductDisplay = dynamic(
  () => import("../product-listing/StaticProductDisplay"),
  { loading: DynamicImportLoader },
);

const RATING_FILTER_PATTERN = /^(\d)\s*Stars?\s*&\s*Up$/i;

function applyStaticFilters(
  products: Product[],
  {
    selectedCategories,
    selectedFilters,
    searchQuery,
  }: {
    selectedCategories: string[];
    selectedFilters: Record<string, string[]>;
    searchQuery: string;
  },
): Product[] {
  let result = products;

  if (selectedCategories.length > 0) {
    result = result.filter((product) =>
      selectedCategories.includes(product.category_name || ""),
    );
  }

  const selectedBrands = selectedFilters["brand"] || [];
  if (selectedBrands.length > 0) {
    result = result.filter((product) =>
      selectedBrands.includes(product.brand_name || ""),
    );
  }

  const selectedOffers = selectedFilters["special offers"] || [];
  if (selectedOffers.length > 0) {
    result = result.filter((product) =>
      selectedOffers.some((offer) => {
        if (offer === "On Sale") {
          return (product.discount_percentage || 0) > 0;
        }
        const ratingMatch = offer.match(RATING_FILTER_PATTERN);
        if (ratingMatch) {
          const minRating = Number(ratingMatch[1]);
          return (product.review_stats?.average_rating || 0) >= minRating;
        }
        return false;
      }),
    );
  }

  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    result = result.filter((product) =>
      (product.title || "").toLowerCase().includes(query),
    );
  }

  return result;
}

function sortStaticProducts(products: Product[], sortBy: string): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price_asc":
      return sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    case "price_desc":
      return sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    case "top_rated":
      return sorted.sort(
        (a, b) =>
          (b.review_stats?.average_rating || 0) -
          (a.review_stats?.average_rating || 0),
      );
    case "biggest_saving":
      return sorted.sort(
        (a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0),
      );
    case "newly_added":
      return sorted.sort((a, b) => {
        const aDate = (a as { created_at?: string }).created_at || "";
        const bDate = (b as { created_at?: string }).created_at || "";
        return bDate.localeCompare(aDate);
      });
    default:
      return sorted;
  }
}

interface StaticCategoryPageProps {
  slug?: string;
}

const StaticCategoryPage = ({ slug }: StaticCategoryPageProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const category = useMemo(
    () =>
      slug
        ? (findStaticCategoryBySlug(slug) ?? staticCategory)
        : staticCategory,
    [slug],
  );

  const categoryProducts = useMemo(
    () => (slug ? getStaticProductsForCategory(category) : staticProducts),
    [slug, category],
  );

  const categoryFilters: Filter[] = useMemo(() => {
    const brands = Array.from(
      new Set(categoryProducts.map((p) => p.brand_name).filter(Boolean)),
    ) as string[];

    return staticFilters.map((filter) =>
      filter.attribute === "Brand" && brands.length > 0
        ? { ...filter, values: brands }
        : filter,
    );
  }, [categoryProducts]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

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
  } = useProductFilters(categoryFilters, category);

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

  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const limitFromUrl = Number(searchParams.get("limit")) || 20;
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        {
          name: category.name,
          path: slug ? `/static-category/${slug}` : "/static-category",
        },
      ]),
    );
  }, [dispatch, category.name, slug]);

  const activePriceRange = useMemo(
    () => resolvePriceRange(minPrice, maxPrice, selectedPrices),
    [minPrice, maxPrice, selectedPrices],
  );

  const filteredProducts = useMemo(() => {
    const byFilters = applyStaticFilters(categoryProducts, {
      selectedCategories,
      selectedFilters,
      searchQuery,
    });
    const byPrice = filterProductsByPriceRange(byFilters, activePriceRange);
    return sortStaticProducts(byPrice, sortBy);
  }, [
    categoryProducts,
    selectedCategories,
    selectedFilters,
    searchQuery,
    activePriceRange,
    sortBy,
  ]);

  const totalItems = filteredProducts.length;

  const paginatedProducts = useMemo(() => {
    const start = (pageFromUrl - 1) * limitFromUrl;
    return filteredProducts.slice(start, start + limitFromUrl);
  }, [filteredProducts, pageFromUrl, limitFromUrl]);

  const handlePageChange = useCallback(
    (page: number) => {
      window.scrollTo({ top: 0, behavior: "smooth" });

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleItemsPerPageChange = useCallback(
    (newLimit: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", newLimit.toString());
      params.set("page", "1");

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const sliderCategories = useMemo(
    () =>
      staticMegaMenuCategories.flatMap(
        (topCategory) =>
          topCategory.subcategories?.map((sub) => ({
            title: sub.name,
            image: sub.icon_url || "/images/image-coming-soon.jpg",
            slug: sub.slug ?? sub.id,
            product_count: staticProducts.filter(
              (p) => p.category_name === sub.name,
            ).length,
          })) || [],
      ),
    [],
  );

  return (
    <div className="container">
      {sliderCategories.length > 0 && (
        <StaticTopCategoriesSlider
          title="Top Categories"
          items={sliderCategories}
          onCategoryClick={(item) =>
            dispatch(
              addBreadcrumb({
                name: item.title,
                path: `/static-category/${item.slug}`,
              }),
            )
          }
          getHref={(item) => `/static-category/${item.slug}`}
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
            filters={categoryFilters}
            category={category}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        <MobileFilterSheet
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onClearAll={clearFilters}
          filters={categoryFilters}
          category={category}
        />

        <div className="flex w-full">
          <StaticProductDisplay
            products={paginatedProducts}
            onToggleSidebar={toggleSidebar}
            totalItems={totalItems}
            itemsPerPage={limitFromUrl}
            currentPage={pageFromUrl}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            categoryName={category.name}
            tags={filterTags}
            onClearFilters={clearFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(StaticCategoryPage);
