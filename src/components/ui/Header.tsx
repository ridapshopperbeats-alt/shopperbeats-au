"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import HeaderIcon from "./HeaderIcon";
import CartPopup from "./CartPopup";

import { RootState } from "@/lib/redux/store";
import { useRef } from "react";

import {
  Percent,
  Sparkles,
  Home,
  Armchair,
  HeartPulse,
  Gamepad2,
  Baby,
  X,
  ChevronDown,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { useGetAddressesQuery } from "@/lib/redux/apis/address-api";
import { useGetWishlistQuery } from "@/lib/redux/apis/cart-api";
import { formatPrice } from "@/lib/utils/main-utils";
import { useLazyReverseGeocodeQuery } from "@/lib/redux/apis/geocode-api";
import { toast } from "react-toastify";
import { useDebounceValue } from "@/lib/hooks/use-debounce";
import { useGetSearchSuggestionsQuery } from "@/lib/redux/apis/products-api";
import { applyImageVariant } from "@/lib/utils/imageUtils";
import { useGetPersonalDataQuery } from "@/lib/redux/apis/auth-api";
import { useLockBodyScroll } from "@/lib/hooks/use-lock-body-scroll";
import GooglePlacesInput from "../common/AddressAutocomplete";
import Button from "../common/Button";
import { addBreadcrumb } from "@/lib/redux/slices/breadcrumb-slice";

export interface MegaMenuCategory {
  name: string;
  id: string;
  slug?: string;
  subcategories: {
    name: string;
    id: string;
    slug?: string;
    links: {
      name: string;
      href: string;
      children?: { name: string; href: string }[];
    }[];
    viewAll?: string;
  }[];
}

interface HeaderProps {
  megaMenuData: MegaMenuCategory[];
}

export default function Header({ megaMenuData }: HeaderProps) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [showCartCard] = useState(false);
  const [showPincodeInput, setShowPincodeInput] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { postcode, suburb, updatePostcode } = useGlobalPostcode();
  useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: wishlistData } = useGetWishlistQuery(undefined);

  const locationRequestedRef = useRef(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [triggerReverseGeocode] = useLazyReverseGeocodeQuery();

  const requestLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
         
          const data = await triggerReverseGeocode({
            lat: latitude,
            lng: longitude,
          }).unwrap();

          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const addressComponents = result.address_components;

            let city = "";
            let pincode = "";

            addressComponents.forEach(
              (component: google.maps.GeocoderAddressComponent) => {
                if (component.types.includes("locality")) {
                  city = component.long_name;
                }
                if (component.types.includes("postal_code")) {
                  pincode = component.long_name;
                }
              },
            );

            if (city && pincode) {
              updatePostcode(pincode, city);
            } else if (pincode) {
              updatePostcode(pincode, "Melbourne");
            } else {
              toast.error("Could not determine postal code from your location");
            }
          } else {
            toast.error("Could not get address from your location");
          }
        } catch {
          toast.error("Failed to get address from location");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  }, [updatePostcode, triggerReverseGeocode]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          if (result.state === "denied") {
            return;
          }
          requestLocation();
        })
        .catch(() => {
          // Permissions API not supported here, fall back to requesting directly
          requestLocation();
        });
    } else {
      requestLocation();
    }
  }, [requestLocation]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsSearching(false);
  }, [pathname]);

  useEffect(() => {
    const checkLocationAndPostcode = async () => {
      if (locationRequestedRef.current) return;
      locationRequestedRef.current = true;

      const storedPostcode = localStorage.getItem("globalPostcode");

      if (!storedPostcode && locationRequestedRef.current) {
        getCurrentLocation();
      }
    };

    checkLocationAndPostcode();
  }, [getCurrentLocation]);

  const [activeCategory, setActiveCategory] = useState<string | null>(
    megaMenuData.length > 0
      ? (megaMenuData[0].slug ?? megaMenuData[0].id)
      : null,
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [openSubCategories, setOpenSubCategories] = useState<
    Record<string, boolean>
  >({});
  const [openSubSubCategories, setOpenSubSubCategories] = useState<
    Record<string, boolean>
  >({});
  const toggleSubCategory = (subCatId: string) => {
    setOpenSubCategories((prev) => ({
      ...prev,
      [subCatId]: !prev[subCatId],
    }));
  };

  const toggleSubSubCategory = (linkName: string) => {
    setOpenSubSubCategories((prev) => ({
      ...prev,
      [linkName]: !prev[linkName],
    }));
  };

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounceValue(searchQuery, 1000);
  const { data: searchResults, isLoading: isSearchLoading } =
    useGetSearchSuggestionsQuery(debouncedSearchQuery, {
      skip: !debouncedSearchQuery,
    });

  useEffect(() => {
  }, [searchResults]);

  interface SuggestionItem {
    id: string;
    type: "product" | "category" | "brand";
    displayLabel: string;
    linkHref: string;
    thumbnailUrl?: string | null;
    price?: number;
  }

  // Single source of truth for what's actually on screen — each list narrows
  // further as the user keeps typing ahead of the debounce, so keyboard
  // bounds/selection and the rendered rows must read from these same
  // filtered lists, not the raw API response.
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

  const toggleMegaMenu = () => {
    setIsMegaMenuOpen(!isMegaMenuOpen);
    setIsMobileNavOpen((prev) => !prev);
  };

  const closeMegaMenu = () => {
    setIsMegaMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const menu = document.querySelector(".mobile-mega-menu");
      const megaMenu = document.getElementById("megaMenu");
      const toggleBtn = document.getElementById("toggleMenuBtn");
      const megaMenuToggleBtn = document.getElementById(
        "mobileSidebarToggleBtn",
      );
      const pincodeDropdown = document.querySelector(".pincode-dropdown");
      const deliveryBlock = document.querySelector(".delivery-block");

      const isInside = (el: Element | null) => el?.contains(target);

      if (
        isMobileNavOpen &&
        menu &&
        !isInside(menu) &&
        !isInside(toggleBtn) &&
        !isInside(megaMenuToggleBtn)
      ) {
        setIsMobileNavOpen(false);
      }
      if (
        isMegaMenuOpen &&
        megaMenu &&
        !isInside(megaMenu) &&
        !isInside(toggleBtn) &&
        !isInside(megaMenuToggleBtn)
      ) {
        setIsMegaMenuOpen(false);
      }
      if (
        showPincodeInput &&
        pincodeDropdown &&
        !isInside(pincodeDropdown) &&
        !isInside(deliveryBlock)
      ) {
        setShowPincodeInput(false);
      }
      if (
        showSearchResults &&
        searchRef.current &&
        !isInside(searchRef.current)
      ) {
        setShowSearchResults(false);
      }
    };

    if (
      isMobileNavOpen ||
      isMegaMenuOpen ||
      showPincodeInput ||
      showSearchResults
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileNavOpen, isMegaMenuOpen, showPincodeInput, showSearchResults]);

  useLockBodyScroll(isMobileNavOpen);

  const { data: personalData } = useGetPersonalDataQuery(undefined, {
    skip: !isAuthenticated,
  });

  const profileImage = personalData?.response?.profile_image?.trim()
    ? applyImageVariant(personalData.response.profile_image, "public")
    : "/images/default_user_icon.jpg";
  return (
    <div className="header-fixed ">
      <div className="container flex flex-col">
        <div className="top-head">
          <div className="logo-block ">
            <div
              role="button"
              tabIndex={0}
              id="mobileSidebarToggleBtn"
              className="mobile-sidebar-toggle"
              aria-label="Open category menu"
              onClick={toggleMegaMenu}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleMegaMenu();
                }
              }}
            >
              <Menu size={22} />
            </div>
            <div className="logo">
              <Link href="/">
                <Image
                  src="/images/logo.svg"
                  alt="ShopperBeats Logo"
                  width={300}
                  height={300}
                  priority
                />
              </Link>
            </div>
          </div>

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

          <div className="login-block">
            <div className="delivery-block" style={{ position: "relative" }}>
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowPincodeInput(!showPincodeInput);
                  }
                }}
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowPincodeInput(!showPincodeInput);
                  } else {
                    router.push("/user/addresses");
                  }
                }}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Image
                  src="/images/deliver-location.svg"
                  alt="Deliver"
                  width={15}
                  height={15}
                />
                <div className="deliver-location">
                  <span>Deliver to</span>
                  <p>
                    {mounted
                      ? postcode
                        ? `${postcode} ${suburb}`
                        : "3000 Melbourne"
                      : "3000 Melbourne"}
                  </p>
                </div>
              </div>

              {showPincodeInput && (
                <div className="pincode-dropdown">
                  <label htmlFor="headerPincode" className="visually-hidden">
                    Enter Pincode
                  </label>
                  <GooglePlacesInput
                    id="headerPincode"
                    mode="pincode"
                    placeholder="Enter Pincode"
                    value={postcode}
                    onPlaceSelect={(data) => {
                      if (!data.pincode) {
                        toast.error(
                          "Please select a valid location with pincode",
                        );
                        return;
                      }
                      updatePostcode(data.pincode, data.city || "Melbourne");
                      setShowPincodeInput(false);
                      toast.success(
                        `Location set to ${data.pincode} ${data.city || "Melbourne"}`,
                      );
                    }}
                    onClear={() => {
                      updatePostcode("", "");
                    }}
                  />
                </div>
              )}
            </div>
            <HeaderIcon
              href="/user/wishlist"
              iconSrc="/images/wishlist.svg"
              alt="wishlist"
              className="wishlist"
              count={wishlistData?.total_items ?? wishlistData?.items?.length ?? 0}
            />

            <CartPopup isVisible={showCartCard} />

            <div className={`header-link account`}>
              {isAuthenticated ? (
                <Link
                  href="/user/personal-information"
                  className="relative inline-block !p-0"
                >
                  <Image
                    src={
                      profileImage?.trim()
                        ? profileImage
                        : "/images/default_user_icon.jpg"
                    }
                    alt="account"
                    className="rounded-full object-cover"
                    fill
                  />

                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                </Link>
              ) : (
                <Link
                  href={`/login?redirect=${encodeURIComponent("/user/personal-information")}`}
                  className="group"
                >
                  <Image
                    src="/images/default_user_icon.jpg"
                    alt="account"
                    width={20}
                    height={20}   
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="bottom-head border-b border-[#D8D8D8] ">
          <div
            className="megamenu-container"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <Button
              id="toggleMenuBtn"
              className={`megamenuBtn ${isMegaMenuOpen ? "active" : ""}`}
              onClick={toggleMegaMenu}
              aria-haspopup="true"
              aria-expanded={isMegaMenuOpen}
              aria-controls="megaMenu"
            >
              <Menu size={20} />
              Shop By Category{" "}
              <ChevronDown size={16} className="inline-block" aria-hidden="true" />
            </Button>
            <div
              id="megaMenu"
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              className={`mega-menu-wrapper ${isMegaMenuOpen ? "active" : ""}`}
            >
              <div className="mega-menu">
                <div className="category-list" data-lenis-prevent>
                  <ul>
                    {megaMenuData.map((cat) => (
                      <li
                        key={cat.id}
                        className={
                          activeCategory === (cat.slug ?? cat.id)
                            ? "active"
                            : ""
                        }
                        onMouseEnter={() =>
                          setActiveCategory(cat.slug ?? cat.id)
                        }
                      >
                        <Link
                          href={`/category/${cat.slug ?? cat.id}`}
                          prefetch={false}
                          className="category-link"
                          onClick={closeMegaMenu}
                        >
                          {cat.name}{" "}
                          <ChevronRight
                            size={14}
                            className="inline-block"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {megaMenuData.map(
                  (cat) =>
                    activeCategory === (cat.slug ?? cat.id) && (
                      <div
                        key={cat.id}
                        className={`mega-content ${
                          activeCategory === (cat.slug ?? cat.id)
                            ? "active"
                            : ""
                        }`}
                        id={cat.id}
                      >
                        <div className="mega-cat">
                          {cat.subcategories.map((subCat) => (
                            <div key={subCat.name} className="mega-column">
                              <Link
                                prefetch={false}
                                href={`/category/${subCat.slug ?? subCat.id}`}
                                onClick={closeMegaMenu}
                              >
                                <h5>{subCat.name}</h5>
                              </Link>
                              <ul>
                                {subCat.links.map((link) => (
                                  <li
                                    key={link.name}
                                    style={{ lineHeight: "28px" }}
                                  >
                                    <Link
                                      prefetch={false}
                                      href={link.href}
                                      onClick={closeMegaMenu}
                                    >
                                      {link.name}
                                    </Link>
                                  </li>
                                ))}

                                {subCat.viewAll && (
                                  <li>
                                    <Link
                                      href={`/category/${subCat.slug ?? subCat.id}`}
                                      className="view-link"
                                      prefetch={false}
                                      onClick={() => {
                                        dispatch(
                                          addBreadcrumb({
                                            name: cat.name,
                                            path: `/category/${cat.slug ?? cat.id}`,
                                          }),
                                        );
                                        closeMegaMenu();
                                      }}
                                    >
                                      View All
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </div>
          </div>

          <nav className={`navbar `} id="menu">
            <ul className="menu">
              <li>
                <Link
                  className={`link flex items-center gap-2 ${pathname === "/product-listing/whats-on-sale" ? "active" : ""}`}
                  href="/product-listing/whats-on-sale"
                >
                  <Percent size={16} className="inline-block " />
                  What&apos;s On Sale
                </Link>
              </li>
              <li>
                <Link
                  className={`link flex items-center gap-2 ${pathname === "/product-listing/clearance" ? "active" : ""}`}
                  href="/product-listing/clearance"
                >
                  <Sparkles size={16} className="inline-block " />
                  Clearance
                </Link>
              </li>
              <li>
                <Link
                  className={`link flex items-center gap-2 ${pathname === "/category/home-garden" ? "active" : ""}`}
                  href="/category/home-garden"
                >
                  <Home size={16} className="inline-block " />
                  Home & Garden
                </Link>
              </li>
              <li>
                <Link
                  className={`link flex items-center gap-2 ${pathname === "/category/furniture" ? "active" : ""}`}
                  href="/category/furniture"
                >
                  <Armchair size={16} className="inline-block " />
                  Furniture
                </Link>
              </li>
              <li>
                <Link
                  className={`link flex items-center gap-2 ${pathname === "/category/health-beauty" ? "active" : ""}`}
                  href="/category/health-beauty"
                >
                  <HeartPulse size={16} className="inline-block " />
                  Health & Beauty
                </Link>
              </li>
              <li>
                <Link
                  className={`link flex items-center gap-2 ${pathname === "/category/toys-games" ? "active" : ""}`}
                  href="/category/toys-games"
                >
                  <Gamepad2 size={16} className="inline-block " />
                  Toys & Games
                </Link>
              </li>
              <li>
                <Link
                  className={`link flex items-center gap-2 ${pathname === "/category/baby-kids" ? "active" : ""}`}
                  href="/category/baby-kids"
                >
                  <Baby size={16} className="inline-block " />
                  Baby & Kids
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div
          className={`${isMobileNavOpen ? "active" : ""} mobile-mega-menu`}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="mobile-mega-menu-close"
            aria-label="Close menu"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <X size={22} />
          </button>
          <div
            className="new-mega-menu-content"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            {megaMenuData.map((cat) => {
              const isMainOpen = openSubCategories[cat.id];

              return (
                <div key={cat.id} className="new-mega-column">
                  <div
                    className="mobile-main-category"
                    onClick={() => toggleSubCategory(cat.id)}
                  >
                    <h5 className="!text-[14px] font-bold">{cat.name}</h5>

                    <span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{
                          transform: isMainOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "0.3s",
                        }}
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>

                  {isMainOpen && (
                    <div className="mobile-subcategories">
                      {cat.subcategories.map((subCat) => {
                        const isSubOpen = openSubSubCategories[subCat.id];

                        return (
                          <div key={subCat.id} className="mobile-subcategory">
                            <div
                              className="mobile-subcategory-title"
                              onClick={() => toggleSubSubCategory(subCat.id)}
                            >
                              <h6 className="text-[12px] font-medium">
                                {subCat.name}
                              </h6>

                              <span>
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  style={{
                                    transform: isSubOpen
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                    transition: "0.3s",
                                  }}
                                >
                                  <path
                                    d="M6 9L12 15L18 9"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>

                            {isSubOpen && (
                              <ul className="mobile-links">
                                {subCat.links.map((link) => (
                                  <li key={link.name}>
                                    <Link
                                      href={link.href}
                                      prefetch={false}
                                      onClick={() => setIsMobileNavOpen(false)}
                                    >
                                      {link.name}
                                    </Link>

                                    {link.children && (
                                      <ul className="mobile-child-links">
                                        {link.children.map((child) => (
                                          <li key={child.name}>
                                            <Link
                                              href={child.href}
                                              prefetch={false}
                                              onClick={() =>
                                                setIsMobileNavOpen(false)
                                              }
                                            >
                                              {child.name}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
