"use client";

import { useState } from "react";
import Accordion from "../common/Accordion";
import CustomerRatingViewPage from "./CustomerRatingViewPage";
import type { ProductDetailsMobileTabsProps } from "@/types/product";


export default function ProductDetailsMobileTabs({
  descriptionContent,
  reviews,
}: ProductDetailsMobileTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  const accordionItems = [
    { id: "description", title: "Description", content: descriptionContent },
  ];

  const tabButtonClass = (tab: "details" | "reviews") =>
    `pb-3 leading-[18px] text-[16px] font-normal border-b-2 -mb-px transition-colors ${
      activeTab === tab
        ? "text-[#FD151B] border-[#FD151B]"
        : "text-[#001325]/64 border-transparent"
    }`;

  return (
    <div>
      <div className="  flex items-center gap-6 border-b border-[#ECECEC] px-2 lg:px-0">
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={tabButtonClass("details")}
        >
          Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={tabButtonClass("reviews")}
        >
          Reviews
        </button>
      </div>

      {activeTab === "details" && (
        <div className="pt-2 px-[10px] lg:px-0">
          <Accordion items={accordionItems} variation={2} independent />
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="pt-4 pb-4 px-[10px] lg:px-0">
          {reviews.length > 0 ? (
            <CustomerRatingViewPage reviews={reviews} />
          ) : (
            <p className="text-[14px] text-[#696e79]">No reviews yet.</p>
          )}
        </div>
      )}

      <div className="mt-6 -mx-7 lg:-mx-4 border-t border-[#EAEAEA] lg:hidden  shadow-[0px_0px_16.1px_0px_#8E8E8E40]" />
    </div>
  );
}
