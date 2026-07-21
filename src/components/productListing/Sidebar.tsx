"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Accordion from "@/components/ui/Accordion";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { Category, Filter } from "@/types/product";
import Button from "@/components/ui/Button";
import { useParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";

export interface SidebarProps {
  filters: Filter[];
  category?: Category | null;
  onClose?: () => void;
  onExpandedChange?: (expanded: boolean) => void;
  onClearAllFilters?: () => void;
  extractedBrands?: {
    name: string;
    slug: string;
    count: number;
  }[];
  extractedCategories?: {
    name: string;
    slug: string;
    count: number;
  }[];
  selectedCategorySlug?: string | null;
  onCategorySelect?: (categorySlug: string | null) => void;
  selectedPriceRange?: string | null;
  onPriceSelect?: (priceRange: string | null) => void;
  isHighlightPage?: boolean;

  slug?: string;

  priceCounts?: {
    under50: number;
    between50and100: number;
    between100and200: number;
    above200: number;
  };
 
  hideHeader?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  filters,
  category,
  onClose,
  extractedCategories,
  extractedBrands,
  selectedCategorySlug,
  onCategorySelect,
  selectedPriceRange,
  isHighlightPage,
  onExpandedChange,
  hideHeader,
  slug,
}) => {
  const {
    brandSearch,
    setBrandSearch,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedCategories,
    setSelectedCategories,
    selectedPrices,
    selectedFilters,
    handleFilterChange,
    handleApplyFilters,
    brandFilter,
    priceFilter,
    categoryFilter,
    specialOffersFilter,
    colorFilter,
    sizeFilter,
    allCategories,
  } = useProductFilters(filters, category);

  const params = useParams();
  const activeSlug = params?.slug;


  const checkboxAccentClass = "!accent-[#F51721] cursor-pointer";

  // Synced with the external `matchMedia` API instead of mirrored into
  // useState + effect. Returns null on the server / before hydration (no
  // `window`), matching the previous initial state.
  const isDesktopViewport = useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia("(min-width: 1024px)");
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => null,
  );

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleCategoryExpand = (key: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? true),
    }));
  };

  const [isAnyAccordionOpen, setIsAnyAccordionOpen] = useState(false);


  const hasAnyCategoryExpanded = Object.values(expandedCategories).some(Boolean);
  const hasAnyExpanded = isAnyAccordionOpen || hasAnyCategoryExpanded;

  useEffect(() => {
    onExpandedChange?.(hasAnyExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnyExpanded]);

  const MIN_PRICE = 0;
  const MAX_PRICE = 1000;

  const [priceRange, setPriceRange] = useState([
    Number(minPrice) || MIN_PRICE,
    Number(maxPrice) || MAX_PRICE,
  ]);

  // Resync the slider range whenever the min/max price filter values change
  // elsewhere. Adjusted directly during render (React's recommended pattern
  // for state that derives from a changed prop, using state rather than a
  // ref so it stays safe to read during render) instead of inside an effect,
  // to avoid an extra render pass.
  const [prevMinPrice, setPrevMinPrice] = useState(minPrice);
  const [prevMaxPrice, setPrevMaxPrice] = useState(maxPrice);

  if (minPrice !== prevMinPrice || maxPrice !== prevMaxPrice) {
    setPrevMinPrice(minPrice);
    setPrevMaxPrice(maxPrice);
    setPriceRange([Number(minPrice) || MIN_PRICE, Number(maxPrice) || MAX_PRICE]);
  }


  const renderNestedCategories = (
    categories: (Category | string)[],
    parentExpanded: boolean = true,
  ) => (
    <>
      <div className="w-full flex flex-col gap-1">
        {categories?.map((catOrString, index) => {
          const cat =
            typeof catOrString === "string"
              ? {
                  id: String(index),
                  name: catOrString,
                  slug: catOrString.toLowerCase().replace(/\s+/g, "-"),
                }
              : catOrString;

          const isActive = activeSlug === cat.slug;

          const hasSubs =
            (cat as Category).subcategories &&
            (cat as Category).subcategories!.length > 0;
          const categoryKey = String(cat.id || cat.slug || index);
          const isExpanded =
            expandedCategories[categoryKey] ?? parentExpanded;

          return (
            <div key={categoryKey} className="w-full flex flex-col">
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2 min-w-0">
                  {!hasSubs ? (
                    <label
                      htmlFor={`category-${categoryKey}`}
                      className="flex items-center gap-2 min-w-0 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        id={`category-${categoryKey}`}
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => setSelectedCategories(cat.name)}
                        className={`h-[14px] w-[14px] shrink-0 ${checkboxAccentClass}`}
                      />

                      <span
                        className={`block w-full !text-[14px] leading-[25px] text-left transition-colors duration-200
                          ${isActive ? "text-[#333333] font-semibold" : "font-normal text-[#575757]"}
                        `}
                      >
                        {cat?.name}
                      </span>
                    </label>
                  ) : (
                    <Link
                      href={`/category/${cat.slug}`}
                      onClick={() => onClose?.()}
                      className={`block w-full !text-[16px] leading-[25px] text-left transition-colors duration-200
                        ${isActive ? "text-[#333333] font-semibold" : ""}
                      `}
                    >
                      {cat?.name}
                    </Link>
                  )}
                </div>

                {hasSubs && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleCategoryExpand(categoryKey);
                    }}
                    aria-label={
                      isExpanded ? "Collapse category" : "Expand category"
                    }
                    aria-expanded={isExpanded}
                    className="shrink-0 cursor-pointer flex items-center justify-center text-[#575757]"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`}
                    />
                  </button>
                )}
              </div>

              {hasSubs && isExpanded && (
                <div className="mt-1 w-full flex flex-col gap-1">
                  {renderNestedCategories(
                    (cat as Category).subcategories!,
                    isExpanded,
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  const accordionItems = [
    ...(extractedCategories && extractedCategories.length > 0
      ? [
          {
            id: "categories",
            title: "Categories",
            content: (
              <div className="w-full flex flex-col gap-1">
                <button
                  onClick={() => onCategorySelect?.(null)}
                  className={`block w-full px-2 py-1 text-left text-[16px] font-semibold transition-colors duration-200 cursor-pointer ${!selectedCategorySlug ? "text-[#333333]" : ""}`}
                >
                  All Categories
                </button>
                {extractedCategories.map((cat) => (
                  <label
                    key={cat.slug}
                    htmlFor={`highlight-category-${cat.slug}`}
                    className="flex items-center gap-2 px-2 py-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id={`highlight-category-${cat.slug}`}
                      checked={selectedCategorySlug === cat.slug}
                      onChange={() =>
                        onCategorySelect?.(
                          selectedCategorySlug === cat.slug ? null : cat.slug,
                        )
                      }
                      className={`h-[14px] w-[14px] shrink-0 ${checkboxAccentClass}`}
                    />
                    <span className="!text-[14px] font-medium text-[#575757] transition-colors duration-200">
                      {cat.name} ({cat.count})
                    </span>
                  </label>
                ))}
              </div>
            ),
            defaultOpen: true,
          },
        ]
      : []),
    ...(!extractedCategories &&
    (categoryFilter?.values?.length || allCategories?.length > 0)
      ? [
          {
            id: "categories",
            title: "Categories",
            content: renderNestedCategories(
              categoryFilter?.values?.length
                ? (categoryFilter.values as never as Category[])
                : allCategories,
            ),
          },
        ]
      : []),
    ...(priceFilter?.values?.length
      ? [
          {
            id: "price",
            title: "Price",
            content: (
              <div className="pt-2 px-2 lg:px-0">
                <Slider
                  value={priceRange}
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={5}
                  onValueChange={(value) => {
                    setPriceRange(value);

                    setMinPrice(String(value[0]));
                    setMaxPrice(String(value[1]));
                  }}
                  className="w-full [&_[data-slot=slider-range]]:bg-red-500 [&_[data-slot=slider-thumb]]:border-red-500 [&_[data-slot=slider-thumb]]:bg-red-500"
                />
                {(!isHighlightPage ||
                  ["clearance", "whats-on-sale"].includes(String(slug))) && (
                  <div className="flex items-center align-center !gap-2 pt-5">
                    <span className="text-[16px] text-[#000000]">$</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => {
                        const newMin = e.target.value;

                        setMinPrice(newMin);

                        setPriceRange([
                          Number(newMin) || MIN_PRICE,
                          priceRange[1],
                        ]);
                      }}
                      className="h-full flex-1 min-w-0 max-w-[70px] max-h-[30px] border-[#676767] !rounded-[53px]"
                    />

                    <span className="shrink-0 px-1 text-[16px] text-[#000000]">to</span>

                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        const newMax = e.target.value;

                        setMaxPrice(e.target.value);

                        setPriceRange([
                          priceRange[0],
                          Number(newMax) || MAX_PRICE,
                        ]);
                      }}
                      className="h-full flex-1 min-w-0 max-w-[70px] max-h-[30px] border-[#676767] !rounded-[53px]"
                    />

                    <Button
                      onClick={handleApplyFilters}
                      className="text-[14px] border border-[#fd151b] text-[#fd151b] cursor-pointer h-full  w-full max-w-[63px] shrink-0 rounded-[53px]"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            ),
            defaultOpen:
              selectedPrices.length > 0 ||
              minPrice !== "" ||
              maxPrice !== "" ||
              selectedPriceRange !== null,
          },
        ]
      : []),

    ...(extractedBrands?.length
      ? [
          {
            id: "brand",
            title: "Brand",
            content: (
              <div className="flex flex-col gap-2">
                <ul>
                  {extractedBrands
                    .filter((b) =>
                      b.name.toLowerCase().includes(brandSearch.toLowerCase()),
                    )
                    .map((brand, idx) => (
                      <li key={brand.slug}>
                        <Input
                          type="checkbox"
                          id={`brand-${idx}`}
                          checked={
                            selectedFilters["brand"]?.includes(brand.name) ||
                            false
                          }
                          onChange={() =>
                            handleFilterChange("Brand", brand.name)
                          }
                          className={checkboxAccentClass}
                        />
                        <label
                          htmlFor={`brand-${idx}`}
                          className="cursor-pointer text-[#575757] font-normal tracking-[-0.5%] text-[14px]"
                        >
                          {brand.name} ({brand.count})
                        </label>
                      </li>
                    ))}
                </ul>
              </div>
            ),
            defaultOpen:
              (selectedFilters["brand"]?.length || 0) > 0 || brandSearch !== "",
          },
        ]
      : brandFilter
        ? [
            {
              id: "brand",
              title: "Brand",
              content: (
                <div className="flex flex-col gap-4">
                  <div style={{ position: "relative", width: "238px" }}>
                    <Search
                      size={16}
                      className="absolute right-0 top-[20%] text-[#A7A7A7]"
                    />
                    <Input
                      type="text"
                      placeholder="Search for a brand"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="!rounded-[50px] max-h-[26px] w-full min-w-[250px] font-normal placeholder:text-[#A7A7A7] placeholder:text-[14px]"
                    />
                  </div>

                  <ul>
                    {(brandFilter.values || [])
                      .filter((brand) =>
                        brand
                          ?.toLowerCase()
                          .includes(brandSearch.toLowerCase()),
                      )
                      .map((brand, idx) => (
                        <li key={brand}>
                          <Input
                            type="checkbox"
                            id={`brand-${idx}`}
                            checked={
                              selectedFilters["brand"]?.includes(brand) || false
                            }
                            onChange={() => handleFilterChange("Brand", brand)}
                            className={checkboxAccentClass}
                          />
                          <label
                            className="cursor-pointer text-[#575757] font-normal tracking-[-0.5%] text-[14px]"
                            htmlFor={`brand-${idx}`}
                          >
                            {brand}
                          </label>
                        </li>
                      ))}
                  </ul>
                </div>
              ),
            },
          ]
        : []),

    ...(specialOffersFilter
      ? [
          {
            id: "special-offers",
            title: "Special Offers",
            content: (
              <div className="flex flex-col gap-2">
                <ul className="">
                  {specialOffersFilter.values?.map((value, idx) => (
                    <li key={value}>
                      <Input
                        type="checkbox"
                        id={`special-offers-${idx}`}
                        checked={
                          selectedFilters["special offers"]?.includes(value) ||
                          false
                        }
                        onChange={() =>
                          handleFilterChange("Special Offers", value)
                        }
                        className={checkboxAccentClass}
                      />
                      <label
                        className="cursor-pointer text-[#575757] font-medium tracking-[-0.5%] text-[14px]"
                        htmlFor={`special-offers-${idx}`}
                      >
                        {value}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ),
            defaultOpen: (selectedFilters["special offers"]?.length || 0) > 0,
          },
        ]
      : []),
    ...(colorFilter
      ? [
          {
            id: "color",
            title: colorFilter.attribute,
            content: (
              <div className="flex flex-col gap-2">
                <ul className="">
                  {colorFilter.values?.map((value, idx) => (
                    <li key={value}>
                      <input
                        type="checkbox"
                        id={`color-${idx}`}
                        checked={
                          selectedFilters[
                            colorFilter.attribute.toLowerCase()
                          ]?.includes(value) || false
                        }
                        onChange={() =>
                          handleFilterChange(colorFilter.attribute, value)
                        }
                        className={checkboxAccentClass}
                      />
                      <label
                        className="cursor-pointer text-[#575757] font-normal tracking-[-0.5%] text-[14px]"
                        htmlFor={`color-${idx}`}
                      >
                        {value}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ),
            defaultOpen:
              (selectedFilters[colorFilter.attribute.toLowerCase()]?.length ||
                0) > 0,
          },
        ]
      : []),
    ...(sizeFilter
      ? [
          {
            id: "size",
            title: "Size",
            content: (
              <div className="flex flex-col gap-2">
                <ul className="">
                  {sizeFilter.values?.map((value, idx) => (
                    <li key={value}>
                      <input
                        type="checkbox"
                        id={`size-${idx}`}
                        checked={
                          selectedFilters["size"]?.includes(value) || false
                        }
                        onChange={() => handleFilterChange("Size", value)}
                        className={checkboxAccentClass}
                      />
                      <label
                        className="cursor-pointer text-[#575757] font-normal tracking-[-0.5%] text-[14px]"
                        htmlFor={`size-${idx}`}
                      >
                        {value}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ),
            defaultOpen: (selectedFilters["size"]?.length || 0) > 0,
          },
        ]
      : []),
  ];


  const forceOpenCount =
    isDesktopViewport === null ? undefined : isDesktopViewport ? 4 : 0;

  return (
    <div className="sidebar w-full overflow-hidden lg:overflow-visible">
      {!hideHeader && accordionItems.length > 0 && (
        <div className=" py-3 border-b border-[#d8d8d8] flex justify-between items-center">
          <h2 className="text-[#282C3F] text-[20px] font-medium flex">
            Filters
          </h2>
        </div>
      )}
      <div >
        <Accordion
          items={accordionItems}
          forceOpenCount={forceOpenCount}
          onOpenChange={(openItems) =>
            setIsAnyAccordionOpen(openItems.some(Boolean))
          }
        />
      </div>
    </div>
  );
};
export default Sidebar;
