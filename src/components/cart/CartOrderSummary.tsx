"use client";

import Link from "next/link";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import GooglePlacesInput from "@/components/common/AddressAutocomplete";
import { formatPrice } from "@/lib/utils/main-utils";
import type { CartOrderSummaryProps } from "@/types/cart";


export default function CartOrderSummary({
  summaryRef,
  cart,
  authChecked,
  isAuthenticated,
  totalSaveAmount,
  hasShippableItem,
  newTotalPrice,
  appliedPromoCode,
  discountAmount,
  promoCodeInput,
  onPromoCodeInputChange,
  promoCodeError,
  onApplyPromoCode,
  isApplyingPromo,
  onRemovePromo,
  isRemovingPromo,
  pincode,
  pincodeError,
  onPincodeChange,
  updatePostcode,
  onCheckDelivery,
  isCheckingDelivery,
  isXlUp,
  secureCheckoutSection,
}: CartOrderSummaryProps) {
  return (
    <div
      ref={summaryRef}
      className="w-full xl:w-[488px] xl:min-h-[522px] flex flex-col xl:sticky xl:top-24 xl:self-start mb-4"
    >
      <div className="bg-white rounded-[8px] shadow-[0px_0px_14px_rgba(0,0,0,0.08)] p-6 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h5 className="fluid-text-base font-bold leading-[normal] text-black">
            Order Summary
          </h5>
          {authChecked && !isAuthenticated && (
            <Link
              href="/login"
              className="fluid-text-12-16 font-semibold text-black underline leading-[normal]"
            >
              Sign in
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-3 pb-4 border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between">
            <span className="cart-summary-label">
              Subtotal (
              {cart.items
                .filter(
                  (i) =>
                    i.is_active &&
                    (i.available_stock === undefined ||
                      i.available_stock > 0),
                )
                .reduce((a, i) => a + i.quantity, 0)}{" "}
              Items)
            </span>
            <p className="fluid-text-sm font-semibold text-[#FD151B] leading-[normal] capitalize">
              ${formatPrice(cart.subtotal ?? cart.items_total)}
            </p>
          </div>

          {totalSaveAmount > 0 && (
            <div className="flex items-center justify-between">
              <span className="cart-summary-label">
                Total Savings
              </span>
              <p className="fluid-text-sm font-semibold text-[#16a249] leading-[normal] capitalize">
                -${formatPrice(totalSaveAmount)}
              </p>
            </div>
          )}

          {hasShippableItem && (
            <div className="flex items-center justify-between">
              <span className="cart-summary-label">
                Shipping
              </span>
              <p className="fluid-text-sm font-semibold text-black leading-[normal] capitalize">
                ${formatPrice(cart.shipping || 0)}
              </p>
            </div>
          )}

          {appliedPromoCode && discountAmount > 0 && (
            <div className="flex items-center justify-between">
              <span className="fluid-text-sm leading-[100%] text-[#726969]">
                Coupon Discount ({appliedPromoCode})
                <button
                  onClick={onRemovePromo}
                  disabled={isRemovingPromo}
                  className="ml-4 text-[#fd151b] fluid-text-12-16 hover:underline disabled:opacity-50"
                >
                  {isRemovingPromo ? "Removing..." : "Remove"}
                </button>
              </span>
              <p className="fluid-text-sm font-semibold text-[#16a249]">
                -${formatPrice(discountAmount)}
              </p>
            </div>
          )}
        </div>

        <div className="pt-4">
          <div className="flex items-center border border-[#15112b2b] rounded-[5px] pl-5 pr-1.5 h-11 w-[430px] md:w-auto max-w-full overflow-hidden">
            <input
              type="text"
              placeholder="Coupon Code"
              value={promoCodeInput}
              onChange={(e) => onPromoCodeInputChange(e.target.value)}
              className="flex-1 min-w-0 h-auto! p-0! bg-transparent! border-0! rounded-none! shadow-none! ring-0! outline-none text-sm placeholder:text-[#726969] font-medium"
            />
            <button
              className="text-[#01295f] fluid-text-xs font-medium  cursor-pointer disabled:opacity-50"
              onClick={onApplyPromoCode}
              disabled={isApplyingPromo}
            >
              {isApplyingPromo ? "Applying..." : "Apply"}
            </button>
          </div>

          {promoCodeError && (
            <p className="text-[#fd151b] text-xs mt-1.5">
              {promoCodeError}
            </p>
          )}
          {appliedPromoCode && (
            <p className="text-[#16a249] text-xs mt-1.5">
              Coupon Code&quot;{appliedPromoCode}&quot; applied!
            </p>
          )}
        </div>

        <div className="flex items-center justify-between py-4 xl:border-t border-[#e5e5e5] mt-4">
          <strong className="fluid-text-base leading-[normal] font-semibold text-black capitalize">
            Total (Incl. Tax)
          </strong>
          <div className="flex flex-col items-end gap-1">
            {totalSaveAmount > 0 && (
              <p className="fluid-text-sm font-semibold leading-[normal] text-[#726969] line-through">
                $
                {formatPrice(
                  (newTotalPrice !== null
                    ? newTotalPrice
                    : cart.total_price) + totalSaveAmount,
                )}
              </p>
            )}
            <p className="fluid-text-base lg:text-[18px] leading-[normal] font-semibold text-[#fd151b]">
              $
              {formatPrice(
                newTotalPrice !== null ? newTotalPrice : cart.total_price,
              )}
            </p>
          </div>
        </div>

        <div className="pb-4 order-1 xl:order-2">
          <p className="fluid-text-sm leading-[normal] font-medium text-black mb-2">
            Deliver To
          </p>
          <div className="flex items-center border border-[#15112b2b] rounded-[5px] pl-5 pr-1.5 h-11 w-[430px] md:w-auto max-w-full">
            <GooglePlacesInput
              mode="pincode"
              placeholder="Enter Pincode"
              value={pincode}
              onPlaceSelect={(data) => {
                if (!data.pincode) {
                  toast.error("Please select a valid pincode");
                  return;
                }

                onPincodeChange({
                  target: {
                    name: "pincode",
                    value: data.pincode,
                  },
                } as React.ChangeEvent<HTMLInputElement>);
                updatePostcode(data.pincode, data.city);
              }}
              inputClassName="flex-1 min-w-0 !h-auto !p-0 !bg-transparent !border-0 !rounded-none !shadow-none !ring-0 outline-none text-sm placeholder:text-[#726969]"
            />

            <button
              onClick={onCheckDelivery}
              disabled={isCheckingDelivery}
              className="text-[#01295f] text-sm font-medium ml-auto whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {isCheckingDelivery ? "Checking..." : "Check Delivery"}
            </button>
          </div>

          {pincodeError && (
            <p className="text-[#fd151b] text-xs mt-1.5">
              {pincodeError}
            </p>
          )}
        </div>

        <Link
          href={
            isAuthenticated
              ? "/check-out"
              : `/login?redirect=${encodeURIComponent("/check-out")}`
          }
          className="mt-auto order-1 xl:order-2"
        >
          <Button
            className="bg-linear-to-r from-[#FF676B] to-[#FD151B] h-[46px] rounded-[74px] text-[#F6F6F6] fluid-text-base font-semibold leadiing-5 w-full shadow-md shadow-[#0E35BF]/25 cursor-pointer"
            debounceDelay={500}
          >
            Checkout
          </Button>
        </Link>

        {isXlUp && secureCheckoutSection}
      </div>

      {!isXlUp && secureCheckoutSection}
    </div>
  );
}
