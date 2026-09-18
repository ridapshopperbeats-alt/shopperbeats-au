"use client";

import  { useState, useEffect, useCallback } from "react";
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
  Sparkles,
  Armchair,
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
import { addBreadcrumb } from "@/lib/redux/slices/breadcrumb-slice";
import { useGetSearchSuggestionsQuery } from "@/lib/redux/apis/products-api";
import { useDebounceValue } from "@/lib/hooks/use-debounce";
import { useIsClient } from "@/lib/hooks/use-is-client";
import TopNavbar from "./TopNavbar";
import type { HeaderProps } from "@/types/ui";


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


export default function Header({ megaMenuData }: HeaderProps) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [showCartCard] = useState(false);
  const [showPincodeInput, setShowPincodeInput] = useState(false);
  const mounted = useIsClient();
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
        if (error.code === error.PERMISSION_DENIED) return;
        console.warn(
          `Geolocation unavailable (code ${error.code}): ${error.message || "no details"}`,
        );
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

  const [searchQuery] = useState("");
  const debouncedSearchQuery = useDebounceValue(searchQuery, 1000);
  const { data: searchResults } =
    useGetSearchSuggestionsQuery(debouncedSearchQuery, {
      skip: !debouncedSearchQuery,
    });

  useEffect(() => { }, [searchResults]);
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

  useEffect(() => {
    const activeCat = megaMenuData.find(
      (cat) => (cat.slug ?? cat.id) === activeCategory
    );

    if (!activeCat) return;

    const isFashionCat = activeCat.name
      ?.toLowerCase()
      .includes("fashion");

    if (!isFashionCat) return;

    const tabs = activeCat.subcategories ?? [];

    const womenTab = tabs.find((tab) => {
      const slug = String(tab.slug ?? "").toLowerCase();
      const name = String(tab.name ?? "").toLowerCase();

      return slug === "women" || name === "women";
    });

    if (womenTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSubTabId(womenTab.slug ?? womenTab.id);
    }
  }, [activeCategory, megaMenuData]);

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
                  mounted
                    ? (wishlistData?.total_items ??
                      wishlistData?.items?.length ??
                      0)
                    : 0
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
                        sizes="24px"
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
                        className={`mega-content ${activeCategory === (cat.slug ?? cat.id) ? "active" : ""
                          }`}
                        id={cat.id}
                      >
                        {(() => {
                          const isFashionCat = cat.name
                            ?.toLowerCase()
                            .includes("fashion");

                          const tabs = isFashionCat
                            ? cat.subcategories ?? []
                            : [];

                          const womenTab = tabs.find((tab) => {
                            const slug = String(tab.slug ?? "").toLowerCase();
                            const name = String(tab.name ?? "").toLowerCase();

                            return slug === "women" || name === "women";
                          });

                          const menTab = tabs.find((tab) => {
                            const slug = String(tab.slug ?? "").toLowerCase();
                            const name = String(tab.name ?? "").toLowerCase();

                            return (
                              slug === "men" ||
                              slug === "man" ||
                              name === "men" ||
                              name === "man"
                            );
                          });
                          const orderedTabs = [
                            ...(womenTab ? [womenTab] : []),
                            ...(menTab ? [menTab] : []),
                            ...tabs.filter(
                              (tab) =>
                                tab !== womenTab &&
                                tab !== menTab
                            ),
                          ];

                          const activeTab =
                            orderedTabs.find(
                              (tab) =>
                                String(tab.slug ?? tab.id) ===
                                String(activeSubTabId)
                            ) ?? womenTab ?? orderedTabs[0];

                          const columns = isFashionCat
                            ? activeTab?.subcategories ?? []
                            : cat.subcategories ?? [];

                          return (
                            <div className="mega-content-inner">

                              {orderedTabs.length > 0 && (
                                <div className="mega-gender-tabs">
                                  {orderedTabs.map((tab) => {
                                    const tabKey = tab.slug ?? tab.id;

                                    const slug = String(
                                      tab.slug ?? ""
                                    ).toLowerCase();

                                    const name = String(
                                      tab.name ?? ""
                                    ).toLowerCase();

                                    const isWomen =
                                      slug === "women" ||
                                      name === "women";

                                    const isMen =
                                      slug === "men" ||
                                      slug === "man" ||
                                      name === "men" ||
                                      name === "man";

                                    const isActive =
                                      String(activeSubTabId) ===
                                      String(tabKey);

                                    return (
                                      <button
                                        key={tabKey}
                                        type="button"
                                        className={isActive ? "active" : ""}
                                        onClick={() => {
                                          setActiveSubTabId(tabKey);
                                        }}
                                      >
                                        {isWomen
                                          ? "Women"
                                          : isMen
                                            ? "Men"
                                            : tab.name}
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
                                          subCat.slug ?? subCat.id
                                        )}
                                        onClick={closeMegaMenu}
                                      >
                                        <h5>{subCat.name}</h5>
                                      </Link>

                                      <ul>
                                        {subCat.links
                                          ?.slice(0, 10)
                                          .map((link) => (
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
                                                subCat.slug ?? subCat.id
                                              )}
                                              className="view-link"
                                              prefetch={false}
                                              onClick={() => {
                                                dispatch(
                                                  addBreadcrumb({
                                                    name: cat.name,
                                                    path: resolveCategoryHref(
                                                      cat.slug ?? cat.id
                                                    ),
                                                  })
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

                            </div>
                          );
                        })()}
                      </div>
                    )
                )}
              </div>
            </div>
          </div>
          <TopNavbar megaMenuData={megaMenuData} />
        </div>
        <div
          className={`fixed inset-0 bg-black/40 z-998 transition-opacity duration-300 ${isMobileNavOpen
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
                ) ?? tabs[1];
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

                                    {Array.isArray(link.children) && (
                                      <ul className="mobile-child-links">
                                        {link.children.map((child: { name: string; href: string }) => (
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

