"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import "../../styles/Checkout.css";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { checkoutValidationSchema } from "@/lib/validations/form-schemas";
import { useCreateOrderMutation } from "@/lib/redux/apis/order-api";
import {
  useClearCartMutation,
  useGetCartQuery,
} from "@/lib/redux/apis/cart-api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import CheckoutForm from "@/components/check-out/CheckoutForm";
import CheckoutHeader from "@/components/check-out/CheckoutHeader";
import CheckoutOrderSummary from "@/components/check-out/CheckoutOrderSummary";
import { useGetAddressesQuery } from "@/lib/redux/apis/address-api";
import { CartItem, PromoData } from "@/types/cart";
import { Address } from "@/types/address";
import {
  getPriceDetails,
  formatPrice,
  getImageUrl,
  getEstimatedDeliveryRange,
} from "@/lib/utils/main-utils";
import { RootState } from "@/lib/redux/store";
import { useSelector } from "react-redux";
import { useGetUserDetailsQuery } from "@/lib/redux/apis/auth-api";
import {
  CardNumberElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { getApiErrorMessage } from "@/lib/utils/api-error";

export default function SecureCheckout() {
  const { postcode } = useGlobalPostcode();
  const [debouncedPostcode, setDebouncedPostcode] = useState(postcode);
  const [selectedAddressData, setSelectedAddressData] = useState<{
    city: string;
    state: string;
    postcode: string;
  } | null>(null);

  const {
    data: cart,
    isLoading,
    isFetching,
  } = useGetCartQuery(
    debouncedPostcode ? { postcode: debouncedPostcode } : undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();
  const [clearCart] = useClearCartMutation();
  const mounted = useIsClient();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [shippingAddressValid, setShippingAddressValid] = useState(true);
  const [billingAddressValid, setBillingAddressValid] = useState(true);
  const isSubmittingRef = useRef(false);

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: userDetails } = useGetUserDetailsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const router = useRouter();

  const combinedCartItems: CartItem[] = useMemo(
    () => cart?.items ?? [],
    [cart],
  );

  useEffect(() => {
    if (
      !isLoading &&
      !isFetching &&
      cart &&
      combinedCartItems.length === 0 &&
      !isProcessingPayment
    ) {
      router.replace("/confirmed-order");
    }
  }, [isLoading, isFetching, cart, combinedCartItems, isProcessingPayment, router]);

  useEffect(() => {
    if (sessionStorage.getItem("orderConfirmation")) {
      sessionStorage.removeItem("orderConfirmation");
    }
  }, []);

  const { data: savedAddresses = [] } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const stripe = useStripe();
  const elements = useElements();
  const checkoutProducts: CartItem[] = useMemo(() => {
    return combinedCartItems.filter(
      (item) =>
        item.is_active &&
        (item.available_stock === undefined || item.available_stock > 0),
    );
  }, [combinedCartItems]);

  const maxHandlingDays = useMemo(() => {
    if (checkoutProducts.length === 0) return 0;
    return Math.max(
      ...checkoutProducts.map((item) => item.handling_time_days || 0),
      0,
    );
  }, [checkoutProducts]);

  const maxHandlingMaxDays = useMemo(() => {
    if (checkoutProducts.length === 0) return 0;
    return Math.max(
      ...checkoutProducts.map(
        (item) => item.handling_time_max_days ?? item.handling_time_days ?? 0,
      ),
      0,
    );
  }, [checkoutProducts]);

  const estimatedDeliveryRange = getEstimatedDeliveryRange(
    maxHandlingDays,
    maxHandlingMaxDays,
  );

  const {
    formData,
    formErrors,
    handleChange,
    handleSubmit,
    setFormData,
    setFormErrors,
  } = useFormValidation(checkoutValidationSchema, {
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
    cardNumber: "",
    expirationDate: "",
    securityCode: "",
    cardholderName: "",
    useShippingAddressAsBilling: false,
    billingFirstName: "",
    billingLastName: "",
    billingCompany: "",
    billingAddress: "",
    billingApartment: "",
    billingCity: "",
    billingState: "",
    billingPostcode: "",
    billingPhone: "",
    paymentMethod: "",
    country: "United States",
    billingCountry: "",
    buyNote: "",
  });

  useEffect(() => {
    if (!postcode) return;

    setFormData((prev) => ({
      ...prev,
      postcode,
    }));
  }, [postcode, setFormData]);

  useEffect(() => {
    if (userDetails?.response?.email) {
      setFormData((prev) => ({
        ...prev,
        email: userDetails.response.email,
      }));
    }
  }, [userDetails, setFormData]);

  useEffect(() => {
    if (!useSavedAddress || !selectedAddressId) return;

    const address = savedAddresses.find(
      (addr: Address) => addr.id === selectedAddressId,
    );

    if (!address) return;

    setFormData((prev) => ({
      ...prev,
      address: address.address,
      firstName: address.first_name,
      lastName: address.last_name,
      apartment: "",
      city: address.city,
      state: address.state,
      postcode: address.pincode,
      country: address.country,
      phone: address.phone_number || prev.phone,
    }));
  }, [useSavedAddress, selectedAddressId, savedAddresses, setFormData]);

  const handlePayNowValidated = handleSubmit(async (data) => {
    if (selectedAddressData) {
      const cityMatch =
        data.city.trim().toLowerCase() ===
        selectedAddressData.city.trim().toLowerCase();

      const stateMatch =
        data.state.trim().toLowerCase() ===
        selectedAddressData.state.trim().toLowerCase();

      const postcodeMatch =
        String(data.postcode).trim() ===
        String(selectedAddressData.postcode).trim();

      if (!cityMatch || !stateMatch || !postcodeMatch) {
        toast.error(
          "City, State and Postcode must match the selected address.",
        );
        return;
      }
    }
    if (isCreatingOrder || isProcessingPayment) return;

    setIsProcessingPayment(true);

    const storedPromoData = sessionStorage.getItem("appliedPromoCode");
    let promoData: PromoData | null = null;
    if (storedPromoData) {
      try {
        promoData = JSON.parse(storedPromoData) as PromoData;
      } catch {
        // ignore malformed promo data
      }
    }

    try {
      const hasNonShippableItem = checkoutProducts.some(
        (item) => item.is_shippable === false,
      );

      if (hasNonShippableItem) {
        toast.error(
          "One or more items in your cart cannot be shipped to this location. Please remove them to continue.",
        );
        return;
      }

      const hasUnavailableItem = checkoutProducts.some(
        (item) =>
          !item.is_active ||
          (item.available_stock !== undefined && item.available_stock <= 0),
      );

      if (hasUnavailableItem) {
        toast.error(
          "One or more items in your cart are currently unavailable or out of available_stock. Please remove them to continue.",
        );
        return;
      }

      if (!shippingAddressValid) {
        toast.error("Please enter a valid address");
        return;
      }

      if (data.useShippingAddressAsBilling && !billingAddressValid) {
        toast.error("Please enter a valid billing address");
        return;
      }

      if (
        formData.paymentMethod !== "CreditCard" &&
        formData.paymentMethod !== "paypal" &&
        formData.paymentMethod !== "afterpay" &&
        formData.paymentMethod !== "zip"
      ) {
        toast.error("Please select a payment method");
        return;
      }

      if (formData.paymentMethod === "CreditCard" && (!stripe || !elements)) {
        toast.error("Stripe is not ready");
        return;
      }

      if (checkoutProducts.length === 0) {
        toast.error("No items to checkout.");
        return;
      }

      const calculatedSubtotal = checkoutProducts.reduce((acc, item) => {
        return (
          acc +
          Number(item.unit_price ?? item.rrp_price_snapshot ?? 0) *
            Number(item.quantity ?? 0)
        );
      }, 0);
      const shippingCost = effectiveShipping;

      const promoDataForCheck = (() => {
        try {
          const stored = sessionStorage.getItem("appliedPromoCode");
          return stored ? JSON.parse(stored) : null;
        } catch {
          return null;
        }
      })();
      const checkTotal =
        (promoDataForCheck
          ? promoDataForCheck.new_total
          : calculatedSubtotal) + shippingCost;
      if (checkTotal >= 50000) {
        toast.error(
          "Orders of $50,000 or more cannot be placed in a single transaction. Please reduce your cart total and try again.",
        );
        return;
      }

      if (checkTotal <= 0) {
        toast.error("Total amount cannot be $0.00.");
        return;
      }

      if (formData.paymentMethod === "CreditCard") {
        const cardElement = elements?.getElement(CardNumberElement);

        if (!cardElement) {
          toast.error("Card details not found");
          return;
        }

        if (elements?.submit) {
          const { error } = await elements.submit();
          if (error) {
            toast.error(error.message || "Invalid card details");
            return;
          }
        }
      }

      const promoDiscount = promoData?.discount_amount ?? 0;

      const finalTotal = calculatedSubtotal + shippingCost - promoDiscount;

      const orderData = {
        warehouse_id: "warehouse-123",
        courier: "",
        tracking_number: "",
        notes: data.buyNote ? `[Buyer Note] ${data.buyNote}\n` : "",
        max_handling_days: maxHandlingDays,
        estimated_delivery_range: estimatedDeliveryRange,

        subtotal: calculatedSubtotal,
        shipping_cost: shippingCost,
        tax_amount: 0,
        total_amount: finalTotal,
        items_count: checkoutProducts.length,
        total_saving: totalSaveAmount,
        source: "web",
        currency: "AUD",
        customer_name: `${data.firstName} ${data.lastName}`,
        customer_email: data.email,
        customer_phone: String(data.phone),

        ...(promoData && {
          coupon_code: promoData.code,
          discount_amount: promoDiscount,
          coupon_type: promoData.discount_type,
          discount_value: promoData.discount_value,
        }),

        shipping_same_as_billing: data.useShippingAddressAsBilling,

        shipping: {
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.company,
          address: data.address,
          apartment: data.apartment,
          city: data.city,
          state: data.state,
          country: data.country || "AUS",
          postal_code: String(data.postcode),
          phone: String(data.phone),
        },

        billing: data.useShippingAddressAsBilling
          ? {
              first_name: data.firstName,
              last_name: data.lastName,
              company: data.company,
              address: data.address,
              apartment: data.apartment,
              city: data.city,
              state: data.state,
              country: data.country || "AUS",
              postal_code: String(data.postcode),
              phone: String(data.phone),
            }
          : {
              first_name: data.billingFirstName,
              last_name: data.billingLastName,
              company: data.billingCompany,
              address: data.billingAddress,
              apartment: data.billingApartment,
              city: data.billingCity,
              state: data.billingState,
              country: data.billingCountry || "AUS",
              postal_code: data.billingPostcode,
              phone: data.billingPhone,
            },

        payment_method: {
          type:
            formData.paymentMethod === "CreditCard"
              ? "CARD"
              : formData.paymentMethod === "afterpay"
                ? "afterpay_clearpay"
                : formData.paymentMethod === "zip"
                  ? "zip"
                  : "PAYPAL",
          provider:
            formData.paymentMethod === "CreditCard"
              ? "stripe"
              : formData.paymentMethod === "afterpay"
                ? "stripe"
                : formData.paymentMethod === "zip"
                  ? "stripe"
                  : "paypal",
        },

        items: checkoutProducts.map((item) => ({
          product_id: item.product_id,
          sku: item.sku || null,
          unique_code: item.unique_code || null,
          variant_id: item.variant_id,
          variant_attributes: item.variant_attributes,
          name: item.product_name,
          tags: item.tags,
          quantity: item.quantity,
          unit_price: Number(item.unit_price ?? item.rrp_price_snapshot ?? 0),
          total_price:
            Number(item.unit_price ?? item.rrp_price_snapshot ?? 0) *
            item.quantity,
          image: getImageUrl(item),
          vendor_id: item.vendor_id,
          ships_from_location: item.ships_from_location || null,
          ean_code: item.ean_code || null,
          handling_time_days: item.handling_time_days || 0,
          supplier: item.supplier || null,
          brand: item.brand || null,
        })),
      };

      
      const orderResult = await createOrder(orderData).unwrap();

      const paymentMethodLabel =
        formData.paymentMethod === "CreditCard"
          ? "Credit Card"
          : formData.paymentMethod === "afterpay"
            ? "Afterpay"
            : formData.paymentMethod === "zip"
              ? "Zip"
              : "PayPal";

      const buildProductsForConfirmation = () =>
        checkoutProducts.map((item) => {
          const productForPriceDetails = {
            price: item.unit_price,
            rrp_price: item.rrp_price_snapshot,
            discount_percentage: item.discount_percentage,
            discounted_price: item.discounted_price,
            oldPrice: item.oldPrice,
            discount: item.discount,
          };
          const { mainPrice, saveAmount } = getPriceDetails(
            productForPriceDetails,
          );
          const variant =
            item.variant_attributes && item.variant_attributes.length > 0
              ? item.variant_attributes
                  .map((attr) => `${attr.name}: ${attr.value}`)
                  .join(", ")
              : undefined;

          return {
            id: String(item.id),
            name: item.product_name,
            price: `$${formatPrice(mainPrice * item.quantity)}`,
            quantity: item.quantity,
            image: getImageUrl(item),
            variant,
            sku: item.sku || undefined,
            unitPrice: `$${formatPrice(mainPrice)}`,
            discount:
              saveAmount > 0 ? `$${formatPrice(saveAmount)}` : undefined,
            finalPrice: `$${formatPrice(mainPrice * item.quantity)}`,
          };
        });

      const buildOrderConfirmation = (
        productsForConfirmation: ReturnType<
          typeof buildProductsForConfirmation
        >,
      ) => ({
        orderId: orderResult.order_id,
        orderNumber: orderResult.order_number,
        deliveryCost: `$${formatPrice(orderResult.shipping_cost || 0)}`,
        totalAmount: `$${formatPrice(finalTotal)}`,
        products: productsForConfirmation,
        deliveryAddress: `${data.address}, ${data.city}, ${data.state}, ${data.postcode}, ${data.country}`,
        couponCode: promoData?.code,
        orderDate: new Date().toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        paymentMethod: paymentMethodLabel,
        paymentStatus: "Paid",
        estimatedDelivery: estimatedDeliveryRange,
        customerName: `${data.firstName} ${data.lastName}`,
        phone: String(data.phone),
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: String(data.postcode),
        country: data.country,
        subtotal: `$${formatPrice(calculatedSubtotal)}`,
        discountAmount: `$${formatPrice(promoDiscount)}`,
        shippingCost: `$${formatPrice(shippingCost)}`,
        taxAmount: `$${formatPrice(0)}`,
      });

      if (formData.paymentMethod === "paypal") {
        if (orderResult.approval_url) {
          const orderConfirmation = buildOrderConfirmation(
            buildProductsForConfirmation(),
          );

          sessionStorage.setItem(
            "orderConfirmation",
            JSON.stringify(orderConfirmation),
          );

          sessionStorage.removeItem("appliedPromoCode");
          window.location.replace(orderResult.approval_url);
          return;
        }
        toast.error("PayPal initiation failed");
        return;
      }

      if (
        formData.paymentMethod === "afterpay" ||
        formData.paymentMethod === "zip"
      ) {
        const orderConfirmation = buildOrderConfirmation(
          buildProductsForConfirmation(),
        );

        sessionStorage.setItem(
          "orderConfirmation",
          JSON.stringify(orderConfirmation),
        );

        sessionStorage.removeItem("appliedPromoCode");
        const result = await stripe?.confirmPayment({
          clientSecret: orderResult.client_secret,
          confirmParams: {
            return_url: window.location.origin + "/order-status?status=success",
            payment_method_data: {
              type:
                formData.paymentMethod === "afterpay"
                  ? "afterpay_clearpay"
                  : "zip",
              billing_details: {
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
              },
            },
          } as Parameters<
            NonNullable<typeof stripe>["confirmPayment"]
          >[0]["confirmParams"],
          redirect: "if_required",
        });

        if (result?.error) {
          sessionStorage.removeItem("orderConfirmation");
          toast.error(result.error.message || "Payment failed");
        }
        return;
      }

      const cardElement = elements?.getElement(CardNumberElement);
      if (!cardElement) {
        toast.error("Card details not found");
        return;
      }

      const stripeResult = await stripe?.confirmCardPayment(
        orderResult.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.cardholderName,
              email: formData.email,
            },
          },
        },
      );

      if (stripeResult?.error) {
        toast.error(stripeResult.error.message || "Payment failed");
        return;
      }

      if (stripeResult?.paymentIntent?.status === "succeeded") {
        toast.success("Payment successful!");

        if (cart?.id) {
          await clearCart({ cartId: cart.id }).unwrap();
        }

        const orderConfirmation = buildOrderConfirmation(
          buildProductsForConfirmation(),
        );

        sessionStorage.setItem(
          "orderConfirmation",
          JSON.stringify(orderConfirmation),
        );

        sessionStorage.removeItem("appliedPromoCode");
        sessionStorage.removeItem("checkoutFormData");

        router.replace("/confirmed-order");
      } else {
        toast.error(
          "Payment failed. Please check your card details and try again.",
        );
      }
    } catch (err) {
      sessionStorage.removeItem("orderConfirmation");

      const detail = (err as { data?: { detail?: string } })?.data?.detail;

      if (typeof detail === "string" && /insufficient.*stock/i.test(detail)) {
        toast.error(
          "Sorry, one or more items in your cart are out of stock. Please update your cart and try again.",
        );
      } else {
        toast.error(getApiErrorMessage(err, "Failed to place order"));
      }
    } finally {
      setIsProcessingPayment(false);
    }
  });

  const handlePayNow = async (e?: React.FormEvent) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      await handlePayNowValidated(e);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const orderSummary = checkoutProducts;
  const effectiveShipping = Number(cart?.shipping) || 0;
  const calculatedSubtotal = Number(cart?.total_price) || 0;

  const totalSaveAmount = ((): number => {
    if (orderSummary.length === 0) return 0;

    const itemSavings = orderSummary.reduce((acc, item) => {
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

    const promotionDiscount = Number(cart?.items_discount) || 0;

    return itemSavings + promotionDiscount;
  })();

  const [promoData] = useState<PromoData | null>(() => {
    if (typeof window === "undefined") return null;
    const storedPromoData = sessionStorage.getItem("appliedPromoCode");
    if (storedPromoData) {
      try {
        return JSON.parse(storedPromoData) as PromoData;
      } catch {
        return null;
      }
    }
    return null;
  });

  const finalTotal = calculatedSubtotal - (promoData?.discount_amount ?? 0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectivePostcode = formData.postcode || postcode;
  const [prevEffectivePostcode, setPrevEffectivePostcode] =
    useState(effectivePostcode);

  if (prevEffectivePostcode !== effectivePostcode) {
    setPrevEffectivePostcode(effectivePostcode);
    if (!(effectivePostcode && effectivePostcode.length === 5)) {
      setDebouncedPostcode("");
    }
  }

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (effectivePostcode && effectivePostcode.length === 5) {
      timerRef.current = setTimeout(() => {
        setDebouncedPostcode(effectivePostcode);
      }, 600);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [effectivePostcode]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="lg:py-7">
      <CheckoutHeader />
      <h1 className="font-extrabold text-xl md:text-2xl leading-[normal] tracking-[normal] text-center capitalize text-black mb-6 pt-5 lg:pt-0">
        Secure Checkout
      </h1>
      <div className="container flex flex-col xl:flex-row items-start justify-center gap-6 mx-auto">
        <div className="checkout-wrapper w-full xl:!w-[570px] xl:shrink-0 !pr-0 order-1">
          <CheckoutForm
            formData={formData}
            formErrors={formErrors}
            handleChange={handleChange}
            handlePayNow={handlePayNow}
            setFormData={setFormData}
            isCreatingOrder={isCreatingOrder || isProcessingPayment}
            useSavedAddress={useSavedAddress}
            setUseSavedAddress={setUseSavedAddress}
            savedAddresses={savedAddresses}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            setFormErrors={setFormErrors}
            onShippingAddressValid={setShippingAddressValid}
            onBillingAddressValid={setBillingAddressValid}
            shippingCost={effectiveShipping}
            setSelectedAddressData={setSelectedAddressData}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <CheckoutOrderSummary
          isLoading={isLoading}
          orderSummary={orderSummary}
          effectiveShipping={effectiveShipping}
          totalSaveAmount={totalSaveAmount}
          promoData={promoData}
          finalTotal={finalTotal}
          isCreatingOrder={isCreatingOrder}
          isProcessingPayment={isProcessingPayment}
        />
      </div>
    </div>
  );
}
