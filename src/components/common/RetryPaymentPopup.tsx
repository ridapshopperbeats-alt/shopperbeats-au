"use client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "@/components/common/Button";
import { useRetryPaymentMutation } from "@/lib/redux/apis/order-api";
import { toast } from "react-toastify";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface RetryPaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const RetryPaymentForm: React.FC<RetryPaymentPopupProps> = ({ isOpen, onClose, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [retryPayment] = useRetryPaymentMutation();
  const [paymentMethod, setPaymentMethod] = useState("CreditCard");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (paymentMethod === "CreditCard" && (!stripe || !elements)) {
        toast.error("Stripe is not ready");
        setIsProcessing(false);
        return;
      }

      const methodPayload = {
        type: paymentMethod === "CreditCard" ? "CARD" : paymentMethod === "afterpay" ? "afterpay_clearpay" : paymentMethod === "zip" ? "zip" : "PAYPAL",
        provider: paymentMethod === "paypal" ? "paypal" : "stripe",
      };

      const result = await retryPayment({
        order_id: orderId,
        payment_method: methodPayload,
      }).unwrap();

      if (paymentMethod === "paypal") {
        if (result.approval_url) {
          window.location.href = result.approval_url;
          return;
        }
        toast.error("PayPal initiation failed");
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === "afterpay" || paymentMethod === "zip") {
        const paymentOptions = {
          clientSecret: result.client_secret,
          confirmParams: {
            return_url: window.location.origin + "/order-status?status=success",
            payment_method_data: {
              type: paymentMethod === "afterpay" ? "afterpay_clearpay" : "zip",
            },
          },
          redirect: "if_required",
        } as never as Parameters<NonNullable<typeof stripe>["confirmPayment"]>[0];

        const confirmResult = await stripe?.confirmPayment(paymentOptions);

        if (confirmResult?.error) {
          toast.error(confirmResult.error.message || "Payment failed");
        }
        setIsProcessing(false);
        return;
      }

      // Credit Card
      const cardElement = elements?.getElement(CardElement);
      if (!cardElement) {
        toast.error("Card details not found");
        setIsProcessing(false);
        return;
      }

      const stripeResult = await stripe?.confirmCardPayment(result.client_secret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeResult?.error) {
        toast.error(stripeResult.error.message || "Payment failed");
      } else if (stripeResult?.paymentIntent?.status === "succeeded") {
        toast.success("Payment successful!");
        onClose();
        // Full reload so the order page reflects the new payment status.
        window.location.reload();
      }
    } catch {
      toast.error("Failed to retry payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="popupModal"
      className="ordermodal retrypopup fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "popupModal") {
          onClose();
        }
      }}
    >
      <div className="modal-content" style={{ padding: "30px", position: "relative", maxWidth: "500px", width: "95%" }}>
        <button
          className="close"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "10px",
            right: "15px",
            fontSize: "28px",
            background: "none",
            border: "none",
            cursor: "pointer",
            lineHeight: "1",
            color: "black",
          }}
        >
          ×
        </button>
        <h3 className="align-center pt-0">Retry Payment</h3>
        <p className="align-center mb-20 text-gray-600">Select a payment method to complete your order.</p>

        <form onSubmit={handleSubmit} className="checkout-form mt-30">
          <div className="h-[500px] w-[450px]">
            <div className="payment-card" style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "8px", }}>
              <label className="flex gap-2 cursor-pointer font-bold">
                <input
                  type="radio"
                  name="retryPaymentMethod"
                  value="CreditCard"
                  checked={paymentMethod === "CreditCard"}
                  onChange={() => setPaymentMethod("CreditCard")}
                />
                Credit Card
              </label>
              <div className="payment-logos dflex" style={{marginBottom:"0px"}}>
                <div className="payment-img"><Image src="/images/visa.svg" alt="Visa" width={40} height={24} /></div>
                <div className="payment-img"><Image src="/images/payment.svg" alt="Mastercard" width={40} height={24} /></div>
                <div className="payment-img"><Image src="/images/american.svg" alt="Amex" width={40} height={24} /></div>
              </div>

              {paymentMethod === "CreditCard" && (

                <div className=" h-[170px] gap-[10px] w-full flex flex-col">
                  <input
                    type="number"
                    name="cardNumber"
                    placeholder="Card number"
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <input
                      type="number"
                      name="expiryDate"
                      placeholder="Expiration date (MM / YY)"
                    />

                    <input
                      type="number"
                      name="securityCode"
                      placeholder="Security code"
                    />
                  </div>

                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="Your Name"
                  />
                </div>
              )}
            </div>

            <div className="payment-option mb-10" style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
              <label className="retry-popup-toggle">
                <div className="flex gap-2">
                  <input
                    type="radio"
                    name="retryPaymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                  />
                  Paypal
                </div>
                <Image src="/images/paypal.svg" alt="Paypal" width={60} height={24} />
              </label>
            </div>

            <div className="payment-option mb-10" style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
              <label className="retry-popup-toggle">
                <div className="flex gap-2">
                  <input
                    type="radio"
                    name="retryPaymentMethod"
                    value="afterpay"
                    checked={paymentMethod === "afterpay"}
                    onChange={() => setPaymentMethod("afterpay")}
                  />
                  Afterpay
                </div>
                <Image src="/images/afterpay.svg" alt="Afterpay" width={60} height={24} />
              </label>
            </div>

            <div className="payment-option mb-20" style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
              <label className="retry-popup-toggle">
                <div className="flex gap-2">
                  <input
                    type="radio"
                    name="retryPaymentMethod"
                    value="zip"
                    checked={paymentMethod === "zip"}
                    onChange={() => setPaymentMethod("zip")}
                  />
                  Zippay
                </div>
                <Image src="/images/zip.svg" alt="Zippay" width={60} height={24} />
              </label>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <Button
              type="submit"
              className="btn btn-red w-30"
              isLoading={isProcessing}
              disabled={isProcessing}
              style={{ alignItems: "center", justifyContent: "center", display: "flex" , marginTop:"10px"}}
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetryPaymentForm;
