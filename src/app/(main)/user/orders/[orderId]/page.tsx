"use client";

import React, { useState, use } from "react";

import { APIProduct, OrderReturn, OrderLineItem } from "@/types/order";

import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "@/lib/stripe";
import { toast } from "react-toastify";

import Link from "next/link";

import "../../../../../styles/Checkout.css";
import "../../../../../styles/Cart.css";
import "../../../../../styles/Product.css";
import { API_ENDPOINTS } from "@/lib/constants/api";
import Image from "next/image";
import {
  useCancelOrderItemMutation,
  useCancelOrderMutation,
  useGetOrderByIdQuery,
} from "@/lib/redux/apis/order-api";
import { ChevronLeft, Truck, MapPin, CheckCircle2, Loader } from "lucide-react";
import Button from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { StatusBadge, BadgeColor } from "@/components/common/StatusBadge";
import { formatPrice } from "@/lib/utils/main-utils";
import CancelOrderPopup from "@/components/common/CancelOrderPopup";
import ReturnOrderPopup from "@/components/common/ReturnOrderPopup";
import ReplaceOrderPopup from "@/components/ui/ReplaceOrderPopup";
import RetryPaymentPopup from "@/components/common/RetryPaymentPopup";
import { getStaticOrder, isStaticOrderId } from "@/lib/mock/static-orders";

const SUPPORT_PHONE = "+1 (994) 775-8686";

