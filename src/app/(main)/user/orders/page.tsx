"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import { RootState } from "@/lib/redux/store";
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
import { formatPrice } from "@/lib/utils/main-utils";
import { getOrderProductImage, getReviewProductId, mapOrderProducts } from "@/lib/utils/order-products";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { getAccessTokenCookie } from "@/lib/utils/access-token";
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";
import CancelOrderPopup from "@/components/common/CancelOrderPopup";
import ReturnOrderPopup from "@/components/common/ReturnOrderPopup";
import RetryPaymentPopup from "@/components/common/RetryPaymentPopup";
import Pagination from "@/components/common/Pagination";
import { Card } from "@/components/common/Card";
import { StatusBadge, BadgeColor } from "@/components/common/StatusBadge";
import { Truck, Eye, ChevronUp, ChevronDown, ArrowUpDown, XCircle, RotateCcw, ChevronRight, Star, RefreshCw } from "lucide-react";

enum OrderStatusCode {
  Confirmed = "confirmed",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
  Pending = "pending",
  InProgress = "in progress",
  ReturnRequested = "return requested",
  ReplacementRequested = "replacement_requested",
  Refunded = "refunded",
}

const ORDER_STATUS_LABELS: Record<OrderStatusCode, string> = {
  [OrderStatusCode.Confirmed]: "Confirmed",
  [OrderStatusCode.Shipped]: "Shipped",
  [OrderStatusCode.Delivered]: "Delivered",
  [OrderStatusCode.Cancelled]: "Cancelled",
  [OrderStatusCode.Pending]: "Pending",
  [OrderStatusCode.InProgress]: "In Progress",
  [OrderStatusCode.ReturnRequested]: "Return Requested",
  [OrderStatusCode.ReplacementRequested]: "Replacement Requested",
  [OrderStatusCode.Refunded]: "Refunded",
};

const IN_TRANSIT_CODES = [
  OrderStatusCode.Confirmed,
  OrderStatusCode.Shipped,
  OrderStatusCode.Pending,
  OrderStatusCode.InProgress,
];

const ORDER_STATUS_COLORS: Record<OrderStatusCode, BadgeColor> = {
  [OrderStatusCode.Confirmed]: BadgeColor.Blue,
  [OrderStatusCode.Shipped]: BadgeColor.Blue,
  [OrderStatusCode.Pending]: BadgeColor.Blue,
  [OrderStatusCode.InProgress]: BadgeColor.Blue,
  [OrderStatusCode.Delivered]: BadgeColor.Green,
  [OrderStatusCode.Cancelled]: BadgeColor.Red,
  [OrderStatusCode.ReturnRequested]: BadgeColor.Orange,
  [OrderStatusCode.ReplacementRequested]: BadgeColor.Orange,
  [OrderStatusCode.Refunded]: BadgeColor.Orange,
};

const getOrderStatusCode = (order: OrderItem): OrderStatusCode => {
  const hasReturnRequested = order?.returns?.some(
    (r: OrderReturn) => r?.status?.toLowerCase() === "requested",
  );

  if (hasReturnRequested) return OrderStatusCode.ReturnRequested;

  const key = (order?.status || "").toLowerCase();
  return (Object.values(OrderStatusCode) as string[]).includes(key)
    ? (key as OrderStatusCode)
    : OrderStatusCode.Pending;
};

const getOrderStatusLabel = (order: OrderItem) =>
  ORDER_STATUS_LABELS[getOrderStatusCode(order)] ?? order?.status ?? "N/A";

const getOrderStatusColor = (order: OrderItem): BadgeColor =>
  ORDER_STATUS_COLORS[getOrderStatusCode(order)] ?? BadgeColor.Blue;

const isInTransitOrder = (order: OrderItem) =>
  IN_TRANSIT_CODES.includes(getOrderStatusCode(order));

const isDeliveredOrder = (order: OrderItem) =>
  getOrderStatusCode(order) === OrderStatusCode.Delivered;

