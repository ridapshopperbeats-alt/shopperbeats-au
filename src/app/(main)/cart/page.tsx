"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useCheckDeliveryMutation,
  useUpdateCartItemQuantityMutation,
  useValidatePromoCodeMutation,
} from "@/lib/redux/apis/cartApi";

import { toast } from "react-toastify";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import * as yup from "yup";
import { useMemo, useRef, useState, useEffect } from "react";
import { useGlobalPostcode } from "@/lib/hooks/useGlobalPostcode";
import Button from "@/components/ui/Button";
import { getPriceDetails } from "@/lib/utils/getPriceDetails";
import { getImageUrl } from "@/lib/utils/imageUtils";
import { pincode } from "@/lib/hooks/useYupValidation";
import Loader from "@/components/ui/loaders/Loader";
import GooglePlacesInput from "@/components/ui/AddressAutocomplete";
import { formatPrice } from "@/lib/utils/formatPrice";
import NoProductsFound from "@/components/NoProductFound";
import GppGoodOutlinedIcon from "@mui/icons-material/GppGoodOutlined";
import { Input } from "@/components/ui/input";

// ---------------- SCHEMAS ----------------
const pincodeSchema = yup.object().shape({
  pincode: pincode,
});

const Cart = () => {
  const { postcode, updatePostcode } = useGlobalPostcode();
  const {
    data: cart,
    error,
    isLoading,
    isFetching,
  } = useGetCartQuery(postcode ? { postcode } : undefined, {
    refetchOnMountOrArgChange: true,
  });
  const clickLockRef = useRef(false);

  const [removeFromCart, { isLoading: isRemoving }] =
    useRemoveFromCartMutation();
  const [validatePromoCode, { isLoading: isApplyingPromo }] =
    useValidatePromoCodeMutation();
  const [checkDelivery, { isLoading: isCheckingDelivery }] =
    useCheckDeliveryMutation();
  const [updateCartItemQuantity, { isLoading: isUpdating }] =
    useUpdateCartItemQuantityMutation();

  const { formData, formErrors, handleChange, handleSubmit, setFormData } =
    useFormValidation(pincodeSchema, { pincode: postcode || "" });

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);

  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);

  const [discountAmount, setDiscountAmount] = useState(0);
  const [newTotalPrice, setNewTotalPrice] = useState<number | null>(null);

  // Update form when global postcode changes
  useEffect(() => {
    if (postcode) {
      setFormData((prev) => ({ ...prev, pincode: postcode }));
    }
  }, [postcode, setFormData]);

  // Restore promo code from session storage on mount
  useEffect(() => {
    const storedPromoData = sessionStorage.getItem("appliedPromoCode");
    if (storedPromoData) {
      try {
        const promoData = JSON.parse(storedPromoData);
        if (promoData && promoData.code) {
          setAppliedPromoCode(promoData.code);
          setDiscountAmount(promoData.discount_amount);
          setNewTotalPrice(promoData.new_total);
          setPromoCodeInput(promoData.code);
        }
      } catch {
        // ignore malformed stored promo data
      }
    }
  }, []);

  // Recalculate promo discount when cart changes
  useEffect(() => {
    const revalidatePromo = async () => {
      if (!appliedPromoCode || !cart?.total_price || !cart.id) return;

      try {
        const response = await validatePromoCode({
          coupon_code: appliedPromoCode,
          cart_id: cart.id,
          post_code: postcode,
        }).unwrap();

        if (response.is_valid) {
          const { discount_type, discount_value, max_discount } = response;
          let discount = 0;
          if (discount_type === "percentage" && discount_value) {
            discount =
              (cart.total_price * Number.parseFloat(discount_value)) / 100;
            if (max_discount) {
              discount = Math.min(discount, Number.parseFloat(max_discount));
            }
          } else if (discount_type === "fixed" && discount_value) {
            discount = Number.parseFloat(discount_value);
          }
          const newTotal = Math.max(cart.total_price - discount, 0);

          setDiscountAmount(discount);
          setNewTotalPrice(newTotal);

          const promoData = {
            code: appliedPromoCode,
            discount_amount: discount,
            discount_type,
            discount_value: discount_value || "0",
            original_total: cart.grand_total,
            new_total: newTotal,
            max_discount: max_discount,
          };
          sessionStorage.setItem("appliedPromoCode", JSON.stringify(promoData));
          window.dispatchEvent(new Event("promoUpdated"));
        } else {
          // If no longer valid, remove it
          handleRemovePromo();
          toast.info("Promo code no longer applicable.");
        }
      } catch {
        // ignore re-validation error silently
      }
    };

    revalidatePromo();
  }, [cart?.total_price]);

  /* ---------------- MEMOIZED SUBTOTAL ---------------- */
  /*
  const subtotal = useMemo(() => {
    if (!cart?.items) return 0;

    return cart.items.reduce((acc, item) => {
      const productForPriceDetails = {
        price: item.unit_price,
        rrp_price: item.rrp_price_snapshot,
        discount_percentage: item.discount_percentage,
        discounted_price: item.discounted_price,
        oldPrice: item.oldPrice,
        discount: item.discount,
      };
      const { mainPrice } = getPriceDetails(productForPriceDetails);
      return acc + mainPrice * Number(item.quantity);
    }, 0);
  }, [cart]);
  */

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
      const { saveAmount } = getPriceDetails(productForPriceDetails);
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

    if (!cart) {
      setPromoCodeError("Cart not available.");
      toast.error("Cart not available.");
      return;
    }

    if (
      appliedPromoCode &&
      appliedPromoCode.toLowerCase() === promoCodeInput.trim().toLowerCase()
    ) {
      setPromoCodeError("already applied");
      toast.error("already applied");
      return;
    }

    // try {
    //   setPromoCodeError(null);
    //   const response = await validatePromoCode({
    //     code: promoCodeInput,
    //     cartTotal: cart.total_price,
    //   }).unwrap();
    try {
      setPromoCodeError(null);
      const response = await validatePromoCode({
        coupon_code: promoCodeInput,
        cart_id: cart.id,
        user_id: "", // Optional
        order_id: "", // Optional
        post_code: postcode,
      }).unwrap();

      // const { discount_type, discount_value } = response;

      // Check if coupon is valid
      if (!response.is_valid) {
        setPromoCodeError(response.message || "Invalid coupon code");
        setAppliedPromoCode(null);
        setDiscountAmount(0);
        setNewTotalPrice(null);
        toast.error(response.message || "Invalid coupon code");
        return;
      }

      // Calculate discount
      const { discount_type, discount_value, max_discount } = response;
      let discount = 0;
      // if (discount_type === "percentage") {
      //   discount = (subtotal * discount_value) / 100;
      // } else if (discount_type === "fixed") {
      //   discount = discount_value;
      if (discount_type === "percentage" && discount_value) {
        discount = (cart.total_price * Number.parseFloat(discount_value)) / 100;

        // Apply max discount cap if specified
        if (max_discount) {
          discount = Math.min(discount, Number.parseFloat(max_discount));
        }
      } else if (discount_type === "fixed" && discount_value) {
        discount = Number.parseFloat(discount_value);
      }
      // const newTotal = Math.max(subtotal - discount, 0);
      // Calculate new total: total_price - discount
      const newTotal = Math.max(cart.total_price - discount, 0);

      setAppliedPromoCode(promoCodeInput);
      setDiscountAmount(discount);
      setNewTotalPrice(newTotal);

      // Store promo code data for checkout
      const promoData = {
        code: promoCodeInput,
        discount_amount: discount,
        discount_type,
        discount_value: discount_value || "0",
        original_total: cart.grand_total,
        new_total: newTotal,
        max_discount: max_discount, // Store max_discount for recalculation
      };
      sessionStorage.setItem("appliedPromoCode", JSON.stringify(promoData));
      window.dispatchEvent(new Event("promoUpdated"));

      toast.success(response.message || "Coupon applied successfully!");
    } catch (error) {
      setPromoCodeError("Failed to apply promo code.");
      setAppliedPromoCode(null);
      setDiscountAmount(0);
      setNewTotalPrice(null);
      // Clear any stored promo data on error
      sessionStorage.removeItem("appliedPromoCode");
      toast.error("Failed to apply promo code.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromoCode(null);
    setDiscountAmount(0);
    setNewTotalPrice(null);
    setPromoCodeInput("");
    sessionStorage.removeItem("appliedPromoCode");
    window.dispatchEvent(new Event("promoUpdated"));
    toast.info("Promo code removed.");
  };

  // ---------------- REMOVE ITEM ----------------
  const handleRemoveItem = async (id: string, variant_id?: string) => {
    if (clickLockRef.current) return;
    clickLockRef.current = true;
    if (isRemoving || isUpdating) return;
    try {
      await removeFromCart({ product_id: id, variant_id }).unwrap();
    } catch {
      toast.error("Failed to remove item.");
    } finally {
      setTimeout(() => {
        clickLockRef.current = false;
      }, 300); // small delay to prevent rapid spam
    }
  };

  useEffect(() => {
    if (cart && cart.items.length === 0) {
      setAppliedPromoCode(null);
      setDiscountAmount(0);
      setNewTotalPrice(null);
      setPromoCodeInput("");

      sessionStorage.removeItem("appliedPromoCode");
      window.dispatchEvent(new Event("promoUpdated"));
    }
  }, [cart]);

  // ---------------- CHECK DELIVERY ----------------
  const handleCheckDelivery = handleSubmit(async (data) => {
    try {
      const response = await checkDelivery(data.pincode).unwrap();
      response.deliverable
        ? toast.success("Delivery available!")
        : toast.error(response.message || "Delivery not available");
    } catch {
      toast.error("Invalid Pincode");
    }
  });

  // Per-item local quantity display (allows user to clear & retype)
  const [localQtyMap, setLocalQtyMap] = useState<Record<string, string>>({});

  // Sync local qty map whenever cart items update from API
  useEffect(() => {
    if (!cart?.items) return;
    setLocalQtyMap((prev) => {
      const next = { ...prev };
      cart.items.forEach((item) => {
        // Only overwrite if there's no pending local edit
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
    if (isUpdating || isRemoving) return;
    if (quantity < 1 || Number.isNaN(quantity)) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      // Final safety check against available_stock before API call
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

      try {
        await updateCartItemQuantity({
          product_id,
          quantity,
          variant_id,
          postcode: postcode,
        }).unwrap();
        // Sync local state back to confirmed server value
        if (item_id != null) {
          const id: string = item_id;
          setLocalQtyMap((prev) => ({ ...prev, [id]: String(quantity) }));
        }
      } catch (err) {
        const error = err as { data?: { message?: string; detail?: string } };
        const errorMessage =
          error?.data?.message ||
          error?.data?.detail ||
          "Failed to update quantity";
        toast.error(errorMessage);
        if (item_id != null) {
          const id: string = item_id;
          setLocalQtyMap((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      }
    }, 800);
  };

  // ---------------- LOADING / EMPTY STATES ----------------
  if (isLoading || isFetching)
    return (
      <div className="flex flex-col justify-center items-center text-center p-8 min-h-[40vh]">
        <Loader />
      </div>
    );
  if (error || !cart || cart.items.length === 0)
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

  // ---------------- RENDER ----------------
  return (
    <div className="container">
      <h4 className="mb-4 lg:pt-7 text-[24px] text-center lg:text-start font-extrabold leading-[100%]">
        Your Shopping Cart
      </h4>

      <div className="flex flex-col xl:flex-row items-start gap-5 pb-14">
        {/* CART LIST */}
        <div className="w-full xl:w-[1226px] lg:rounded-[8px] lg:overflow-visible lg:shadow-[0_0_20px_rgba(0,0,0,0.18)]">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#D9D2D2] text-[16px] leading-[100%] font-medium">
            <div className="col-span-6 text-base">Item</div>
            <div className="col-span-2 text-base text-center">Qty.</div>
            <div className="col-span-2 text-base">Item Price</div>
            <div className="col-span-2 text-base">Subtotal</div>
          </div>

          <div
            className="flex flex-col items-center gap-[14px] py-4 lg:block lg:gap-0 lg:py-0 lg:max-h-[490px] lg:overflow-y-auto lg:overscroll-contain gray-scrollbar no-scrollbar"
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
                productForPriceDetails,
              );

              // const itemSubtotal = mainPrice * Number(item.quantity);
              const itemSubtotal =
                item.subtotal ?? mainPrice * Number(item.quantity);

              const itemInfo = (
                <>
                  <h3 className="text-[12px] lg:text-[14px] font-semibold leading-[100%] text-black mb-0.5 lg:mb-1.5 line-clamp-1">
                    {item.is_active ? (
                      <Link
                        href={`/product/${item.unique_code || item.product_id}`}
                      >
                        {item.product_name}
                      </Link>
                    ) : (
                      <span style={{ cursor: "not-allowed", opacity: 0.7 }}>
                        {item.product_name}
                      </span>
                    )}
                  </h3>

                  {!item.is_active ? (
                    <p className="text-[12px] leading-tight lg:leading-[100%] font-bold text-[#fd151b] mb-0.5 lg:mb-1.5">
                      Not Available Currently
                    </p>
                  ) : item.available_stock !== undefined &&
                    item.available_stock <= 0 ? (
                    <p className="text-[12px] leading-tight lg:leading-[100%] font-bold text-[#fd151b] mb-0.5 lg:mb-1.5">
                      Out of Stock
                    </p>
                  ) : (
                    <p className="text-[11px] lg:text-[12px] leading-tight lg:leading-[100%] font-bold text-[#01295F] mb-0.5 lg:mb-1.5">
                      In Stock{" "}
                      <span className="text-[#049950]">
                        Code Applied - (GET500) 50% OFF
                        {item.promotion_discount != null &&
                          item.promotion_discount > 0 && (
                            <span className="ml-1 font-medium">
                              - ${formatPrice(item.promotion_discount)}
                            </span>
                          )}
                      </span>
                    </p>
                  )}
                  {item.shipping_cost === 0 && (
                    <p className="text-[12px] lg:text-[14px] leading-[100%] text-[#726969] mb-0.5 lg:mb-1.5">
                      Eligible For FREE Shipping
                    </p>
                  )}
                  {item.handling_time_days === 1 ? (
                    <p className="text-[12px] lg:text-[14px] leading-[100%] text-[#726969] mb-0.5 lg:mb-1.5">
                      Leaves warehouse in Next business day
                    </p>
                  ) : (
                    <p className="text-[12px] lg:text-[14px] leading-[100%] text-[#726969] mb-0.5 lg:mb-1.5">{`Leaves warehouse in 1 – ${item.handling_time_days} business days`}</p>
                  )}

                  {item.variant_attributes &&
                    item.variant_attributes.length > 0 && (
                      <div>
                        {item.variant_attributes.map((attr) => (
                          <p
                            key={attr.name}
                            className="text-[12px] lg:text-[14px] leading-[100%] text-black"
                          >
                            <strong className="font-medium">
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
                      isUpdating ||
                      isRemoving ||
                      clickLockRef.current ||
                      !item.is_active ||
                      (item.available_stock !== undefined &&
                        item.available_stock <= 0)
                    }
                    className="w-7 h-7 flex items-center justify-center text-lg leading-none text-black disabled:opacity-40 cursor-pointer border-0"
                    onClick={() => {
                      if (
                        clickLockRef.current ||
                        isUpdating ||
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
                  <Input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    min="1"
                    value={localQtyMap[item.id] ?? item.quantity}
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
                    disabled={isUpdating}
                    className="!w-8 !h-auto !min-w-0 !p-0 !py-0 !bg-transparent !border-0 !rounded-none !shadow-none !ring-0 text-center text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <Button
                    disabled={
                      isUpdating ||
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
                  className={`lg:text-[14px] text-[12px] leading-[100%] underline mt-1 ${!item.is_active ? "text-[#fd151b] font-bold" : "text-[#726969]"}`}
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
                  className={`md:w-full lg:border-b lg:border-[#e4e3e3] lg:last:border-b-0 lg:px-6 lg:py-5 ${!item.is_active ? "opacity-60" : ""}`}
                >
                  {/* MOBILE / TABLET CARD  */}
                  <div className="lg:hidden w-[358px] mx-auto rounded-[8px] bg-white shadow-[0px_0px_14px_0px_#00000014] p-4 overflow-hidden">
                    <div className="flex flex-row gap-3">
                      <div className="shrink-0 w-[84px] h-[84px]">
                        {item.is_active &&
                        (item.available_stock === undefined ||
                          item.available_stock > 0) ? (
                          <Link
                            href={`/product/${item.unique_code || item.product_id}`}
                          >
                            <Image
                              src={getImageUrl(item)}
                              alt={item.product_name}
                              width={84}
                              height={84}
                              loading="lazy"
                              className="w-[84px] h-[84px] object-cover"
                            />
                          </Link>
                        ) : (
                          <Image
                            src={getImageUrl(item)}
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
                        <span className="text-[#fd151b] font-semibold text-[16px] leading-tight">
                          ${formatPrice(item.final_price ?? itemSubtotal)}
                        </span>
                        {showWasPrice && (
                          <span className="text-[12px] lg:text-[16px] leading-[100%] text-[#726969] line-through">
                            ${formatPrice(wasPrice)}
                          </span>
                        )}
                        {removeLink}
                      </div>
                    </div>

                    {/* {item.promotion_discount != null &&
                      item.promotion_discount > 0 && (
                        <span className="inline-block mt-1 bg-[#fff4f4] text-[#e53e3e] border border-[#fed7d7] rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                          🏷 Item Discount: $
                          {formatPrice(item.promotion_discount)}
                        </span>
                      )} */}

                    <span className="inline-flex mt-1.5 bg-[#01295F] text-white text-[10px] leading-[100%] font-semibold w-[88px] h-[20px] rounded-[4px] text-center items-center  justify-center">
                      SALE 20% OFF
                    </span>
                  </div>

                  {/* DESKTOP GRID (lg / 1024px and up) */}
                  <div className="hidden lg:grid lg:grid-cols-12 lg:items-center lg:gap-4">
                    {/* ITEM */}
                    <div className="col-span-6 flex flex-row gap-[20px]">
                      <div className="shrink-0 w-[137px] h-[136px]">
                        {item.is_active &&
                        (item.available_stock === undefined ||
                          item.available_stock > 0) ? (
                          <Link
                            href={`/product/${item.unique_code || item.product_id}`}
                          >
                            <Image
                              src={getImageUrl(item)}
                              alt={item.product_name}
                              width={137}
                              height={136}
                              loading="lazy"
                              className="w-[137px] h-[136px] object-cover"
                            />
                          </Link>
                        ) : (
                          <Image
                            src={getImageUrl(item)}
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

                    {/* QUANTITY */}
                    <div className="col-span-2 flex justify-center items-center">
                      {qtySelector}
                    </div>

                    {/* PRICE */}
                    <div className="col-span-2 flex justify-start items-center">
                      <div className="flex flex-col items-start">
                        <div className="flex flex-row lg:flex-col xl:flex-row items-start xl:items-center gap-2 lg:gap-0 xl:gap-2">
                          <span className="text-[16px] font-semibold text-[#FD151B]">
                            ${formatPrice(mainPrice)}
                          </span>

                          {showWasPrice && (
                            <span className="text-[16px] text-[#726969] line-through">
                              ${formatPrice(wasPrice)}
                            </span>
                          )}
                        </div>
                        {item.promotion_discount != null &&
                          item.promotion_discount > 0 && (
                            <span className="inline-block mt-1.5 bg-[#fff4f4] text-[#e53e3e] border border-[#fed7d7] rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                              🏷 Item Discount: $
                              {formatPrice(item.promotion_discount)}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* SUBTOTAL */}
                    <div className="col-span-2 flex justify-start items-center">
                      <div className="flex flex-col items-start">
                        <span className="text-[#fd151b] font-semibold text-[16px]">
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

        {/* ORDER SUMMARY */}
        <div className="w-[358px] mx-auto lg:w-full xl:w-[488px] xl:min-h-[522px] bg-white rounded-[8px] shadow-[0px_0px_14px_rgba(0,0,0,0.08)] p-6 flex flex-col xl:sticky xl:top-24 xl:self-start">
          <div className="flex items-center justify-between mb-5">
            <h5 className="text-[18px] font-bold leading-[100%] text-black">
              Order Summary
            </h5>
            <Link
              href="/login"
              className="text-[12px] lg:text-[16px] font-semibold text-black underline"
            >
              Sign in
            </Link>
          </div>

          <div className="flex flex-col gap-3 pb-4 border-b border-[#e5e5e5]">
            <div className="flex items-center justify-between">
              <span className="text-[14px] lg:text-[16px] leading-[100%] text-[#726969] font-medium">
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
              <p className="text-[14px] lg:text-[16px] font-semibold text-[#FD151B]">
                ${formatPrice(cart.subtotal ?? cart.items_total)}
              </p>
            </div>

            {totalSaveAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[14px] lg:text-[16px] leading-[100%] text-[#726969] font-medium">
                  Total Savings
                </span>
                <p className="text-[14px] lg:text-[16px] font-semibold text-[#16a249]">
                  -${formatPrice(totalSaveAmount)}
                </p>
              </div>
            )}

            {hasShippableItem && (
              <div className="flex items-center justify-between">
                <span className="text-[14px] lg:text-[16px] leading-[100%] text-[#726969] font-medium">
                  Shipping
                </span>
                <p className="text-[14px] lg:text-[16px] font-semibold text-black">
                  ${formatPrice(cart.shipping || 0)}
                </p>
              </div>
            )}

            {cart.taxes &&
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
              ))}

            {/* COUPON DISCOUNT */}
            {appliedPromoCode && discountAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[14px] lg:text-[16px] leading-[100%] text-[#726969]">
                  Coupon Discount ({appliedPromoCode})
                  <button
                    onClick={handleRemovePromo}
                    className="ml-4 text-[#fd151b] text-[12px] lg:text-[16px] hover:underline"
                  >
                    Remove
                  </button>
                </span>
                <p className="text-[14px] lg:text-[16px] font-semibold text-[#16a249]">
                  -${formatPrice(discountAmount)}
                </p>
              </div>
            )}
          </div>

          {/* PROMO */}
          <div className="pt-4">
            <div className="flex items-center border border-[#15112b2b] rounded-[5px] pl-5 pr-1.5 h-11 w-[430px] md:w-auto max-w-full overflow-hidden">
              <Input
                type="text"
                placeholder="Promo Code"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                className="flex-1 min-w-0 !h-auto !p-0 !bg-transparent !border-0 !rounded-none !shadow-none !ring-0 outline-none text-sm placeholder:text-[#726969] font-medium"
              />
              <button
                className="text-[#01295f] text-[12px] font-medium  cursor-pointer disabled:opacity-50"
                onClick={handleApplyPromoCode}
                disabled={isApplyingPromo}
              >
                {isApplyingPromo ? "Applying..." : "Apply"}
              </button>
            </div>

            {promoCodeError && (
              <p className="text-[#fd151b] text-xs mt-1.5">{promoCodeError}</p>
            )}
            {appliedPromoCode && (
              <p className="text-[#16a249] text-xs mt-1.5">
                Promo &quot;{appliedPromoCode}&quot; applied!
              </p>
            )}
          </div>

          <div className="flex items-center justify-between py-4 border-t border-[#e5e5e5] mt-4">
            <strong className="text-[18px] leading-[100%] font-semibold text-black">
              Total (Incl. GST)
            </strong>
            <div className="flex flex-col items-end gap-1">
              {totalSaveAmount > 0 && (
                <p className="text-[14px] lg:text-[16px] font-semibold leading-[100%] text-[#726969] line-through">
                  $
                  {formatPrice(
                    (newTotalPrice !== null
                      ? newTotalPrice
                      : cart.total_price) + totalSaveAmount,
                  )}
                </p>
              )}
              <p className="text-[20px] lg:text-[18px] leading-[100%] font-semibold text-[#fd151b]">
                $
                {formatPrice(
                  newTotalPrice !== null ? newTotalPrice : cart.total_price,
                )}
              </p>
            </div>
          </div>

          {/* PINCODE CHECK */}
          <div className="pb-4">
            <p className="text-[14px] lg:text-[16px] leading-[100%] font-medium text-black mb-2">
              Deliver To
            </p>
            <div className="flex items-center border border-[#15112b2b] rounded-[5px] pl-5 pr-1.5 h-11 w-[430px] md:w-auto max-w-full overflow-hidden">
              <GooglePlacesInput
                mode="pincode"
                placeholder="Enter Pincode"
                value={formData.pincode}
                onPlaceSelect={(data) => {
                  console.log(data, "data");
                  if (!data.pincode) {
                    toast.error("Please select a valid pincode");
                    return;
                  }

                  // Update form value (keeps Yup + submit working)
                  handleChange({
                    target: {
                      name: "pincode",
                      value: data.pincode,
                    },
                  } as React.ChangeEvent<HTMLInputElement>);
                  updatePostcode(data.pincode, data.city || "Melbourne");
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

          <Link href="/checkout" className="mt-auto">
            <Button
              className="bg-gradient-to-r from-[#FF676B] to-[#FD151B] h-[46px] rounded-[74px] text-[#F6F6F6] text-[16px] font-semibold leadiing-5 w-full shadow-md shadow-[#0E35BF]/25 cursor-pointer"
              debounceDelay={500}
            >
              Checkout
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-1.5 text-xs text-[#657689] mt-4 text-[12px] font-medium leading-5">
            <GppGoodOutlinedIcon /> Guaranteed Safe &amp; Secured Checkout
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
                    width={50}
                    height={15}
                    loading="lazy"
                    className="object-contain"
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
