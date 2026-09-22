"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { ChevronDownIcon, MapPin, ShieldCheck } from "lucide-react";

import Button from "@/components/common/Button";
import Accordion from "../common/Accordion";
import { BadgeColor, StatusBadge } from "../common/StatusBadge";
import ProductGallery from "../product-listing/ProductGallery";
import BundleSection from "../ui/BundleSection";
import RecommendedForYou from "../homepage/RecommendedForYou";
import ColorPopup from "./ColorPopup";
import CustomerRatingViewPage from "./CustomerRatingViewPage";
import ProductDetailsMobileTabs from "./ProductDetailsMobileTabs";
import {
  getFeaturesContent,
  getDeliveryTabContent,
  warrantyAndReturnContent,
} from "@/components/ui/product-tab-content";
import { renderContent } from "@/lib/utils/render-content";
import {
  formatPrice,
  getEstimatedDeliveryRange,
  getPriceDetails,
  getVariantImage,
} from "@/lib/utils/main-utils";
import type { ProductDetailContentProps } from "@/types/product";

export default function ProductDetailContent({
  product,
  productTitle,
  selectedVariant,
  selectedAttributes,
  handleAttributeChange,
  findVariantForAttrValue,
  isProductInWishlist,
  isWishlistLoading,
  handleWishlistButtonClick,
  isOutOfStock,
  mainPrice,
  wasPrice,
  saveAmount,
  discountPercentage,
  hasRealColors,
  hasRealStyles,
  colorAttrName,
  styleAttrName,
  colorSwatchOptions,
  realStyleOptions,
  showPopup,
  setShowPopup,
  remainingAttributeFields,
  shippingCharge,
  shippingStatus,
  mounted,
  selectedLocation,
  postcode,
  suburb,
  setShowLocationPopup,
  quantity,
  setQuantity,
  isAddingToCart,
  isProductInCart,
  handleCartButtonClick,
  handleDisabledAddToCart,
  handleBuyNow,
  productFeatures,
  finalRecommendations,
  recentlyViewed,
  isRecommendedForYouLoading,
  productTabItems,
  activeTab,
  handleTabClick,
  handleTabKeyDown,
  tabRefs,
  firstHalf,
  secondHalf,
}: ProductDetailContentProps) {
  return (
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
            <div className="text-left">
            
              <div className="product-content">
                <div
                  className="product-description-content font-normal text-[14px] leading-[30px] tracking-[0px] align-middle text-black px-[10px] lg:px-0 text-left mt-[15px]"
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
                  <div className="text-left">
                   
                    <div className="product-content">
                      <div
                        className="product-description-content font-normal text-[14px] leading-[30px] tracking-[0px] align-middle text-black text-left mt-[15px]"
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
  );
}
