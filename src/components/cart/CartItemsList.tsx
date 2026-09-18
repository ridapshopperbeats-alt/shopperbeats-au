"use client";

import Link from "next/link";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import CartItemRow, { getCartItemHref } from "@/components/cart/CartItemRow";
import {
  getPriceDetails,
  getHandlingDeliveryRange,
} from "@/lib/utils/main-utils";
import type { CartItemsListProps } from "@/types/cart";


export default function CartItemsList({
  items,
  isXlUp,
  matchedHeight,
  updatingItemId,
  isRemoving,
  clickLockRef,
  localQtyMap,
  setLocalQtyMap,
  onRemoveItem,
  onUpdateQuantity,
}: CartItemsListProps) {
  return (
    <div
      className={`w-full xl:w-[1226px] lg:rounded-[8px] lg:overflow-visible lg:shadow-[0_0_14px_rgba(0,0,0,0.08)] ${items.length >= 3 ? "xl:flex xl:flex-col" : ""}`}
      style={
        items.length >= 3 && isXlUp && matchedHeight
          ? { height: matchedHeight }
          : undefined
      }
    >
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#D9D2D2] fluid-text-base leading-[100%] font-medium shrink-0">
        <div className="col-span-6 text-base">Item</div>
        <div className="col-span-2 text-base text-center">Qty.</div>
        <div className="col-span-2 text-base">Item Price</div>
        <div className="col-span-2 text-base">Subtotal</div>
      </div>

      <div
        className={`flex flex-col items-center gap-[14px]  lg:block lg:gap-0 lg:py-0 lg:max-h-[490px] lg:overflow-y-auto lg:overscroll-contain gray-scrollbar ${items.length >= 3 ? "xl:max-h-none xl:flex-1 xl:min-h-0" : ""}`}
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
          const { mainPrice, wasPrice, showWasPrice } = getPriceDetails(
            productForPriceDetails as never,
          );

          const itemSubtotal =
            item.subtotal ?? mainPrice * Number(item.quantity);

          const deliveryPrefix = "Estimated delivery in";

          const itemInfo = (
            <>
              <h3 className="fluid-text-xs font-semibold leading-[18px] text-black mb-0.5 lg:mb-1.5 ">
                {item.is_active ? (
                  <Link
                    href={getCartItemHref(item)}
                  >
                    {item.product_name}
                  </Link>
                ) : (
                  <span className="cursor-pointer">
                    {item.product_name}
                  </span>
                )}
              </h3>

              {!item.is_active ? (
                <p className="fluid-text-xs leading-tight lg:leading-[100%] font-bold text-[#fd151b] mb-0.5 lg:mb-1.5">
                  Not Available Currently
                </p>
              ) : item.available_stock !== undefined &&
                item.available_stock <= 0 ? (
                <p className="fluid-text-xs leading-tight lg:leading-[100%] font-bold text-[#fd151b] mb-0.5 lg:mb-1.5">
                  Out of Stock
                </p>
              ) : (
                <p className="flex items-center flex-wrap gap-1.5 fluid-text-11-12 lg:leading-[100%] font-bold text-[#01295F] mb-0.5 lg:mb-1.5">
                  <span className="">In Stock</span>
                </p>
              )}
              {item.shipping_cost === 0 && (
                <p className="fluid-text-xs leading-[12px] text-[#726969] mb-0.5 lg:mb-1.5 font-medium">
                  Eligible For FREE Shipping
                </p>
              )}
              <p className="fluid-text-xs leading-[16px] text-[#726969] mb-0.5 lg:mb-1.5 font-medium">
                {deliveryPrefix}{" "}
                {getHandlingDeliveryRange(
                  item.handling_time_days ?? 0,
                  item.handling_time_max_days,
                )}
              </p>

              {item.variant_attributes &&
                item.variant_attributes.length > 0 && (
                  <div>
                    {item.variant_attributes.map((attr) => (
                      <p
                        key={attr.name}
                        className="fluid-text-xs leading-[100%] text-black mb-1 font-medium"
                      >
                        <strong className="font-semibold">
                          {attr.name}:{" "}
                        </strong>
                        {attr.value}
                      </p>
                    ))}
                  </div>
                )}
            </>
          );

          const qtySelector = (
            <div className="inline-flex items-center justify-between border border-[#d9d2d2] rounded-full h-[34px] lg:h-9 w-[76px] lg:w-[104px] px-1 overflow-hidden">
              <Button
                disabled={
                  updatingItemId === item.id ||
                  isRemoving ||
                  !item.is_active ||
                  (item.available_stock !== undefined &&
                    item.available_stock <= 0)
                }
                className="w-7 h-7 flex items-center justify-center text-lg leading-none text-black disabled:opacity-40 cursor-pointer border-0"
                onClick={() => {
                  if (
                    clickLockRef.current ||
                    updatingItemId === item.id ||
                    isRemoving ||
                    !item.is_active ||
                    (item.available_stock !== undefined &&
                      item.available_stock <= 0)
                  )
                    return;
                  if (item.quantity === 1) {
                    onRemoveItem(item.product_id, item.variant_id);
                  } else {
                    const newQty = item.quantity - 1;
                    setLocalQtyMap((prev) => ({
                      ...prev,
                      [item.id]: String(newQty),
                    }));
                    onUpdateQuantity(
                      item.product_id,
                      newQty,
                      item.variant_id,
                      item.id,
                    );
                  }
                }}
                debounceDelay={300}
              >
                -
              </Button>
              <div className="relative flex items-center justify-center w-8 h-full shrink-0">
                <input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  min="1"
                  value={localQtyMap[item.id] ?? item.quantity ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setLocalQtyMap((prev) => ({
                      ...prev,
                      [item.id]: raw,
                    }));

                    const value = Number.parseInt(raw);
                    if (Number.isNaN(value) || value < 1) return;

                    const stockLimit = item.available_stock ?? item.stock;
                    if (
                      stockLimit !== undefined &&
                      stockLimit !== null &&
                      value > stockLimit
                    ) {
                      toast.error("No more stock available", {
                        toastId: "stock-warning",
                      });
                      const capped = Math.max(stockLimit, 0);
                      setLocalQtyMap((prev) => ({
                        ...prev,
                        [item.id]: String(capped),
                      }));
                      if (capped >= 1) {
                        onUpdateQuantity(
                          item.product_id,
                          capped,
                          item.variant_id,
                          item.id,
                        );
                      }
                      return;
                    }

                    onUpdateQuantity(
                      item.product_id,
                      value,
                      item.variant_id,
                      item.id,
                    );
                  }}
                  onBlur={() => {
                    const raw = localQtyMap[item.id] ?? "";
                    const value = Number.parseInt(raw);
                    if (Number.isNaN(value) || value < 1) {
                      setLocalQtyMap((prev) => ({
                        ...prev,
                        [item.id]: String(item.quantity),
                      }));
                    }
                  }}
                  disabled={updatingItemId === item.id}
                  className="w-8! h-auto! min-w-0! p-0! py-0! bg-transparent! border-0! rounded-none! shadow-none! ring-0! text-center text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {updatingItemId === item.id && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <span className="mt-2 h-3 w-3 rounded-full border-2 border-[#012961] border-t-transparent animate-spin" />
                  </span>
                )}
              </div>

              <Button
                disabled={
                  updatingItemId === item.id ||
                  !item.is_active ||
                  (item.available_stock !== undefined &&
                    item.available_stock <= 0)
                }
                className="w-7 h-7 flex items-center justify-center text-lg leading-none text-black disabled:opacity-40 cursor-pointer"
                onClick={() => {
                  const currentLocalQty = Number.parseInt(
                    localQtyMap[item.id] ?? String(item.quantity),
                  );
                  const stockLimit = item.available_stock ?? item.stock;
                  if (
                    stockLimit !== undefined &&
                    stockLimit !== null &&
                    currentLocalQty >= stockLimit
                  ) {
                    toast.error("No more stock available", {
                      toastId: "stock-warning",
                    });
                    return;
                  }
                  const newQty =
                    (Number.isNaN(currentLocalQty)
                      ? item.quantity
                      : currentLocalQty) + 1;
                  setLocalQtyMap((prev) => ({
                    ...prev,
                    [item.id]: String(newQty),
                  }));
                  onUpdateQuantity(
                    item.product_id,
                    newQty,
                    item.variant_id,
                    item.id,
                  );
                }}
              >
                +
              </Button>
            </div>
          );

          const removeLink = (
            <Link
              href="#"
              className={`fluid-text-xs leading-[21px] font-medium underline mt-1 ${!item.is_active ? "text-[#fd151b]" : "text-[#726969]"}`}
              onClick={() =>
                onRemoveItem(item.product_id, item.variant_id)
              }
            >
              Remove
            </Link>
          );

          return (
            <CartItemRow
              key={item.id}
              item={item}
              mainPrice={mainPrice}
              wasPrice={wasPrice}
              showWasPrice={showWasPrice}
              itemSubtotal={itemSubtotal}
              itemInfo={itemInfo}
              qtySelector={qtySelector}
              removeLink={removeLink}
            />
          );
        })}
      </div>
    </div>
  );
}
