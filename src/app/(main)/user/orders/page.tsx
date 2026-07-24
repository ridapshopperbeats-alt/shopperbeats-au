"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  OrderAPIResponse,
  OrderItem,
  Status,
  OrderReturn,
} from "@/types/order";

import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "@/lib/stripe";
import { toast } from "react-toastify";
import "../../../../styles/Checkout.css";
import "../../../../styles/Cart.css";
import "../../../../styles/Product.css";

import Image from "next/image";
import { useCancelOrderMutation, useListOrdersQuery } from "@/lib/redux/apis/order-api";
import { formatPrice, formatReadableDate } from "@/lib/utils/main-utils";
import { getOrderProductImage, getReviewProductId, mapOrderProducts } from "@/lib/utils/order-products";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer";
import { Loader } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";
import CancelOrderPopup from "@/components/common/CancelOrderPopup";
import ReturnOrderPopup from "@/components/common/ReturnOrderPopup";
import RetryPaymentPopup from "@/components/common/RetryPaymentPopup";
import Pagination from "@/components/common/Pagination";
import { STATIC_ORDERS } from "@/lib/mock/static-orders";

const ORDER_STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  pending: "Pending",
  "in progress": "In Progress",
  "return requested": "Return Requested",
};

const getOrderStatusLabel = (order: OrderItem) => {
  const hasReturnRequested = order?.returns?.some(
    (r: OrderReturn) => r?.status?.toLowerCase() === "requested",
  );

  const key = hasReturnRequested
    ? "return requested"
    : (order?.status || "").toLowerCase();

  return ORDER_STATUS_LABELS[key] ?? order?.status ?? "N/A";
};

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
    calculateStartFetchingPage(1, 10),
  );

  const { data, isLoading, isFetching, isError, refetch } = useListOrdersQuery(
    {
      page: fetchingPage,
      per_page: CHUNK_SIZE,
      sort_by: "created_at",
      sort_dir: "desc",
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [allOrders, setAllOrders] = useState<OrderItem[]>([]);
  console.log(allOrders, "=====allorders");
  const querySettled = !isLoading && !isFetching;
  const useStaticFallback =
    querySettled && (isError || !data || (data.data?.length ?? 0) === 0);

  const effectiveTotal = useStaticFallback
    ? STATIC_ORDERS.length
    : data?.total_items ?? 0;
  const totalPages = Math.ceil(effectiveTotal / uiLimit);

  useEffect(() => {
    if (!querySettled) return;

    const sourceOrders =
      data?.data && data.data.length > 0 ? data.data : STATIC_ORDERS;

    const mapped: OrderItem[] = sourceOrders.map((o: OrderAPIResponse) => {
      const isCancelled =
        o.shipstation_order_status?.toLowerCase() === "cancelled";

      return {
        id: o.id,
        order_number: o.order_number,
        created_at: String(o.created_at),
        totalPayment: `${o.currency} ${formatPrice(o.total_amount)}`,
        paymentMethod:
          o.order_details?.customer_snapshot?.payment_method?.type ?? "N/A",
        status: o.status as Status,
        statusDate: o.estimated_delivery_date ?? "Not Available",
        estimated_delivery_date: o.estimated_delivery_date ?? "Not Available",
        isCancelled,
        available_actions: o.available_actions || [],
        tracking_link: o.tracking_link,
        returns: o.returns,
        hasRequestedReturn: o.returns?.some(
          (r: OrderReturn) => r.status?.toLowerCase() === "requested",
        ),
        products: mapOrderProducts(o),
      };
    });

    const startFetching = calculateStartFetchingPage(currentPage, uiLimit);

    if (fetchingPage === startFetching) {
      setAllOrders(mapped);
    } else if (fetchingPage > startFetching) {
      // Append logic
      setAllOrders((prev) => {
        if (prev.length >= uiLimit) return prev;
        const newOrders = mapped.filter(
          (o) => !prev.some((existing) => existing.id === o.id),
        );
        return [...prev, ...newOrders].slice(0, uiLimit);
      });
    }
  }, [data, querySettled, fetchingPage, currentPage, uiLimit]);

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
    cancelMessage: string,
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
    } catch {
      toast.error("Failed to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadInvoice = async (
    orderId: string,
    orderNumber?: string,
  ) => {
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
    } catch {
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
    if (
      allOrders.length < uiLimit &&
      allOrders.length < effectiveTotal &&
      !isFetching
    ) {
      setFetchingPage((prev) => prev + 1);
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

  if (isLoading && allOrders.length === 0)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div>
      {allOrders.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 text-[20px] sm:text-[24px] font-bold leading-[100%] justify-between pb-5">
          <h4>Orders ({effectiveTotal})</h4>

          <div className="product-sort">
            <span>Sort by:</span>

            <Select value={sortOrdersBy} onValueChange={handleSortChange}>
              <SelectTrigger className="!border !border-gray-500 focus:ring-0 focus:ring-offset-0 shadow-none w-[140px] rounded-[14px]">
                <SelectValue placeholder="Select" className="text-black text-[12px]" />
              </SelectTrigger>

              <SelectContent
                position="popper"
                className=" bg-white rounded-[10px] !ring-gray-200 w-[100px] p-0 overflow-hidden "
              >
                <SelectItem
                  value="oldest"
                  className="px-3 py-2 not-visited:cursor-pointer rounded-none  text-[12px] "
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
        <div key={order.id} className="order-block">
          <div className="order-detail grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-5">
            <div className="order-detail-item">
              <h5 className="text-black text-center font-[Montserrat] text-[18px] not-italic font-bold leading-[normal] capitalize">
                Order Number
              </h5>
              <p className="text-black text-center font-[Montserrat] text-[16px] not-italic font-normal leading-[normal] capitalize">
                {order.order_number || order.id}
              </p>
            </div>
            <div className="order-detail-item">
              <h5 className="text-black text-center font-[Montserrat] text-[18px] not-italic font-bold leading-[normal] capitalize">
                Order Date
              </h5>
              <p className="text-black text-center font-[Montserrat] text-[16px] not-italic font-normal leading-[normal] capitalize">
                {formatReadableDate(order.created_at)}
              </p>
            </div>
            <div className="order-detail-item">
              <h5 className="text-black text-center font-[Montserrat] text-[18px] not-italic font-bold leading-[normal] capitalize">
                Total Payment
              </h5>
              <p className="text-black text-center font-[Montserrat] text-[16px] not-italic font-normal leading-[normal] capitalize">
                {order.totalPayment}
              </p>
            </div>

            <div className="order-detail-item">
              <h5 className="text-black text-center font-[Montserrat] text-[18px] not-italic font-bold leading-[normal] capitalize">
                Payment Method
              </h5>
              <p className="text-black text-center font-[Montserrat] text-[16px] not-italic font-normal leading-[normal] capitalize">
                {order.paymentMethod}
              </p>
            </div>

            <div className="order-detail-item">
              <h5 className="text-black text-center font-[Montserrat] text-[18px] not-italic font-bold leading-[normal] capitalize">
                Order Status
              </h5>

              <p className="text-black text-center font-[Montserrat] text-[18px] not-italic font-bold leading-[normal] capitalize">
                {getOrderStatusLabel(order)}
              </p>
            </div>

            <div className="order-detail-item">
              <h5 className="text-black text-center font-[Montserrat] text-[18px] not-italic font-bold leading-[normal] capitalize">
                {order.status === Status.DELIVERED
                  ? "Delivered on"
                  : "Estimated Delivery Date"}
              </h5>
              <p className="text-black text-center font-[Montserrat] text-[16px] not-italic font-normal leading-[normal] capitalize">
                {order.estimated_delivery_date
                  ? new Date(order.estimated_delivery_date).toLocaleDateString(
                      "en-AU",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )
                  : "Not Available"}
              </p>
            </div>
          </div>
          <div>
            {order.products.map((product, idx) => (
              <div
                key={product.id ?? product.item_id ?? idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-200 py-2"
              >
                <div className="flex items-center gap-4">
                  <Link
                    href={`/product/${product.unique_code || product.product_id || product.id}`}
                    className="shrink-0"
                  >
                    <Image
                      width={137}
                      height={137}
                      src={getOrderProductImage(product)}
                      alt={product.title || product.name}
                      className="w-[90px] h-[90px] sm:w-[137px] sm:h-[137px] object-contain cursor-pointer"
                    />
                  </Link>

                  <div>
                    <Link
                      href={`/product/${product.unique_code || product.product_id || product.id}`}
                    >
                      <p className="cursor-pointer hover:text-red-600 transition-colors font-bold">
                        {product.title}
                      </p>
                    </Link>

                    <div>
                      {product.variant_attributes?.map((attr, i) => (
                        <p key={i} className="text-[14px] font-medium text-black">
                          <strong className="font-semibold">{attr.name}:</strong>{" "}
                          {attr.value}
                        </p>
                      ))}

                      <p className="text-[14px] font-medium text-black">
                        <strong className="font-semibold">Quantity:</strong>{" "}
                        {product.quantity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-3 sm:shrink-0">
                  {order.status?.toLowerCase() === "delivered" && (
                    <Link
                      href={`/user/orders/${order.id}/review?product_id=${encodeURIComponent(
                        getReviewProductId(product),
                      )}`}
                      className="btn btn-red btn-filled btn-sharp"
                    >
                      Add Review
                    </Link>
                  )}

                  {order.tracking_link?.trim() && (
                    <Link
                      href={order.tracking_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-red btn-filled btn-sharp"
                    >
                      Track Order
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 pb-5">
            <div className="flex items-center">
              <button
                className="btn btn-red btn-outline btn-rounded cursor-pointer"
                onClick={() => router.push(`/user/orders/${order.id}`)}
              >
                View Order Details
              </button>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {order.status?.toLowerCase() === "delivered" && (
                <button
                  className="btn btn-red btn-outline btn-rounded cursor-pointer"
                  onClick={() =>
                    handleDownloadInvoice(order.id, order.order_number)
                  }
                >
                  Download Invoice
                </button>
              )}

              {(order.available_actions.includes("retry") ||
                order.available_actions.includes("retry_payment")) && (
                <button
                  className="btn btn-red btn-filled btn-sharp"
                  onClick={() => handleRetryPaymentClick(order.id)}
                >
                  Retry Payment
                </button>
              )}

              {order.available_actions.includes("cancel") && (
                <button
                  className={`cursor-pointer transition-colors text-[16px] font-semibold text-[#726969] hover:text-[#FD151B] underline ${
                    isCancelling ? "cursor-not-allowed" : ""
                  }`}
                  onClick={() => !isCancelling && handleCancelClick(order.id)}
                >
                  Cancel Order
                </button>
              )}

              {order.available_actions.includes("return") && (
                <button
                  className="cursor-pointer transition-colors hover:text-[#FD151B] "
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
              <span
                className="loader-spinner"
                style={{
                  marginRight: "10px",
                  border: "2px solid #f3f3f3",
                  borderTop: "2px solid #333",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  animation: "spin 1s linear infinite",
                }}
              ></span>
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
