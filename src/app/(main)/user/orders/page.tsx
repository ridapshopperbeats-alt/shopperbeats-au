"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { OrderAPIResponse, OrderItem, Status, OrderReturn } from "@/types/order";
import CancelOrderPopup from "@/components/common/CancelOrderPopup";
import ReturnOrderPopup from "@/components/common/ReturnOrderPopup";
import RetryPaymentPopup from "@/components/common/RetryPaymentPopup";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "@/lib/stripe";
import { toast } from "react-toastify";
import Image from "next/image";

import { API_ENDPOINTS } from "@/lib/constants/api";
import Pagination from "@/components/common/Pagination";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer";
import { useCancelOrderMutation, useListOrdersQuery } from "@/lib/redux/apis/order-api";

import { getOrderProductImage, getReviewProductId, mapOrderProducts } from "@/lib/utils/order-products";
import { formatPrice, formatReadableDate } from "@/lib/utils/main-utils";

import "../../../../styles/Checkout.css";
import "../../../../styles/Cart.css";
import "../../../../styles/Product.css";
import "../../../../styles/auth.css";

export default function MyOrdersPage() {
  const router = useRouter();
  const [cancelOrder] = useCancelOrderMutation();
 

  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [isReturnPopupOpen, setIsReturnPopupOpen] = useState(false);
  const [isRetryPopupOpen, setIsRetryPopupOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const CHUNK_SIZE = 20;

  const [sortOrdersBy, setSortOrdersBy] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [uiLimit, setUiLimit] = useState(10);

  const calculateStartFetchingPage = (uiPage: number, limit: number) => {
    const offset = (uiPage - 1) * limit;
    return Math.floor(offset / CHUNK_SIZE) + 1;
  };

  const [fetchingPage, setFetchingPage] = useState(
    calculateStartFetchingPage(1, 10)
  );

  const { data, isLoading, refetch, isFetching } = useListOrdersQuery({
    page: fetchingPage,
    per_page: CHUNK_SIZE,
    sort_by: "created_at",
    sort_dir: "desc",
  }, {
    refetchOnMountOrArgChange: true,
  });

  const [allOrders, setAllOrders] = useState<OrderItem[]>([]);

  const effectiveTotal = data?.total_items ?? 0;
  const totalPages = Math.ceil(effectiveTotal / uiLimit);

  useEffect(() => {
    if (!data?.data) return;

    const mapped: OrderItem[] = data.data.map((o: OrderAPIResponse) => {
      const isCancelled = o.shipstation_order_status?.toLowerCase() === "cancelled";

      return {
        id: o.id,
        order_number: o.order_number,
        created_at: String(o.created_at),
        totalPayment: `${o.currency} ${formatPrice(o.total_amount)}`,
        paymentMethod: o.order_details?.customer_snapshot?.payment_method?.type ?? "N/A",
        status: o.status as Status,
        statusDate: o.estimated_delivery_date ?? "Not Available",
        estimated_delivery_date: o.estimated_delivery_date ?? "Not Available",
        isCancelled,
        available_actions: o.available_actions || [],
        tracking_link: o.tracking_link,
        returns: o.returns,
        hasRequestedReturn: o.returns?.some((r: OrderReturn) => r.status?.toLowerCase() === "requested"),
        products: mapOrderProducts(o),
      };
    });

    const startFetching = calculateStartFetchingPage(currentPage, uiLimit);

    if (fetchingPage === startFetching) {
      setAllOrders(mapped);
    } else if (fetchingPage > startFetching) {
      setAllOrders(prev => {
        if (prev.length >= uiLimit) return prev;
        const newOrders = mapped.filter(o => !prev.some(existing => existing.id === o.id));
        return [...prev, ...newOrders].slice(0, uiLimit);
      });
    }
  }, [data, fetchingPage, currentPage, uiLimit]);

  const handleSortChange = (value: string) => {
    setSortOrdersBy(value as "price" | "date");
    setAllOrders([]);
    setCurrentPage(1);
    setFetchingPage(calculateStartFetchingPage(1, uiLimit));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsCancelPopupOpen(true);
  };

  const handleReturnClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsReturnPopupOpen(true);
  };

  const handleRetryPaymentClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsRetryPopupOpen(true);
  };


  const handleCancelConfirm = async (
    orderId: string,
    cancelMessage: string
  ) => {
    setIsCancelling(true);
    try {
      await cancelOrder({
        order_id: orderId,
        reason: cancelMessage,
      }).unwrap();
      toast.success("Order cancelled successfully!");
      setIsCancelPopupOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to cancel order.");
      console.error("Failed to cancel order:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadInvoice = async (orderId: string, orderNumber?: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL_ORDER || "";
      const endpoint = API_ENDPOINTS.ORDER.GET_INVOICE(orderId);
      const url = `${baseUrl}${endpoint}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invoice");
      }
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Invoice-${orderNumber || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFetchingPage(calculateStartFetchingPage(page, uiLimit));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (limit: number) => {
    setUiLimit(limit);
    setCurrentPage(1);
    setFetchingPage(calculateStartFetchingPage(1, limit));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const handleLoadMore = () => {
    if (allOrders.length < uiLimit && allOrders.length < effectiveTotal && !isFetching) {
      setFetchingPage(prev => prev + 1);
    }
  };

  useIntersectionObserver({
    target: loadMoreRef as React.RefObject<Element>,
    onIntersect: () => {
      handleLoadMore();
    },
    enabled: allOrders.length < uiLimit && allOrders.length < effectiveTotal,
    rootMargin: "100px",
  });


  if (isLoading && allOrders.length === 0) return null;

  return (
    <div>
      {allOrders.length > 0 ? (
        <div className="dflex order-detail-header">
          <h4>Orders ({effectiveTotal})</h4>

          <div className="product-sort">
            <span>Sort by:</span>

            <Select
              value={sortOrdersBy}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="orders-sort-trigger">
                <SelectValue placeholder="Select" className="orders-sort-value" />
              </SelectTrigger>

              <SelectContent
                position="popper"
                className="orders-sort-content"
              >

                <SelectItem
                  value="oldest"
                  className="orders-sort-item"
                >
                  Date
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="orders-empty-state">
          <p>No orders yet</p>
        </div>
      )}


      {allOrders.map((order) => (
        <div key={order.id} className="order-block orders-block-spacing">
          <div className="dflex order-detail">
            <div className="order-item">
              <h5 className="orders-item-label">Order Number</h5>
              <p className="orders-item-value">{order.order_number || order.id}</p>
            </div>
            <div className="order-item">
              <h5 className="orders-item-label">Order Date</h5>
              <p className="orders-item-value">{formatReadableDate(order.created_at)}</p>
            </div>
            <div className="order-item">
              <h5 className="orders-item-label">Total Payment</h5>
              <p className="orders-item-value">{formatPrice(order.totalPayment)}</p>
            </div>

            <div className="order-item">
              <h5 className="orders-item-label">Payment Method</h5>
              <p className="orders-item-value">{order.paymentMethod}</p>
            </div>

            <div className="order-item">
              <h5 className="orders-item-label">Order Status</h5>

              <div className="order-status-value">
                {order?.returns?.some((r: OrderReturn) => r?.status?.toLowerCase() === "requested")
                  ? "Return Requested"
                  : (order?.status || "N/A")}
              </div>
            </div>


            <div className="order-item">
              <h5>
                {order.status === Status.DELIVERED
                  ? "Delivered on"
                  : "Estimated Delivery Date"}
              </h5>
              <p>{order.estimated_delivery_date
                ? formatReadableDate(order.estimated_delivery_date)

                : "Not Available"}</p>
            </div>
          </div>
          <div>
            {order.products.map((product, idx) => {
              const reviewProductId = getReviewProductId(product);
              if (!reviewProductId) return null;

              return (
                <div key={idx} className="orders-product-row">

                  {/* Product Image */}
                  <Link href={`/product/${product.unique_code || product.product_id || product.id}`}>
                    <Image
                      width={137}
                      height={137}
                      src={getOrderProductImage(product)}
                      alt={product.title || product.name}
                      className="order-item-image"
                    />
                  </Link>

                  {/* Product Details */}
                  <div>
                    <Link href={`/product/${product.unique_code || product.product_id || product.id}`}>
                      <p className="orders-product-title">
                        {product.title}
                      </p>
                    </Link>

                    <div>
                      {product.variant_attributes?.map((attr, i) => (
                        <p
                          key={i}
                          className="orders-product-meta"
                        >
                          <strong className="orders-product-meta-label">
                            {attr.name}:
                          </strong>{" "}
                          {attr.value}
                        </p>
                      ))}

                      <p className="orders-product-meta">
                        <strong className="orders-product-meta-label">Quantity:</strong>{" "}
                        {product.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Review Button */}
                  {/* Review Button - Show only when delivered */}
                  <div className="orders-product-actions">
                    {order.status?.toLowerCase() === "delivered" && (
                      <div>
                        <Link
                          href={`/user/orders/${order.id}/review?product_id=${encodeURIComponent(
                            reviewProductId
                          )}`}
                          className="btn btn-red btn-filled btn-sharp"
                        >
                          Add Review
                        </Link>
                      </div>
                    )}
                    {order.tracking_link?.trim() && (
                      <div>
                        <Link
                          href={order.tracking_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-red btn-filled btn-sharp w-full"
                        >
                          Track Order
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="dflex order-action order-detail-header">
            <div className="btn-action">

              <button
                className="btn btn-red btn-outline btn-rounded cursor-pointer"
                onClick={() => router.push(`/user/orders/${order.id}`)}
              >
                View Order Details
              </button>
              {order.status?.toLowerCase() === "delivered" && (
                <button
                  className="btn btn-red btn-outline btn-rounded cursor-pointer"
                  onClick={() => handleDownloadInvoice(order.id, order.order_number)}
                >
                  Download Invoice
                </button>
              )}
            </div>
            <div className="orders-action-right">
              {(order.available_actions.includes("retry") || order.available_actions.includes("retry_payment")) && (
                <button
                  className="btn btn-red btn-filled btn-sharp"
                  onClick={() => handleRetryPaymentClick(order.id)}
                >
                  Retry Payment
                </button>
              )}
              {order.available_actions.includes("cancel") && (
                <button
                  className={`orders-cancel-btn ${isCancelling ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isCancelling && handleCancelClick(order.id)}
                >
                  Cancel Order
                </button>
              )}
              {order.available_actions.includes("return") && (
                <button
                  className="orders-return-btn"
                  onClick={() => handleReturnClick(order.id)}
                >
                  Return
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {allOrders.length < uiLimit && allOrders.length < effectiveTotal && (
        <div ref={loadMoreRef} className="orders-load-more">
          {isFetching && (
            <div className="dflex align-center">
              <span className="orders-loader-spinner"></span>
              Loading more orders...
            </div>
          )}
        </div>
      )}

      <CancelOrderPopup
        isOpen={isCancelPopupOpen}
        onClose={() => setIsCancelPopupOpen(false)}
        orderId={selectedOrderId ?? ""}
        onCancelConfirm={handleCancelConfirm}
      />
      <ReturnOrderPopup
        isOpen={isReturnPopupOpen}
        onClose={() => setIsReturnPopupOpen(false)}
        orderId={selectedOrderId}
      />
      {selectedOrderId && (
        <Elements stripe={stripePromise}>
          <RetryPaymentPopup
            isOpen={isRetryPopupOpen}
            onClose={() => setIsRetryPopupOpen(false)}
            orderId={selectedOrderId}
          />
        </Elements>
      )}
      <div className="product-search orders-pagination-wrapper">

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={uiLimit}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={effectiveTotal}
          limitOptions={[10, 20, 50, 100]}
        />
      </div>
    </div>
  );
}
