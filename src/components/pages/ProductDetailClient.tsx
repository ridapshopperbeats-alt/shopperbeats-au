"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  useAddToCartMutation,
  useGetCartQuery,
  useGetWishlistQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemQuantityMutation,
} from "@/lib/redux/apis/cart-api";
import CartCheckoutDrawer from "@/components/cart/CartCheckoutDrawer";
import { CartItem } from "@/types/cart";
import { useGetRecommendationsQuery } from "@/lib/redux/apis/products-api";
import { useCalculateShippingMutation } from "@/lib/redux/apis/order-api";
import Image from "next/image";
import ProductGallery from "../product-listing/ProductGallery";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { Product, Category } from "@/types/product";
import { ProductSEO } from "@/types/seo";
import Accordion from "../common/Accordion";
import ProductDetailsMobileTabs from "./ProductDetailsMobileTabs";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumb-slice";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { useWishlistToggle } from "@/lib/hooks/use-wishlist-toggle";
import { useIsClient } from "@/lib/hooks/use-is-client";

import DeliveryDetailsPopup from "../ui/DeliveryDetailsPopup";
import {
  renderContent,
  cleanText,
  parseProductHTML,
} from "@/lib/utils/render-content";
import { useVariantSelection } from "@/lib/hooks/use-variant-selection";
import { WishlistKey } from "@/types/wishlist";
import BundleSection from "../ui/BundleSection";
import RecommendedForYou from "../homepage/RecommendedForYou";
import { useSEO } from "@/contexts/SEOContext";
import {
  getFeaturesContent,
  getDeliveryTabContent,
  warrantyAndReturnContent,
} from "@/components/ui/product-tab-content";
import Link from "next/link";
import { ChevronDownIcon, MapPin, ShieldCheck } from "lucide-react";
import ColorPopup from "./ColorPopup";
import LocationPopup from "./LocationPopup";
import CustomerRatingViewPage from "./CustomerRatingViewPage";
import {
  findCategoryPath,
  formatPrice,
  getEstimatedDeliveryRange,
  getImageUrl,
  getPriceDetails,
  getVariantImage,
} from "@/lib/utils/main-utils";
import { BadgeColor, StatusBadge } from "../common/StatusBadge";

