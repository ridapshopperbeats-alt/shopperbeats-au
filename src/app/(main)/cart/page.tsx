"use client";

import Image from "next/image";

import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import * as yup from "yup";
import { useMemo, useRef, useState, useEffect } from "react";
import { pincode } from "@/lib/validations/form-schemas";
import { getPriceDetails } from "@/lib/utils/main-utils";
import NoProductsFound from "@/components/NoProductFound";
import CartItemsList from "@/components/cart/CartItemsList";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import { ShieldCheck } from "lucide-react";
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
import { getApiErrorMessage } from "@/lib/utils/api-error";

const pincodeSchema = yup.object().shape({
  pincode: pincode,
});

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
   
      setPromoCodeError(null);
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
        toast.success(message);
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
      const result = await removeCoupon().unwrap();
      setAppliedPromoCode(null);
      setDiscountAmount(0);
      setNewTotalPrice(null);
      setPromoCodeInput("");
      setPromoCodeError(null);
      toast.info(
        
          result.message || "Coupon removed successfully"
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to remove coupon."));
    }
  };

  const handleRemoveItem = async (id: string, variant_id?: string) => {
    if (clickLockRef.current) return;
    clickLockRef.current = true;
    if (isRemoving || isUpdating) {
      clickLockRef.current = false;
      return;
    }

    try {
      const result = await removeFromCart({
        product_id: id,
        variant_id,
      }).unwrap();
      toast.info(result.message || "Item removed from cart");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to remove item."));
    } finally {
      clickLockRef.current = false;
    }
  };

  useEffect(() => {
    if (cart && cart.items.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppliedPromoCode(null);
      setDiscountAmount(0);
      setNewTotalPrice(null);
      setPromoCodeInput("");
    }
  }, [cart]);

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
        <CartItemsList
          items={cart.items}
          isXlUp={isXlUp}
          matchedHeight={matchedHeight}
          updatingItemId={updatingItemId}
          isRemoving={isRemoving}
          clickLockRef={clickLockRef}
          localQtyMap={localQtyMap}
          setLocalQtyMap={setLocalQtyMap}
          onRemoveItem={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
        />

        <CartOrderSummary
          summaryRef={orderSummaryRef}
          cart={cart}
          authChecked={authChecked}
          isAuthenticated={isAuthenticated}
          totalSaveAmount={totalSaveAmount}
          hasShippableItem={hasShippableItem}
          newTotalPrice={newTotalPrice}
          appliedPromoCode={appliedPromoCode}
          discountAmount={discountAmount}
          promoCodeInput={promoCodeInput}
          onPromoCodeInputChange={setPromoCodeInput}
          promoCodeError={promoCodeError}
          onApplyPromoCode={handleApplyPromoCode}
          isApplyingPromo={isApplyingPromo}
          onRemovePromo={handleRemovePromo}
          isRemovingPromo={isRemovingPromo}
          pincode={formData.pincode}
          pincodeError={formErrors.pincode}
          onPincodeChange={handleChange}
          updatePostcode={updatePostcode}
          onCheckDelivery={handleCheckDelivery}
          isCheckingDelivery={isCheckingDelivery}
          isXlUp={isXlUp}
          secureCheckoutSection={secureCheckoutSection}
        />
      </div>
    </div>
  );
};

export default Cart;