const formatOrderDate = (date: Date | string | null | undefined): string => {
  if (!date) return "Not Available";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Not Available";
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatusBadgeColor = (order: {
  status?: string;
  returns?: OrderReturn[];
}): BadgeColor => {
  const hasReturnRequested = order.returns?.some(
    (r) => r?.status?.toLowerCase() === "requested",
  );
  if (hasReturnRequested) return BadgeColor.Orange;

  const key = (order.status || "").toLowerCase();
  if (key === "delivered") return BadgeColor.Green;
  if (key === "cancelled") return BadgeColor.Red;
  return BadgeColor.Blue;
};

const getStatusBadgeLabel = (order: {
  status?: string;
  returns?: OrderReturn[];
}): string => {
  const hasReturnRequested = order.returns?.some(
    (r) => r?.status?.toLowerCase() === "requested",
  );
  if (hasReturnRequested) return "Return Requested";
  return order.status || "N/A";
};

interface OrderDetailProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderDetail({ params }: OrderDetailProps) {
  const { orderId } = use(params);
  const isStatic = isStaticOrderId(orderId);
  const { data, isLoading, refetch } = useGetOrderByIdQuery(orderId, {
    skip: isStatic,
  });
  const [cancelOrder] = useCancelOrderMutation();
  const [cancelOrderItem] = useCancelOrderItemMutation();

  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [isReturnPopupOpen, setIsReturnPopupOpen] = useState(false);
  const [isReplacePopupOpen, setIsReplacePopupOpen] = useState(false);
  const [isCancelItemPopupOpen, setIsCancelItemPopupOpen] = useState(false);
  const [isReturnItemPopupOpen, setIsReturnItemPopupOpen] = useState(false);
  const [isRetryPopupOpen, setIsRetryPopupOpen] = useState(false);

  const [selectedItemForCancel, setSelectedItemForCancel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<{
    id: string;
    product: APIProduct;
  } | null>(null);
  const [selectedItemForReplace, setSelectedItemForReplace] = useState<{
    id: string;
    product: APIProduct;
  } | null>(null);

  const handleCancelConfirm = async (
    id: string,
    cancelMessage: string,
    isItemLevel: boolean,
  ) => {
    try {
      if (isItemLevel) {
        await cancelOrderItem({
          id: id,
          reason: cancelMessage,
        }).unwrap();
        toast.success("Item cancelled successfully!");
        setSelectedItemForCancel(null);
      } else {
        await cancelOrder({
          order_id: id,
          reason: cancelMessage,
        }).unwrap();
        toast.success("Order cancelled successfully!");
      }
      setIsCancelPopupOpen(false);
      if (!isStatic) refetch();
    } catch {
      toast.error(`Failed to cancel ${isItemLevel ? "item" : "order"}.`);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL_ORDER || "";
      const endpoint = API_ENDPOINTS.ORDER.GET_INVOICE(orderId);
      const url = `${baseUrl}${endpoint}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch invoice");

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Invoice-${order?.order_number || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch {
      toast.error("Failed to download invoice");
    }
  };

  if (!isStatic && isLoading) return <Loader />;

  const order = isStatic ? getStaticOrder(orderId) : data;
  if (!order) return <p>Order not found</p>;
  const snapshot = order.order_details?.customer_snapshot || {};
  const products = snapshot.products || [];
  const orderItems = order.items || [];
  const shippingDetails = order.order_details;
  const shippingAddress = snapshot.shipping_address;

  const subtotal = Number(order.subtotal) || 0;
  const shipping = Number(order.shipping_cost) || 0;

  const totalSavings =
    (Number(order.total_saving) || 0) + (Number(order.discount_amount) || 0);

  const finalTotal = subtotal - totalSavings + shipping;

  const isDelivered = order.status?.toLowerCase() === "delivered";
  const shippingName = [
    shippingDetails?.shipping_first_name,
    shippingDetails?.shipping_last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex w-full flex-col gap-4">
      <Link
        href="/user/orders"
        className="inline-flex items-center gap-1 text-[0.75rem] font-medium text-[#99A1AF] hover:text-[#FD151B] leading-[18px]"
      >
        <ChevronLeft size={14} />
        Back to My Orders
      </Link>

      <Card className="w-full border p-4 sm:p-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div className="grid grid-cols-3 gap-2 sm:gap-5 flex-1 w-full">
            <div className="flex flex-col gap-1">
              <span className="text-[0.625rem] text-[#99A1AF] font-semibold leading-[15px] capitalize">Order ID</span>
              <span className="text-[0.75rem] font-bold text-[#211E22] leading-[18px]">
                #{order.order_number || order.id}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[0.625rem] text-[#99A1AF] font-semibold leading-[15px] capitalize">Placed On</span>
              <span className="text-[0.75rem] font-bold text-[#211E22] leading-[18px]">
                {formatOrderDate(order.created_at)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[0.625rem] text-[#99A1AF] font-semibold leading-[15px] capitalize">
                {isDelivered ? "Delivered On" : "Estimated Delivery Date"}
              </span>
              <span className="text-[0.75rem] font-bold text-[#211E22] leading-[18px]">
                {formatOrderDate(order.estimated_delivery_date)}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-start">
            <StatusBadge
              label={getStatusBadgeLabel(order)}
              color={getStatusBadgeColor(order)}
            />

            {order.tracking_link && (
              <Link
                href={order.tracking_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-auto min-w-[138.067px] h-[34.75px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[24px] bg-[#FD151B] px-5 py-2 text-center font-montserrat text-[0.75rem] font-bold leading-[18.75px] text-white"
              >
                <Truck size={16} />
                Track Order
              </Link>
            )}

            {(order.available_actions?.includes("retry") ||
              order.available_actions?.includes("retry_payment")) && (
                <Button
                  className="flex w-auto min-w-[138.067px] h-[34.75px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[24px] bg-[#FD151B] px-5 py-2 text-center font-montserrat text-[0.75rem] font-bold leading-[18.75px] text-white"
                  onClick={() => setIsRetryPopupOpen(true)}
                >
                  Retry Payment
                </Button>
              )}

            {isDelivered && (
              <Button
                className="flex w-auto min-w-[138.067px] h-[34.75px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[24px] border border-[#FD151B] bg-white px-5 py-2 text-center font-montserrat text-[0.75rem] font-semibold leading-[18.75px] text-[#FD151B]"
                onClick={handleDownloadInvoice}
              >
                Download Invoice
              </Button>
            )}
          </div>
        </div>

        <hr className="-mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] border-t border-[#F3F4F6]" />

        <div className="w-full">
          {products.map((product: APIProduct, idx: number) => {
            const matchingItem = orderItems.find(
              (item: OrderLineItem) => item.product_id === product.product_id,
            );
            const trueItemId =
              matchingItem?.id ||
              product.id ||
              product.item_id ||
              product.product_id;

            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-100 py-3 last:border-b-0 last:mb-0"
              >
                <div className="flex items-center gap-4">
                  <Link
                    href={`/product/${product.unique_code || product.product_id}`}
                    className="shrink-0"
                  >
                    <Image
                      height={136}
                      width={136}
                      src={product.image}
                      alt={product.name}
                      className="h-[74px] w-[74px] shrink-0 self-stretch rounded-lg border border-[#F3F4F6] bg-gray-300 bg-cover bg-center object-cover cursor-pointer"
                    />
                  </Link>

                  <div className="w-full">
                    <Link
                      href={`/product/${product.unique_code || product.product_id}`}
                    >
                      <p className="cursor-pointer hover:text-red-600 transition-colors font-bold fluid-text-xs capitalize">
                        {product.name}
                      </p>
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {product.variant_attributes?.length > 0 ? (
                        product.variant_attributes.map((attr, i) => (
                          <StatusBadge
                            key={i}
                            label={`${attr.name}: ${attr.value}`}
                            color={BadgeColor.Gray}
                            showDot={false}
                            className="text-[11px]"
                          />
                        ))
                      ) : (
                        <>
                          {product.size && (
                            <StatusBadge
                              label={`Size: ${product.size}`}
                              color={BadgeColor.Gray}
                              showDot={false}
                              className="text-[11px]"
                            />
                          )}
                          {product.color && (
                            <StatusBadge
                              label={`Colour: ${product.color}`}
                              color={BadgeColor.Gray}
                              showDot={false}
                              className="text-[11px]"
                            />
                          )}
                        </>
                      )}

                      <StatusBadge
                        label={`Qty: ${product.quantity}`}
                        color={BadgeColor.Gray}
                        showDot={false}
                        className="text-[11px]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2">
                      {(matchingItem?.available_actions?.includes("cancel") ||
                        matchingItem?.available_options?.includes(
                          "cancel",
                        )) && (
                          <button
                            className="cursor-pointer text-[0.75rem] font-semibold text-[#99A1AF] hover:text-[#FD151B]"
                            onClick={() => {
                              setSelectedItemForCancel({
                                id: String(trueItemId),
                                name: product.name,
                              });
                              setIsCancelItemPopupOpen(true);
                            }}
                          >
                            Cancel Item
                          </button>
                        )}

                      {matchingItem?.status?.toLowerCase() === "delivered" && (
                        <button
                          className="cursor-pointer text-[0.75rem] font-semibold text-[#99A1AF] hover:text-[#FD151B]"
                          onClick={() => {
                            setSelectedItemForReturn({
                              id: String(trueItemId),
                              product,
                            });
                            setIsReturnPopupOpen(true);
                          }}
                        >
                          Return Item
                        </button>
                      )}

                      {matchingItem?.status?.toLowerCase() === "delivered" && (
                        <button
                          className="cursor-pointer text-[0.75rem] font-semibold text-[#99A1AF] hover:text-[#FD151B]"
                          onClick={() => {
                            setSelectedItemForReplace({
                              id: String(trueItemId),
                              product,
                            });
                            setIsReplacePopupOpen(true);
                          }}
                        >
                          Replace Item
                        </button>
                      )}

                      {(matchingItem?.available_actions?.includes("review") ||
                        matchingItem?.available_actions?.includes(
                          "add_review",
                        ) ||
                        matchingItem?.available_options?.includes("review") ||
                        matchingItem?.available_options?.includes(
                          "add_review",
                        )) && (
                          <Link
                            href={`/user/orders/${order.id}/review?product_id=${product.product_id}`}
                            className="cursor-pointer text-[0.75rem] font-semibold text-[#FD151B] hover:underline"
                          >
                            Add Review
                          </Link>
                        )}

                      {product.status === "cancelled" && (
                        <p className="text-[0.75rem] font-semibold text-red-600">
                          Cancelled
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 sm:ml-4">
                  <p className="text-[12px] text-[#9CA3AF]">Price</p>
                  <p className="text-[14px] font-bold text-black">
                    {order.currency} {formatPrice(product.total_price)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="w-full border p-4 sm:p-6 gap-4">
          <h3 className="fluid-text-xs font-bold text-[#211E22] leading-[19px]">Price Breakdown</h3>

          <hr className="-mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] border-t border-[#F3F4F6]" />

          <div className="flex w-full flex-col">
            <div className="flex items-center justify-between py-2.5 first:pt-0">
              <span className="text-[0.75rem] text-[#99A1AF] font-normal">Subtotal</span>
              <span className="text-[0.75rem] font-semibold text-[#211E22]">
                {order.currency} {formatPrice(subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-[0.75rem] text-[#99A1AF] font-normal">Shipping</span>
              <span className="text-[0.75rem] font-semibold text-[#211E22]">
                {shipping > 0 ? `${order.currency} ${formatPrice(shipping)}` : "Free"}
              </span>
            </div>

            {totalSavings > 0 && (
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[0.75rem] text-[#99A1AF]">Discount Applied</span>
                <span className="text-[0.75rem] font-semibold text-[#1AAE4A]">
                  - {order.currency} {formatPrice(totalSavings)}
                </span>
              </div>
            )}
          </div>

          <hr className="-mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] border-t border-dashed border-[#F3F4F6]" />

          <div className="flex w-full items-center justify-between">
            <span className="fluid-text-xs font-bold text-[#211E22] font-bold">Total Paid</span>
            <span className="text-[0.875rem] font-bold text-[#FD151B]">
              {order.currency} {formatPrice(finalTotal)}
            </span>
          </div>
          <hr className="-mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] border-t border-dashed border-[#F3F4F6]" />

          <div className="flex w-full items-center gap-3 ">


            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] text-[#1AAE4A]">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <p className="text-[0.75rem] font-bold text-[#211E22]">
                Payment Method
              </p>
              <p className="text-[0.75rem] text-[#99A1AF] font-normal">
                {snapshot.payment_method?.type || "N/A"} &middot; Paid on {formatOrderDate(order.created_at)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="w-full border p-4 sm:p-6 gap-4">
          <h3 className="fluid-text-xs font-bold text-[#211E22] leading-[19px]">Delivery Address</h3>
          <hr className="-mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] border-t border-[#F3F4F6]" />

          <div className="flex w-full items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDECEC] text-[#FD151B]">
              <MapPin size={16} />
            </span>
            <div>
              <p className="text-[0.75rem] font-bold text-[#211E22]">Home</p>
              <p className="text-[0.75rem] text-[#726969]">
                {shippingName ? `${shippingName}, ` : ""}
                {shippingAddress?.address}, {shippingAddress?.city}
                {shippingAddress?.state ? `, ${shippingAddress.state}` : ""}
                {shippingAddress?.postal_code
                  ? ` ${shippingAddress.postal_code}`
                  : ""}
              </p>
            </div>
          </div>

          <hr className="w-full border-t border-[#F3F4F6]" />

          <div className="flex w-full flex-col gap-3">
            <span className="text-[0.625rem] font-bold text-[#99A1AF] capitalize">
              Need Help?
            </span>

            <a
              href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`}
              className="text-[0.75rem] font-medium text-[#211E22] hover:text-[#FD151B] leading-[15px]"
            >
              Contact Support - {SUPPORT_PHONE}
            </a>
            <Link
              href="/return-and-warranty"
              className="text-[0.75rem] font-medium text-[#211E22] hover:text-[#FD151B] leading-[15px]"
            >
              Return / Refund Policy
            </Link>
            <Link
              href="/contact"
              className="text-[0.75rem] font-medium text-[#211E22] hover:text-[#FD151B]"
            >
              Raise a Concern
            </Link>
          </div>

          {order.available_actions?.includes("cancel") && (
            <button
              className="cursor-pointer text-[0.75rem] font-semibold text-[#99A1AF] hover:text-[#FD151B]"
              onClick={() => {
                setSelectedItemForCancel(null);
                setIsCancelPopupOpen(true);
              }}
            >
              Cancel Order
            </button>
          )}

          {order.available_actions?.includes("return") && (
            <button
              className="cursor-pointer text-[0.75rem] font-semibold text-[#99A1AF] hover:text-[#FD151B]"
              onClick={() => {
                setSelectedItemForReturn(null);
                setIsReturnPopupOpen(true);
              }}
            >
              Return Order
            </button>
          )}

          {order.available_actions?.includes("replace") && (
            <button
              className="cursor-pointer text-[0.75rem] font-semibold text-[#99A1AF] hover:text-[#FD151B]"
              onClick={() => {
                setSelectedItemForReplace(null);
                setIsReplacePopupOpen(true);
              }}
            >
              Replace Order
            </button>
          )}
        </Card>
      </div>

      <CancelOrderPopup
        isOpen={isCancelPopupOpen || isCancelItemPopupOpen}
        onClose={() => {
          setIsCancelPopupOpen(false);
          setIsCancelItemPopupOpen(false);
          setSelectedItemForCancel(null);
        }}
        orderId={order.id}
        itemId={selectedItemForCancel?.id}
        itemName={selectedItemForCancel?.name}
        onCancelConfirm={handleCancelConfirm}
      />

      <ReturnOrderPopup
        isOpen={isReturnPopupOpen || isReturnItemPopupOpen}
        onClose={() => {
          setIsReturnPopupOpen(false);
          setIsReturnItemPopupOpen(false);
          setSelectedItemForReturn(null);
          if (!isStatic) refetch();
        }}
        orderId={order.id}
        itemId={selectedItemForReturn?.id}
        product={selectedItemForReturn?.product}
      />

      <ReplaceOrderPopup
        isOpen={isReplacePopupOpen}
        onClose={() => {
          setIsReplacePopupOpen(false);
          setSelectedItemForReplace(null);
          if (!isStatic) refetch();
        }}
        orderId={order.id}
        itemId={selectedItemForReplace?.id}
        product={selectedItemForReplace?.product}
      />

      <Elements stripe={stripePromise}>
        <RetryPaymentPopup
          isOpen={isRetryPopupOpen}
          onClose={() => setIsRetryPopupOpen(false)}
          orderId={order.id}
        />
      </Elements>
    </div>
  );
}