export default function ProductDetailClient({
  product: initialProduct,
  recommendations,
  megaMenuData,
  slug,
  seo,
  recentlyViewed,
}: {
  product: Product;
  recommendations: Product[];
  megaMenuData: Category[];
  slug: string;
  seo?: ProductSEO;
  recentlyViewed?: Product[] | null;
  popularProducts?: Product[] | null;
}) {
  const product = initialProduct;

  const { data: recommendationsData, isFetching: isRecommendationsFetching } =
    useGetRecommendationsQuery(
      {
        product_id: product?.id,
        category_name: product?.category_name,
        brand_name: product?.brand_name,
        product_name: product?.title,
      },
      { skip: !product?.id },
    );

  const apiRecommendations = Array.isArray(recommendationsData)
    ? recommendationsData
    : recommendationsData?.data;

  const finalRecommendations =
    apiRecommendations && apiRecommendations.length > 0
      ? apiRecommendations
      : recommendations && recommendations.length > 0
        ? recommendations
        : [];

  const isRecommendedForYouLoading =
    isRecommendationsFetching &&
    finalRecommendations.length === 0 &&
    !(recentlyViewed && recentlyViewed.length > 0);

  const { updateMetadata } = useSEO();

  useEffect(() => {
    const mainImage = getImageUrl(product, "public");
    const cleanDescription =
      seo?.meta_description?.replace(/<[^>]*>/g, "").substring(0, 160) ||
      product.description?.replace(/<[^>]*>/g, "").substring(0, 160);

    updateMetadata({
      title: seo?.page_title || product.title,
      description: cleanDescription,
      keywords: seo?.meta_keywords,
      canonical_url: seo?.canonical_url,
      og_title: seo?.page_title || product.title,
      og_image: [mainImage],
      twitter_cards_title: seo?.page_title || product.title,
      twitter_cards_type: "summary_large_image",
    });
  }, [product, seo, updateMetadata]);
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const {
    attributeNames,
    selectedAttributes,
    selectedVariant,
    filteredAttributes,
    handleAttributeChange,
    setSelectedVariant,
    setSelectedAttributes,
  } = useVariantSelection(product.variants || []);

  const variantIdsKey = useMemo(
    () => (product.variants || []).map((v) => v.id).join(","),
    [product.variants],
  );

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const variantMatch = product.variants.find((v) => v.id === slug);
      if (variantMatch) {
        setSelectedVariant(variantMatch);
        const attrs: Record<string, string> = {};
        variantMatch.attributes.forEach((attr) => {
          attrs[attr.name.toLowerCase()] = attr.value;
        });
        setSelectedAttributes(attrs);
        return;
      }

      const firstInStock = product.variants.find((v) => (v.stock ?? 0) > 0);
      const variantToSelect = firstInStock ?? product.variants[0];

      setSelectedVariant(variantToSelect);
      const attrs: Record<string, string> = {};
      variantToSelect.attributes.forEach((attr) => {
        attrs[attr.name.toLowerCase()] = attr.value;
      });
      setSelectedAttributes(attrs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, variantIdsKey, setSelectedVariant, setSelectedAttributes]);

  const [calculateShipping] = useCalculateShippingMutation();

  const { postcode, suburb, updatePostcode } = useGlobalPostcode();
  const { data: cart } = useGetCartQuery(
    postcode ? { postcode: postcode } : undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const [removeCartItem, { isLoading: isRemovingCartItem }] =
    useRemoveFromCartMutation();
  const [updateCartItemQuantity, { isLoading: isUpdatingCartItem }] =
    useUpdateCartItemQuantityMutation();
  const [localQtyMap, setLocalQtyMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cart?.items) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalQtyMap((prev) => {
      const next = { ...prev };
      cart.items.forEach((item) => {
        if (next[item.id] === undefined) {
          next[item.id] = String(item.quantity);
        }
      });
      return next;
    });
  }, [cart]);

  const handleCartDrawerUpdateQuantity = (
    product_id: string,
    quantity: number,
    variant_id?: string,
    item_id?: string,
  ) => {
    if (quantity < 1 || Number.isNaN(quantity)) return;
    updateCartItemQuantity({
      product_id,
      quantity,
      variant_id,
      postcode: postcode,
    })
      .unwrap()
      .then(() => {
        if (item_id != null) {
          setLocalQtyMap((prev) => ({ ...prev, [item_id]: String(quantity) }));
        }
      })
      .catch(() => {
        toast.error("Failed to update quantity");
        if (item_id != null) {
          setLocalQtyMap((prev) => {
            const next = { ...prev };
            delete next[item_id];
            return next;
          });
        }
      });
  };

  const handleCartDrawerRemove = async (id: string, variant_id?: string) => {
    try {
      await removeCartItem({ product_id: id, variant_id }).unwrap();
    } catch {
      toast.error("Failed to remove item.");
    }
  };

  const handleCartDrawerIncrement = (item: CartItem) => {
    const currentLocalQty = Number.parseInt(
      localQtyMap[item.id] ?? String(item.quantity),
    );
    const stockLimit = item.available_stock ?? item.stock;
    if (
      stockLimit !== undefined &&
      stockLimit !== null &&
      currentLocalQty >= stockLimit
    ) {
      toast.error("No more stock available", { toastId: "stock-warning" });
      return;
    }
    const newQty =
      (Number.isNaN(currentLocalQty) ? item.quantity : currentLocalQty) + 1;
    setLocalQtyMap((prev) => ({ ...prev, [item.id]: String(newQty) }));
    handleCartDrawerUpdateQuantity(
      item.product_id,
      newQty,
      item.variant_id,
      item.id,
    );
  };

  const handleCartDrawerDecrement = (item: CartItem) => {
    if (
      isUpdatingCartItem ||
      isRemovingCartItem ||
      !item.is_active ||
      (item.available_stock !== undefined && item.available_stock <= 0)
    )
      return;
    if (item.quantity === 1) {
      handleCartDrawerRemove(item.product_id, item.variant_id);
    } else {
      const newQty = item.quantity - 1;
      setLocalQtyMap((prev) => ({ ...prev, [item.id]: String(newQty) }));
      handleCartDrawerUpdateQuantity(
        item.product_id,
        newQty,
        item.variant_id,
        item.id,
      );
    }
  };

  const cartHasShippableItem = cart?.items?.some(
    (item) => item.is_shippable === true,
  );

  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const wishlistItemsFromServer = useMemo<WishlistKey[]>(
    () => wishlistData?.items ?? [],
    [wishlistData],
  );

  const [shippingCharge, setShippingCharge] = useState<number | null>(null);
  const [shippingStatus, setShippingStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");

  const mounted = useIsClient();

  const [selectedLocation, setSelectedLocation] = useState<{
    pincode: string;
    suburb: string;
    state?: string;
  } | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );

  const router = useRouter();

  const hasVariants = (product?.variants?.length ?? 0) > 0;

  const wishlistPriceDetails = useMemo(
    () => getPriceDetails(product, selectedVariant),
    [product, selectedVariant],
  );

  const {
    isWishlisted: isProductInWishlist,
    isLoading: isWishlistLoading,
    toggle: handleWishlistButtonClick,
  } = useWishlistToggle({
    productId: product.id,
    variantId: selectedVariant?.id ?? null,
    wishlistItems: wishlistItemsFromServer,
    requireVariant: true,
    hasVariants,
    matchAnyVariant: true,
    productSnapshot: {
      image: getImageUrl(product, "public"),
      title: product.title,
      brand_name: product.brand_name,
      mainPrice: wishlistPriceDetails.mainPrice,
      wasPrice: wishlistPriceDetails.wasPrice,
      showWasPrice: wishlistPriceDetails.showWasPrice,
      discountPercentage: wishlistPriceDetails.discountPercentage,
      unique_code: product.unique_code,
      promotion_name: product.promotion_name,
      stock: selectedVariant?.stock ?? product.stock,
      tags: product.tags,
      vendor_id: product.vendor_id,
      ships_from_location: product.ships_from_location,
      handling_time_days: product.handling_time_days,
      handling_time_max_days: product.handling_time_max_days,
      variants: product.variants,
      rating: product.review_stats?.average_rating,
      reviewCount: product.review_stats?.total_reviews,
    },
  });

  const [quantity, setQuantity] = useState(1);

  const [showPopup, setShowPopup] = useState(false);

  const colorAttrName = attributeNames.find(
    (name) => name === "color" || name === "colour",
  );
  const realColorOptions = useMemo(
    () => (colorAttrName ? filteredAttributes[colorAttrName] || [] : []),
    [colorAttrName, filteredAttributes],
  );
  const hasRealColors = realColorOptions.length > 0;

  const styleAttrName = attributeNames.find((name) => name === "style");
  const realStyleOptions = styleAttrName
    ? filteredAttributes[styleAttrName] || []
    : [];
  const hasRealStyles = realStyleOptions.length > 0;

  const findVariantForAttrValue = useCallback(
    (attrName: string, value: string) =>
      product.variants?.find((v) => {
        const matchesValue = v.attributes.some(
          (a) => a.name.toLowerCase() === attrName && a.value === value,
        );
        if (!matchesValue) return false;

        return Object.entries(selectedAttributes).every(([key, val]) => {
          if (!val || key === attrName) return true;
          return v.attributes.some(
            (a) => a.name.toLowerCase() === key && a.value === val,
          );
        });
      }),
    [product.variants, selectedAttributes],
  );

  const colorSwatchOptions = useMemo(
    () =>
      realColorOptions.map((c) => {
        const variant = findVariantForAttrValue(colorAttrName!, c.value);
        return {
          ...c,
          image: variant
            ? getVariantImage(variant, "pdptmb")
            : "/images/image-coming-soon.jpg",
        };
      }),
    [realColorOptions, colorAttrName, findVariantForAttrValue],
  );

  const [activeTab, setActiveTab] = useState("description");
  const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);

  const handleTabClick = (tab: string, index: number) => {
    setActiveTab(tab);
    tabRefs.current[index]?.focus();
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const tabCount = productTabItems.length;
    let newIndex = index;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      newIndex = (index + 1) % tabCount;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      newIndex = (index - 1 + tabCount) % tabCount;
    } else if (e.key === "Home") {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      newIndex = tabCount - 1;
    }

    if (newIndex !== index) {
      const newTab = productTabItems[newIndex];
      setActiveTab(newTab.key);
      tabRefs.current[newIndex]?.focus();
    }
  };

  const productTabItems = [{ key: "description", label: "Description" }];

  const isProductInCart = useMemo(() => {
    if (!selectedVariant?.id) return false;

    return cart?.items?.some(
      (item) =>
        item.product_id === product.id &&
        item.variant_id === selectedVariant.id,
    );
  }, [cart?.items, product.id, selectedVariant]);

  const handleBuyNow = async () => {
    const hasVariants = product?.variants && product.variants.length > 0;
    if (hasVariants && !selectedVariant?.id) {
      toast.error("Choose your preferred option before buying !");
      return;
    }

    if (product && product.id) {
      try {
        await addToCart({
          productId: product.id,
          quantity: quantity,
          variant_id: selectedVariant?.id,
          vendor_id: product.vendor_id,
          postcode: postcode,
        }).unwrap();

        router.push("/check-out");
      } catch (err) {
        const error = err as {
          data?: { detail?: string; error?: string };
          message?: string;
        };
        const errorMessage =
          error?.data?.detail ||
          error?.data?.error ||
          error?.message ||
          "Failed to add product to cart.";
        toast.error(errorMessage);
      }
    }
  };

  const handleCartButtonClick = useCallback(async () => {
    if (isProductInCart) {
      setIsCartDrawerOpen(true);
      return;
    }

    const hasVariants = product?.variants && product.variants.length > 0;

    if (hasVariants && !selectedVariant?.id) {
      toast.error("Choose your preferred option before adding to cart!");
      return;
    }

    if (product && product.id) {
      try {
        await addToCart({
          productId: product.id,
          quantity: quantity,
          variant_id: selectedVariant?.id,
          vendor_id: product.vendor_id,
          postcode: postcode,
        }).unwrap();
        toast.success("Product added to cart!");
        setIsCartDrawerOpen(true);
      } catch (err) {
        const error = err as {
          data?: { detail?: string; error?: string };
          message?: string;
        };
        const errorMessage =
          error?.data?.detail ||
          error?.data?.error ||
          error?.message ||
          "Failed to add product to cart.";
        toast.error(errorMessage);
      }
    }
  }, [
    isProductInCart,
    addToCart,
    product,
    selectedVariant,
    quantity,
    postcode,
  ]);

  const closeDeliveryPopup = () => setShowDeliveryPopup(false);

  const isOutOfStock = useMemo(() => {
    const hasVariants = product.variants && product.variants.length > 0;

    if (hasVariants) {
      if (!selectedVariant) return false;

      return (selectedVariant.stock ?? 0) <= 0;
    }

    return (product.stock ?? 0) <= 0;
  }, [product, selectedVariant]);

  const productTitle = useMemo(() => {
    if (
      !selectedVariant ||
      !selectedVariant.attributes ||
      selectedVariant.attributes.length === 0
    ) {
      return product.title || "";
    }
    const attributeValues = selectedVariant.attributes
      .filter((attr) => attr.value && attr.value.trim() !== "")
      .map((attr) => attr.value)
      .join(" | ");
    return attributeValues
      ? `${product.title} ${attributeValues}`
      : product.title || "";
  }, [product.title, selectedVariant]);

  const roundValue = (v?: string | number) => Math.round(Number(v ?? 0));

  const length = roundValue(selectedVariant?.length ?? product?.length);
  const width = roundValue(selectedVariant?.width ?? product?.width);
  const weight = roundValue(selectedVariant?.weight ?? product?.weight);
  const height = roundValue(selectedVariant?.height ?? product?.height);

  const precautionaryNote =
    selectedVariant?.precautionary_note?.trim() ||
    product?.precautionary_note?.trim();

  const careInstructions =
    selectedVariant?.care_instructions?.trim() ||
    product?.care_instructions?.trim();

  const warranty =
    selectedVariant?.warranty?.trim() || product?.warranty?.trim();

  const keyFeatures =
    selectedVariant?.key_features?.trim() || product?.key_features?.trim();

  const productFeatures = useMemo(() => {
    if (keyFeatures) {
      return keyFeatures
        .split(/<br\s*\/?>|\r?\n/gi)
        .map((item) => cleanText(item))
        .filter(Boolean);
    }

    return parseProductHTML({ htmlString: product?.description || "" })
      .features;
  }, [keyFeatures, product?.description]);

  const accordionItems = useMemo(
    () => [
      ...(length || width || weight || height
        ? [
          {
            title: "Specifications",
            id: "specifications",
            content: (
              <ul>
                {length && (
                  <li>
                    <b>Length :-</b> {length} cm
                  </li>
                )}
                {width && (
                  <li>
                    <b>Width :-</b> {width} cm
                  </li>
                )}
                {weight && (
                  <li>
                    <b>Weight :-</b> {weight} Kg
                  </li>
                )}
                {height && (
                  <li>
                    <b>Height :-</b> {height} cm
                  </li>
                )}
              </ul>
            ),
          },
        ]
        : []),

      ...(precautionaryNote || careInstructions
        ? [
          {
            title: "Precautionary & Care Instructions",
            id: "care",
            content: (
              <ul>
                {precautionaryNote && (
                  <li>
                    <b>Precautionary Note :-</b> {precautionaryNote}
                  </li>
                )}
                {careInstructions && (
                  <li>
                    <b>Care Instructions :-</b> {careInstructions}
                  </li>
                )}
              </ul>
            ),
          },
        ]
        : []),

      ...(warranty
        ? [
          {
            title: "Warranty",
            id: "warranty",
            content: (
              <ul>
                <li>{warranty}</li>
              </ul>
            ),
          },
        ]
        : []),
    ],
    [
      length,
      width,
      weight,
      height,
      precautionaryNote,
      careInstructions,
      warranty,
    ],
  );

  const { firstHalf, secondHalf } = useMemo(() => {
    const middleIndex = Math.ceil(accordionItems.length / 2);
    return {
      firstHalf: accordionItems.slice(0, middleIndex),
      secondHalf: accordionItems.slice(middleIndex),
    };
  }, [accordionItems]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!product || !product.category_id) return;
    const categoryPath =
      findCategoryPath(megaMenuData, product.category_id) || [];

    const fullPath = [
      ...categoryPath,
      {
        name: product.title || "Untitled Product",
        path: `/product/${product.unique_code || product.id}`,
      },
    ];
    dispatch(setBreadcrumbs(fullPath));
  }, [product, megaMenuData, dispatch]);

  const checkProductShippability = useCallback(
    async (currentPostcode: string) => {
      if (!currentPostcode || !product) return;

      setShippingStatus("checking");
      setShippingCharge(null);

      try {
        const productIdentifier =
          selectedVariant?.sku || product.sku || product.id;

        const response = await calculateShipping({
          postcode: currentPostcode,
          product_identifier: productIdentifier,
        }).unwrap();

        if (
          response.shipping_cost === "ns" ||
          response.shipping_cost === null
        ) {
          setShippingCharge(null);
          setShippingStatus("unavailable");
          toast.error("Delivery is not available in your selected region");
        } else {
          const shippingCost = Number.parseFloat(response.shipping_cost) || 0;
          setShippingCharge(shippingCost);
          setShippingStatus("available");
        }
      } catch {
        setShippingCharge(null);
        setShippingStatus("unavailable");
        toast.error("Invalid Pincode");
      }
    },
    [calculateShipping, product, selectedVariant],
  );

  const checkProductShippabilityRef = useRef(checkProductShippability);
  useEffect(() => {
    checkProductShippabilityRef.current = checkProductShippability;
  });

  useEffect(() => {
    if (!postcode || !product) return;
    let active = true;
    const id = setTimeout(() => {
      if (active) checkProductShippabilityRef.current(postcode);
    }, 0);
    return () => {
      active = false;
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postcode, selectedVariant?.id, product?.id]);

  const { mainPrice, wasPrice, saveAmount, discountPercentage } = useMemo(
    () => getPriceDetails(product, selectedVariant),
    [product, selectedVariant],
  );

  const handleDisabledAddToCart = () => {
    if (isAddingToCart) return;
    toast.error("Please select all required variants!");
  };

  const remainingAttributeFields = attributeNames
    .filter(
      (attrName) =>
        attrName !== "color" && attrName !== "colour" && attrName !== "style",
    )
    .map((attrName) => {
      const availableOptions = (filteredAttributes[attrName] || []) as {
        value: string;
        stock: number | undefined;
      }[];

      const attrLabel = attrName.charAt(0).toUpperCase() + attrName.slice(1);

      return (
        <div key={attrName} className="flex flex-col gap-2">
          <span className="pdp-field-label">
            {attrLabel} : <span>{selectedAttributes[attrName] || ""}</span>
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {availableOptions.map((item) => {
              const isSelected = selectedAttributes[attrName] === item.value;
              const isOutOfStockOption = (item.stock ?? 0) <= 0;

              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => handleAttributeChange(attrName, item.value)}
                  disabled={isOutOfStockOption}
                  title={item.value}
                  className={`min-w-[30px] h-[30px] lg:min-w-10 lg:h-10 px-2 flex items-center justify-center border rounded-[8px] text-[14px] font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isSelected
                    ? "border-[#FD151B] text-[#FD151B]"
                    : "border-[#CCCCCC] text-[#1D265F]/50"
                    }`}
                >
                  {item.value}
                </button>
              );
            })}
          </div>
        </div>
      );
    });

  return (
    <div className="lg:pt-[13px]">
      <div className="lg:px-[40px]">
        <Breadcrumb />
        <div className="pdp-columns flex flex-wrap lg:flex-nowrap justify-start lg:gap-3 lg:items-start">
          <div className="flex flex-col gap-[20px] w-full lg:min-w-0 lg:flex-1 lg:max-w-[1540px]">
            <div className="flex flex-wrap w-full xl:flex-nowrap gap-5 min-[1280px]:h-[600px] min-[1500px]:h-[700px] ">
              <div className="w-full px-[10px] lg:px-0 min-[1280px]:h-[600px] min-[1500px]:h-[700px] min-[1440px]:basis-[calc(60%_-_12px)] min-[1440px]:grow-0 min-[1440px]:shrink-0 min-[1440px]:max-w-[746px] min-[1540px]:self-stretch">
                <ProductGallery
                  product={product}
                  selectedVariant={selectedVariant}
                  isWishlisted={!isOutOfStock && isProductInWishlist}
                  onWishlistToggle={(e) => {
                    if (isOutOfStock) {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.error("This product is out of stock");
                      return;
                    }
                    handleWishlistButtonClick(e);
                  }}
                  isWishlistLoading={isWishlistLoading}
                />
              </div>

              <div className="w-full px-[10px] lg:px-0 min-[1366px]:max-w-[400px] min-[1440px]:max-w-[420px] flex flex-col gap-3 lg:gap-[3px] xl:max-[1540px]:max-h-[800px] 2xl:max-w-[640px]">
                <div className="flex items-start justify-between gap-2">
                  <div className="mr-2 pb-1.5">
                    <div className="flex items-center gap-2">
                      {product.promotion_name && (
                        <div>
                          <StatusBadge
                            label="SALE"
                            color={BadgeColor.BlueDark}
                            icon={
                              <Image
                                src="/images/sale.svg"
                                alt="sale"
                                width={14}
                                height={14}
                                className="brightness-0 invert"
                              />
                            }
                          />
                        </div>
                      )}
                      {(selectedVariant
                        ? selectedVariant.stock
                        : product.stock) !== undefined &&
                        (selectedVariant
                          ? selectedVariant.stock
                          : product.stock)! > 0 &&
                        (selectedVariant
                          ? selectedVariant.stock
                          : product.stock)! < 5 && (
                          <StatusBadge
                            label="LOW STOCK"
                            color={BadgeColor.BlueDark}
                            icon={
                              <Image
                                src="/images/low-stock.svg"
                                alt="Low Stock"
                                width={14}
                                height={14}
                                className="brightness-0 invert"
                              />
                            }
                          />
                        )}
                    </div>
                    <h5 className="fluid-text-14-20 font-medium text-black leading-[20px] lg:leading-[30px]">
                      {productTitle || "Product Title"}
                    </h5>
                    <p className="mt-1 font-bold fluid-text-12-14 leading-[18px] text-[#162DC3]">
                      <Link href={`/brand/${product.brand_slug}`}>
                        <span className="text-[#535766]">By</span>{" "}
                        {product.brand_name || "Brand Name"}
                      </Link>
                    </p>
                  </div>
                </div>
                <div className="border-t border-[#ECECEC]" />
                <div className="flex flex-col gap-[15px] lg:gap-5 lg:py-3">
                  <div className="flex items-baseline gap-3 flex-wrap leading-[18px]">
                    <span className="fluid-text-20-36 leading-[20px] font-bold text-[#FD151B]">
                      ${formatPrice(mainPrice)}
                    </span>
                    <span className="fluid-text-14-24  font-medium text-[#535766] line-through self-center">
                      ${formatPrice(wasPrice)}
                    </span>
                  </div>
                  <span className="fluid-text-12-14 leading-[16px] lg:leading-[26px] font-semibold">
                    <span className="bg-[#EEF8F0] inline-flex w-[84px] h-[30px] text-center items-center justify-center  text-[#267A03]  font-bold  rounded-[5px]">
                      You Save :
                    </span>
                    <span className="ml-2 text-[#267A03] font-bold">
                      $ {formatPrice(saveAmount)} (
                      {discountPercentage.toFixed(0)}% Off )
                    </span>
                  </span>
                </div>
                {hasRealColors && <div className="border-t border-[#ECECEC]" />}
                {hasRealColors && (
                  <div className="lg:py-2 flex flex-col gap-[10px]">
                    <div>
                      <div className="flex text-[13px] lg:text-[14px] font-bold text-[#1D265F] leading-[24px] items-center justify-between mb-2">
                        <span>
                          Color :{" "}
                          <span>
                            {selectedAttributes[colorAttrName!] || ""}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-[4px] flex-wrap">
                        {colorSwatchOptions.slice(0, 4).map((c) => (
                          <button
                            type="button"
                            key={c.value}
                            onClick={() =>
                              handleAttributeChange(colorAttrName!, c.value)
                            }
                            disabled={(c.stock ?? 0) <= 0}
                            aria-label={c.value}
                            title={c.value}
                            className={`m-1 w-8 h-8 rounded-full border border-[#6B6B6B]/30 overflow-hidden cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${selectedAttributes[colorAttrName!] === c.value
                              ? "border-2 shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                              : ""
                              }`}
                          >
                            <Image
                              src={c.image}
                              alt={c.value}
                              width={32}
                              height={32}
                              className="img-cover"
                            />
                          </button>
                        ))}

                        {colorSwatchOptions.length > 4 && (
                          <>
                            <Button
                              onClick={() => setShowPopup(true)}
                              type="button"
                              className="fluid-text-12-14 ml-auto font-bold text-[#0B38D7] underline cursor-pointer shrink-0 inline-flex items-center gap-1 leading-[18px]"
                            >
                              More{" "}
                              <ChevronDownIcon className="shrink-0" size={13} />
                            </Button>

                            <ColorPopup
                              open={showPopup}
                              onClose={() => setShowPopup(false)}
                              colors={colorSwatchOptions}
                              selectedColor={selectedAttributes[colorAttrName!]}
                              onSelectColor={(color) => {
                                handleAttributeChange(colorAttrName!, color);
                                setShowPopup(false);
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {remainingAttributeFields}
                  </div>
                )}

                {hasRealStyles && <div className="border-t border-[#ECECEC]" />}
                {hasRealStyles && (
                  <div className="lg:py-2 flex flex-col gap-[10px]">
                    <div className="flex text-[13px] lg:text-[14px] font-bold text-[#1D265F] leading-[24px] items-center justify-between mb-2">
                      <span>
                        Style :{" "}
                        <span>{selectedAttributes[styleAttrName!] || ""}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-[15px] flex-wrap">
                      {realStyleOptions.map((option) => {
                        const optionVariant = findVariantForAttrValue(
                          styleAttrName!,
                          option.value,
                        );
                        const {
                          mainPrice: optionMainPrice,
                          wasPrice: optionWasPrice,
                          showWasPrice: optionShowWasPrice,
                        } = getPriceDetails(product, optionVariant);
                        const isSelected =
                          selectedAttributes[styleAttrName!] === option.value;
                        const isOutOfStockOption = (option.stock ?? 0) <= 0;

                        return (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() =>
                              handleAttributeChange(
                                styleAttrName!,
                                option.value,
                              )
                            }
                            disabled={isOutOfStockOption}
                            title={option.value}
                            className="flex flex-col items-center gap-1 rounded-[8px] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <div
                              className={`w-[47px] h-[48px] rounded-full border-[#6B6B6B] overflow-hidden flex items-center justify-center shrink-0 transition-all ${isSelected
                                ? "border-2 shadow-[0_0_8px_rgba(107,107,107,0.5)]"
                                : "border"
                                }`}
                            >
                              <Image
                                src={
                                  optionVariant
                                    ? getVariantImage(optionVariant, "pdptmb")
                                    : "/images/image-coming-soon.jpg"
                                }
                                alt={option.value}
                                width={47}
                                height={48}
                                className="img-cover"
                              />
                            </div>
                            <span className="inline-flex flex-col text-[12px] tracking-[0px]">
                              <span className="font-bold text-[#FD151B]">
                                ${formatPrice(optionMainPrice)}
                              </span>
                              {optionShowWasPrice && (
                                <span className="font-normal line-through text-[#535766]">
                                  ${formatPrice(optionWasPrice)}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t border-[#ECECEC]" />
                {!hasRealColors && remainingAttributeFields}

                {!isOutOfStock && (
                  <div className="lg:hidden text-[13px] leading-[18px]">
                    <p className="font-bold text-[#1D265F]">
                      Delivery Fee - ${formatPrice(shippingCharge)}
                    </p>

                    <p className="font-normal text-[#535766]">
                      {getEstimatedDeliveryRange(
                        product.handling_time_days || 0,
                        product.handling_time_max_days,
                      )}
                    </p>
                  </div>
                )}
                <div className="lg:hidden flex border-t border-[#ECECEC]" />
                <div className="lg:hidden flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={15}
                        strokeWidth={2.5}
                        className="text-[#FD151B]"
                      />
                      <div className="flex flex-col leading-[16px]">
                        <span className="fluid-text-xs font-bold text-[#1D265F]">
                          Deliver To{" "}
                          {mounted
                            ? selectedLocation
                              ? [
                                selectedLocation.suburb,
                                selectedLocation.pincode,
                              ]
                                .filter(Boolean)
                                .join(" ")
                              : postcode
                                ? [suburb, postcode].filter(Boolean).join(" ")
                                : "New York 10001"
                            : "New York 10001 "}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLocationPopup(true)}
                      className="text-[14px] font-bold text-[#0B38D7]  cursor-pointer shrink-0"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <div className="lg:hidden flex  border-t border-[#ECECEC]" />
                <div className="lg:hidden flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="product-quantity"
                      className="pdp-field-label"
                    >
                      Quantity:
                    </label>
                  </div>
                  {(() => {
                    const maxQty = Math.max(
                      1,
                      Math.min(
                        10,
                        (selectedVariant
                          ? selectedVariant.stock
                          : product.stock) || 0,
                      ),
                    );

                    return (
                      <div
                        id="product-quantity"
                        className="flex items-center justify-between w-[120px] h-[42px] border border-[#999999]/20 rounded-[8px] px-4"
                      >
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="pdp-stepper-btn"
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <span className="fluid-text-sm font-bold text-black">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((q) => Math.min(maxQty, q + 1))
                          }
                          className="pdp-stepper-btn"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    );
                  })()}
                </div>
                <div className="lg:hidden flex border-t border-[#ECECEC]" />
                <div className="lg:hidden flex flex-col gap-3">
                  {(() => {
                    const hasVariants =
                      product.variants && product.variants.length > 0;

                    const shouldDisableAddToCart =
                      (hasVariants && !selectedVariant) ||
                      shippingStatus === "unavailable";

                    if (isOutOfStock) {
                      return (
                        <Button
                          disabled
                          className="w-full h-[46px] rounded-full bg-gray-300 text-white font-semibold cursor-not-allowed"
                          debounceDelay={0}
                        >
                          Out of Stock
                        </Button>
                      );
                    }

                    return (
                      <>
                        <Button
                          disabled={
                            isAddingToCart || shippingStatus === "unavailable"
                          }
                          onClick={
                            shouldDisableAddToCart || isAddingToCart
                              ? handleDisabledAddToCart
                              : handleCartButtonClick
                          }
                          className={`w-full h-[46px] rounded-full font-semibold text-white transition-colors cursor-pointer
              ${isProductInCart ? "bg-[#FD151B]" : "bg-[#FD151B]"}
              ${shouldDisableAddToCart ? "opacity-50 cursor-not-allowed" : ""}
            `}
                          aria-disabled={shouldDisableAddToCart}
                          debounceDelay={500}
                        >
                          {isAddingToCart
                            ? "Adding..."
                            : isProductInCart
                              ? "Go to Cart"
                              : "Add to Cart"}
                        </Button>

                        <Button
                          onClick={handleBuyNow}
                          disabled={shippingStatus === "unavailable"}
                          className="w-full h-[46px] rounded-full font-semibold text-[#FD151B] border border-[#FD151B] bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          debounceDelay={500}
                        >
                          Buy Now
                        </Button>
                      </>
                    );
                  })()}
                </div>
                <div className="lg:hidden flex mx-auto text-[12px] text-center font-medium text-[#657689] leading-[20px] ">
                  <ShieldCheck /> Guaranteed Safe & Secured Checkout
                </div>
                <div className="lg:hidden flex flex-wrap gap-2 justify-center">
                  {[
                    "visa",
                    "payment",
                    "american",
                    "paypal",
                    "afterpay",
                    "zip",
                  ].map((img) => (
                    <div
                      key={img}
                      className=" rounded h-[15px] flex items-center justify-center bg-white"
                    >
                      <Image
                        src={`/images/${img}.svg`}
                        alt={img}
                        width={38}
                        height={15}
                        loading="lazy"
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
                {productFeatures.length > 0 && (
                  <div className="hidden lg:flex flex-col lg:pt-2">
                    <span className="fluid-text-sm font-bold leading-[19px] text-[#333333]">
                      Features :
                    </span>
                    <ul className="list-disc pl-5 mt-2 flex flex-col gap-2 fluid-text-xs leading-[24px] text-[#333333]">
                      {productFeatures.slice(0, 6).map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Link href="/shop-with-peace">
              <div className="lg:hidden flex w-full">
                <Image
                  src="/images/shop-with-confidence.svg"
                  alt="Shop with Confidence"
                  width={381}
                  height={270}
                  className="w-full h-auto block px-[10px] lg:px-0"
                />
              </div>
            </Link>

            {product.bundle_group_code &&
              product.bundle_products &&
              product.bundle_products.length > 0 && (
                <BundleSection bundleProducts={product.bundle_products} />
              )}
            <div>
              <RecommendedForYou
                personalized={finalRecommendations}
                recentlyViewed={recentlyViewed}
                isLoading={isRecommendedForYouLoading}
              />
            </div>

            <div className="xl:hidden flex flex-col gap-5 w-full min-[1440px]:max-w-[1388px] min-[1440px]:sticky min-[1440px]:self-start `">
              <ProductDetailsMobileTabs
                featuresContent={getFeaturesContent(product, {
                  hideHeading: true,
                })}
                descriptionContent={
                  <div style={{ textAlign: "left" }}>
                    {/* <h6
                      className="descrpt-title px-[10px] lg:px-0 text-left"
                    >
                      Product Description
                    </h6> */}
                    <div className="product-content">
                      <div
                        className="product-description-content font-normal text-[14px] leading-[30px] tracking-[0px] align-middle text-black px-[10px] lg:px-0"
                        style={{ textAlign: "left", marginTop: "15px" }}
                      >
                        {renderContent(product.description) ||
                          "ShopperBeats continues to stand as the planet premier shopping destination..."}
                        <div className="text-[12px] sm:text-[12px] text-[#F51721] mt-4 sm:mt-12 font-normal px-[10px] lg:px-0">
                          PROP65 Warning: This product contains a chemical known to the State of California to cause cancer.
                          Decorations and accessories are not included. Images shown are only a representation and may vary.
                        </div>
                      </div>
                    </div>
                  </div>
                }
                deliveryContent={getDeliveryTabContent(product)}
                reviews={product.reviews || []}
              />
            </div>
            <div className="hidden xl:flex w-full min-[1440px]:min-h-[489px] border border-[#ECECEC] rounded-[7px] p-5 flex-col gap-4">
              <div className="product-tabs">
                <ul className="flex items-center gap-1" role="tablist">
                  {productTabItems.map(({ key, label }, index) => (
                    <li
                      key={key}
                      ref={(el) => {
                        tabRefs.current[index] = el;
                      }}
                      role="tab"
                      aria-selected={activeTab === key}
                      tabIndex={activeTab === key ? 0 : -1}
                      className={`flex items-center justify-center h-[45px] px-6 rounded-[30px] border border-[#ECECEC] cursor-pointer whitespace-nowrap transition-colors font-bold fluid-text-sm leading-[17px] tracking-[0px] text-center align-middle ${activeTab === key
                        ? "bg-[#FD151B] text-white shadow-[5px_5px_15px_0px_rgba(0,0,0,0.05)]"
                        : "bg-white text-[#000000]"
                        }`}
                      onClick={() => handleTabClick(key, index)}
                      onKeyDown={(e) => handleTabKeyDown(e, index)}
                    >
                      {label}
                    </li>
                  ))}
                </ul>
                <div className="tab-content">
                  {activeTab === "description" && (
                    <>
                      <div className="tab-pane product-description">
                        <div style={{ textAlign: "left" }}>
                          {/* <h6
                            className="descrpt-title"
                            style={{ textAlign: "left", marginTop: "10px" }}
                          >
                            Product Description
                          </h6> */}
                          <div className="product-content">
                            <div
                              className="product-description-content font-normal text-[14px] leading-[30px] tracking-[0px] align-middle text-black"
                              style={{ textAlign: "left", marginTop: "15px" }}
                            >
                              {renderContent(product.description) ||
                                "ShopperBeats continues to stand as the planet premier shopping destination..."}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid-4-8 mt-6 leading-8">
                        <Accordion items={firstHalf} variation={2} />

                        <Accordion items={secondHalf} variation={2} />
                      </div>
                    </>
                  )}{" "}
                  {activeTab === "delivery" && (
                    <div className="tab-pane">
                      {getDeliveryTabContent(product)}
                    </div>
                  )}
                  {activeTab === "warranty" && (
                    <div className="tab-pane">{warrantyAndReturnContent}</div>
                  )}
                </div>
              </div>

              <div className="text-[11px] sm:text-[12px] text-[#F51721] mt-auto font-normal">
                PROP65 Warning: This product contains a chemical known to the State of California to cause cancer.
                Decorations and accessories are not included. Images shown are only a representation and may vary.
              </div>
            </div>

            {(product.reviews?.length ?? 0) > 0 && (
              <div className="hidden xl:block">
                <CustomerRatingViewPage reviews={product.reviews} />
              </div>
            )}
          </div>

          <div className="hidden lg:flex flex-col gap-5 w-full lg:w-[300px] lg:shrink-0 xl:w-[381px] lg:sticky lg:top-32 lg:self-start pdp-sidebar-col">
            <div className="w-full lg:min-h-[489px] border border-[#F8F8F8] shadow shadow-[#000000]/10 rounded-[7px] p-5 flex flex-col gap-4 pdp-sidebar-card">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="pdp-price fluid-text-20-36 leading-[18px] font-bold text-[#FD151B]">
                  ${formatPrice(mainPrice)}
                </span>
              </div>

              {!isOutOfStock && (
                <p className="pdp-delivery-fee font-bold text-[#1D265F] text-[14px]">
                  Delivery Fee - ${formatPrice(shippingCharge)}{" "}
                  <span className="pdp-delivery-date fluid-text-xs font-normal text-[#1A2553] leading-[20px]">
                    (
                    {getEstimatedDeliveryRange(
                      product.handling_time_days || 0,
                      product.handling_time_max_days,
                    )}
                    )
                  </span>
                </p>
              )}

              <div className="pdp-section-divider"></div>

              <div className="flex flex-col gap-2 pdp-deliver-row">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={16}
                      strokeWidth={2.5}
                      className="text-[#FD151B]"
                    />
                    <div className="flex flex-col leading-[18px]">
                      <span className="pdp-field-label">
                        Deliver To
                      </span>
                      <span className="pdp-field-label">
                        {mounted
                          ? selectedLocation
                            ? [
                              selectedLocation.suburb,
                              selectedLocation.pincode,
                            ]
                              .filter(Boolean)
                              .join(" ")
                            : postcode
                              ? [suburb, postcode].filter(Boolean).join(" ")
                              : "New York 10001"
                          : "New York 10001"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLocationPopup(true)}
                    className="pdp-change-btn fluid-text-xs font-bold text-[#0B38D7]  cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="pdp-section-divider"></div>

              <div className="flex flex-col gap-1.5 pdp-qty-row">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="product-quantity"
                    className="pdp-field-label"
                  >
                    Quantity:
                  </label>
                </div>
                {(() => {
                  const maxQty = Math.max(
                    1,
                    Math.min(
                      10,
                      (selectedVariant
                        ? selectedVariant.stock
                        : product.stock) || 0,
                    ),
                  );

                  return (
                    <div
                      id="product-quantity"
                      className="flex items-center justify-between w-[120px] h-[42px] border border-[#F8F8F8] rounded-[8px] px-4 pdp-qty-stepper"
                    >
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="pdp-stepper-btn"
                        aria-label="Decrease quantity"
                      >
                        &minus;
                      </button>
                      <span className="pdp-qty-value text-[14px] font-bold text-black">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(maxQty, q + 1))
                        }
                        className="pdp-stepper-btn"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  );
                })()}
              </div>
              <div className="pdp-section-divider"></div>

              {shippingStatus === "unavailable" && (
                <p className="pdp-shipping-warning text-red-500 text-[13px] -mt-2">
                  This product cannot be shipped to your selected region.
                </p>
              )}

              <div className="flex flex-col gap-3 pdp-cta-group">
                {(() => {
                  const hasVariants =
                    product.variants && product.variants.length > 0;

                  const shouldDisableAddToCart =
                    (hasVariants && !selectedVariant) ||
                    shippingStatus === "unavailable";

                  if (isOutOfStock) {
                    return (
                      <Button
                        disabled
                        className="pdp-cta-btn w-full h-[46px] rounded-full bg-gray-300 text-white font-semibold cursor-not-allowed"
                        debounceDelay={0}
                      >
                        Out of Stock
                      </Button>
                    );
                  }

                  return (
                    <>
                      <Button
                        disabled={
                          isAddingToCart || shippingStatus === "unavailable"
                        }
                        onClick={
                          shouldDisableAddToCart || isAddingToCart
                            ? handleDisabledAddToCart
                            : handleCartButtonClick
                        }
                        className={`pdp-cta-btn w-full h-[46px] rounded-full font-semibold text-white transition-colors cursor-pointer
              ${isProductInCart ? "bg-[#FD151B]" : "bg-[#FD151B]"}
              ${shouldDisableAddToCart ? "opacity-50 cursor-not-allowed" : ""}
            `}
                        aria-disabled={shouldDisableAddToCart}
                        debounceDelay={500}
                      >
                        {isAddingToCart
                          ? "Adding..."
                          : isProductInCart
                            ? "Go to Cart"
                            : "Add to Cart"}
                      </Button>

                      <Button
                        onClick={handleBuyNow}
                        disabled={shippingStatus === "unavailable"}
                        className="pdp-cta-btn w-full h-[46px] rounded-full font-semibold text-[#FD151B] border border-[#FD151B] bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        debounceDelay={500}
                      >
                        Buy Now
                      </Button>
                    </>
                  );
                })()}
              </div>

              <div className="pdp-safe-checkout flex mx-auto items-center gap-2 fluid-text-xs text-center font-medium text-[#657689] leading-[20px]  ">
                <ShieldCheck /> Guaranteed Safe & Secured Checkout
              </div>

              <div>
                <div className="pdp-payment-icons flex flex-wrap gap-2 justify-center">
                  {[
                    "visa",
                    "payment",
                    "american",
                    "paypal",
                    "afterpay",
                    "zip",
                  ].map((img) => (
                    <div
                      key={img}
                      className=" rounded h-[15px] flex items-center justify-center bg-white"
                    >
                      <Image
                        src={`/images/${img}.svg`}
                        alt={img}
                        width={38}
                        height={15}
                        loading="lazy"
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/shop-with-peace">
              <Image
                src="/images/shop-with-confidence.svg"
                alt="Shop with Confidence"
                width={381}
                height={270}
                className="hidden lg:block w-full h-auto mb-6"
              />
            </Link>
          </div>
        </div>
      </div>

      {showDeliveryPopup && (
        <DeliveryDetailsPopup
          onClose={closeDeliveryPopup}
          freeShipping={shippingCharge === 0 || !!product.free_shipping}
          handlingTimeDays={Number(product.handling_time_days) || 0}
          fastDelivery={product?.fast_dispatch || false}
          {...(shippingCharge !== null &&
            shippingCharge > 0 && { shippingCharge })}
        />
      )}

      <LocationPopup
        open={showLocationPopup}
        onClose={() => setShowLocationPopup(false)}
        selectedAddressId={selectedAddressId}
        onApply={(data) => {
          updatePostcode(data.pincode, data.suburb || "");
          setSelectedLocation({
            pincode: data.pincode,
            suburb: data.suburb,
            state: data.state,
          });
          setSelectedAddressId(data.addressId);
          setShippingCharge(null);
        }}
      />

      <CartCheckoutDrawer
        open={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        items={cart?.items || []}
        subtotal={cart?.subtotal ?? cart?.items_total ?? 0}
        shippingCost={cart?.shipping || 0}
        hasShippableItem={!!cartHasShippableItem}
        localQtyMap={localQtyMap}
        isUpdating={isUpdatingCartItem}
        isRemoving={isRemovingCartItem}
        onIncrement={handleCartDrawerIncrement}
        onDecrement={handleCartDrawerDecrement}
        onRemove={handleCartDrawerRemove}
        onCheckout={() => router.push("/check-out")}
      />
    </div>
  );
}
