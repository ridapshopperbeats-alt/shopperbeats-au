"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";

import Button from "@/components/common/Button";
import {
  formatPrice,
  getEstimatedDeliveryRange,
} from "@/lib/utils/main-utils";
import type { ProductDetailSidebarProps } from "@/types/product";


export default function ProductDetailSidebar({
  product,
  selectedVariant,
  isOutOfStock,
  mainPrice,
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
}: ProductDetailSidebarProps) {
  return (
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
  );
}
