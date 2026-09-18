"use client";

import Image from "next/image";
import Link from "next/link";

import Button from "@/components/common/Button";
import {
  getPriceDetails,
  formatPrice,
  getImageUrl,
} from "@/lib/utils/main-utils";
import type { CheckoutOrderSummaryProps } from "@/types/checkout";


export default function CheckoutOrderSummary({
  isLoading,
  orderSummary,
  effectiveShipping,
  totalSaveAmount,
  promoData,
  finalTotal,
  isCreatingOrder,
  isProcessingPayment,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="w-full xl:!w-[570px] xl:shrink-0 order-2 flex flex-col gap-4 xl:sticky xl:top-32 h-auto">
      <div className="w-full xl:!w-full h-auto bg-white opacity-100 rounded-[7px] border border-[#F8F8F8] shadow-[0_0_4px_0_rgba(0,0,0,0.10)]">
        {isLoading ? (
          <div
            style={{
              minHeight: "400px",
            }}
          />
        ) : (
          <>
            <div className="hidden lg:flex lg:flex-col lg:h-full">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E5E5E5]">
                <h6 className="checkout-total-label">
                  Order Summary
                </h6>
                <Link href="/cart" className="">
                  <button className="fluid-text-xs font-semibold text-black underline leading-[normal]">
                    Edit Cart
                  </button>
                </Link>
              </div>

              {orderSummary.length > 0 && (
                <div
                  className="max-h-[320px] 2xl:max-h-[384px] overflow-y-auto overscroll-contain border-b border-[#E5E5E5] no-scrollbar shadow-[0px_0px_30px_0px_#00000014]"
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                >
                  {orderSummary.map((item) => {
                    const productForPriceDetails = {
                      price: item.unit_price,
                      rrp_price: item.rrp_price_snapshot,
                      discount_percentage: item.discount_percentage,
                      discounted_price: item.discounted_price,
                      oldPrice: item.oldPrice,
                      discount: item.discount,
                    };
                    const { mainPrice, wasPrice, showWasPrice } =
                      getPriceDetails(productForPriceDetails);

                    const isInactive = !item.is_active;
                    const isOutOfStock =
                      item.available_stock !== undefined &&
                      item.available_stock <= 0;
                    const isNotShippable = item.is_shippable === false;

                    const isUnavailable =
                      isInactive || isOutOfStock || isNotShippable;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 px-4 py-4 border-b border-[#E5E5E5] last:border-b-0 ${isUnavailable ? "opacity-50" : "opacity-100"}`}
                      >
                        {item.images && (
                          <Image
                            src={getImageUrl(item)}
                            alt={item.product_name}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-[4px] object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 alihn-items-center justify-between flex gap-2">
                          <p className="text-12px w-full max-w-[300px] font-semibold text-black line-clamp-2">
                            {item.product_name}
                          </p>
                          {isUnavailable && (
                            <span className="block text-[12px] text-red-600 mt-1">
                              {isInactive && "Not Available Currently"}
                              {isOutOfStock && "Out of Stock"}
                              {isNotShippable &&
                                "Not available for this location"}
                            </span>
                          )}
                          <p className="text-right text-[12px] font-semibold text-black my-4">
                            {item.quantity} ×{" "}
                            {showWasPrice && (
                              <span className="price old-price">
                                ${formatPrice(wasPrice)}
                              </span>
                            )}
                            <span className="price">
                              ${formatPrice(mainPrice)}
                            </span>
                          </p>
                         
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- New redesigned order summary totals (matches cart page) — disabled, kept for later use ---
              <div className="px-4 py-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="fluid-text-xs text-[#726969] font-normal capitalize leading-[normal]">
                    Original Listing Price (Total)
                  </span>
                  <p className="fluid-text-xs font-bold text-black leading-[normal]">
                    ${formatPrice(originalListingPrice)}
                  </p>
                </div>

                {discountTotal > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsDiscountExpanded((prev) => !prev)}
                      className="flex items-center justify-between w-full cursor-pointer"
                    >
                      <span className="flex items-center gap-1 fluid-text-xs font-normal text-[#16A249] capitalize leading-[normal]">
                        Discount
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform text-black ${isDiscountExpanded ? "rotate-180" : ""}`}
                        />
                      </span>
                      <p className="fluid-text-xs font-bold text-[#16A249] leading-[normal] capitalize">
                        -${formatPrice(discountTotal)}
                      </p>
                    </button>

                    {isDiscountExpanded && (
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="fluid-text-xs text-[#726969] font-normal capitalize leading-[normal]">
                            Marketplace Discount
                          </span>
                          <p className="fluid-text-xs text-[#000000] font-normal capitalize leading-[normal]">
                            ${formatPrice(itemSavings)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="fluid-text-xs text-[#726969] font-normal capitalize leading-[normal]">
                            Item Promotion Discount
                          </span>
                          <p className="fluid-text-xs text-[#000000] font-normal capitalize leading-[normal]">
                            ${formatPrice(promotionDiscount)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="fluid-text-xs text-[#726969] font-normal capitalize leading-[normal]">
                            Coupon Discount
                          </span>
                          <p className="fluid-text-xs text-[#000000] font-normal capitalize leading-[normal]">
                            ${formatPrice(couponDiscount)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-[8px] px-4 py-4 mt-2 bg-[#EFF9F0] flex items-center justify-between gap-2">
                  <span className="fluid-text-xs font-normal text-[#726969] capitalize leading-[normal]">
                    Price After Discount
                  </span>
                  <p className="fluid-text-xs font-bold text-[#16A249] leading-[normal] capitalize shrink-0">
                    ${formatPrice(priceAfterDiscount)}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => setIsTotalExpanded((prev) => !prev)}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <span className="flex items-center gap-1 fluid-text-xs font-normal text-[#726969] capitalize leading-[normal]">
                    Total Payable Amount
                    <ChevronDown
                      className={`w-4 h-4 transition-transform text-[#000000] ${isTotalExpanded ? "rotate-180" : ""}`}
                    />
                  </span>
                  <p className="fluid-text-xs lg:text-[18px] leading-[normal] font-bold text-[#000000] capitalize">
                    ${formatPrice(finalTotal)}
                  </p>
                </button>

                {isTotalExpanded && (
                  <div className="flex flex-col gap-2 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="fluid-text-xs font-normal text-[#726969] capitalize leading-[normal]">
                        Shipping
                      </span>
                      {effectiveShipping ? (
                        <p className="fluid-text-xs text-black font-normal capitalize leading-[normal]">
                          ${formatPrice(effectiveShipping)}
                        </p>
                      ) : (
                        <p className="fluid-text-xs font-normal text-[#16A249] capitalize leading-[normal]">
                          FREE
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="fluid-text-xs font-normal text-[#726969] capitalize leading-[normal]">
                        Tax
                      </span>
                      <p className="fluid-text-xs text-black font-normal capitalize leading-[normal]">
                        ${formatPrice(cart?.tax_total || 0)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              --- End new design --- */}

              <div className="px-4 py-4 flex flex-col gap-3 bg-white">
                <div className="flex items-center justify-between">
                  <p className="checkout-total-value text-[0.875rem]">Delivery</p>
                  <p className="text-[0.875rem] font-semibold mr-[5px]">
                    ${formatPrice(effectiveShipping)}
                  </p>
                </div>

                {totalSaveAmount + (promoData?.discount_amount || 0) >
                  0 && (
                  <div className="flex items-center justify-between">
                    <p className="checkout-total-value text-[0.875rem]">Savings</p>
                    <p className="text-[0.875rem] font-semibold mr-[5px] text-[#16A249]">
                      -$
                      {formatPrice(
                        totalSaveAmount + (promoData?.discount_amount || 0),
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-4 bg-[#F5F5F5] rounded-b-[8px]">
                <p className="checkout-total-label">
                  Total (incl. Tax)
                </p>
                <p className="price text-[1.125rem] font-semibold leading-[normal]">
                  ${formatPrice(finalTotal)}
                </p>
              </div>
            </div>

            {/* Mobile/md (below lg, <1024px) — compact Figma layout */}
            <div className="lg:hidden flex flex-col h-full">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E5E5E5]">
                <h6 className="checkout-total-label">
                  Order Summary
                </h6>
                <a
                  href="/cart"
                  className="fluid-text-xs font-semibold text-black underline"
                >
                  Edit Cart
                </a>
              </div>

              {orderSummary.length > 0 && (
                <div
                  className="max-h-[220px] md:max-h-[280px] overflow-y-auto overscroll-contain border-b border-[#E5E5E5]"
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                >
                  {orderSummary.map((item) => {
                    const { mainPrice } = getPriceDetails({
                      price: item.unit_price,
                      rrp_price: item.rrp_price_snapshot,
                      discount_percentage: item.discount_percentage,
                      discounted_price: item.discounted_price,
                      oldPrice: item.oldPrice,
                      discount: item.discount,
                    });

                    const isInactive = !item.is_active;
                    const isOutOfStock =
                      item.available_stock !== undefined &&
                      item.available_stock <= 0;
                    const isNotShippable = item.is_shippable === false;

                    const isUnavailable =
                      isInactive || isOutOfStock || isNotShippable;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 px-4 py-4 border-b border-[#E5E5E5] last:border-b-0 ${isUnavailable ? "opacity-50" : "opacity-100"}`}
                      >
                        {item.images && (
                          <Image
                            src={getImageUrl(item)}
                            alt={item.product_name}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-[4px] object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black line-clamp-2">
                            {item.product_name}
                          </p>
                          {isUnavailable && (
                            <span className="block text-xs text-red-600 mt-1">
                              {isInactive && "Not Available Currently"}
                              {isOutOfStock && "Out of Stock"}
                              {isNotShippable &&
                                "Not available for this location"}
                            </span>
                          )}
                          <p className="text-right text-sm font-semibold text-black mt-1">
                            {item.quantity} ×{" "}
                            <span className="price">
                              ${formatPrice(mainPrice)}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- New redesigned order summary totals (matches cart page) — disabled, kept for later use ---
              <div className="px-4 py-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="fluid-text-xs text-[#726969] font-normal capitalize leading-[normal]">
                    Original Listing Price (Total)
                  </span>
                  <p className="fluid-text-xs font-bold text-black leading-[normal]">
                    ${formatPrice(originalListingPrice)}
                  </p>
                </div>

                {discountTotal > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsDiscountExpanded((prev) => !prev)}
                      className="flex items-center justify-between w-full cursor-pointer"
                    >
                      <span className="flex items-center gap-1 fluid-text-xs font-normal text-[#16A249] capitalize leading-[normal]">
                        Discount
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform text-black ${isDiscountExpanded ? "rotate-180" : ""}`}
                        />
                      </span>
                      <p className="fluid-text-xs font-bold text-[#16A249] leading-[normal] capitalize">
                        -${formatPrice(discountTotal)}
                      </p>
                    </button>

                    {isDiscountExpanded && (
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="fluid-text-xs text-[#726969] font-normal capitalize leading-[normal]">
                            Marketplace Discount
                          </span>
                          <p className="fluid-text-xs text-[#000000] font-normal capitalize leading-[normal]">
                            ${formatPrice(itemSavings)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="fluid-text-xs text-[#726969] font-normal capitalize leading-[normal]">
                            Item Promotion Discount
                          </span>
                          <p className="fluid-text-xs text-[#000000] font-normal capitalize leading-[normal]">
                            ${formatPrice(promotionDiscount)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="fluid-text-xs text-[#726969] font-normal capitalize leading-[normal]">
                            Coupon Discount
                          </span>
                          <p className="fluid-text-xs text-[#000000] font-normal capitalize leading-[normal]">
                            ${formatPrice(couponDiscount)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-[8px] px-4 py-4 mt-2 bg-[#EFF9F0] flex items-center justify-between gap-2">
                  <span className="fluid-text-xs font-normal text-[#726969] capitalize leading-[normal]">
                    Price After Discount
                  </span>
                  <p className="fluid-text-xs font-bold text-[#16A249] leading-[normal] capitalize shrink-0">
                    ${formatPrice(priceAfterDiscount)}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => setIsTotalExpanded((prev) => !prev)}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <span className="flex items-center gap-1 fluid-text-xs font-normal text-[#726969] capitalize leading-[normal]">
                    Total Payable Amount
                    <ChevronDown
                      className={`w-4 h-4 transition-transform text-[#000000] ${isTotalExpanded ? "rotate-180" : ""}`}
                    />
                  </span>
                  <p className="fluid-text-xs text-[18px] leading-[normal] font-bold text-[#000000] capitalize">
                    ${formatPrice(finalTotal)}
                  </p>
                </button>

                {isTotalExpanded && (
                  <div className="flex flex-col gap-2 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="fluid-text-xs font-normal text-[#726969] capitalize leading-[normal]">
                        Shipping
                      </span>
                      {effectiveShipping ? (
                        <p className="fluid-text-xs text-black font-normal capitalize leading-[normal]">
                          ${formatPrice(effectiveShipping)}
                        </p>
                      ) : (
                        <p className="fluid-text-xs font-normal text-[#16A249] capitalize leading-[normal]">
                          FREE
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="fluid-text-xs font-normal text-[#726969] capitalize leading-[normal]">
                        Tax
                      </span>
                      <p className="fluid-text-xs text-black font-normal capitalize leading-[normal]">
                        ${formatPrice(cart?.tax_total || 0)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              --- End new design --- */}

              <div className="px-4 py-4 flex flex-col gap-3 bg-white">
                <div className="flex items-center justify-between">
                  <p className="checkout-total-value text-[0.875rem]">Delivery</p>
                  <p className="price text-sm">
                    ${formatPrice(effectiveShipping)}
                  </p>
                </div>

                {totalSaveAmount + (promoData?.discount_amount || 0) >
                  0 && (
                  <div className="flex items-center justify-between">
                    <p className="checkout-total-value text-[0.875rem]">Savings</p>
                    <p className="fluid-text-sm font-semibold leading-[100%] text-[#16A249]">
                      -$
                      {formatPrice(
                        totalSaveAmount + (promoData?.discount_amount || 0),
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-4 bg-[#F5F5F5] rounded-b-[8px]">
                <p className="checkout-total-label">
                  Total (incl. GST)
                </p>
                <p className="price text-[1.125rem]">
                  ${formatPrice(finalTotal)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex lg:hidden justify-center">
        <Button
          className="global-btn"
          type="submit"
          form="checkout-form"
          disabled={isCreatingOrder || isProcessingPayment}
          isLoading={isCreatingOrder || isProcessingPayment}
        >
          {isCreatingOrder || isProcessingPayment
            ? "Placing Order..."
            : "Pay Now"}
        </Button>
      </div>

      <Link href="/shop-with-peace">
        <Image
          src="/images/shop-with-confidence.svg"
          alt="Shop with Confidence"
          width={600}
          height={270}
          className="hidden lg:block h-auto w-full"
        />
      </Link>
    </div>
  );
}
