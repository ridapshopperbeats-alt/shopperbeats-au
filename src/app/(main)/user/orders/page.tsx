"use client";

import React, { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
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
import { useCapturePaymentMutation } from "@/lib/redux/apis/payment-api";
import { useClearCartMutation, useGetCartQuery } from "@/lib/redux/apis/cart-api";
import { getOrderProductImage, getReviewProductId, mapOrderProducts } from "@/lib/utils/order-products";
import { formatPrice, formatReadableDate } from "@/lib/utils/main-utils";

import "../../../../styles/Checkout.css";
import "../../../../styles/Cart.css";
import "../../../../styles/Product.css";

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
        <div className="dflex justify-between">
          <h4>Orders ({effectiveTotal})</h4>

          <div className="product-sort">
            <span>Sort by:</span>

            <Select
              value={sortOrdersBy}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="!border !border-gray-500 focus:ring-0 focus:ring-offset-0 shadow-none w-[140px] rounded-[14px]">
                <SelectValue placeholder="Select" className="text-black" />
              </SelectTrigger>

              <SelectContent
                position="popper"
                className=" bg-white rounded-[10px] !ring-gray-200 w-[100px] p-0 overflow-hidden "
              >

                <SelectItem
                  value="oldest"
                  className="px-3 py-2 not-visited:cursor-pointer rounded-none data-[highlighted]:bg-gray-200 data-[highlighted]:text-black  "
                >
                  Date
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center py-20">
          <p>No orders yet</p>
        </div>
      )}


      {allOrders.map((order) => (
        <div key={order.id} className="order-block mt-30">
          <div className="dflex order-detail">
            <div className="order-item">
              <h5 style={{ fontSize: "clamp(16px, 1.5vw, 18px)", fontWeight: "800" }}>Order Number</h5>
              <p style={{ fontSize: "clamp(12px, 1.5vw, 16px)" }}>{order.order_number || order.id}</p>
            </div>
            <div className="order-item">
              <h5 style={{ fontSize: "clamp(16px, 1.5vw, 18px)", fontWeight: "800" }}>Order Date</h5>
              <p style={{ fontSize: "clamp(12px, 1.5vw, 16px)" }}>{formatReadableDate(order.created_at)}</p>
            </div>
            <div className="order-item">
              <h5 style={{ fontSize: "clamp(16px, 1.5vw, 18px)", fontWeight: "800" }}>Total Payment</h5>
              <p style={{ fontSize: "clamp(12px, 1.5vw, 16px)" }}>{formatPrice(order.totalPayment)}</p>
            </div>

            <div className="order-item">
              <h5 style={{ fontSize: "clamp(16px, 1.5vw, 18px)", fontWeight: "800" }}>Payment Method</h5>
              <p style={{ fontSize: "clamp(12px, 1.5vw, 16px)" }}>{order.paymentMethod}</p>
            </div>

            <div className="order-item">
              <h5 style={{ fontSize: "clamp(16px, 1.5vw, 18px)", fontWeight: "800" }}>Order Status</h5>

              <div style={{ textTransform: "capitalize" }}>
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
                <div key={idx} className="grid sm:grid-cols-3 grid-cols-1 gap-4 items-center mb-4 border-b border-gray-200 py-2">

                  {/* Product Image */}
                  <Link href={`/product/${product.unique_code || product.product_id || product.id}`}>
                    <Image
                      width={137}
                      height={137}
                      src={getOrderProductImage(product)}
                      alt={product.title || product.name}
                      className="cursor-pointer object-contain"
                    />
                  </Link>

                  {/* Product Details */}
                  <div>
                    <Link href={`/product/${product.unique_code || product.product_id || product.id}`}>
                      <p className="cursor-pointer hover:text-red-600 transition-colors font-bold">
                        {product.title}
                      </p>
                    </Link>

                    <div>
                      {product.variant_attributes?.map((attr, i) => (
                        <p
                          key={i}
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#000000",
                          }}
                        >
                          <strong style={{ fontWeight: "600" }}>
                            {attr.name}:
                          </strong>{" "}
                          {attr.value}
                        </p>
                      ))}

                      <p style={{ fontSize: "14px", fontWeight: "500", color: "#000000" }}>
                        <strong style={{ fontWeight: "600" }}>Quantity:</strong>{" "}
                        {product.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Review Button */}
                  {/* Review Button - Show only when delivered */}
                  <div className="flex justify-end">
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
          <div className="dflex order-action justify-between">
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
            <div className="flex items-center gap-4">
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
                  className={`cursor-pointer ${isCancelling ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isCancelling && handleCancelClick(order.id)}
                >
                  Cancel Order
                </button>
              )}
              {order.available_actions.includes("return") && (
                <button
                  className="cursor-pointer"
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
        <div ref={loadMoreRef} className="w-full flex justify-center py-4">
          {isFetching && (
            <div className="dflex align-center">
              <span className="loader-spinner" style={{ marginRight: "10px", border: "2px solid #f3f3f3", borderTop: "2px solid #333", borderRadius: "50%", width: "16px", height: "16px", animation: "spin 1s linear infinite" }}></span>
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
      <div className="product-search bg-white mt-40">

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