type OrderTab = "all" | "transit" | "delivered";

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, authChecked } = useSelector((state: RootState) => state.auth);
  const [cancelOrder] = useCancelOrderMutation();

  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [isReturnPopupOpen, setIsReturnPopupOpen] = useState(false);
  const [isRetryPopupOpen, setIsRetryPopupOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const CHUNK_SIZE = 20;

  const [sortOrdersBy, setSortOrdersBy] = useState<string>("");
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [collapsedOrders, setCollapsedOrders] = useState<Set<string>>(new Set());

  const toggleOrderCollapse = (orderId: string) => {
    setCollapsedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
      skip: !authChecked || !isAuthenticated,
    },
  );

  const [allOrders, setAllOrders] = useState<OrderItem[]>([]);
  const querySettled = !isLoading && !isFetching;

  const effectiveTotal = data?.total_items ?? 0;
  const totalPages = Math.ceil(effectiveTotal / uiLimit);

  useEffect(() => {
    if (!querySettled) return;

    const sourceOrders = data?.data ?? [];

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

      const token = getAccessTokenCookie();
      const response = await fetch(url, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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

  if (!mounted || (isLoading && allOrders.length === 0))
    return (
      <div>
        Loading.....
      </div>
    );

  const transitCount = allOrders.filter(isInTransitOrder).length;
  const deliveredCount = allOrders.filter(isDeliveredOrder).length;

  const displayedOrders =
    activeTab === "transit"
      ? allOrders.filter(isInTransitOrder)
      : activeTab === "delivered"
        ? allOrders.filter(isDeliveredOrder)
        : allOrders;

  const TABS: { key: OrderTab; label: string; count: number }[] = [
    { key: "all", label: "All Orders", count: allOrders.length },
    { key: "transit", label: "In Transit", count: transitCount },
    { key: "delivered", label: "Delivered", count: deliveredCount },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      {allOrders.length > 0 && (
        <>
          <Card className="w-full flex-row flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
            <div className="no-scrollbar flex w-fit max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-full bg-[#F5F5F5] p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-1 sm:gap-2 whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 transition-colors ${
                    activeTab === tab.key
                      ? "bg-white text-center font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-semibold leading-[18px] text-[#FD151B] shadow-sm"
                      : "text-center font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-semibold leading-[18px] text-[#6A7282] hover:text-black"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`flex shrink-0 flex-col items-center justify-center rounded-full ${
                      activeTab === tab.key
                        ? "w-[17.917px] h-[19px] px-1.5 py-0.5 bg-[#FEF2F2] text-center  text-[clamp(0.625rem,0.625rem,0.625rem)] font-semibold leading-[18px] text-[#FD151B]"
                        : "w-[17.9px] h-[19px] px-1.5 py-0.5 bg-[#E5E7EB] text-center text-[clamp(0.625rem,0.625rem,0.625rem)] font-bold leading-[15px] text-[#6A7282]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="product-sort flex w-full shrink-0 items-center gap-2 sm:w-auto">
              <ArrowUpDown size={14} className="shrink-0 text-[#99A1AF]" />
              <span className="shrink-0 text-[#99A1AF] font-medium text-[clamp(0.75rem,0.75rem,0.75rem)] leading-[16.5px]">Sort by:</span>

              <Select value={sortOrdersBy} onValueChange={handleSortChange}>
                <SelectTrigger
                className="inline-flex w-auto min-w-0 items-center justify-start gap-2 rounded-[23px] border border-[#E5E7EB] bg-[#F9FAFB] py-[7.5px] pr-[38px] pl-[12.066px] shadow-none focus:ring-0 focus:ring-offset-0">
                  <SelectValue
                    placeholder="Delivery Date"
                    className="!text-[#99A1AF] font-medium leading-[16px] text-12px!"
                    style={{ color: "#99A1AF" }}
                  />
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  className=" bg-white rounded-[23px] !ring-gray-200 w-[100px] p-0 overflow-hidden "
                >
                  <SelectItem
                    value="oldest"
                    className="px-3 py-2 cursor-pointer rounded-none fluid-text-xs text-[#99A1AF] font-medium leading-[16px]"
                  >
                    Delivery Date
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="flex items-center gap-2 fluid-text-sm">
            <span className="font-bold text-sm font-bold text-[#211E22] leading-[19px]">
              Orders <span className="text-sb-red">({effectiveTotal})</span>
            </span>
            <ChevronRight size={14} className="text-[#D1D5DC] ml-[-5px]" />
            <span className="text-[#99A1AF] text-[0.75rem] font-normal leading-[18px] capitalize">
              {TABS.find((t) => t.key === activeTab)?.label}
            </span>
          </div>
        </>
      )}

      {querySettled && isError && allOrders.length === 0 && (
        <Card className="w-full p-6 border">
          <div className="w-full flex flex-col items-center justify-center gap-3 py-20">
            <p>Failed to load your orders. Please try again.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-red btn-filled btn-sharp"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      {querySettled && !isError && allOrders.length === 0 && (
        <Card className="w-full p-6 border">
          <div className="w-full flex justify-center py-20">
            <p>No orders yet</p>
          </div>
        </Card>
      )}

      {displayedOrders.length === 0 && allOrders.length > 0 && (
        <Card className="w-full p-6 border">
          <div className="w-full flex justify-center py-20">
            <p>No orders in this category</p>
          </div>
        </Card>
      )}

      {displayedOrders.map((order) => (
        <Card key={order.id} className="w-full border p-4 sm:p-6 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full">
            <div className="flex w-full items-center justify-between gap-3 sm:hidden">
              <StatusBadge
                label={getOrderStatusLabel(order)}
                color={getOrderStatusColor(order)}
              />

              <button
                type="button"
                onClick={() => toggleOrderCollapse(order.id)}
                className="cursor-pointer text-[#99A1AF] hover:text-black"
                aria-label={collapsedOrders.has(order.id) ? "Expand order" : "Collapse order"}
              >
                {collapsedOrders.has(order.id) ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronUp size={18} />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 flex-1 w-full">
              <div className="flex flex-col gap-1">
                <span className="text-[0.625rem] text-[#99A1AF] font-semibold leading-[15px] capitalize">Order ID</span>
                <span className="text-[0.75rem] font-bold text-[#211E22] leading-[18px]">
                  #{order.order_number || order.id}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[0.625rem] text-[#99A1AF] font-semibold leading-[15px] capitalize">Total Payment</span>
                <span className="text-[0.75rem] font-bold text-[#211E22] leading-[18px]">{order.totalPayment}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[0.625rem] text-[#99A1AF] font-semibold leading-[15px] capitalize">Payment Method</span>
                <span className="text-[0.75rem] font-bold text-[#211E22] leading-[18px]">{order.paymentMethod}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[0.625rem] text-[#99A1AF] font-semibold leading-[15px] capitalize">Estimated Delivery Date</span>
                  {/* {order.status === Status.DELIVERED
                    ? "Delivered On"
                    : "Estimated Delivery Date"} */}
                <span className="text-[0.75rem] font-bold text-[#211E22] leading-[18px]">
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
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <StatusBadge
                label={getOrderStatusLabel(order)}
                color={getOrderStatusColor(order)}
              />

              <button
                type="button"
                onClick={() => toggleOrderCollapse(order.id)}
                className="cursor-pointer text-[#99A1AF] hover:text-black"
                aria-label={collapsedOrders.has(order.id) ? "Expand order" : "Collapse order"}
              >
                {collapsedOrders.has(order.id) ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronUp size={18} />
                )}
              </button>
            </div>

          </div>

          <hr className="-mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] border-t border-[#F9FAFB]" />

          {!collapsedOrders.has(order.id) && (
            <div className="w-full">
              {order.products.map((product, idx) => (
                <div
                  key={product.id ?? product.item_id ?? idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-100 py-3 last:border-b-0 last:mb-0"
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
                        className="h-[74px] w-[74px] shrink-0 self-stretch rounded-lg border border-[#F3F4F6] bg-gray-300 bg-cover bg-center object-cover cursor-pointer"
                      />
                    </Link>

                    <div>
                      <Link
                        href={`/product/${product.unique_code || product.product_id || product.id}`}
                      >
                        <p className="cursor-pointer hover:text-red-600 transition-colors font-semibold fluid-text-xs text-[#211E22] leading-[18px]">
                          {product.title}
                        </p>
                      </Link>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {product.variant_attributes?.map((attr, i) => (
                          <StatusBadge
                            key={i}
                            label={`${attr.name}: ${attr.value}`}
                            color={BadgeColor.Gray}
                            showDot={false}
                          />
                        ))}

                        <StatusBadge
                          label={`Qty: ${product.quantity}`}
                          color={BadgeColor.Gray}
                          showDot={false}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 sm:ml-4">
                    <p className="text-[0.625rem] text-[#99A1AF] font-normal leading-[15px] capitalize">Price</p>
                    <p className="fluid-text-xs font-bold text-[#211E22] leading-[19px]">
                      {(order.totalPayment.split(" ")[0] || "").trim()}{" "}
                      {formatPrice(product.total_price ?? product.unit_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="-mx-4 sm:-mx-6 -mb-4 sm:-mb-6 flex w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] h-auto sm:h-[69.75px] shrink-0 flex-col items-start sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-b-2xl border-t border-[#F3F4F6] bg-[#F9FAFB] px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3 flex-wrap">
              {order.status?.toLowerCase() === "delivered" && (
                <Link
                  href={`/user/orders/${order.id}/review?product_id=${encodeURIComponent(
                    getReviewProductId(order.products[0]),
                  )}`}
                  className="flex w-auto min-w-[138.067px] h-[34.75px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[24px] bg-[#FD151B] px-5 py-2 text-center font-montserrat text-[0.75rem] font-bold leading-[18.75px] text-white"
                >
                  <Star size={16} />
                  Add Review
                </Link>
              )}

              {order.tracking_link?.trim() && (
                <Link
                  href={order.tracking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-[138.067px] h-[34.75px] shrink-0 items-center gap-2 rounded-[24px] bg-[#FD151B] px-5 py-2 text-center font-montserrat text-[0.75rem] font-bold leading-[18.75px] text-white"
                >
                  <Truck size={16} />
                  Track Order
                </Link>
              )}

              <button
                className="flex w-[183.25px] h-[36.75px] shrink-0 items-center gap-2 rounded-[24px] border border-[#FD151B] bg-white px-5 py-2 cursor-pointer text-center font-montserrat text-[0.75rem] font-semibold leading-[18.75px] text-[#FD151B]"
                onClick={() => router.push(`/user/orders/${order.id}`)}
              >
                <Eye size={16} />
                View Order Details
              </button>

              {order.status?.toLowerCase() === "delivered" && (
                <button
                  className="flex w-auto min-w-[138.067px] h-[34.75px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[24px] bg-[#FD151B] px-5 py-2 cursor-pointer text-center font-montserrat text-[0.75rem] font-bold leading-[18.75px] text-white"
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
                  className="flex w-auto min-w-[138.067px] h-[34.75px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[24px] bg-[#FD151B] px-5 py-2 cursor-pointer text-center font-montserrat text-[0.75rem] font-bold leading-[18.75px] text-white"
                  onClick={() => handleRetryPaymentClick(order.id)}
                >
                  Retry Payment
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {order.available_actions.includes("cancel") && (
                <button
                  className={`inline-flex cursor-pointer items-center gap-1.5 transition-colors text-[0.75rem] font-medium text-[#99A1AF] leading-[18px] hover:text-[#FD151B] ${
                    isCancelling ? "cursor-not-allowed" : ""
                  }`}
                  onClick={() => !isCancelling && handleCancelClick(order.id)}
                >
                  <XCircle size={12} />
                  Cancel Order
                </button>
              )}

              {order.available_actions.includes("return") && (
                <button
                  className="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-[#FD151B] text-[0.75rem] font-medium text-[#99A1AF] leading-[18px]"
                  onClick={() => handleReturnClick(order.id)}
                >
                  <RefreshCw size={12} />
                  Return
                </button>
              )}
            </div>
          </div>
        </Card>
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
      <div className="w-full bg-white [&>div]:pt-0">
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
