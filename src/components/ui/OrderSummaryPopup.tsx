"use client"
import Link from 'next/link';
import React, { useState } from 'react';
import { useCancelOrderMutation } from "@/lib/redux/apis/order-api";
import CancelOrderPopup from "@/components/ui/CancelOrderPopup";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import '../../styles/Checkout.css'
import Image from 'next/image';


export interface PopupProduct {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  variant?: string;
  sku?: string;
  unitPrice?: string;
  discount?: string;
  finalPrice?: string;
}

export interface OrderDetails {
  orderId?: string;
  orderNumber?: string;
  deliveryCost: string;
  totalAmount: string;
  deliveryAddress?: string;
  couponCode?: string;
  products: PopupProduct[];
  orderDate?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  estimatedDelivery?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  subtotal?: string;
  discountAmount?: string;
  shippingCost?: string;
  taxAmount?: string;
}

interface OrderSummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: OrderDetails;
  isAuthenticated: boolean;
  from?: string;
}

const OrderSummaryPopup: React.FC<OrderSummaryPopupProps> = ({ isOpen, onClose, orderDetails, isAuthenticated, from }) => {
  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [cancelOrder] = useCancelOrderMutation();

  const handleCancelConfirm = async (orderId: string, reason: string) => {
    try {
      await cancelOrder({ order_id: orderId, reason: reason }).unwrap();
      toast.success("Order cancelled successfully!");
      setIsCancelPopupOpen(false);
      onClose();
    } catch {
      toast.error("Failed to cancel order.");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div id={from === "checkout" ? "popupModal" : "popupModall"} className="">
      <div
        className="w-[400px] md:h-[620px] lg:h-[650px] md:w-[662px] bg-white rounded-[8px] flex justify-center items-center relative p-6 overflow-auto overscroll-contain no-scrollbar"
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="w-[400px] md:h-[40rem] lg:h-[600px] md:w-[582px]">
          <div
            className="shadow-md h-[30px] w-[30px] flex absolute top-3 md:top-2 lg:top-5 text-[30px] leading-[30px] rounded-[50%] justify-center items-center right-2 md:right-5 cursor-pointer bg-white"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </div>
          <div className="text-[20px]  md:text-[30px] font-bold text-center py-2">Your Order is Confirmed!</div>
          <div
            className="bg-white rounded-[8px] border border-[#E5E5E5] overflow-auto overscroll-contain flex flex-col"
            style={{height:"100%",maxHeight:"22rem"}}
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="text-center py-4 border-b border-[#E5E5E5]">
              <h6 className="text-[28px] font-semibold">
                Order ID:{" "}
                <span className="font-normal text-[#555]">
                  #{orderDetails.orderNumber || orderDetails.orderId || "N/A"}
                </span>
              </h6>
            </div>

            {orderDetails.products.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start py-4 px-4"
              >
                <div className="flex gap-4">
                  <div className="w-[72px] h-[72px] rounded-[6px] overflow-hidden border border-gray-200 shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        height={100}
                        width={100}
                        alt={item.name}
                        className=" object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-[14px] font-medium  max-w-[300px]">
                      {item.name}
                    </p>
                  </div>
                </div>

                <p className="text-[14px] font-medium whitespace-nowrap">
                  {item.quantity} ×{" "}
                  <span className="text-[14px] text-[#FD151B] font-semibold ">{item.price}</span>
                </p>
              </div>
            ))}

            <div className="flex justify-between py-3 px-4 border-b border-t border-[#E5E5E5]">
              <div>
                <p className="font-semibold text-[14px]">Delivery</p>
                <p className="!text-[14px] text-[#726969] mt-1 max-w-[300px] leading-[18px]">{orderDetails.deliveryAddress}</p>
              </div>
              <p style={{ color: "#FD151B", fontSize: "14px", fontWeight: "500" }} >{orderDetails.deliveryCost}</p>
            </div>

            <div className="flex justify-between py-3 px-4 border-b border-[#E5E5E5]">
              <div>
                {orderDetails.couponCode && (
                  <p className="!text-[14px] text-[#726969] mt-1 max-w-[400px] leading-[18px]">
                    {orderDetails.couponCode}
                  </p>
                )}
              </div>
              <p style={{ color: "#FD151B", fontSize: "14px", fontWeight: "500" }} >{orderDetails.deliveryCost}</p>
            </div>


            <div className="flex flex-grow justify-between p-4 bg-[#F5F5F5]">
              <p className="font-semibold text-[20px]">Total (incl. GST)</p>
              <p style={{ color: "#FD151B", fontSize: "16px", fontWeight: "500" }}>
                {orderDetails.totalAmount}
              </p>
            </div>
          </div>

          <div className='w-full mx-auto flex flex-col px-2'>
            <Link href="/" className="btn btn-red btn-filled btn-sharp  mt-30 mb-20 ">
              Continue Shopping
            </Link>
            {isAuthenticated && <Link href="/user/orders" className="btn btn-red btn-outline btn-rounded ">
              View Order
            </Link>}
          </div>
          <p className="mt-30 align-center">
            Order placed by mistake?{" "}
            <Button
              className="btn-link"
              onClick={() => setIsCancelPopupOpen(true)}
              style={{ color: "#FD151B", fontSize: "16px", cursor: "pointer" }}
            >
              Cancel Order
            </Button>
          </p>
        </div>
      </div>
      <CancelOrderPopup
        isOpen={isCancelPopupOpen}
        onClose={() => setIsCancelPopupOpen(false)}
        orderId={orderDetails.orderId ?? ""}
        onCancelConfirm={handleCancelConfirm}
      />
    </div>
  );
};

export default OrderSummaryPopup;
