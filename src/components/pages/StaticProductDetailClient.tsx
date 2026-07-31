"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  ChevronDownIcon,
  Clock,
  MapPin,
  Pencil,
  ShieldCheck,
} from "lucide-react";

import Button from "@/components/common/Button";
import CartCheckoutDrawer from "@/components/cart/CartCheckoutDrawer";
import ProductGallery from "../product-listing/ProductGallery";
import Accordion from "../common/Accordion";
import Breadcrumb from "@/components/common/Breadcrumb";
import ProductDetailsMobileTabs from "./ProductDetailsMobileTabs";
import DeliveryDetailsPopup from "../ui/DeliveryDetailsPopup";
import ColorPopup from "./ColorPopup";
import LocationPopup from "./LocationPopup";
import SizeGuidePopup from "./SizeGuidePopup";
import CustomerRatingViewPage from "./CustomerRatingViewPage";
import StaticRecommendedForYou from "../homepage/StaticRecommendedForYou";
import NoProductsFound from "@/components/NoProductFound";

import { renderContent, cleanText } from "@/lib/utils/render-content";
import { useVariantSelection } from "@/lib/hooks/use-variant-selection";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { useStaticCart } from "@/lib/hooks/useStaticCart";
import { useStaticWishlist } from "@/lib/hooks/useStaticWishlist";
import type { StaticCartItem } from "@/lib/utils/staticStorage";
import type { CartItem } from "@/types/cart";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumb-slice";
import getEstimatedDeliveryRange from "@/lib/utils/get-estimated-delivery-range";
import { getDeliveryTabContent } from "@/components/ui/product-tab-content";
import {
  formatPrice,
  getImageUrl,
  getPriceDetails,
  getVariantImage,
} from "@/lib/utils/main-utils";
import {
  findStaticBreadcrumbPath,
  getStaticProductDetail,
  getStaticProductShippingCost,
  getStaticRelatedProducts,
} from "@/lib/utils/staticCategoryData";

