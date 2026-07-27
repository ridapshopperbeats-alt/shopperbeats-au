"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { OrderDetailsType } from "@/types/order";

// Extract the order details type from OrderSummaryPopup's props

export default function ConfirmedOrderPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetailsType>({
    orderId: "",
    deliveryCost: "",
    totalAmount: "",
    products: [],
    deliveryAddress: "",
  });
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const stored = sessionStorage.getItem("orderConfirmation");

    if (!stored) {
      router.replace("/");
      return;
    }

    try {
      setOrderDetails(JSON.parse(stored) as OrderDetailsType);
    } catch {
      console.log("Failed to parse order confirmation data from sessionStorage.");
    }

    sessionStorage.removeItem("orderConfirmation");
  }, [router]);

  return (
    <div className="py-7">
      <div className="container">
        <div className="w-full max-w-[600px] mx-auto px-4 sm:px-0">
          <h1 className="text-[22px] lg:text-[28px] font-bold text-center mb-6">
            Your Orders are Confirmed!
          </h1>

          <div className="w-full lg:w-[582px] bg-white rounded-[8px] border border-[#D9D2D2] flex flex-col">
            <div className="overflow-auto">
              {/* Header */}
              <div className="text-center py-4 border-b border-[#D9D2D2]">
                <h6 className="text-[18px] font-semibold">
                  Order ID:{" "}
                  <span className="font-normal text-[#555]">
                    #{orderDetails.orderNumber || orderDetails.orderId}
                  </span>
                </h6>
              </div>

              {/* Products */}
              {orderDetails.products.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-stretch py-4 px-4 border-b border-[#D9D2D2] gap-2"
                >
                  <div className="flex gap-3 sm:gap-4 min-w-0">
                    <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          height={80}
                          width={80}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-montserrat font-semibold text-[12px] leading-[16px] tracking-[0%] max-w-[160px] sm:max-w-[300px]">{item.name}</p>
                      <div className="flex flex-wrap gap-2 my-2 sm:my-4">
                        <p className="font-montserrat font-semibold text-[12px] leading-[16px] tracking-[0%]">QTY - {item.quantity || 0}</p>
                        {orderDetails.couponCode && (
                          <p className="px-2 py-1 rounded-[4px] flex gap-1 items-center">
                            <span className="font-montserrat font-medium text-[12px] leading-[100%] tracking-[0%] capitalize" style={{ color: "#049950" }}>
                              Code Applied -{" "}
                            </span>
                            <span className="font-montserrat font-bold text-[12px] leading-[100%] tracking-[0%] capitalize" style={{ color: "#049950" }}>
                              {orderDetails.couponCode}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap flex flex-col justify-end shrink-0">
                    <p className="text-[14px] text-[#FD151B] font-semibold">{item.price}</p>
                  </div>
                </div>
              ))}

              {/* Delivery */}
              <div className="flex justify-between py-3 px-4 border-b border-[#D9D2D2]">
                <div>
                  <p className="font-semibold text-[14px]">Delivery</p>
                  <p className="font-montserrat font-medium text-[14px] leading-[100%] tracking-[0%] text-[#726969] mt-1 max-w-[220px] sm:max-w-[300px]">
                    {orderDetails.deliveryAddress}
                  </p>
                </div>
                <p className="text-[14px] text-[#FD151B] font-semibold shrink-0">{orderDetails.deliveryCost}</p>
              </div>
            </div>

            {/* Total */}
            <div className="w-full h-[54px] flex justify-between items-center p-6 rounded-bl-[8px] rounded-br-[8px] border border-[#D9D2D2] bg-[#F5F5F5]">
              <p className="font-semibold text-[16px]">Total (incl. GST)</p>
              <p className="text-[16px] text-[#FD151B] font-semibold">{orderDetails.totalAmount}</p>
            </div>
          </div>

          <div className="w-full mx-auto flex flex-col px-2 mt-8 gap-4">
            <Link href="/">
              <Button
                className="bg-gradient-to-r from-[#FF676B] to-[#FD151B] h-[46px] rounded-[74px] text-[#F6F6F6] text-[16px] font-semibold leadiing-5 w-full shadow-md shadow-[#0E35BF]/25 cursor-pointer"
                debounceDelay={500}
              >
                Continue Shopping
              </Button>
            </Link>
            <Link href="/user/orders" className="btn btn-red btn-outline btn-rounded w-full lg:w-[583px] flex items-center justify-center">
              Track My Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
