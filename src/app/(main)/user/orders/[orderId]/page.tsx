"use client";

import React, { useState, use } from "react";
import {
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useCancelOrderItemMutation,
} from "@/lib/redux/apis/order-api";
import { APIProduct, OrderReturn, OrderLineItem } from "@/types/order";
import CancelOrderPopup from "@/components/common/CancelOrderPopup";
import ReturnOrderPopup from "@/components/common/ReturnOrderPopup";
import ReplaceOrderPopup from "@/components/ui/ReplaceOrderPopup";
import RetryPaymentPopup from "@/components/common/RetryPaymentPopup";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "@/lib/stripe";
import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import Link from "next/link";

import { API_ENDPOINTS } from "@/lib/constants/api";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/main-utils";

import "../../../../../styles/Checkout.css";
import "../../../../../styles/Cart.css";
import "../../../../../styles/Product.css";
import "../../../../../styles/auth.css";

interface OrderDetailProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderDetail({ params }: OrderDetailProps) {
  const { orderId } = use(params);
  const { data, isLoading, refetch } = useGetOrderByIdQuery(orderId);
  const [cancelOrder] = useCancelOrderMutation();
  const [cancelOrderItem] = useCancelOrderItemMutation();

  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [isReturnPopupOpen, setIsReturnPopupOpen] = useState(false);
  const [isReplacePopupOpen, setIsReplacePopupOpen] = useState(false);
  const [isCancelItemPopupOpen, setIsCancelItemPopupOpen] = useState(false);
  const [isReturnItemPopupOpen, setIsReturnItemPopupOpen] = useState(false);
  const [isRetryPopupOpen, setIsRetryPopupOpen] = useState(false);

  const [selectedItemForCancel, setSelectedItemForCancel] = useState<{ id: string, name: string } | null>(null);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<{ id: string, product: APIProduct } | null>(null);
  const [selectedItemForReplace, setSelectedItemForReplace] = useState<{ id: string, product: APIProduct } | null>(null);

