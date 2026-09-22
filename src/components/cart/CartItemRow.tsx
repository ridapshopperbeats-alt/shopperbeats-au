"use client";

import Image from "next/image";
import Link from "next/link";

import { formatPrice, getImageUrl } from "@/lib/utils/main-utils";
import type { CartItemRowProps } from "@/types/cart";

export function getCartItemHref(item: {
  product_id: string;
  unique_code?: string;
}) {
  return `/product/${item.unique_code || item.product_id}`;
}


export default function CartItemRow({
  item,
  mainPrice,
  wasPrice,
  showWasPrice,
  itemSubtotal,
  itemInfo,
  qtySelector,
  removeLink,
}: CartItemRowProps) {
  return (
    <div
      className={`w-full lg:border-b lg:border-[#e4e3e3] lg:last:border-b-0 lg:px-6 lg:py-5 ${!item.is_active ? "opacity-60" : ""}`}
    >
      <div className="lg:hidden w-full rounded-[8px] bg-white shadow-[0px_0px_14px_0px_#00000014] p-4 overflow-hidden">
        <div className="flex flex-row gap-3">
          <div className="shrink-0 w-[84px] h-[84px]">
            {item.is_active &&
              (item.available_stock === undefined ||
                item.available_stock > 0) ? (
              <Link
                href={getCartItemHref(item)}
              >
                <Image
                  src={getImageUrl(item as never)}
                  alt={item.product_name}
                  width={84}
                  height={84}
                  loading="lazy"
                  className="w-[84px] h-[84px] object-cover"
                />
              </Link>
            ) : (
              <Image
                src={getImageUrl(item as never)}
                alt={item.product_name}
                width={84}
                height={84}
                loading="lazy"
                className="w-[84px] h-[84px] object-cover rounded-md border border-[#e4e3e3] cursor-not-allowed opacity-60"
              />
            )}
          </div>

          <div className="flex-1 max-w-[245px]">{itemInfo}</div>
        </div>

        <div className="flex items-start justify-between mt-2">
          {qtySelector}

          <div className="flex flex-col items-end leading-tight">
            <span className="text-[#fd151b] font-bold fluid-text-base leading-tight">
              ${formatPrice(item.final_price ?? itemSubtotal)}
            </span>
            {showWasPrice && (
              <span className="fluid-text-12-16 leading-[100%] text-[#726969] line-through">
                ${formatPrice(wasPrice)}
              </span>
            )}
            {removeLink}
          </div>
        </div>

      </div>

      <div className="hidden lg:grid lg:grid-cols-12 lg:items-center lg:gap-4">
        <div className="col-span-6 flex flex-row gap-[20px]">
          <div className="shrink-0 w-[137px] h-[136px]">
            {item.is_active &&
              (item.available_stock === undefined ||
                item.available_stock > 0) ? (
              <Link
                href={getCartItemHref(item)}
              >
                <Image
                  src={getImageUrl(item as never)}
                  alt={item.product_name}
                  width={137}
                  height={136}
                  loading="lazy"
                  className="w-[137px] h-[136px] object-cover"
                />
              </Link>
            ) : (
              <Image
                src={getImageUrl(item as never)}
                alt={item.product_name}
                width={137}
                height={136}
                loading="lazy"
                className="w-[137px] h-[136px] object-cover rounded-md border border-[#e4e3e3] cursor-not-allowed opacity-60"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">{itemInfo}</div>
        </div>

        <div className="col-span-2 flex justify-center items-center">
          {qtySelector}
        </div>

        <div className="col-span-2 flex justify-start items-center">
          <div className="flex flex-col items-start">
            <div className="flex flex-row lg:flex-col xl:flex-row items-start xl:items-center gap-2 lg:gap-0 xl:gap-2">
              <span className="fluid-text-sm font-semibold text-[#FD151B] leading-[normal] capitalize">
                ${formatPrice(mainPrice)}
              </span>

              {showWasPrice && (
                <span className="fluid-text-sm text-[#726969] line-through leading-[normal] capitalize font-semibold">
                  ${formatPrice(wasPrice)}
                </span>
              )}
            </div>

          </div>
        </div>

        <div className="col-span-2 flex justify-start items-center">
          <div className="flex flex-col items-start">
            <span className="text-[#fd151b] font-medium fluid-text-sm font-semibold leading-[normal] capitalize">
              ${formatPrice(item.final_price ?? itemSubtotal)}
            </span>
            {removeLink}
          </div>
        </div>
      </div>
    </div>
  );
}
