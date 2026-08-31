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
  X,
  ChevronDown,
  ChevronRight,
  Menu,
  HandbagIcon,
  HeartPulse,
  Sparkles,
  Armchair,
  Home,
  Gem,
  Tag,
  Leaf,
  Gamepad2,
  ShoppingBag,
  Heart
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { useGetAddressesQuery } from "@/lib/redux/apis/address-api";
import { useGetWishlistQuery } from "@/lib/redux/apis/cart-api";
import { useLazyReverseGeocodeQuery } from "@/lib/redux/apis/geocode-api";
import { toast } from "react-toastify";
import { applyImageVariant } from "@/lib/utils/imageUtils";
import { useGetPersonalDataQuery } from "@/lib/redux/apis/auth-api";
import { useLockBodyScroll } from "@/lib/hooks/use-lock-body-scroll";
import GooglePlacesInput from "../common/AddressAutocomplete";
import Button from "../common/Button";
import GlobalSearch from "../common/GlobalSearch";
import CategoryNavbar from "./CategoryNavbar";
import { addBreadcrumb } from "@/lib/redux/slices/breadcrumb-slice";
import { useGetSearchSuggestionsQuery } from "@/lib/redux/apis/products-api";
import { useDebounceValue } from "@/lib/hooks/use-debounce";

export interface MegaMenuSubcategory {
  name: string;
  id: string;
  slug?: string;
  links: {
    name: string;
    href: string;
    children?: { name: string; href: string }[];
  }[];
  // A subcategory can itself have further nested subcategories (e.g. a
  // "Women"/"Men" segment sits between the category and its real
  // leaf groupings like "Accessories"/"Clothing"). When present, the
  // mega menu treats this subcategory's siblings as tabs and renders
  // this array as the mega-menu columns instead of `links`.
  subcategories?: MegaMenuSubcategory[];
  viewAll?: string;
}

export interface MegaMenuCategory {
  name: string;
  id: string;
  slug?: string;
  subcategories: MegaMenuSubcategory[];
}

interface HeaderProps {
  megaMenuData: MegaMenuCategory[];
}

const resolveCategoryHref = (slugOrId: string) => `/category/${slugOrId}`;

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("fashion") || n.includes("apparel") || n.includes("clothing"))
    return ShoppingBag;
  if (n.includes("home") && n.includes("garden")) return Leaf;
  if (n.includes("furniture")) return Armchair;
  if (n.includes("health") || n.includes("beauty")) return Heart;
  if (n.includes("outdoor") || n.includes("patio")) return Armchair;
  if (n.includes("toy") || n.includes("game")) return Gamepad2;
  if (n.includes("jewel")) return Gem;
  if (n.includes("sale") || n.includes("sparkle")) return Sparkles;
  return Tag;
};

const getCategoryPromo = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("fashion"))
    return {
      label: "New Collection",
      title: "Women's Fashion",
      desc: "Explore the latest trends this season.",
      image: "/images/womentop.png",
    };
  if (n.includes("home") && n.includes("garden"))
    return {
      label: "Trending Now",
      title: "Home & Garden",
      desc: "Refresh your space for less.",
      image: "/images/home-garden-banner.jpg",
    };
  if (n.includes("furniture"))
    return {
      label: "New Arrivals",
      title: "Furniture",
      desc: "Comfort meets style.",
      image: "/images/furniture.png",
    };
  if (n.includes("health") || n.includes("beauty"))
    return {
      label: "Self Care",
      title: "Health & Beauty",
      desc: "Feel good, look good.",
      image: "/images/health-beauty-banner.jpg",
    };
  if (n.includes("outdoor") || n.includes("patio"))
    return {
      label: "Outdoor Living",
      title: "Outdoor & Patio",
      desc: "Make the most of the outdoors.",
      image: "/images/patioFurniture.png",
    };
  return {
    label: "New In",
    title: name,
    desc: "Explore our latest picks.",
    image: null as string | null,
  };
};

