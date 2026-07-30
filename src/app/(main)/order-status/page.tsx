"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { useCapturePaymentMutation } from "@/lib/redux/apis/payment-api";
import { useClearCartMutation, useGetCartQuery } from "@/lib/redux/apis/cart-api";
import { toast } from "react-toastify";
import stripePromise from "@/lib/stripe";

function OrderStatusContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const hasProcessedPayment = useRef(false);
  const searchParams = useSearchParams();
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(
    !!searchParams.get("payment_intent_client_secret") || !!searchParams.get("token")
  );
  const status = searchParams.get("status");
  const [actualRedirectStatus, setActualRedirectStatus] = useState(searchParams.get("redirect_status"));
  const [capturePayment] = useCapturePaymentMutation();
  const [clearCart] = useClearCartMutation();
const {
  data: cart,
  isSuccess: isCartLoaded,
} = useGetCartQuery(undefined, {
  refetchOnMountOrArgChange: true,
});

  useEffect(() => {
    // If cancelled or failed, don't try to load order details
    if (status === "cancel" || actualRedirectStatus === "failed") {
      setIsLoading(false);
      return;
    }

    if (isVerifyingPayment) {
      return;
    }

    // Add a small delay to ensure sessionStorage is available
    const timer = setTimeout(() => {
      const storedOrderConfirmation = sessionStorage.getItem('orderConfirmation');

      if (storedOrderConfirmation) {
        router.replace("/confirmed-order");
        return;
      } else {
        // Redirect to home if no order data
        router.replace("/");
        return;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router, status, isVerifyingPayment, actualRedirectStatus]);

  useEffect(() => {
    const token = searchParams.get("token");
    const payerId = searchParams.get("PayerID");
    const paymentIntent = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");
    
    // Do not process payment capture if status is cancel or failed
    if (status === "cancel" || actualRedirectStatus === "failed") return;

    // Handle PayPal payment
    if (token && payerId && !isProcessingPayment && !hasProcessedPayment.current) {
      const handleCapture = async () => {
        hasProcessedPayment.current = true;
        setIsProcessingPayment(true);
        const toastId = toast.loading("Processing PayPal payment...");
        try {
          await capturePayment({ token }).unwrap();


            toast.update(toastId, {
              render: "Payment Successful!",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            sessionStorage.removeItem("checkoutFormData");

          // Wait for cart to be available
          if (isCartLoaded && cart?.id) {
            await clearCart({ cartId: cart.id }).unwrap();
          }
        } catch {
          toast.error("Payment detection failed or cancelled.", { toastId: toastId });
          if (isCartLoaded && cart?.id) {
            await clearCart({ cartId: cart.id }).unwrap();
          }
          router.replace("/user/orders");
        } finally {
          setIsProcessingPayment(false);
          setIsVerifyingPayment(false);
        }
      };

      if (isCartLoaded) {
        handleCapture();
      }
    }
    
    // Handle Stripe payment (Afterpay/Zip)
    else if (paymentIntent && !isProcessingPayment && !hasProcessedPayment.current) {
      const handleStripeSuccess = async () => {
        hasProcessedPayment.current = true;
        setIsProcessingPayment(true);
        const toastId = toast.loading("Processing payment...");
        try {
          const clientSecret = searchParams.get("payment_intent_client_secret");
          if (clientSecret) {
            const stripe = await stripePromise;
            if (stripe) {
              const { paymentIntent: pi } = await stripe.retrievePaymentIntent(clientSecret);
              if (pi && pi.status !== "succeeded" && pi.status !== "processing") {
                toast.update(toastId, {
                  render: "Payment Failed",
                  type: "error",
                  isLoading: false,
                  autoClose: 3000,
                });
                setActualRedirectStatus("failed");
                
                // Clear cart even on failure because order is created
                if (isCartLoaded && cart?.id) {
                  await clearCart({ cartId: cart.id }).unwrap();
                }

                setIsLoading(false);
                setIsProcessingPayment(false);
                setIsVerifyingPayment(false);
                return;
              }
            }
          }

          toast.update(toastId, {
            render: "Payment Successful!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          localStorage.removeItem("checkoutFormData");

          // Wait for cart to be available
          if (isCartLoaded && cart?.id) {
            await clearCart({ cartId: cart.id }).unwrap();
          }
        } catch {
          toast.error("Payment processing failed.", { toastId: toastId });
        } finally {
          setIsProcessingPayment(false);
          setIsVerifyingPayment(false);
        }
      };

      if (isCartLoaded) {
        handleStripeSuccess();
      }
    }
  }, [searchParams, capturePayment, cart?.id, clearCart, router, isProcessingPayment, isCartLoaded, status]);

  useEffect(() => {
    // Clear cart on manual cancel if not already cleared
    if (status === "cancel" && isCartLoaded && cart?.id) {
      clearCart({ cartId: cart.id });
    }
  }, [status, isCartLoaded, cart?.id, clearCart]);

  if (isLoading) {
    return null;
  }

  if (status === "cancel") {
    return (
      <div className="pt-40 pb-70">
        <div className="container order-status-box">
          <h2 className="order-status-title">Payment Cancelled</h2>
          <p className="order-status-message">Your payment was cancelled and the order has not been placed.</p>
          <button className="btn btn-red btn-filled order-status-btn" onClick={() => router.replace('/cart')}>
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  if (actualRedirectStatus === "failed") {
    return (
      <div className="pt-40 pb-70">
        <div className="container order-status-box">
          <h2 className="order-status-title">Payment Failed</h2>
          <p className="order-status-message">Unfortunately, your payment could not be processed. Please try again with a different payment method.</p>
          <button className="btn btn-red btn-filled order-status-btn" onClick={() => router.replace('/user/orders')}>
            Return to My Orders
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={null}>
      <OrderStatusContent />
    </Suspense>
  );
}