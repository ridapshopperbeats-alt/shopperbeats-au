"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  useAddToCartMutation,
  useCreateWishlistMutation,
  useGetCartQuery,
  useGetWishlistQuery,
  useRemoveFromCartMutation,
  useRemoveFromWishlistMutation,
  useUpdateCartItemQuantityMutation,
} from "@/lib/redux/apis/cart-api";
import CartCheckoutDrawer from "@/components/cart/CartCheckoutDrawer";
import { CartItem } from "@/types/cart";
import {
  useGetProductBySlugQuery,
  useGetRecommendationsQuery,
} from "@/lib/redux/apis/products-api";
import { useCalculateShippingMutation } from "@/lib/redux/apis/order-api";
import Image from "next/image";
import ProductGallery from "../productListing/ProductGallery";
import { toast } from "react-toastify";

import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Product, Category } from "@/types/product";
import { ProductSEO } from "@/types/seo";
import Accordion from "../ui/Accordion";
import ProductDetailsMobileTabs from "./ProductDetailsMobileTabs";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumb-slice";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { findCategoryPath, getPriceDetails, getImageUrl, getVariantImage, formatPrice } from "@/lib/utils/main-utils";
import DeliveryDetailsPopup from "../ui/DeliveryDetailsPopup";
import {
  renderContent,
  cleanText,
  parseProductHTML,
} from "@/lib/utils/render-content";
import { useVariantSelection } from "@/lib/hooks/use-variant-selection";
import { WishlistKey } from "@/types/wishlist";
import BundleSection from "../ui/BundleSection";
import { useSEO } from "@/contexts/SEOContext";
import {
  getFeaturesContent,
  getDeliveryTabContent,
  warrantyAndReturnContent,
  getProductDetailsContent,
  getItemsDetailsContent,
  getStyleGuideContent,
} from "@/components/ui/product-tab-content";
import Link from "next/link";
import getEstimatedDeliveryRange from "@/lib/utils/get-estimated-delivery-range";
import { ChevronDownIcon, Clock, MapPin } from "lucide-react";
import ColorPopup from "./ColorPopup";
import LocationPopup from "./LocationPopup";
import CustomerRatingViewPage from "./CustomerRatingViewPage";
import StarRating from "../ui/StarRating";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import GppGoodOutlinedIcon from "@mui/icons-material/GppGoodOutlined";

const KNOWN_COMPACT_SIZE_TOKENS = new Set([
  "xxs",
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "xxxl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "sm",
  "md",
  "lg",
]);

const subscribeNoop = () => () => {};

function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

