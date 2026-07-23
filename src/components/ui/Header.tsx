"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addBreadcrumb } from "@/lib/redux/slices/breadcrumb-slice";
import { syncAuthState } from "@/lib/redux/slices/auth-slice";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import HeaderIcon from "./HeaderIcon";
import CartPopup from "./CartPopup";
import { useRouter, usePathname } from "next/navigation";
import { useGetAddressesQuery } from "@/lib/redux/apis/address-api";
import GooglePlacesInput from "../common/AddressAutocomplete";
import { toast } from "react-toastify";

import { useSearchProductsQuery } from "../../lib/redux/apis/products-api";
import { Product } from "@/types/product";
import Button from "../common/Button";
import { RootState } from "@/lib/redux/store";
import { RxHamburgerMenu } from "react-icons/rx";
import { useGetPersonalDataQuery } from "@/lib/redux/apis/auth-api";
import { useLazyReverseGeocodeQuery } from "@/lib/redux/apis/geocode-api";
import { HeaderProps } from "@/types/form";
import { useDebounceValue } from "@/lib/hooks/use-debounce";
import { useIsClient } from "@/lib/hooks/use-is-client";
import {
  Percent,
  Home,
  Armchair,
  HeartPulse,
  ChevronDown,
  X,
  Handbag,
  Sofa,
  Trophy,
} from "lucide-react";

export default function Header({ megaMenuData }: HeaderProps) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [showCartCard] = useState(false);
  const [showPincodeInput, setShowPincodeInput] = useState(false);
  const mounted = useIsClient();
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { postcode, suburb, updatePostcode } = useGlobalPostcode();
  useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });

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
          requestLocation();
        });
    } else {
      requestLocation();
    }
  }, [requestLocation]);

  useEffect(() => {
    dispatch(syncAuthState());
  }, [dispatch]);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsSearching(false);
  }

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
    useSearchProductsQuery(debouncedSearchQuery, {
      skip: !debouncedSearchQuery,
    });

  const mapProductToSearchResult = (product: Product, query: string) => {
    const titleMatch = product.title?.toLowerCase().includes(query);
    const brandMatch = product.brand_name?.toLowerCase().includes(query);
    const categoryMatch = product.category_name?.toLowerCase().includes(query);

    if (brandMatch && !titleMatch && !categoryMatch) {
      return {
        displayLabel: product.brand_name,
        linkHref: `/brand/${product.brand_name}`,
        id: product.id,
      };
    }
    if (categoryMatch && !titleMatch && !brandMatch) {
      return {
        displayLabel: product.category_name || "",
        linkHref: `/category/${product.category_slug ?? product.category_id}`,
        id: product.id,
      };
    }
    return {
      displayLabel: product.title,
      linkHref: `/product/${product.unique_code || product.id}`,
      id: product.id,
    };
  };

  const dedupedResults = React.useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    const results =
      searchResults?.data?.map((p) => mapProductToSearchResult(p, query)) || [];

    return results.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.displayLabel === item.displayLabel),
    );
  }, [searchResults, debouncedSearchQuery]);

  const handleSearch = () => {
    if (
      selectedResultIndex !== -1 &&
      dedupedResults &&
      dedupedResults[selectedResultIndex]
    ) {
      const selectedItem = dedupedResults[selectedResultIndex];
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

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.lenisInstance?.stop();
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.lenisInstance?.start();
    };
  }, [isMobileNavOpen]);

  const { data: personalData } = useGetPersonalDataQuery(undefined, {
    skip: !isAuthenticated,
  });

  const profileImage = personalData?.response?.profile_image?.trim()
    ? personalData.response.profile_image
    : "/images/user.svg";
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
              <RxHamburgerMenu size={22} />
            </div>
            <div className="logo">
              <Link href="/">
                <Image
                  src="/images/logo.svg"
                  alt="ShopperBeats Logo"
                  width={300}
                  height={61}
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
                    dedupedResults && prev < dedupedResults.length - 1
                      ? prev + 1
                      : 0,
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedResultIndex((prev) =>
                    dedupedResults && prev > 0
                      ? prev - 1
                      : (dedupedResults?.length || 1) - 1,
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
              <div className="search-results">
                {isSearchLoading ? (
                  <p>Loading...</p>
                ) : dedupedResults &&
                  dedupedResults.filter((item) =>
                    item.displayLabel
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  ).length > 0 ? (
                  dedupedResults
                    .filter((item) =>
                      item.displayLabel
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                    )
                    .map((item, index) => (
                      <Link
                        prefetch={false}
                        key={`${item.id ?? ""}-${item.displayLabel ?? ""}`}
                        href={item.linkHref}
                        onClick={() => {
                          setIsSearching(true);
                          setShowSearchResults(false);
                        }}
                      >
                        <div
                          className={`search-result-item ${
                            index === selectedResultIndex ? "selected" : ""
                          }`}
                        >
                          <p className="text-[#696e79]">{item.displayLabel}</p>
                        </div>
                      </Link>
                    ))
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
                    className="rounded-full"
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
          <Button
            id="toggleMenuBtn"
            className="megamenuBtn"
            onClick={toggleMegaMenu}
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <RxHamburgerMenu size={20} />
            Shop By Category
            <ChevronDown size={18} />
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
                          <i
                            className="fa fa-angle-right"
                            aria-hidden="true"
                          ></i>
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
          </Button>

          <nav className={`navbar `} id="menu">
            <ul className="menu">
              <li>
                <Link
                  className="link flex items-center gap-2 hover:text-red-500"
                  href="/category/home-garden"
                >
                  <Home size={16} className="inline-block " />
                  Home & Garden
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center gap-2 hover:text-red-500"
                  href="/category/furniture"
                >
                  <Armchair size={16} className="inline-block " />
                  Furniture
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center gap-2 hover:text-red-500"
                  href="#"
                >
                  <Handbag size={16} className="inline-block " />
                  Fashion & Accessories
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center gap-2 hover:text-red-500"
                  href="/category/health-beauty"
                >
                  <HeartPulse size={16} className="inline-block " />
                  Health & Beauty
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center gap-2 hover:text-red-500"
                  href="#"
                >
                  <Sofa size={16} className="inline-block " />
                  Outdoor & Patio
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center gap-2 hover:text-red-500"
                  href="/category/best-seller"
                >
                  <Trophy size={16} className="inline-block " />
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  className="link flex items-center gap-2 hover:text-red-500"
                  href="/product-listing/whats-on-sale"
                >
                  <Percent size={16} className="inline-block " />
                  What&apos;s On Sale
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
