"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDebounceValue } from "@/lib/hooks/use-debounce";
import { useGetSearchSuggestionsQuery } from "@/lib/redux/apis/products-api";
import { applyImageVariant } from "@/lib/utils/imageUtils";
import { formatPrice } from "@/lib/utils/main-utils";

interface SuggestionItem {
  id: string;
  type: "product" | "category" | "brand";
  displayLabel: string;
  linkHref: string;
  thumbnailUrl?: string | null;
  price?: number;
}

export default function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);

  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounceValue(searchQuery, 1000);
  const { data: searchResults, isLoading: isSearchLoading } =
    useGetSearchSuggestionsQuery(debouncedSearchQuery, {
      skip: !debouncedSearchQuery,
    });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSearching(false);
  }, [pathname]);

  const query = searchQuery.toLowerCase();

  const filteredProducts: SuggestionItem[] = React.useMemo(() => {
    return (searchResults?.products || [])
      .filter((p) => p.title?.toLowerCase().includes(query))
      .map((p) => ({
        id: p.id,
        type: "product" as const,
        displayLabel: p.title,
        linkHref: `/product/${p.slug}`,
        thumbnailUrl: p.thumbnail_url
          ? applyImageVariant(p.thumbnail_url, "public")
          : p.thumbnail_url,
        price: p.price,
      }));
  }, [searchResults, query]);

  const filteredCategories: SuggestionItem[] = React.useMemo(() => {
    return (searchResults?.categories || [])
      .filter((c) => c.name?.toLowerCase().includes(query))
      .map((c) => ({
        id: c.id,
        type: "category" as const,
        displayLabel: c.name,
        linkHref: `/category/${c.slug}`,
      }));
  }, [searchResults, query]);

  const filteredBrands: SuggestionItem[] = React.useMemo(() => {
    return (searchResults?.brands || [])
      .filter((b) => b.name?.toLowerCase().includes(query))
      .map((b) => ({
        id: b.id,
        type: "brand" as const,
        displayLabel: b.name,
        linkHref: `/brand/${b.slug}`,
      }));
  }, [searchResults, query]);

  const filteredResults: SuggestionItem[] = React.useMemo(
    () => [...filteredProducts, ...filteredCategories, ...filteredBrands],
    [filteredProducts, filteredCategories, filteredBrands],
  );

  const handleSearch = () => {
    if (
      selectedResultIndex !== -1 &&
      filteredResults &&
      filteredResults[selectedResultIndex]
    ) {
      const selectedItem = filteredResults[selectedResultIndex];
      setIsSearching(true);
      router.push(selectedItem.linkHref);
      setShowSearchResults(false);
      setSelectedResultIndex(-1);
    } else {
      if (searchQuery.trim() == "") return;
      setIsSearching(true);
      router.push(`/search?q=${searchQuery.trim()}`);
      setShowSearchResults(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        showSearchResults &&
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchResults]);

  if (
    pathname === "/user/personal-information" ||
    pathname === "/user/change-password" ||
    pathname === "/user/logout" ||
    pathname === "/user/addresses"
  )
    return null;

  return (
    <div className="search-block" ref={searchRef}>
      <label htmlFor="headerSearch" className="visually-hidden">
        Search products
      </label>
      <input
        style={{ background: "#fff", borderRadius: "5px" }}
        id="headerSearch"
        type="text"
        placeholder="Explore amazing products you'll love"
        value={searchQuery}
        onChange={(e) => {
          setShowSearchResults(true);
          setSearchQuery(e.target.value);
          setSelectedResultIndex(-1);
        }}
        onFocus={() => {
          if (searchQuery.trim() !== "") {
            setShowSearchResults(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedResultIndex((prev) =>
              filteredResults && prev < filteredResults.length - 1
                ? prev + 1
                : 0,
            );
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedResultIndex((prev) =>
              filteredResults && prev > 0
                ? prev - 1
                : (filteredResults?.length || 1) - 1,
            );
          } else if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
          } else if (e.key === "Escape") {
            setShowSearchResults(false);
          }
        }}
      />

      {!isSearching && searchQuery && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => {
            setSearchQuery("");
            setShowSearchResults(false);
            setSelectedResultIndex(-1);
          }}
          aria-label="Clear search"
        >
          &times;
        </button>
      )}

      {isSearching ? (
        <div className="search-loader"></div>
      ) : (
        <button
          type="button"
          onClick={handleSearch}
          aria-label="Search"
        ></button>
      )}

      {searchQuery && showSearchResults && (
        <div className="search-results" data-lenis-prevent>
          {isSearchLoading ? (
            <p>Loading...</p>
          ) : filteredResults.length > 0 ? (
            (() => {
              let runningIndex = -1;

              const renderGroup = (
                title: string,
                items: SuggestionItem[],
              ) =>
                items.length > 0 && (
                  <div className="search-result-group" key={title}>
                    <p className="search-result-group-title text-[11px] font-semibold uppercase tracking-wide text-[#9aa0ab] px-3 pt-2">
                      {title}
                    </p>
                    {items.map((item) => {
                      runningIndex += 1;
                      const currentIndex = runningIndex;

                      return (
                        <Link
                          prefetch={false}
                          key={`${item.type}-${item.id}`}
                          href={item.linkHref}
                          onClick={() => {
                            setIsSearching(true);
                            setShowSearchResults(false);
                          }}
                        >
                          <div
                            className={`search-result-item flex items-center gap-2 ${
                              currentIndex === selectedResultIndex
                                ? "selected"
                                : ""
                            }`}
                          >
                            {item.type === "product" && (
                              <span className="relative w-8 h-8 shrink-0 rounded-[4px] overflow-hidden bg-[#F5F5F5]">
                                {item.thumbnailUrl && (
                                  <Image
                                    src={item.thumbnailUrl}
                                    alt={item.displayLabel}
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                  />
                                )}
                              </span>
                            )}
                            <p className="text-[#696e79] flex-1 min-w-0 truncate">
                              {item.displayLabel}
                            </p>
                            {item.type === "product" &&
                              item.price !== undefined && (
                                <span className="text-[#fd151b] font-semibold text-[13px] shrink-0">
                                  ${formatPrice(item.price)}
                                </span>
                              )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );

              return (
                <>
                  {renderGroup("Products", filteredProducts)}
                  {renderGroup("Categories", filteredCategories)}
                  {renderGroup("Brands", filteredBrands)}
                  <Link
                    prefetch={false}
                    href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => {
                      setIsSearching(true);
                      setShowSearchResults(false);
                      setSelectedResultIndex(-1);
                    }}
                  >
                    <div className="search-result-item see-all-results w-full text-center font-semibold text-[#fd151b]">
                      See all results
                    </div>
                  </Link>
                </>
              );
            })()
          ) : (
            <div className="search-result-item">
              <p className="text-[#696e79]">No products found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
