"use client";

import dynamic from "next/dynamic";

import React, { useState, useEffect, useMemo, useCallback } from "react";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useDispatch } from "react-redux";

import {
  setBreadcrumbs,
  addBreadcrumb,
} from "@/lib/redux/slices/breadcrumb-slice";

import { Filter, Product } from "@/types/product";

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
import {
  staticCategory,
  staticFilters,
  staticProducts,
  staticMegaMenuCategories,
  findStaticCategoryBySlug,
  getStaticProductsForCategory,
} from "@/lib/utils/staticCategoryData";
// import type { Category, Filter } from "@/types/product";
// import { API_ENDPOINTS } from "@/lib/constants/api";


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

const dummySliderCategories = [
  {
    title: "Women's Clothing",
    image: "/images/womentop.png",
    slug: "womens-clothing",
    product_count: 10,
  },
  {
    title: "Fragrance",
    image: "/images/fragrance.png",
    slug: "fragrance",
    product_count: 8,
  },
  {
    title: "Furniture",
    image: "/images/furniture.png",
    slug: "furniture",
    product_count: 12,
  },
  {
    title: "Patio Furniture",
    image: "/images/patioFurniture.png",
    slug: "patio-furniture",
    product_count: 6,
  },
  {
    title: "Baby & Kids",
    image: "/images/baby-kids.png",
    slug: "baby-kids",
    product_count: 15,
  },
  {
    title: "Home Decor",
    image: "/images/homeDecor.png",
    slug: "home-decor",
    product_count: 9,
  },
  {
    title: "Jewelry",
    image: "/images/jewelry.png",
    slug: "jewelry",
    product_count: 11,
  },
  {
    title: "Men's Clothing",
    image: "/images/menClothing.png",
    slug: "mens-clothing",
    product_count: 14,
  },
  {
    title: "Footwear",
    image: "/images/footwear.png",
    slug: "footwear",
    product_count: 7,
  },
  {
    title: "Watches",
    image: "/images/watches.png",
    slug: "watches",
    product_count: 5,
  },
  {
    title: "Children Clothing",
    image: "/images/baby-kids.png",
    slug: "children-clothing",
    product_count: 8,
  },
  {
    title: "Fashion",
    image: "/images/womentop.png",
    slug: "fashion",
    product_count: 13,
  },
];

const StaticCategoryPage = ({ slug }: StaticCategoryPageProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [sliderCategories] = useState(dummySliderCategories);

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

  const fallbackSliderCategories = useMemo(
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

  // const [sliderCategories, setSliderCategories] = useState(
  //   fallbackSliderCategories,
  // );

  // useEffect(() => {
  //   let isMounted = true;

  //   async function loadCategories() {
  //     try {
  //       const res = await fetch(
  //         `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.CATEGORIES.LIST}`,
  //       );

  //       if (!res.ok) return;

  //       const data: Category[] = await res.json();
  //       const topLevel = (Array.isArray(data) ? data : []).filter(
  //         (category) => !category.parent_id,
  //       );

  //       if (!isMounted || topLevel.length === 0) return;

  //       setSliderCategories(
  //         topLevel.map((category) => ({
  //           title: category.name,
  //           image:
  //             category.icon_url ||
  //             category.image_url ||
  //             "/images/image-coming-soon.jpg",
  //           slug: category.slug ?? category.id,
  //           product_count: category.product_count ?? 0,
  //         })),
  //       );
  //     } catch (error) {
  //       console.error("Error fetching top categories:", error);
  //     }
  //   }

  //   loadCategories();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);



  return (
    <div className="container">
      {sliderCategories.length > 0 && (
        // <StaticTopCategoriesSlider
        //   title="Top Categories"
        //   items={sliderCategories}
        //   onCategoryClick={(item) =>
        //     dispatch(
        //       addBreadcrumb({
        //         name: item.title,
        //         path: `/static-category/${item.slug}`,
        //       }),
        //     )
        //   }
        //   getHref={(item) => `/static-category/${item.slug}`}
        // />

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
      <div className="flex flex-col min-w-0 relative lg:gap-6 lg:flex-row lg:items-start my-6">
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

        <div className="flex w-full min-w-0">
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