export default function Header({ megaMenuData }: HeaderProps) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [showCartCard] = useState(false);
  const [showPincodeInput, setShowPincodeInput] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { postcode, suburb, updatePostcode } = useGlobalPostcode();
  useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: wishlistData } = useGetWishlistQuery(undefined);

  const locationRequestedRef = useRef(false);
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
              updatePostcode(pincode, "");
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
  const [activeSubTabId, setActiveSubTabId] = useState<string | null>(null);
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

  useEffect(() => {}, [searchResults]);

  interface SuggestionItem {
    id: string;
    type: "product" | "category" | "brand";
    displayLabel: string;
    linkHref: string;
    thumbnailUrl?: string | null;
    price?: number;
  }

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

  // const handleSearch = () => {
  //   if (
  //     selectedResultIndex !== -1 &&
  //     filteredResults &&
  //     filteredResults[selectedResultIndex]
  //   ) {
  //     const selectedItem = filteredResults[selectedResultIndex];
  //     setIsSearching(true);
  //     router.push(selectedItem.linkHref);
  //     setShowSearchResults(false);
  //     setSelectedResultIndex(-1);
  //   } else {
  //     if (searchQuery.trim() == "") return;
  //     setIsSearching(true);
  //     router.push(`/search?q=${searchQuery.trim()}`);
  //     setShowSearchResults(false);
  //   }
  // };

  const toggleMegaMenu = () => {
    setIsMegaMenuOpen(true);
  };

  const toggleMobileNav = () => {
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
    };

    if (isMobileNavOpen || isMegaMenuOpen || showPincodeInput) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileNavOpen, isMegaMenuOpen, showPincodeInput]);

  useLockBodyScroll(isMobileNavOpen);

  const { data: personalData } = useGetPersonalDataQuery(undefined, {
    skip: !isAuthenticated,
  });

  const hasCustomAvatar = !!personalData?.response?.profile_image?.trim();

  const profileImage = hasCustomAvatar
    ? applyImageVariant(personalData!.response!.profile_image!, "public")
    : "/images/user.svg";

  const hideSearch =
    pathname === "/user/personal-information" ||
    pathname === "/user/change-password" ||
    pathname === "/user/logout" ||
    pathname === "/user/addresses" ||
    pathname === "/check-out";

  // Checkout has its own minimal header (see CheckoutHeader) instead of the
  // full site header.
  if (pathname === "/check-out") {
    return null;
  }

  return (
    <div className="header-fixed ">
      <div className="px-[10px] xl:px-[40px] flex flex-col">
        <div className={`top-head ${hideSearch ? "no-search" : ""}`}>
          <div className="logo-block ">
            <div
              role="button"
              tabIndex={0}
              id="mobileSidebarToggleBtn"
              className="mobile-sidebar-toggle"
              aria-label="Open category menu"
              onClick={toggleMobileNav}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleMobileNav();
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

          {!hideSearch && <GlobalSearch />}

          <div className="login-block">
            {pathname?.startsWith("/category") && (
              <div className="flex items-center lg:hidden">
                <CartPopup isVisible={showCartCard} />
              </div>
            )}
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
                  setShowPincodeInput(!showPincodeInput);
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
                    {mounted && postcode
                      ? `${postcode}${suburb ? ` ${suburb}` : ""}`
                      : "Enter your postcode"}
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
                      updatePostcode(data.pincode, data.city || "");
                      setShowPincodeInput(false);
                      toast.success(
                        `Location set to ${data.pincode}${data.city ? ` ${data.city}` : ""}`,
                      );
                    }}
                    onClear={() => {
                      updatePostcode("", "");
                    }}
                  />
                </div>
              )}
            </div>
            <div className="hidden lg:flex lg:items-center">
              <HeaderIcon
                href="/user/wishlist"
                iconSrc="/images/wishlist.svg"
                alt="wishlist"
                className="wishlist"
                count={
                  wishlistData?.total_items ?? wishlistData?.items?.length ?? 0
                }
              />

              <CartPopup isVisible={showCartCard} />

              <div className={`header-link account`}>
                {isAuthenticated ? (
                  <Link
                    href="/user/personal-information"
                    className="relative group items-center justify-center"
                    style={hasCustomAvatar ? { padding: 0 } : undefined}
                  >
                    {hasCustomAvatar ? (
                      <Image
                        src={profileImage}
                        alt="account"
                        className="rounded-full object-cover"
                        fill
                      />
                    ) : (
                      <Image
                        src={profileImage}
                        alt="account"
                        className="rounded-full object-cover"
                        width={20}
                        height={20}
                      />
                    )}

                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  </Link>
                ) : (
                  <Link
                    href={`/login?redirect=${encodeURIComponent("/user/personal-information")}`}
                    className="group items-center justify-center"
                  >
                    <Image
                      src="/images/user.svg"
                      alt="account"
                      width={20}
                      height={20}
                    />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bottom-head">
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
              <ChevronDown
                size={16}
                className="inline-block"
                aria-hidden="true"
              />
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
                    {megaMenuData.map((cat) => {
                      const CategoryIcon = getCategoryIcon(cat.name);
                      return (
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
                            href={resolveCategoryHref(cat.slug ?? cat.id)}
                            prefetch={false}
                            className="category-link"
                            onClick={closeMegaMenu}
                          >
                            <span className="category-link-label">
                              <CategoryIcon
                                size={16}
                                className="category-icon"
                                aria-hidden="true"
                              />
                              {cat.name}
                            </span>
                            <ChevronRight
                              size={14}
                              className="inline-block"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      );
                    })}
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
                        {(() => {
                          const isFashionCat = cat.name
                            .toLowerCase()
                            .includes("fashion");
                          const promo = getCategoryPromo(cat.name);

                          // Fashion-style categories have an extra nested
                          // level: cat.subcategories are segments (e.g.
                          // "Women"/"Men") rendered as tabs, and the active
                          // segment's own subcategories (e.g. "Accessories",
                          // "Clothing") become the mega-menu columns. Other
                          // categories keep the old behaviour: their
                          // subcategories ARE the columns directly.
                          const tabs = isFashionCat ? cat.subcategories : [];
                          const activeTab =
                            tabs.find(
                              (tab) => (tab.slug ?? tab.id) === activeSubTabId,
                            ) ?? tabs[0];
                          const columns = isFashionCat
                            ? activeTab
                              ? activeTab.subcategories?.length
                                ? activeTab.subcategories
                                : [activeTab]
                              : []
                            : cat.subcategories;

                          return (
                            <div className="mega-content-inner">
                              {tabs.length > 0 && (
                                <div className="mega-gender-tabs">
                                  {tabs.map((tab) => {
                                    const tabKey = tab.slug ?? tab.id;
                                    return (
                                      <button
                                        key={tabKey}
                                        type="button"
                                        className={
                                          activeTab &&
                                          (activeTab.slug ?? activeTab.id) ===
                                            tabKey
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          setActiveSubTabId(tabKey)
                                        }
                                      >
                                        {tab.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                              <div className="mega-content-row">
                                <div className="mega-cat">
                                  {columns.map((subCat) => (
                                    <div
                                      key={subCat.id}
                                      className="mega-column"
                                    >
                                      <Link
                                        prefetch={false}
                                        href={resolveCategoryHref(
                                          subCat.slug ?? subCat.id,
                                        )}
                                        onClick={closeMegaMenu}
                                      >
                                        <h5>{subCat.name}</h5>
                                      </Link>
                                      <ul>
                                        {subCat.links.slice(0, 10).map((link) => (
                                          <li key={link.name}>
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
                                              href={resolveCategoryHref(
                                                subCat.slug ?? subCat.id,
                                              )}
                                              className="view-link"
                                              prefetch={false}
                                              onClick={() => {
                                                dispatch(
                                                  addBreadcrumb({
                                                    name: cat.name,
                                                    path: resolveCategoryHref(
                                                      cat.slug ?? cat.id,
                                                    ),
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

                                {/* <div className="mega-promo !w-[340px] !h-[307px] opacity-100 rounded-[10px] pt-[40px] pr-[24px] pb-[40px] pl-[24px] bg-[#FFF0F1]">
                                  {promo.image && (
                                    <div className="mega-promo-image">
                                      <Image
                                        src={promo.image}
                                        alt={promo.title}
                                        fill
                                        sizes="220px"
                                        style={{ objectFit: "cover" }}
                                      />
                                    </div>
                                  )}
                                  <div className="mega-promo-content">
                                    <span className="mega-promo-label">
                                      {promo.label}
                                    </span>
                                    <h4>{promo.title}</h4>
                                    <p>{promo.desc}</p>
                                    <Link
                                      href={resolveCategoryHref(
                                        cat.slug ?? cat.id,
                                      )}
                                      prefetch={false}
                                      className="mega-promo-btn"
                                      onClick={closeMegaMenu}
                                    >
                                      Shop Now
                                    </Link>
                                  </div>
                                </div> */}
                              </div>
                            </div>
                          );
                        })()}
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
                  className="link flex items-center xl:gap-2 hover:text-red-500"
                  href="/category/home-garden"
                >
                  <Leaf size={16} className="inline-block text-center icons-size" />
                  Home & Garden
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center xl:gap-2 hover:text-red-500"
                  href="/category/furniture"
                >
                  <Armchair size={16} className="inline-block icons-size" />
                  Furniture
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center  xl:gap-2 hover:text-red-500"
                  href="/category/fashion-accessories"
                >
                  <HandbagIcon size={16} className="inline-block icons-size" />
                  Fashion & Accessories
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center xl:gap-2 hover:text-red-500"
                  href="/category/health-beauty"
                >
                  <HeartPulse size={16} className="inline-block icons-size" />
                  Health & Beauty
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center xl:gap-2 hover:text-red-500"
                  href="/category/outdoor-patio"
                >
                  <Armchair size={16} className="inline-block icons-size" />
                  Outdoor & Patio
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center xl:gap-2 hover:text-red-500"
                  href="/product-listing/best-sellers"
                >
                  <Gem size={16} className="inline-block icons-size" />
                  Best Sellers
                </Link>
              </li>

              <li>
                <Link
                  className="link flex items-center xl:gap-2 hover:text-red-500"
                  href="/product-listing/whats-on-sale"
                >
                  <Sparkles size={16} className="inline-block icons-size" />
                  What&apos;s On Sale
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div
          className={`fixed inset-0 bg-black/40 z-998 transition-opacity duration-300 ${
            isMobileNavOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileNavOpen(false)}
        />

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
              const isFashionCat = cat.name.toLowerCase().includes("fashion");
              const tabs = isFashionCat ? cat.subcategories : [];
              const activeTab =
                tabs.find(
                  (tab) => (tab.slug ?? tab.id) === activeSubTabId,
                ) ?? tabs[0];
              const subCategories = isFashionCat
                ? activeTab
                  ? activeTab.subcategories?.length
                    ? activeTab.subcategories
                    : [activeTab]
                  : []
                : cat.subcategories;

              return (
                <div key={cat.id} className="new-mega-column">
                  <div className="mobile-main-category">
                    <Link
                      href={resolveCategoryHref(cat.slug ?? cat.id)}
                      prefetch={false}
                      onClick={() => setIsMobileNavOpen(false)}
                      className="flex-1"
                    >
                      <h5 className="fluid-text-sm! font-bold">{cat.name}</h5>
                    </Link>

                    <span
                      className="cursor-pointer shrink-0 pl-2"
                      onClick={() => toggleSubCategory(cat.id)}
                    >
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
                      {tabs.length > 0 && (
                        <div className="mega-gender-tabs">
                          {tabs.map((tab) => {
                            const tabKey = tab.slug ?? tab.id;
                            return (
                              <button
                                key={tabKey}
                                type="button"
                                className={
                                  activeTab &&
                                  (activeTab.slug ?? activeTab.id) === tabKey
                                    ? "active"
                                    : ""
                                }
                                onClick={() => setActiveSubTabId(tabKey)}
                              >
                                {tab.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {subCategories.map((subCat) => {
                        const isSubOpen = openSubSubCategories[subCat.id];

                        return (
                          <div key={subCat.id} className="mobile-subcategory">
                            <div className="mobile-subcategory-title">
                              <Link
                                href={resolveCategoryHref(
                                  subCat.slug ?? subCat.id,
                                )}
                                prefetch={false}
                                onClick={() => setIsMobileNavOpen(false)}
                                className="flex-1"
                              >
                                <h6 className="fluid-text-xs font-medium">
                                  {subCat.name}
                                </h6>
                              </Link>

                              <span
                                className="cursor-pointer shrink-0 pl-2"
                                onClick={() =>
                                  toggleSubSubCategory(subCat.id)
                                }
                              >
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
