"use client";

import Image from "next/image";
import Link from "next/link";

import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import * as yup from "yup";
import { useMemo, useRef, useState, useEffect } from "react";
import Button from "@/components/common/Button";
import { pincode } from "@/lib/validations/form-schemas";
import GooglePlacesInput from "@/components/common/AddressAutocomplete";
import {
  getPriceDetails,
  getImageUrl,
  formatPrice,
} from "@/lib/utils/main-utils";
import NoProductsFound from "@/components/NoProductFound";
import { Input } from "@/components/common/input";
import { ShieldCheck } from "lucide-react";
import { getHandlingDeliveryRange } from "@/lib/utils/get-handling-delivery-range";
import {
  useGetCartQuery,
  useUpdateCartItemQuantityMutation,
  useRemoveFromCartMutation,
  useCheckDeliveryMutation,
  useValidatePromoCodeMutation,
  useRemoveCouponMutation,
} from "@/lib/redux/apis/cart-api";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

// ---------------- SCHEMAS ----------------
const pincodeSchema = yup.object().shape({
  pincode: pincode,
});

function getCartItemHref(item: { product_id: string; unique_code?: string }) {
  return `/product/${item.unique_code || item.product_id}`;
}

const Cart = () => {
  const { isAuthenticated, authChecked } = useSelector(
    (state: RootState) => state.auth,
  );
  const { postcode, updatePostcode } = useGlobalPostcode();
  const {
    data: cartData,
    isLoading: isCartLoading,
    isFetching: isCartFetching,
  } = useGetCartQuery(postcode ? { postcode } : undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [removeFromCart, { isLoading: isRemoving }] =
    useRemoveFromCartMutation();
  const [updateCartItemQuantity, { isLoading: isUpdatingCartItem }] =
    useUpdateCartItemQuantityMutation();
  const [checkDelivery, { isLoading: isCheckingDelivery }] =
    useCheckDeliveryMutation();
  const [validatePromoCode, { isLoading: isApplyingPromo }] =
    useValidatePromoCodeMutation();
  const [removeCoupon, { isLoading: isRemovingPromo }] =
    useRemoveCouponMutation();

  const cart = cartData;

  const clickLockRef = useRef(false);
  const orderSummaryRef = useRef<HTMLDivElement>(null);
  const [matchedHeight, setMatchedHeight] = useState<number | null>(null);

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const isUpdating = updatingItemId !== null || isUpdatingCartItem;

  const { formData, formErrors, handleChange, handleSubmit } =
    useFormValidation(pincodeSchema, { pincode: postcode || "" });

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);

  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);

  const [discountAmount, setDiscountAmount] = useState(0);
  const [newTotalPrice, setNewTotalPrice] = useState<number | null>(null);

  const isXlUp = useMediaQuery("(min-width: 1280px)", true);

  useEffect(() => {
    if (cart?.has_coupon && cart.applied_coupon_code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppliedPromoCode(cart.applied_coupon_code);
      setDiscountAmount(cart.coupon_discount || 0);
      setPromoCodeInput(cart.applied_coupon_code);
    }
  }, [cart?.has_coupon, cart?.applied_coupon_code, cart?.coupon_discount]);


  useEffect(() => {
    const el = orderSummaryRef.current;
    if (!el || !isXlUp || (cart?.items.length ?? 0) < 3) {
      setMatchedHeight(null);
      return;
    }

    const update = () => setMatchedHeight(el.offsetHeight);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isXlUp, cart?.items.length, appliedPromoCode, discountAmount]);

  const totalSaveAmount = useMemo(() => {
    if (!cart?.items) return 0;

    const itemSavings = cart.items.reduce((acc, item) => {
      const productForPriceDetails = {
        price: item.unit_price,
        rrp_price: item.rrp_price_snapshot,
        discount_percentage: item.discount_percentage,
        discounted_price: item.discounted_price,
        oldPrice: item.oldPrice,
        discount: item.discount,
      };
      const { saveAmount } = getPriceDetails(productForPriceDetails as never);
      return acc + saveAmount * Number(item.quantity);
    }, 0);

    const promotionDiscount = cart.items_discount || 0;
    const couponDiscount = discountAmount || 0;

    return itemSavings + promotionDiscount + couponDiscount;
  }, [cart, discountAmount]);

  // ---------------- APPLY PROMO CODE ----------------
  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoCodeError("Please enter a promo code.");
      toast.error("Please enter a promo code.");
      return;
    }

    if (
      appliedPromoCode &&
      appliedPromoCode.toLowerCase() === promoCodeInput.trim().toLowerCase()
    ) {
      setPromoCodeError("Already applied");
      toast.error("Already applied");
      return;
    }

    setPromoCodeError(null);

    try {
      const result = await validatePromoCode({
        coupon_code: promoCodeInput.trim(),
        cart_id: cartData?.id || "",
        post_code: postcode,
      }).unwrap();

      if (!result.is_valid) {
        const message =
          result.reason || result.message || "Invalid coupon code";
        setPromoCodeError(message);
        setAppliedPromoCode(null);
        setDiscountAmount(0);
        setNewTotalPrice(null);
        toast.error(message);
        return;
      }

      const discountValue = Number.parseFloat(result.discount_value || "0");
      const maxDiscount = result.max_discount
        ? Number.parseFloat(result.max_discount)
        : null;

      const cartTotalPrice = cart?.total_price ?? 0;
      let discount =
        result.discount_type === "percentage"
          ? cartTotalPrice * (discountValue / 100)
          : discountValue;

      if (maxDiscount !== null) discount = Math.min(discount, maxDiscount);
      discount = Math.min(discount, cartTotalPrice);

      const newTotal = Math.max(cartTotalPrice - discount, 0);

      setAppliedPromoCode(promoCodeInput);
      setDiscountAmount(discount);
      setNewTotalPrice(newTotal);
      toast.success(
        <span style={{ color: "#16a249" }}>
          {result.message}
        </span>,
      );
    } catch {
      setPromoCodeError("Failed to validate coupon code");
      toast.error("Failed to validate coupon code");
    }
  };

  const handleRemovePromo = async () => {
    try {
      await removeCoupon().unwrap();
      setAppliedPromoCode(null);
      setDiscountAmount(0);
      setNewTotalPrice(null);
      setPromoCodeInput("");
      setPromoCodeError(null);
      toast.info("Promo code removed.");
    } catch {
      toast.error("Failed to remove coupon.");
    }
  };

  // ---------------- REMOVE ITEM ----------------
  const handleRemoveItem = async (id: string, variant_id?: string) => {
    if (clickLockRef.current) return;
    clickLockRef.current = true;
    if (isRemoving || isUpdating) {
      clickLockRef.current = false;
      return;
    }

    try {
      await removeFromCart({ product_id: id, variant_id }).unwrap();
    } catch {
      toast.error("Failed to remove item.");
    } finally {
      clickLockRef.current = false;
    }
  };

  // Resets the promo-code UI state (including the user-editable input) once
  // the cart empties out — an external-system reset, not derivable state.
  useEffect(() => {
    if (cart && cart.items.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppliedPromoCode(null);
      setDiscountAmount(0);
      setNewTotalPrice(null);
      setPromoCodeInput("");
    }
  }, [cart]);

  // ---------------- CHECK DELIVERY ----------------
  const handleCheckDelivery = handleSubmit(async (data) => {
    try {
      const result = await checkDelivery(data.pincode).unwrap();
      updatePostcode(data.pincode);

      if (result.deliverable) {
        toast.success(result.message || "Delivery available!");
      } else {
        toast.error(result.message || "Delivery not available for this postcode.");
      }
    } catch {
      toast.error("Failed to check delivery.");
    }
  });

  // Per-item local quantity display (allows user to clear & retype)
  const [localQtyMap, setLocalQtyMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cart?.items) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalQtyMap((prev) => {
      const next = { ...prev };
      cart.items.forEach((item) => {
        if (next[item.id] === undefined) {
          next[item.id] = String(item.quantity);
        }
      });
      return next;
    });
  }, [cart]);

  // ---------------- QUANTITY DEBOUNCED UPDATE ----------------
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUpdateQuantity = (
    product_id: string,
    quantity: number,
    variant_id?: string,
    item_id?: string,
  ) => {
    if (quantity < 1 || Number.isNaN(quantity)) return;

    if (isUpdating || isRemoving) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const item = cart?.items.find((i) => i.id === item_id);
      const stockLimit = item?.available_stock ?? item?.stock;

      if (
        stockLimit !== undefined &&
        stockLimit !== null &&
        quantity > stockLimit
      ) {
        toast.error("Requested quantity exceeds available stock", {
          toastId: "stock-warning",
        });
        if (item_id != null) {
          setLocalQtyMap((prev) => ({
            ...prev,
            [item_id]: String(stockLimit),
          }));
        }
        return;
      }

      if (item_id != null) setUpdatingItemId(item_id);

      updateCartItemQuantity({ product_id, quantity, variant_id, postcode })
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
        })
        .finally(() => setUpdatingItemId(null));
    }, 800);
  };

  // ---------------- LOADING / EMPTY STATES ----------------
  if (isCartLoading || (isCartFetching && !cartData))
    return (
      <div className="flex flex-col justify-center items-center text-center p-8 min-h-[40vh]">
        <p className="text-sm text-gray-400">Loading your cart...</p>
      </div>
    );

  if (!cart || cart.items.length === 0)
    return (
      <div className="flex flex-col justify-center items-center text-center p-8 min-h-[40vh]">
        <NoProductsFound
          title="Your cart is"
          titleSpan="empty!"
          subTitle="Discover Amazing Deals."
        />
      </div>
    );

  const hasShippableItem = cart.items?.some(
    (item) => item.is_shippable === true,
  );

  const secureCheckoutSection = (
    <div className="order-3 mb-4">
      <div className="flex items-center justify-center gap-1.5 text-[#657689] mt-4 fluid-text-xs font-medium leading-5">
        <ShieldCheck /> Guaranteed Safe &amp; Secured Checkout
      </div>

      <div className="grid grid-cols-6 w-[328px] gap-2 mx-auto mt-3">
        {["visa", "payment", "american", "paypal", "afterpay", "zip"].map(
          (img) => (
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
          ),
        )}
      </div>
    </div>
  );

  return (
    <div className="container">
      <h4 className="mb-4 pt-5 lg:pt-10 fluid-text-xl text-center lg:text-start font-extrabold leading-[100%]">
        Your Shopping Cart
      </h4>

      <div className="flex flex-col xl:flex-row items-start gap-5 xl:pb-10">
        <div
          className={`w-full xl:w-[1226px] lg:rounded-[8px] lg:overflow-visible lg:shadow-[0_0_14px_rgba(0,0,0,0.08)] ${cart.items.length >= 3 ? "xl:flex xl:flex-col" : ""}`}
          style={
            cart.items.length >= 3 && isXlUp && matchedHeight
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
            className={`flex flex-col items-center gap-[14px]  lg:block lg:gap-0 lg:py-0 lg:max-h-[490px] lg:overflow-y-auto lg:overscroll-contain gray-scrollbar ${cart.items.length >= 3 ? "xl:max-h-none xl:flex-1 xl:min-h-0" : ""}`}
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            {cart.items.map((item) => {
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
                        handleRemoveItem(item.product_id, item.variant_id);
                      } else {
                        const newQty = item.quantity - 1;
                        setLocalQtyMap((prev) => ({
                          ...prev,
                          [item.id]: String(newQty),
                        }));
                        handleUpdateQuantity(
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
                            handleUpdateQuantity(
                              item.product_id,
                              capped,
                              item.variant_id,
                              item.id,
                            );
                          }
                          return;
                        }

                        handleUpdateQuantity(
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
                      handleUpdateQuantity(
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
                    handleRemoveItem(item.product_id, item.variant_id)
                  }
                >
                  Remove
                </Link>
              );

              return (
                <div
                  key={item.id}
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
                            style={{ cursor: "not-allowed", opacity: 0.6 }}
                            className="w-[84px] h-[84px] object-cover rounded-md border border-[#e4e3e3]"
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
                            style={{ cursor: "not-allowed", opacity: 0.6 }}
                            className="w-[137px] h-[136px] object-cover rounded-md border border-[#e4e3e3]"
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
                        {/* {item.promotion_discount != null &&
                          item.promotion_discount > 0 && (
                            <span className="inline-block mt-1.5 bg-[#fff4f4] text-[#e53e3e] border border-[#fed7d7] rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                              🏷 Item Discount: $
                              {formatPrice(item.promotion_discount)}
                            </span>
                          )} */}
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
            })}
          </div>
        </div>

        <div
          ref={orderSummaryRef}
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

              {/* {cart.taxes &&
                cart.taxes.length > 0 &&
                cart.taxes.map((tax) => (
                  <div
                    key={tax.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-base text-[#726969]">
                      {tax.name} ({tax.rate}%)
                    </span>
                    <p className="text-base font-semibold text-black">
                      ${formatPrice(Number.parseFloat(tax.amount))}
                    </p>
                  </div>
                ))} */}

              {appliedPromoCode && discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="fluid-text-sm leading-[100%] text-[#726969]">
                    Coupon Discount ({appliedPromoCode})
                    <button
                      onClick={handleRemovePromo}
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
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="flex-1 min-w-0 h-auto! p-0! bg-transparent! border-0! rounded-none! shadow-none! ring-0! outline-none text-sm placeholder:text-[#726969] font-medium"
                />
                <button
                  className="text-[#01295f] fluid-text-xs font-medium  cursor-pointer disabled:opacity-50"
                  onClick={handleApplyPromoCode}
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
                  value={formData.pincode}
                  onPlaceSelect={(data) => {
                    if (!data.pincode) {
                      toast.error("Please select a valid pincode");
                      return;
                    }

                    handleChange({
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
                  onClick={handleCheckDelivery}
                  disabled={isCheckingDelivery}
                  className="text-[#01295f] text-sm font-medium ml-auto whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  {isCheckingDelivery ? "Checking..." : "Check Delivery"}
                </button>
              </div>

              {formErrors.pincode && (
                <p className="text-[#fd151b] text-xs mt-1.5">
                  {formErrors.pincode}
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
      </div>
    </div>
  );
};

export default Cart;
