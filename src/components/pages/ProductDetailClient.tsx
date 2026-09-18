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
import { toast } from "react-toastify";

import { useRouter } from "next/navigation";
import { Product, Category } from "@/types/product";
import { ProductSEO } from "@/types/seo";
import ProductDetailMain from "./ProductDetailMain";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumb-slice";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { useWishlistToggle } from "@/lib/hooks/use-wishlist-toggle";
import { useIsClient } from "@/lib/hooks/use-is-client";

import DeliveryDetailsPopup from "../ui/DeliveryDetailsPopup";
import {
  cleanText,
  parseProductHTML,
} from "@/lib/utils/render-content";
import { useVariantSelection } from "@/lib/hooks/use-variant-selection";
import { WishlistKey } from "@/types/wishlist";
import { useSEO } from "@/contexts/SEOContext";
import LocationPopup from "./LocationPopup";
import {
  findCategoryPath,
  getImageUrl,
  getPriceDetails,
  getVariantImage,
} from "@/lib/utils/main-utils";

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
      <ProductDetailMain
        product={product}
        productTitle={productTitle}
        selectedVariant={selectedVariant}
        selectedAttributes={selectedAttributes}
        handleAttributeChange={handleAttributeChange}
        findVariantForAttrValue={findVariantForAttrValue}
        isProductInWishlist={isProductInWishlist}
        isWishlistLoading={isWishlistLoading}
        handleWishlistButtonClick={handleWishlistButtonClick}
        isOutOfStock={isOutOfStock}
        mainPrice={mainPrice}
        wasPrice={wasPrice}
        saveAmount={saveAmount}
        discountPercentage={discountPercentage}
        hasRealColors={hasRealColors}
        hasRealStyles={hasRealStyles}
        colorAttrName={colorAttrName}
        styleAttrName={styleAttrName}
        colorSwatchOptions={colorSwatchOptions}
        realStyleOptions={realStyleOptions}
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        remainingAttributeFields={remainingAttributeFields}
        shippingCharge={shippingCharge}
        shippingStatus={shippingStatus}
        mounted={mounted}
        selectedLocation={selectedLocation}
        postcode={postcode}
        suburb={suburb}
        setShowLocationPopup={setShowLocationPopup}
        quantity={quantity}
        setQuantity={setQuantity}
        isAddingToCart={isAddingToCart}
        isProductInCart={isProductInCart}
        handleCartButtonClick={handleCartButtonClick}
        handleDisabledAddToCart={handleDisabledAddToCart}
        handleBuyNow={handleBuyNow}
        productFeatures={productFeatures}
        finalRecommendations={finalRecommendations}
        recentlyViewed={recentlyViewed}
        isRecommendedForYouLoading={isRecommendedForYouLoading}
        productTabItems={productTabItems}
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        handleTabKeyDown={handleTabKeyDown}
        tabRefs={tabRefs}
        firstHalf={firstHalf}
        secondHalf={secondHalf}
      />

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