function isCompactAttributeValue(rawValue: string): boolean {
  const value = rawValue.trim();
  if (!value) return false;

  const normalized = value.toLowerCase().replace(/\s+/g, "");
  if (KNOWN_COMPACT_SIZE_TOKENS.has(normalized)) return true;

  if (/^\d+(\.\d+)?\s*[a-z]{0,4}$/i.test(value)) return true;

  return false;
}

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
  popularProducts: Product[] | null;
  megaMenuData: Category[];
  slug: string;
  seo?: ProductSEO;
  recentlyViewed?: Product[] | null;
}) {
  const { data: latestProduct } = useGetProductBySlugQuery(slug, {
    skip: !slug,
  });
  const product = latestProduct || initialProduct;

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
    const mainImage = getImageUrl(product);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, seo]);
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
  }, [slug, product.variants, setSelectedVariant, setSelectedAttributes]);

  const [createWishlist, { isLoading: isAddingToWishlist }] =
    useCreateWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemoving }] =
    useRemoveFromWishlistMutation();
  const [calculateShipping] = useCalculateShippingMutation();

  const { postcode, suburb, updatePostcode } = useGlobalPostcode();
  const { data: cart } = useGetCartQuery(
    postcode ? { postcode: postcode } : undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  // ---------------- CART CHECKOUT DRAWER ----------------
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [removeCartItem, { isLoading: isRemovingCartItem }] =
    useRemoveFromCartMutation();
  const [updateCartItemQuantity, { isLoading: isUpdatingCartItem }] =
    useUpdateCartItemQuantityMutation();
  const [localQtyMap, setLocalQtyMap] = useState<Record<string, string>>({});

  const [lastSyncedCart, setLastSyncedCart] = useState(cart);
  if (cart !== lastSyncedCart) {
    setLastSyncedCart(cart);
    if (cart?.items) {
      let changed = false;
      const next = { ...localQtyMap };
      cart.items.forEach((item) => {
        if (next[item.id] === undefined) {
          next[item.id] = String(item.quantity);
          changed = true;
        }
      });
      if (changed) {
        setLocalQtyMap(next);
      }
    }
  }

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
    refetchOnMountOrArgChange: false,
  });

  const [localWishlistItems, setLocalWishlistItems] = useState<WishlistKey[]>(
    [],
  );
  const [wishlistLoaded, setWishlistLoaded] = useState(false);

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

  // Load the fetched wishlist into local state exactly once (the
  // `wishlistLoaded` flag guards it so subsequent renders don't overwrite
  // local optimistic updates). Adjusted during render instead of inside a
  // useEffect, per https://react.dev/learn/you-might-not-need-an-effect.
  if (wishlistData?.items && !wishlistLoaded) {
    setLocalWishlistItems(wishlistData.items);
    setWishlistLoaded(true);
  }

  const router = useRouter();

  const isProductInWishlist = localWishlistItems.some((item) => {
    const isSameProduct = item.product_id === product.id;
    if (!selectedVariant) {
      return isSameProduct;
    }
    return isSameProduct && item.variant_id === selectedVariant.id;
  });

  const handleWishlistButtonClick = useCallback(async () => {
    const hasVariants = product?.variants && product.variants.length > 0;

    if (hasVariants && !selectedVariant?.id) {
      toast.error("Choose your preferred option before adding to wishlist!");
      return;
    }
    if (!product?.id || isAddingToWishlist || isRemoving) return;
    const variantId = selectedVariant?.id ?? null;
    const productId = product.id;
    const wasInWishlist = isProductInWishlist;

    if (wasInWishlist) {
      setLocalWishlistItems((prev) =>
        prev.filter(
          (item) =>
            !(item.product_id === product.id && item.variant_id === variantId),
        ),
      );
    } else {
      setLocalWishlistItems((prev) => [
        ...prev,
        { product_id: productId, variant_id: variantId },
      ]);
    }

    try {
      if (wasInWishlist) {
        await removeFromWishlist({
          product_id: product.id,
          variant_id: selectedVariant?.id,
        }).unwrap();
        toast.success("Product removed from wishlist!");
      } else {
        await createWishlist({
          product_id: product.id,
          variant_id: selectedVariant?.id,
        }).unwrap();
        toast.success("Product added to wishlist!");
      }
    } catch {
      toast.error("Failed to update wishlist.");
      if (!product?.id) return;
      const revertProductId: string = product.id;
      const revertVariantId: string | null = selectedVariant?.id ?? null;
      if (wasInWishlist) {
        setLocalWishlistItems((prev) => [
          ...prev,
          { product_id: revertProductId, variant_id: revertVariantId },
        ]);
      } else {
        setLocalWishlistItems((prev) =>
          prev.filter(
            (item) =>
              !(
                item.product_id === product.id &&
                item.variant_id === selectedVariant?.id
              ),
          ),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    product?.id,
    selectedVariant?.id,
    isProductInWishlist,
    createWishlist,
    removeFromWishlist,
    isAddingToWishlist,
    isRemoving,
  ]);

  const [quantity, setQuantity] = useState(1);

  const [showPopup, setShowPopup] = useState(false);

  const colorAttrName = attributeNames.find(
    (name) => name === "color" || name === "colour",
  );
  const realColorOptions = colorAttrName
    ? filteredAttributes[colorAttrName] || []
    : [];
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

  const [activeTab, setActiveTab] = useState("description");
  const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const productTabItems = [
    { key: "description", label: "Description" },
    { key: "delivery", label: "Delivery" },
    { key: "warranty", label: "Warranty and Return" },
  ];
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

        router.push("/checkout");
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

  const accordionItems = [
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

    //  Show Warranty only if exists
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
  ];
  const mergedAccordions = [...accordionItems];
  const middleIndex = Math.ceil(mergedAccordions.length / 2);

  const firstHalf = mergedAccordions.slice(0, middleIndex);
  const secondHalf = mergedAccordions.slice(middleIndex);
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

  const { mainPrice, wasPrice, saveAmount, discountPercentage } =
    useMemo(
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

      const isCompactAttribute =
        availableOptions.length > 0 &&
        availableOptions.every((item) => isCompactAttributeValue(item.value));

      if (isCompactAttribute) {
        return (
          <div key={attrName} className="flex flex-col gap-2">
            <span className="text-[14px] font-bold text-[#1D265F]">
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
      }

      return (
        <div key={attrName} className="flex flex-col gap-1.5">
          <label className="text-[14px] font-medium text-black">
            {attrLabel}
          </label>
          <Select
            value={selectedAttributes[attrName] || undefined}
            onValueChange={(value) => handleAttributeChange(attrName, value)}
          >
            <SelectTrigger className="h-[32px] w-full max-w-[230px] rounded-[20px] border border-[#001325]/64 bg-white px-4 shadow-none focus:ring-0">
              <SelectValue placeholder={`Select ${attrLabel}`} />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="w-[240px] max-w-[230px] border !border-[#F6F6F6] bg-white p-2 shadow-[#000000]/25 rounded-[5px] ring-0 outline-none focus:outline-none focus:ring-0 text-[14px] font-normal leading-[17px] "
            >
              {availableOptions.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  disabled={(item.stock ?? 0) <= 0}
                >
                  {item.value}
                  {(item.stock ?? 0) <= 0 ? " (Out of Stock)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    });

  return (
    <div className="lg:pt-[13px]">
      <div className="container">
        <Breadcrumb />
        <div className="pdp-columns flex flex-wrap lg:flex-nowrap justify-start lg:gap-3 lg:items-start">
          <div className="flex flex-col gap-[20px] w-full lg:min-w-0 lg:flex-1 lg:max-w-[1540px]">
            <div className="flex flex-wrap w-full xl:flex-nowrap gap-5 xl:h-[700px]">
              <div className="w-full min-[1440px]:basis-[calc(55%_-_12px)] min-[1440px]:grow-0 min-[1440px]:shrink-0 min-[1440px]:max-w-[746px] xl:max-[1439px]:h-[700px] min-[1540px]:self-stretch">
                <ProductGallery
                  product={product}
                  selectedVariant={selectedVariant}
                  isWishlisted={isProductInWishlist}
                  onWishlistToggle={handleWishlistButtonClick}
                  isWishlistLoading={isAddingToWishlist || isRemoving}
                />
              </div>

              <div className="w-full min-[1440px]:basis-[calc(43%_-_12px)] min-[1440px]:grow-0 min-[1440px]:shrink-0 min-[1440px]:max-w-[580px] flex flex-col gap-3 lg:gap-[3px] xl:max-[1540px]:max-h-[800px] 2xl:basis-[45%] 2xl:grow-0 2xl:shrink-0 2xl:max-w-[680px]">
                <div className="flex items-start justify-between gap-2">
                  <div className="mr-2 pb-1.5">
                    <div className="flex items-center gap-2">
                      {product.promotion_name && (
                        <div className="promotion-badge">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/sale.svg"
                            alt="Sale"
                            className="badge-img"
                          />
                          <span className="badge-text">SALE</span>
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
                          <div className="promotion-badge low-stock-badge">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/images/low-stock.svg"
                              alt="Low Stock"
                              className="badge-img"
                            />
                            <span className="badge-text">LOW STOCK</span>
                          </div>
                        )}

                      {/* {product.tags && product.tags.length > 0 && (
                        <div className="promotion-badge tag-badge">
                          <Button className="btn-yellow btn-outline btn-rounded promotion-tag">
                            {product.tags[0]}
                          </Button>
                        </div>
                      )} */}
                    </div>
                    <h5 className="text-[14px] lg:text-[20px] font-medium text-black leading-[20px] lg:leading-[30px]">
                      {productTitle || "Product Title"}
                    </h5>

                    <div className="flex items-center w-auto h-[18px] gap-1">
                      {(product.review_stats?.average_rating ?? 0) > 0 && (
                        <StarRating
                          rating={product.review_stats?.average_rating ?? 0}
                          size={17}
                        />
                      )}
                      <span className="text-[14px] leading-[18px] font-bold text-[#162DC3]">
                        {product.review_stats?.total_reviews ?? 0} Reviews
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-[12px] lg:text-[14px] leading-[18px] text-[#162DC3]">
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
                    <span className="text-[20px] lg:text-[36px] leading-[20px] font-bold text-[#FD151B]">
                      ${formatPrice(mainPrice)}
                    </span>
                    <span className="text-[14px] lg:text-[24px]  font-medium text-[#535766] line-through self-center">
                      ${formatPrice(wasPrice)}
                    </span>
                  </div>
                  <span className="text-[12px] lg:text-[14px] leading-[16px] lg:leading-[26px] font-semibold">
                    <span className="bg-[#EEF8F0] inline-flex w-[84px] h-[30px] text-center items-center justify-center  text-[#267A03]  font-bold  rounded-[5px]">
                      You Save :
                    </span>
                    <span className="ml-2 text-[#267A03]">
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
                        {realColorOptions.slice(0, 4).map((c) => (
                          <button
                            type="button"
                            key={c.value}
                            onClick={() =>
                              handleAttributeChange(colorAttrName!, c.value)
                            }
                            disabled={(c.stock ?? 0) <= 0}
                            aria-label={c.value}
                            title={c.value}
                            className={`m-1 w-8 h-8 rounded-full cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${selectedAttributes[colorAttrName!] === c.value
                              ? "shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                              : ""
                              }`}
                            style={{
                              backgroundColor: c.value
                                .toLowerCase()
                                .replace(/\s+/g, ""),
                            }}
                          />
                        ))}

                        {realColorOptions.length > 4 && (
                          <>
                            <Button
                              onClick={() => setShowPopup(true)}
                              type="button"
                              className="text-[12px] lg:text-[14px] ml-auto font-bold text-[#0B38D7] underline cursor-pointer shrink-0 inline-flex items-center gap-1 leading-[18px]"
                            >
                              More{" "}
                              <ChevronDownIcon className="shrink-0" size={13} />
                            </Button>

                            <ColorPopup
                              open={showPopup}
                              onClose={() => setShowPopup(false)}
                              colors={realColorOptions}
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
                                    ? getVariantImage(optionVariant)
                                    : "/images/image-coming-soon.jpg"
                                }
                                alt={option.value}
                                width={47}
                                height={48}
                                className="w-full h-full object-cover"
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

                <div className="lg:hidden text-[13px] leading-[18px]">
                  <p className="font-bold text-[#1D265F]">
                    Delivery Fee - ${formatPrice(shippingCharge)}
                  </p>

                  <p className="font-normal text-[#535766]">
                    {getEstimatedDeliveryRange(
                      product.ships_from_location,
                      product.handling_time_days || 0,
                    )}
                  </p>
                </div>
                <div className="lg:hidden flex border-t border-[#ECECEC]" />
                <div className="lg:hidden flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={20}
                        className="shrink-0 text-[#FD151B]"
                        fill="#FD151B"
                        stroke="#FFFFFF"
                      />
                      <div className="flex flex-col leading-[16px]">
                        <span className="text-[12px] font-bold text-[#1D265F]">
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
                                : "Melbourne 3000"
                            : "Melbourne 3000"}
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
                      className="text-[14px] font-bold text-[#1D265F]"
                    >
                      Quantity:
                    </label>
                    {(() => {
                      const stockValue = selectedVariant
                        ? selectedVariant.stock
                        : product.stock;

                      return stockValue !== undefined &&
                        stockValue !== null &&
                        stockValue > 0 &&
                        stockValue < 10 ? (
                        <span className="text-[12px]  font-bold text-[#FD151B]">
                          <Clock
                            size={16}
                            className="inline-flex mb-1 font-bold"
                          />{" "}
                        </span>
                      ) : null;
                    })()}
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
                          className="text-[18px] leading-none font-bold text-black cursor-pointer select-none"
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <span className="text-[14px] font-bold text-black">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((q) => Math.min(maxQty, q + 1))
                          }
                          className="text-[18px] leading-none font-bold text-black cursor-pointer select-none"
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
                  <GppGoodOutlinedIcon /> Guaranteed Safe & Secured Checkout
                </div>
                <div className="lg:hidden flex flex-wrap gap-2">
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    {" "}
                    <Image
                      src="/images/visa.svg"
                      alt="Visa"
                      width={50}
                      height={25}
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    <Image
                      src="/images/payment.svg"
                      alt="Payment"
                      width={50}
                      height={25}
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    <Image
                      src="/images/american.svg"
                      alt="American Express"
                      width={50}
                      height={25}
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    <Image
                      src="/images/paypal.svg"
                      alt="PayPal"
                      width={50}
                      height={25}
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    {" "}
                    <Image
                      src="/images/afterpay.svg"
                      alt="Afterpay"
                      width={50}
                      height={25}
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    {" "}
                    <Image
                      src="/images/zip.svg"
                      alt="Zip"
                      width={50}
                      height={25}
                    />
                  </div>
                </div>
                {productFeatures.length > 0 && (
                  <div className="hidden lg:flex flex-col lg:pt-2">
                    <span className="text-[16px] font-bold leading-[19px] text-[#333333]">
                      Features :
                    </span>
                    <ul className="list-disc pl-5 mt-2 flex flex-col gap-2 text-[14px] leading-[24px] text-[#333333]">
                      {productFeatures.slice(0, 6).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:hidden flex w-full">
              <Image
                src="/images/shop-with-confidence.svg"
                alt="Shop with Confidence"
                width={381}
                height={270}
                className="w-full h-auto block"
              />
            </div>

            {product.bundle_group_code &&
              product.bundle_products &&
              product.bundle_products.length > 0 && (
                <BundleSection bundleProducts={product.bundle_products} />
              )}

              

            <div className="xl:hidden flex flex-col gap-5 w-full min-[1440px]:max-w-[1388px] min-[1440px]:sticky min-[1440px]:self-start">
              <ProductDetailsMobileTabs
                featuresContent={getFeaturesContent(product, {
                  hideHeading: true,
                })}
                descriptionContent={
                  <div style={{ textAlign: "left" }}>
                    <h6
                      className="descrpt-title"
                      style={{ textAlign: "left", marginTop: "10px" }}
                    >
                      Product Description
                    </h6>
                    <div className="product-content">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          width: "100%",
                        }}
                      >
                        <Image
                          src={getImageUrl(product)}
                          alt="Product Image"
                          width={100}
                          height={500}
                          loading="lazy"
                          className="w-full h-[500px] object-contain"
                        />
                      </div>

                      <div
                        className="product-description-content font-normal text-[14px] leading-[30px] tracking-[0px] align-middle text-black"
                        style={{ textAlign: "left", marginTop: "15px" }}
                      >
                        {renderContent(product.description) ||
                          "ShopperBeats continues to stand as the planet premier shopping destination..."}
                      </div>
                    </div>
                  </div>
                }
                productDetailsContent={getProductDetailsContent(product)}
                styleContent={getStyleGuideContent(product)}
                itemsDetailsContent={getItemsDetailsContent(product)}
                reviews={product.reviews || []}
              />
            </div>
            <div className="hidden xl:flex w-full min-[1440px]:min-h-[489px] border border-[#ECECEC] rounded-[7px] p-5 flex-col gap-4">
              <div className="product-tabs">
                <ul className="flex items-center gap-1">
                  {productTabItems.map(({ key, label }) => (
                    <li
                      key={key}
                      className={`flex items-center justify-center h-[45px] px-6 rounded-[30px] border border-[#ECECEC] cursor-pointer whitespace-nowrap transition-colors font-bold text-[14px] leading-[17px] tracking-[0px] text-center align-middle ${activeTab === key
                        ? "bg-[#FD151B] text-white shadow-[5px_5px_15px_0px_rgba(0,0,0,0.05)]"
                        : "bg-white text-[#000000]"
                        }`}
                      onClick={() => handleTabClick(key)}
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
                          <h6
                            className="descrpt-title"
                            style={{ textAlign: "left", marginTop: "10px" }}
                          >
                            Product Description
                          </h6>
                          <div className="product-content">
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                width: "100%",
                              }}
                            >
                              <Image
                                src={getImageUrl(product)}
                                alt="Product Image"
                                width={100}
                                height={500}
                                loading="lazy"
                                className="w-full h-[500px] object-contain"
                              />
                            </div>

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
            </div>

            {(product.reviews?.length ?? 0) > 0 && (
              <CustomerRatingViewPage reviews={product.reviews} />
            )}
          </div>

          <div className="hidden lg:flex flex-col gap-5 w-full lg:w-[300px] lg:shrink-0 xl:w-[381px] lg:sticky lg:top-32 lg:self-start">
            <div className="w-full lg:min-h-[489px] border border-[#F8F8F8] shadow shadow-[#000000]/10 rounded-[7px] p-5 flex flex-col gap-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-[36px] leading-[18px] font-bold text-[#FD151B]">
                  ${formatPrice(mainPrice)}
                </span>
              </div>

              <p className="font-bold text-[#1D265F] text-[14px]">
                Delivery Fee - ${formatPrice(shippingCharge)}{" "}
                <span className="text-[14px] font-normal text-[#1A2553] leading-[20px]">
                  (
                  {getEstimatedDeliveryRange(
                    product.ships_from_location,
                    product.handling_time_days || 0,
                  )}
                  )
                </span>
              </p>

              <div className="-mx-5 border-t border-[#ECECEC]"></div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={20}
                      className="shrink-0 text-[#FD151B]"
                      fill="#FD151B"
                      stroke="#FFFFFF"
                    />
                    <div className="flex flex-col leading-[18px]">
                      <span className="text-[14px] font-bold text-[#1D265F]">
                        Deliver To
                      </span>
                      <span className="text-[14px] font-bold text-[#1D265F]">
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
                              : "Melbourne 3000"
                          : "Melbourne 3000"}
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

              <div className="-mx-5 border-t border-[#ECECEC]"></div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="product-quantity"
                    className="text-[14px] font-bold text-[#1D265F]"
                  >
                    Quantity:
                  </label>
                  {(() => {
                    const stockValue = selectedVariant
                      ? selectedVariant.stock
                      : product.stock;

                    return stockValue !== undefined &&
                      stockValue !== null &&
                      stockValue > 0 &&
                      stockValue < 10 ? (
                      <span className="text-[12px] font-bold text-[#FD151B]">
                        <Clock
                          size={16}
                          className="inline-flex mb-1 font-bold"
                        />{" "}
                        Only {stockValue} items left
                      </span>
                    ) : null;
                  })()}
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
                      className="flex items-center justify-between w-[120px] h-[42px] border border-[#F8F8F8] rounded-[8px] px-4"
                    >
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="text-[18px] leading-none font-bold text-black cursor-pointer select-none"
                        aria-label="Decrease quantity"
                      >
                        &minus;
                      </button>
                      <span className="text-[14px] font-bold text-black">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(maxQty, q + 1))
                        }
                        className="text-[18px] leading-none font-bold text-black cursor-pointer select-none"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  );
                })()}
              </div>
              <div className="-mx-5 border-t border-[#ECECEC]"></div>

              {/* Error message for non-shippable */}
              {shippingStatus === "unavailable" && (
                <p className="text-red-500 text-[13px] -mt-2">
                  This product cannot be shipped to your selected region.
                </p>
              )}

              <div className="flex flex-col gap-3">
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

              <div className="text-[12px] text-center font-medium text-[#657689] leading-[20px] ">
                <GppGoodOutlinedIcon /> Guaranteed Safe & Secured Checkout
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    {" "}
                    <Image
                      src="/images/visa.svg"
                      alt="Visa"
                      width={50}
                      height={25}
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    <Image
                      src="/images/payment.svg"
                      alt="Payment"
                      width={50}
                      height={25}
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    <Image
                      src="/images/american.svg"
                      alt="American Express"
                      width={50}
                      height={25}
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    <Image
                      src="/images/paypal.svg"
                      alt="PayPal"
                      width={50}
                      height={25}
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    {" "}
                    <Image
                      src="/images/afterpay.svg"
                      alt="Afterpay"
                      width={50}
                      height={25}
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white border-2 border-[#ededed] rounded-[5px] p-1 h-[36px] flex-1">
                    {" "}
                    <Image
                      src="/images/zip.svg"
                      alt="Zip"
                      width={50}
                      height={25}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Link href="/shop-with-peace">
              <Image
                src="/images/shop-with-confidence.svg"
                alt="Shop with Confidence"
                width={381}
                height={270}
                className="hidden lg:block w-full h-auto"
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
          updatePostcode(data.pincode, data.suburb || "Melbourne");
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
        onCheckout={() => router.push("/checkout")}
      />
    </div>
  );
}