export default function StaticProductDetailClient({ slug }: { slug: string }) {
  const product = useMemo(() => getStaticProductDetail(slug), [slug]);

  const router = useRouter();
  const dispatch = useDispatch();

  const { postcode, suburb, updatePostcode } = useGlobalPostcode();
  const { addToCart, items: cartItems, updateQuantity, removeItem } = useStaticCart();
  const { toggleItem, isWishlisted: checkWishlisted } = useStaticWishlist();
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const {
    attributeNames,
    selectedAttributes,
    selectedVariant,
    filteredAttributes,
    handleAttributeChange,
  } = useVariantSelection(product?.variants || []);

  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    pincode: string;
    suburb: string;
    state?: string;
  } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!product) return;
    const categoryPath = findStaticBreadcrumbPath(product.category_slug);
    dispatch(
      setBreadcrumbs([
        ...categoryPath,
        {
          name: product.title || "Untitled Product",
          path: `/static-product/${product.unique_code || product.id}`,
        },
      ]),
    );
  }, [product, dispatch]);

  const hasVariants = (product?.variants?.length ?? 0) > 0;
  const productKey = product ? `static-${product.id}` : "";
  const isWishlisted = product ? checkWishlisted(product.id || "") : false;

  const isProductInCart = useMemo(
    () => cartItems.some((item) => item.product_id === productKey),
    [cartItems, productKey],
  );

  const colorAttrName = attributeNames.find(
    (name) => name === "color" || name === "colour",
  );
  const realColorOptions = useMemo(
    () => (colorAttrName ? filteredAttributes[colorAttrName] || [] : []),
    [colorAttrName, filteredAttributes],
  );
  const hasRealColors = realColorOptions.length > 0;

  const colorSwatchOptions = useMemo(
    () =>
      realColorOptions.map((c) => {
        const variant = product?.variants?.find((v) =>
          v.attributes.some(
            (a) =>
              a.name.toLowerCase() === colorAttrName && a.value === c.value,
          ),
        );
        return {
          ...c,
          image: variant
            ? getVariantImage(variant, "pdptmb")
            : "/images/image-coming-soon.jpg",
        };
      }),
    [realColorOptions, colorAttrName, product],
  );

  const remainingAttributeFields = attributeNames
    .filter((attrName) => attrName !== "color" && attrName !== "colour")
    .map((attrName) => {
      const availableOptions = (filteredAttributes[attrName] || []) as {
        value: string;
        stock: number | undefined;
      }[];
      const attrLabel = attrName.charAt(0).toUpperCase() + attrName.slice(1);
      const isSizeAttribute = attrName === "size";

      return (
        <div key={attrName} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className=" text-[14px]  font-bold text-[#1D265F]">
              {attrLabel}
              {selectedAttributes[attrName] && (
                <span> : {selectedAttributes[attrName]}</span>
              )}
            </label>

            {isSizeAttribute && (
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="inline-flex items-center gap-1 whitespace-nowrap underline text-[14px] font-bold leading-[14px] text-[#0B38D7] cursor-pointer"
              >
                <Pencil size={16} className="shrink-0" />
                Size Guide
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {availableOptions.map((item) => {
              const isSelected = selectedAttributes[attrName] === item.value;
              const isOutOfStockOption = (item.stock ?? 0) <= 0;

              return (
                <button
                  type="button"
                  key={item.value}
                  disabled={isOutOfStockOption}
                  onClick={() => handleAttributeChange(attrName, item.value)}
                  aria-label={item.value}
                  title={item.value}
                  className={`w-auto px-2 h-10 rounded-[8px] border text-[14px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    isSelected
                      ? "border-[#FD151B] text-[#FD151B]"
                      : "border-[#CCCCCC] text-[#1D265F]/50"
                  }`}
                >
                  {item.value}
                </button>
              );
            })}
          </div>

          {isSizeAttribute && (
            <SizeGuidePopup
              open={showSizeGuide}
              onClose={() => setShowSizeGuide(false)}
            />
          )}
        </div>
      );
    });

  const estimatedDeliveryRange = getEstimatedDeliveryRange(
    product?.ships_from_location,
    product?.handling_time_days || 0,
  );

  const productTabItems = [{ key: "description", label: "Description" }];

  const handleTabClick = (tab: string, index: number) => {
    setActiveTab(tab);
    tabRefs.current[index]?.focus();
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const tabCount = productTabItems.length;
    let newIndex = index;

    if (e.key === "ArrowRight") newIndex = (index + 1) % tabCount;
    else if (e.key === "ArrowLeft")
      newIndex = (index - 1 + tabCount) % tabCount;
    else if (e.key === "Home") newIndex = 0;
    else if (e.key === "End") newIndex = tabCount - 1;

    if (newIndex !== index) {
      setActiveTab(productTabItems[newIndex].key);
      tabRefs.current[newIndex]?.focus();
    }
  };

  if (!product) {
    return (
      <div className="py-10">
        <NoProductsFound />
      </div>
    );
  }

  const isOutOfStock = hasVariants
    ? selectedVariant
      ? (selectedVariant.stock ?? 0) <= 0
      : false
    : (product.stock ?? 0) <= 0;

  const productTitle = (() => {
    if (!selectedVariant?.attributes?.length) return product.title || "";
    const attributeValues = selectedVariant.attributes
      .filter((attr) => attr.value?.trim())
      .map((attr) => attr.value)
      .join(" | ");
    return attributeValues
      ? `${product.title} ${attributeValues}`
      : product.title || "";
  })();

  const { mainPrice, wasPrice, saveAmount, discountPercentage } =
    getPriceDetails(product, selectedVariant);

  const shippingCharge = getStaticProductShippingCost(product);

  const productFeatures = (product.key_features || "")
    .split(/<br\s*\/?>|\r?\n/gi)
    .map((item) => cleanText(item))
    .filter(Boolean);

  const specifications = product.specifications || [];

  const accordionItems = [
    ...(specifications.length > 0
      ? [
          {
            title: "Specifications",
            id: "specifications",
            content: (
              <ul>
                {specifications.map((spec) => (
                  <li key={spec.label}>
                    <b>{spec.label} :-</b> {spec.value}
                  </li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
    ...(product.care_instructions
      ? [
          {
            title: "Precautionary & Care Instructions",
            id: "care",
            content: (
              <ul>
                <li>
                  <b>Care Instructions :-</b> {product.care_instructions}
                </li>
              </ul>
            ),
          },
        ]
      : []),
    ...(product.warranty
      ? [
          {
            title: "Warranty",
            id: "warranty",
            content: (
              <ul>
                <li>{product.warranty}</li>
              </ul>
            ),
          },
        ]
      : []),
  ];

  const middleIndex = Math.ceil(accordionItems.length / 2);
  const firstHalf = accordionItems.slice(0, middleIndex);
  const secondHalf = accordionItems.slice(middleIndex);

  const relatedProducts = getStaticRelatedProducts(product, 10);

  const handleWishlistButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const wasWishlisted = isWishlisted;
    toggleItem({
      id: product.id || "",
      image: getImageUrl(product, "public"),
      brand_name: product.brand_name || "No Brand",
      title: productTitle,
      mainPrice,
      wasPrice,
      saveAmount,
      shippingCharge,
      isOutOfStock,
    });
    toast.success(
      wasWishlisted
        ? "Product removed from wishlist!"
        : "Product added to wishlist!",
    );
  };

  const addStaticProductToCartLocal = () => {
    addToCart({
      id: product.id || "",
      image: getImageUrl(product, "public"),
      brand_name: product.brand_name || "No Brand",
      title: productTitle,
      mainPrice,
      wasPrice,
      saveAmount,
      shippingCharge,
      isOutOfStock,
    });
  };

  const handleDisabledAddToCart = () => {
    toast.error("Please select all required variants!");
  };

  const handleCartButtonClick = () => {
    if (isProductInCart) {
      setIsCartDrawerOpen(true);
      return;
    }
    if (hasVariants && !selectedVariant?.id) {
      toast.error("Choose your preferred option before adding to cart!");
      return;
    }
    addStaticProductToCartLocal();
    toast.success("Product added to cart!");
    setIsCartDrawerOpen(true);
  };

  const toDrawerCartItem = (item: StaticCartItem): CartItem => ({
    id: item.id,
    product_id: item.product_id,
    variant_id: item.variant_id || "",
    variant_attributes: item.variant_attributes || [],
    quantity: item.quantity,
    unit_price: String(item.unit_price),
    rrp_price_snapshot: String(item.rrp_price_snapshot),
    product_name: item.product_name,
    discount_percentage: item.discount_percentage,
    discounted_price: item.discounted_price,
    oldPrice: String(item.oldPrice),
    discount: String(item.discount),
    final_price: item.final_price,
    subtotal: item.subtotal,
    shipping_cost: item.shipping_cost,
    is_shippable: item.is_shippable,
    handling_time_days: item.handling_time_days,
    images: item.images,
    tags: [],
  });

  const drawerCartItems = cartItems.map(toDrawerCartItem);
  const drawerSubtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const drawerShippingCost = cartItems.reduce((acc, item) => acc + item.shipping_cost, 0);
  const drawerHasShippableItem = cartItems.some((item) => item.is_shippable);

  const handleBuyNow = () => {
    if (hasVariants && !selectedVariant?.id) {
      toast.error("Choose your preferred option before buying !");
      return;
    }
    addStaticProductToCartLocal();
    router.push("/cart");
  };

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
                  isWishlisted={isWishlisted}
                  onWishlistToggle={handleWishlistButtonClick}
                />
              </div>

              <div className="w-full min-[1440px]:basis-[calc(43%_-_12px)] min-[1440px]:grow-0 min-[1440px]:shrink-0 min-[1440px]:max-w-[580px] flex flex-col gap-3 lg:gap-[3px] xl:max-[1540px]:max-h-[800px] 2xl:basis-[45%] 2xl:grow-0 2xl:shrink-0 2xl:max-w-[680px]">
                <div className="flex items-start justify-between gap-2">
                  <div className="mr-2 pb-1.5">
                    <div className="flex items-center gap-2">
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
                    </div>
                    <h5 className="text-[14px] lg:text-[20px] font-medium text-black leading-[20px] lg:leading-[30px]">
                      {productTitle || "Product Title"}
                    </h5>

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
                  <div className="lg:py-2 flex flex-col gap-[12px]">
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
                            className={`m-1 w-8 h-8 rounded-full border border-[#6B6B6B]/30 overflow-hidden cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              selectedAttributes[colorAttrName!] === c.value
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
                              className="text-[12px] lg:text-[14px] ml-auto font-bold text-[#0B38D7] underline cursor-pointer shrink-0 inline-flex items-center gap-1 leading-[18px]"
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

                <div className="border-t border-[#ECECEC]" />
                {!hasRealColors && remainingAttributeFields}

                {!isOutOfStock && (
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
                )}
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
                      className="pdp-field-label"
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
                        <span className="text-[14px] font-bold text-black">
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
                    const shouldDisableAddToCart =
                      hasVariants && !selectedVariant;

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
                          onClick={
                            shouldDisableAddToCart
                              ? handleDisabledAddToCart
                              : handleCartButtonClick
                          }
                          className={`w-full h-[46px] rounded-full font-semibold text-white transition-colors cursor-pointer bg-[#FD151B] ${
                            shouldDisableAddToCart
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          aria-disabled={shouldDisableAddToCart}
                          debounceDelay={500}
                        >
                          {isProductInCart ? "Go to Cart" : "Add to Cart"}
                        </Button>

                        <Button
                          onClick={handleBuyNow}
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
                <div className="lg:hidden flex flex-wrap gap-2">
                  {[
                    "visa",
                    "payment",
                    "american",
                    "paypal",
                    "afterpay",
                    "zip",
                  ].map((img) => (
                    <div className="pdp-qty-box" key={img}>
                      <Image
                        src={`/images/${img}.svg`}
                        alt={img}
                        width={50}
                        height={25}
                      />
                    </div>
                  ))}
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

            <Link href="/shop-with-peace">
              <div className="lg:hidden flex w-full">
                <Image
                  src="/images/shop-with-confidence.svg"
                  alt="Shop with Confidence"
                  width={381}
                  height={270}
                  className="w-full h-auto block"
                />
              </div>
            </Link>

            <div>
              <StaticRecommendedForYou products={relatedProducts} />
            </div>

            <div className="xl:hidden flex flex-col gap-5 w-full min-[1440px]:max-w-[1388px] min-[1440px]:sticky min-[1440px]:self-start">
              <ProductDetailsMobileTabs
                featuresContent={null}
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
                        className="product-description-content font-normal text-[14px] leading-[30px] tracking-[0px] align-middle text-black"
                        style={{ textAlign: "left", marginTop: "15px" }}
                      >
                        {renderContent(product.description)}
                      </div>
                    </div>
                  </div>
                }
                deliveryContent={getDeliveryTabContent(product)}
                reviews={product.reviews || []}
              />
            </div>
            <div className="hidden xl:flex w-full min-[1440px]:min-h-auto border border-[#ECECEC] rounded-[7px] p-5 flex-col gap-4">
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
                      className={`flex items-center justify-center h-[45px] px-6 rounded-[30px] border border-[#ECECEC] cursor-pointer whitespace-nowrap transition-colors font-bold text-[14px] leading-[17px] tracking-[0px] text-center align-middle ${
                        activeTab === key
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
                          <h6
                            className="descrpt-title"
                            style={{ textAlign: "left", marginTop: "10px" }}
                          >
                            Product Description
                          </h6>
                          <div className="product-content">
                            <div
                              className="product-description-content font-normal text-[14px] leading-[30px] tracking-[0px] align-middle text-black"
                              style={{ textAlign: "left", marginTop: "15px" }}
                            >
                              {renderContent(product.description)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {accordionItems.length > 0 && (
                        <div className="grid-4-8 mt-6 leading-8">
                          <Accordion items={firstHalf} variation={2} />
                          <Accordion items={secondHalf} variation={2} />
                        </div>
                      )}
                    </>
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

              {!isOutOfStock && (
                <p className="font-bold text-[#1D265F] text-[14px]">
                  Delivery Fee - ${formatPrice(shippingCharge)}{" "}
                  <span className="text-[14px] font-normal text-[#1A2553] leading-[20px]">
                    ({estimatedDeliveryRange})
                  </span>
                </p>
              )}

              <div className="pdp-section-divider"></div>

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
                      <span className="pdp-field-label">Deliver To</span>
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

              <div className="pdp-section-divider"></div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="product-quantity-desktop"
                    className="pdp-field-label"
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
                      id="product-quantity-desktop"
                      className="flex items-center justify-between w-[120px] h-[42px] border border-[#F8F8F8] rounded-[8px] px-4"
                    >
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="pdp-stepper-btn"
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

              <div className="flex flex-col gap-3">
                {(() => {
                  const shouldDisableAddToCart =
                    hasVariants && !selectedVariant;

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
                        onClick={
                          shouldDisableAddToCart
                            ? handleDisabledAddToCart
                            : handleCartButtonClick
                        }
                        className={`w-full h-[46px] rounded-full font-semibold text-white transition-colors cursor-pointer bg-[#FD151B] ${
                          shouldDisableAddToCart
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        aria-disabled={shouldDisableAddToCart}
                        debounceDelay={500}
                      >
                        {isProductInCart ? "Go to Cart" : "Add to Cart"}
                      </Button>

                      <Button
                        onClick={handleBuyNow}
                        className="w-full h-[46px] rounded-full font-semibold text-[#FD151B] border border-[#FD151B] bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        debounceDelay={500}
                      >
                        Buy Now
                      </Button>
                    </>
                  );
                })()}
              </div>

              <div className=" flex mx-auto items-center gap-2 text-[12px] text-center font-medium text-[#657689] leading-[20px]  ">
                <ShieldCheck /> Guaranteed Safe & Secured Checkout
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "visa",
                    "payment",
                    "american",
                    "paypal",
                    "afterpay",
                    "zip",
                  ].map((img) => (
                    <div className="pdp-qty-box-lg" key={img}>
                      <Image
                        src={`/images/${img}.svg`}
                        alt={img}
                        width={50}
                        height={25}
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
                className="hidden lg:block w-full h-auto"
              />
            </Link>
          </div>
        </div>
      </div>

      {showDeliveryPopup && (
        <DeliveryDetailsPopup
          onClose={() => setShowDeliveryPopup(false)}
          freeShipping={shippingCharge === 0 || !!product.free_shipping}
          handlingTimeDays={Number(product.handling_time_days) || 0}
          fastDelivery={product?.fast_dispatch || false}
          {...(shippingCharge > 0 && { shippingCharge })}
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
        }}
      />

      <CartCheckoutDrawer
        open={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        items={drawerCartItems}
        subtotal={drawerSubtotal}
        shippingCost={drawerShippingCost}
        hasShippableItem={drawerHasShippableItem}
        localQtyMap={{}}
        isUpdating={false}
        isRemoving={false}
        onIncrement={(item) => updateQuantity(item.product_id, item.quantity + 1)}
        onDecrement={(item) => {
          if (item.quantity <= 1) return;
          updateQuantity(item.product_id, item.quantity - 1);
        }}
        onRemove={(id) => removeItem(id)}
        onCheckout={() => router.push("/cart")}
      />
    </div>
  );
}
