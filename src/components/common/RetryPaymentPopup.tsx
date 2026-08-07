"use client";
import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import Button from "@/components/common/Button";
import { useRetryPaymentMutation } from "@/lib/redux/apis/order-api";
import { toast } from "react-toastify";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface RetryPaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const PAYMENT_INPUT_CLASS =
  "!h-auto !w-full !rounded-[14px] !border !border-[#E5E7EB] !bg-white !px-4 !py-3 !text-[0.8125rem] !leading-normal !text-[#211E22] focus:!border-[#FD151B] focus:outline-none focus:ring-1 focus:ring-[#FD151B] placeholder:!font-montserrat placeholder:!text-[14px] placeholder:!font-medium placeholder:!leading-normal placeholder:!capitalize placeholder:!text-black";

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

  const paymentOptionClass = (value: string) =>
    `flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] transition-colors ${
      paymentMethod === value
        ? "border-[#FD151B] bg-[#FFF5F5]"
        : "border-[#E5E7EB] bg-white hover:border-[#FD151B]/50"
    }`;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="flex w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border-t-4 border-[#FD151B] bg-white shadow-xl">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-300 sm:hidden" />
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-[1rem] font-bold text-[#211E22]">Retry Payment</h2>
            <p className="text-[0.8125rem] text-[#99A1AF]">
              Select a payment method to complete your order.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 cursor-pointer text-[#99A1AF] hover:text-[#211E22]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div
            className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 flex flex-col gap-3"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            <label className={paymentOptionClass("CreditCard")}>
              <span className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[#211E22]">
                <input
                  type="radio"
                  name="retryPaymentMethod"
                  value="CreditCard"
                  checked={paymentMethod === "CreditCard"}
                  onChange={() => setPaymentMethod("CreditCard")}
                  className="accent-[#FD151B]"
                />
                Credit Card
              </span>
              <div className="flex items-center gap-2">
                <Image src="/images/visa.svg" alt="Visa" width={32} height={20} />
                <Image src="/images/payment.svg" alt="Mastercard" width={32} height={20} />
                <Image src="/images/american.svg" alt="Amex" width={32} height={20} />
              </div>
            </label>

            {paymentMethod === "CreditCard" && (
              <div className="flex flex-col gap-3 rounded-[14px] border border-[#F3F4F6] bg-[#F9FAFB] p-4">
                <input
                  type="number"
                  name="cardNumber"
                  placeholder="Card number"
                  className={PAYMENT_INPUT_CLASS}
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    name="expiryDate"
                    placeholder="MM / YY"
                    className={PAYMENT_INPUT_CLASS}
                  />

                  <input
                    type="number"
                    name="securityCode"
                    placeholder="Security code"
                    className={PAYMENT_INPUT_CLASS}
                  />
                </div>

                <input
                  type="text"
                  name="cardHolder"
                  placeholder="Your Name"
                  className={PAYMENT_INPUT_CLASS}
                />
              </div>
            )}

            <label className={paymentOptionClass("paypal")}>
              <span className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[#211E22]">
                <input
                  type="radio"
                  name="retryPaymentMethod"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={() => setPaymentMethod("paypal")}
                  className="accent-[#FD151B]"
                />
                Paypal
              </span>
              <Image src="/images/paypal.svg" alt="Paypal" width={56} height={20} />
            </label>

            <label className={paymentOptionClass("afterpay")}>
              <span className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[#211E22]">
                <input
                  type="radio"
                  name="retryPaymentMethod"
                  value="afterpay"
                  checked={paymentMethod === "afterpay"}
                  onChange={() => setPaymentMethod("afterpay")}
                  className="accent-[#FD151B]"
                />
                Afterpay
              </span>
              <Image src="/images/afterpay.svg" alt="Afterpay" width={56} height={20} />
            </label>

            <label className={paymentOptionClass("zip")}>
              <span className="flex items-center gap-2 text-[0.8125rem] font-semibold text-[#211E22]">
                <input
                  type="radio"
                  name="retryPaymentMethod"
                  value="zip"
                  checked={paymentMethod === "zip"}
                  onChange={() => setPaymentMethod("zip")}
                  className="accent-[#FD151B]"
                />
                Zippay
              </span>
              <Image src="/images/zip.svg" alt="Zippay" width={56} height={20} />
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 p-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto cursor-pointer rounded-full border border-[#E5E7EB] bg-white px-6 py-2.5 text-center text-[0.8125rem] font-semibold text-[#99A1AF] hover:bg-gray-50"
            >
              Cancel
            </button>
            <Button
              type="submit"
              isLoading={isProcessing}
              disabled={isProcessing}
              className="w-full sm:w-auto cursor-pointer rounded-full bg-[#FD151B] px-6 py-2.5 text-center text-[0.8125rem] font-bold text-white hover:bg-[#e11319] disabled:cursor-not-allowed disabled:opacity-50"
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
