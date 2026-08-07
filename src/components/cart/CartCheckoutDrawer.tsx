"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { CartCheckoutDrawerProps } from "@/types/cart";
import { getImageUrl, formatPrice, getPriceDetails } from "@/lib/utils/main-utils";
import "@/styles/Cart.css";

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
        className={`cart-drawer-overlay ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      <div
        className={`cart-drawer-panel ${open
            ? "translate-x-0 translate-y-0"
            : "translate-y-full sm:translate-y-0 translate-x-0 sm:translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Cart Checkout"
      >
        <div className="cart-drawer-handle-wrapper">
          <span className="cart-drawer-handle-bar" />
        </div>

        <div className="cart-drawer-header">
          <h3 className="cart-drawer-title">
            In Your Cart ({itemCount})
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="cart-drawer-close-btn"
          >
            <span>
              <X className="cart-drawer-close-icon" strokeWidth={3} />
            </span>
          </button>
        </div>

        <div
          className="cart-drawer-scroll-area"
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
                className="cart-drawer-item"
              >
                <div className="cart-drawer-item-image-wrapper">
                  <Image
                    src={getImageUrl(item)}
                    alt={item.product_name}
                    width={70}
                    height={70}
                    className="cart-drawer-item-image"
                  />
                </div>

                <div className="cart-drawer-item-details">
                  <p className="cart-drawer-item-name">
                    {item.product_name}
                  </p>
                  <p className="cart-drawer-item-handling">
                    {item.handling_time_days === 1
                      ? "Leaves Warehouse In Next Business Day"
                      : `Leaves Warehouse In 1-${item.handling_time_days ?? 2} Business Days`}
                  </p>
                  {/* {size && ( */}
                    <p className="cart-drawer-item-attr-label">
                      Size :
                      <span className="cart-drawer-item-attr-value"> {size || "S"}</span>
                    </p>
                  {/* )} */}
                  {/* {colour && ( */}
                    <p className="cart-drawer-item-attr-label">
                      Colour :
                      <span className="cart-drawer-item-attr-value-sm">{colour || "Red"}</span>
                    </p>
                  {/* )} */}

                  <div className="cart-drawer-qty-row">
                    <div className="cart-drawer-qty-left">
                      <span className="cart-drawer-item-attr-label">Qty :</span>
                      <div className="cart-drawer-qty-stepper">
                        <button
                          type="button"
                          disabled={isUpdating || isRemoving}
                          className="cart-drawer-qty-btn"
                          onClick={() => onDecrement(item)}
                        >
                          -
                        </button>
                        <span className="text-[12px] font-semibold">{qty}</span>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="cart-drawer-qty-btn"
                          onClick={() => onIncrement(item)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                   
                  </div>

                  <div className="cart-drawer-price-remove-row">
                    <p className="cart-drawer-price-row">
                      <span className="cart-drawer-item-attr-label">Price : </span>
                      <span className="cart-drawer-price-value text-[12px] font-semibold">
                        ${formatPrice(item.final_price ?? mainPrice)}kk
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemove(item.product_id, item.variant_id)}
                      className="cart-drawer-remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-drawer-footer">
          <div className="cart-drawer-summary-row">
            <span
              className="cart-drawer-shipping-label text-[14px] font-normal"
            >
              Shipping
            </span>
            <span className="cart-drawer-shipping-value ">
              {hasShippableItem ? `$${formatPrice(shippingCost)}` : "Free"}
            </span>
          </div>
          <div className="cart-drawer-subtotal-row">
            <strong className="cart-drawer-subtotal-text">
              Subtotal
            </strong>
            <strong className="cart-drawer-subtotal-text">
              ${formatPrice(subtotal)}
            </strong>
          </div>

          <div className="cart-drawer-actions">
            <Link href="/cart">
              <button
                type="button"
                onClick={onClose}
                className="cart-drawer-review-btn"
              >
                Review Cart
              </button>
            </Link>

            <button
              type="button"
              onClick={onCheckout}
              className="cart-drawer-checkout-btn"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
