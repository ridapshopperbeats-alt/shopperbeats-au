"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { CartItem } from "@/types/cart";
import { getImageUrl } from "@/lib/utils/image-utils";
import { formatPrice } from "@/lib/utils/format-price";
import { getPriceDetails } from "@/lib/utils/get-price-details";

interface CartCheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  hasShippableItem: boolean;
  localQtyMap: Record<string, string>;
  isUpdating: boolean;
  isRemoving: boolean;
  onIncrement: (item: CartItem) => void;
  onDecrement: (item: CartItem) => void;
  onRemove: (id: string, variant_id?: string) => void;
  onCheckout: () => void;
}

export default function CartCheckoutDrawer({
  open,
  onClose,
  items,
  subtotal,
  shippingCost,
  hasShippableItem,
  localQtyMap,
  isUpdating,
  isRemoving,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}: CartCheckoutDrawerProps) {
  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <div
        className={`fixed inset-0 bg-[#0000008C] z-[1100] transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-0 z-[1101] flex flex-col bg-white opacity-100 shadow-[0px_-4px_20px_0px_#00000026] sm:shadow-[0px_0px_10px_0px_#00000033] w-full sm:w-[500px] h-auto max-h-[88vh] sm:h-full sm:max-h-full rounded-t-[24px] sm:rounded-none transition-transform duration-300 ease-out ${open
            ? "translate-x-0 translate-y-0"
            : "translate-y-full sm:translate-y-0 translate-x-0 sm:translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Cart Checkout"
      >
        <div className="flex sm:hidden justify-center pt-3 pb-1 shrink-0">
          <span className="w-9 h-1 rounded-full bg-[#D9D2D2]" />
        </div>

        <div className="relative flex items-center justify-between sm:justify-center px-5 py-3 sm:py-4 border-b border-[#D9D2D2] shrink-0">
          <h3 className="font-montserrat font-bold text-[20px] sm:font-black sm:text-[14px] leading-[100%] tracking-[0%] text-left sm:text-center capitalize text-black whitespace-nowrap">
            In Your Cart ({itemCount})
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex items-center justify-center w-8 h-8 rounded-[16px] bg-[#F5F5F5] opacity-100 text-[#878787] sm:absolute sm:right-5 sm:w-auto sm:h-auto sm:rounded-none sm:bg-transparent sm:text-[#D3D3D3] cursor-pointer"
          >
            <span className="flex items-center justify-center w-[13.33px] h-[13.33px] rounded-full border-2 border-[#878787] opacity-100 sm:border-0 sm:w-auto sm:h-auto">
              <X className="w-[9px] h-[9px] sm:w-[13.15px] sm:h-[13.15px]" strokeWidth={3} />
            </span>
          </button>
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-[#F2F2F2] [&::-webkit-scrollbar-track]:rounded-[15px] [&::-webkit-scrollbar-thumb]:bg-[#D3D3D3] [&::-webkit-scrollbar-thumb]:rounded-[15px] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          {items.map((item) => {
            const productForPriceDetails = {
              price: item.unit_price,
              rrp_price: item.rrp_price_snapshot,
              discount_percentage: item.discount_percentage,
              discounted_price: item.discounted_price,
              oldPrice: item.oldPrice,
              discount: item.discount,
            };
            const { mainPrice } = getPriceDetails(productForPriceDetails);
            const qty = localQtyMap[item.id] ?? String(item.quantity);
            const size = item.variant_attributes?.find(
              (attr) => attr.name.toLowerCase() === "size",
            )?.value;
            const colour = item.variant_attributes?.find(
              (attr) =>
                attr.name.toLowerCase() === "colour" ||
                attr.name.toLowerCase() === "color",
            )?.value;

            return (
              <div
                key={item.id}
                className="flex gap-3 px-5 py-4 border-b border-[#EAEAEA]"
              >
                <div className="shrink-0 w-[70px] h-[70px] rounded-[8px] sm:rounded-none overflow-hidden">
                  <Image
                    src={getImageUrl(item)}
                    alt={item.product_name}
                    width={70}
                    height={70}
                    className="w-[70px] h-[70px] object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <p className="font-montserrat font-semibold text-[14px] leading-[100%] tracking-[0%] capitalize text-black max-w-[296px] line-clamp-2">
                    {item.product_name}
                  </p>
                  <p className="font-montserrat font-medium text-[12px] leading-[100%] tracking-[0%] capitalize text-[#726969] max-w-[238px]">
                    {item.handling_time_days === 1
                      ? "Leaves Warehouse In Next Business Day"
                      : `Leaves Warehouse In 1-${item.handling_time_days ?? 2} Business Days`}
                  </p>
                  {size && (
                    <p className="font-montserrat font-semibold text-[12px] leading-[100%] tracking-[0%] capitalize text-[#000000] max-w-[179px]">
                      Size :
                      <span className="font-montserrat font-medium text-[12px] leading-[100%] tracking-[0%] capitalize text-[#000000] ml-5"> {size || "N/A"}</span>
                    </p>
                  )}
                  {colour && (
                    <p className="font-montserrat font-semibold text-[12px] leading-[100%] tracking-[0%] capitalize text-[#000000] max-w-[179px]">
                      Colour :
                      <span className="font-montserrat font-medium text-[12px] leading-[100%] tracking-[0%] capitalize text-[#000000] ml-2">{colour || "N/A"}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] text-black">
                      <span className="font-montserrat font-semibold text-[12px] leading-[100%] tracking-[0%] capitalize text-[#000000] max-w-[179px]">Qty :</span>
                      <div className="inline-flex items-center justify-between w-[50px] h-[21px] opacity-100 border border-[#E4E4E4] rounded-[8px] px-1 gap-1 ml-5">
                        <button
                          type="button"
                          disabled={isUpdating || isRemoving}
                          className="w-4 h-4 flex items-center justify-center text-[13px] leading-none disabled:opacity-40 cursor-pointer"
                          onClick={() => onDecrement(item)}
                        >
                          -
                        </button>
                        <span className="w-4 text-center">{qty}</span>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="w-4 h-4 flex items-center justify-center text-[13px] leading-none disabled:opacity-40 cursor-pointer"
                          onClick={() => onIncrement(item)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(item.product_id, item.variant_id)}
                      className="text-[12px] text-[#726969] underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>

                  <p className="text-[12px] text-black">
                    <span className="font-montserrat font-semibold text-[12px] leading-[100%] tracking-[0%] capitalize text-[#000000] max-w-[179px]">Price : </span>
                    <span className="text-[#FD151B] font-semibold ml-5">
                      ${formatPrice(item.final_price ?? mainPrice)}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 w-full sm:min-h-[121px] bg-white opacity-100 shadow-[0px_-4px_20px_0px_#00000026] sm:shadow-[0px_0px_10px_0px_#00000033] px-6 py-5">
          <div className="flex items-center justify-between mb-1.5">
            <span
              style={{ fontFamily: "Inter" }}
              className="font-normal text-[14px] leading-[100%] tracking-[0%] text-[#878787]"
            >
              Shipping
            </span>
            <span className="font-montserrat font-normal text-[14px] leading-[100%] tracking-[0%] capitalize text-black">
              {hasShippableItem ? `$${formatPrice(shippingCost)}` : "Free"}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <strong className="font-montserrat font-semibold text-[14px] leading-[100%] tracking-[0%] capitalize text-black">
              Subtotal
            </strong>
            <strong className="font-montserrat font-semibold text-[14px] leading-[100%] tracking-[0%] capitalize text-black">
              ${formatPrice(subtotal)}
            </strong>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 sm:justify-between mt-2">
            <Link href="/cart">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-[155px] h-[46px] rounded-full font-semibold text-[#FD151B] border border-[#FD151B] bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Cart
              </button>
            </Link>

            <button
              type="button"
              onClick={onCheckout}
              className="w-full sm:w-[159px] h-[46px] opacity-100 rounded-[73px] bg-[linear-gradient(137.27deg,#FF676B_19.41%,#FD151B_65.49%)] shadow-[0px_4px_4px_0px_#0E35BF40] text-white text-[14px] font-semibold cursor-pointer"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