  const handleCancelConfirm = async (
    id: string,
    cancelMessage: string,
    isItemLevel: boolean
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
      refetch();
    } catch (error) {
      toast.error(`Failed to cancel ${isItemLevel ? 'item' : 'order'}.`);
      console.error(`Failed to cancel ${isItemLevel ? 'item' : 'order'}:`, error);
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
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  if (!data) return <p>Order not found</p>;

  const order = data;
  const snapshot = order.order_details?.customer_snapshot || {};
  const products = snapshot.products || [];
  const orderItems = order.items || [];

  const isCancelled =
    order.shipstation_order_status?.toLowerCase() === "cancelled";

  const subtotal = Number(order.subtotal) || 0;
  const shipping = Number(order.shipping_cost) || 0;

  const totalSavings =
    (Number(order.total_saving) || 0) +
    (Number(order.discount_amount) || 0);

  const finalTotal = subtotal - totalSavings + shipping;

  return (
    <div>
      <div className="dflex order-action order-detail-header">
        <h4>Order Detail</h4>
        <div className="btn-action btn-track">
          {(order.available_actions?.includes("retry") || order.available_actions?.includes("retry_payment")) && (
            <Button
              className="btn btn-red btn-filled btn-sharp"
              onClick={() => setIsRetryPopupOpen(true)}
            >
              Retry Payment
            </Button>
          )}
          {order.tracking_link && (
            <Link
              href={order.tracking_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-red btn-filled btn-sharp order-track-link"
            >
              Track Order
            </Link>
          )}
          {order.available_actions?.includes("cancel") && (
            <Button
              className="btn btn-link"
              onClick={() => {
                setSelectedItemForCancel(null);
                setIsCancelPopupOpen(true);
              }}
            >
              Cancel Order
            </Button>
          )}
          {order.available_actions?.includes("return") && (
            <Button
              className="btn btn-link"
              onClick={() => {
                setSelectedItemForReturn(null);
                setIsReturnPopupOpen(true);
              }}
            >
              Return Order
            </Button>
          )}
          {order.available_actions?.includes("replace") && (
            <Button
              className="btn btn-link"
              onClick={() => {
                setSelectedItemForReplace(null);
                setIsReplacePopupOpen(true);
              }}
            >
              Replace Order
            </Button>
          )}
          {order.status?.toLowerCase() === "delivered" && (
            <Button
              className="btn btn-red btn-outline btn-sharp"
              onClick={handleDownloadInvoice}
            >
              Download Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Order Info */}
      <div className="dflex order-detail order-detail-info">
        <div className="order-item">
          <h5>Order Number</h5>
          <p>{order.order_number || order.id}</p>
        </div>

        <div className="order-item">
          <h5>Total Payment</h5>
          <p>
            {order.currency} {formatPrice(order.total_amount)}
          </p>
        </div>

        <div className="order-item">
          <h5>Payment Method</h5>
          <p>{snapshot.payment_method?.type || "N/A"}</p>
        </div>

        <div className="order-item">
          <h5>Order Status</h5>

          <div className="order-status-value">
            {order.returns?.some((r: OrderReturn) => r?.status?.toLowerCase() === "requested") ? (
              "Return Requested"
            ) : (
              order.status || "N/A"
            )}
          </div>
        </div>

        <div className="order-item">
          <h5>
            {order.status === "delivered"
              ? "Delivered on"
              : "Estimated Delivery"}
          </h5>
          <p>
            {order.estimated_delivery_date
              ? new Date(order.estimated_delivery_date).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              : "Not Available"}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <table className="cart-table order-table">
        <thead className="visually-hidden">
          <tr>
            <th scope="col">Product Information</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: APIProduct, idx: number) => {
            const matchingItem = orderItems.find((item: OrderLineItem) => item.product_id === product.product_id);
            const trueItemId = matchingItem?.id || product.id || product.item_id || product.product_id;

            return (
              <tr key={idx}>
                <td className="item-info">
                  <Link href={`/product/${product.unique_code || product.product_id}`}>
                    <Image
                      height={136}
                      width={136}
                      src={product.image}
                      alt={product.name}
                      className="order-item-image"
                    />
                  </Link>
                  <div>
                    <Link href={`/product/${product.unique_code || product.product_id}`}>
                      <h3 className="order-item-title">{product.name}</h3>
                    </Link>

                    {product?.variant_attributes?.length > 0 ? (
                      product?.variant_attributes?.map((attr, i) => (
                        <p key={i}>
                          <strong>{attr.name}:</strong> {attr.value}
                        </p>
                      ))
                    ) : (
                      <>
                        {product.size && (
                          <p>
                            <strong>Size:</strong> {product.size}
                          </p>
                        )}
                        {product.color && (
                          <p>
                            <strong>Colour:</strong> {product.color}
                          </p>
                        )}
                      </>
                    )}

                    <p>
                      <strong>Quantity:</strong> {product.quantity}
                    </p>

                    <div className="order-item-actions">
                      {/* Cancel & Return Item Buttons */}
                      {(matchingItem?.available_actions?.includes("cancel") || matchingItem?.available_options?.includes("cancel")) && (
                        <div className="order-item-action-wrapper">
                          <Button
                            className="order-item-action-btn"
                            onClick={() => {
                              setSelectedItemForCancel({ id: String(trueItemId), name: product.name });
                              setIsCancelItemPopupOpen(true);
                            }}
                          >
                            Cancel Item
                          </Button>
                        </div>
                      )}



                      {matchingItem?.status?.toLowerCase() === "delivered" && (
                        <Button
                          className="order-item-action-btn"
                          onClick={() => {
                            setSelectedItemForReturn({
                              id: String(trueItemId),
                              product,
                            });
                            setIsReturnPopupOpen(true);
                          }}
                        >
                          Return Item
                        </Button>
                      )}


                      {matchingItem?.status?.toLowerCase() === "delivered" && (
                        <Button
                          className="order-item-action-btn"
                          onClick={() => {
                            setSelectedItemForReplace({
                              id: String(trueItemId),
                              product,
                            });
                            setIsReplacePopupOpen(true);
                          }}
                        >
                          Replace Item
                        </Button>
                      )}
                    </div>

                    {(matchingItem?.available_actions?.includes("review") || matchingItem?.available_actions?.includes("add_review") || matchingItem?.available_options?.includes("review") || matchingItem?.available_options?.includes("add_review")) && (
                      <div className="order-item-action-wrapper">
                        <Link href={`/user/orders/${order.id}/review?product_id=${product.product_id}`}>
                          <Button
                            className="order-item-action-btn"
                          >
                            Add Review
                          </Button>
                        </Link>
                      </div>
                    )}

                    {product.status === "cancelled" && (
                      <p className="order-item-cancelled-label">Cancelled</p>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Order Summary */}
      <div className="order-summery mt-5">
        <div className="summary-row order-summary-row">
          <p className="order-summary-label">Subtotal ({products.length} Items)</p>
          <p className="price">
            {order.currency} {formatPrice(order.subtotal)}
          </p>
        </div>

        <div className="summary-row order-summary-row">
          <p className="order-summary-label">Total Savings</p>
          <p className="savings">
            -{order.currency}{" "}
            {formatPrice(
              (Number(order.total_saving) || 0) +
              (Number(order.discount_amount) || 0)
            )}
          </p>
        </div>

        <div className="order-delivery-row">
          <p className="order-summary-label">
            Delivery Details
            <br />
            <span className="order-delivery-address">
              Address: {snapshot.shipping_address.address},{" "}
              {snapshot.shipping_address.city}
            </span>
          </p>
          <p className="price">
            {order.currency} {formatPrice(order.shipping_cost)}
          </p>
        </div>

        <div className="order-total-row">
          <strong className="order-total-label">Total (Incl. GST)</strong>
          <p className="price">
            {order.currency} {formatPrice(finalTotal)}
          </p>
        </div>
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
          refetch();
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
          refetch();
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
