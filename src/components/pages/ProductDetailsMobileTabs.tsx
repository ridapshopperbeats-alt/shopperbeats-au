"use client";

import { useState } from "react";
import Accordion from "../common/Accordion";
import { Review } from "@/types/product";
import { warrantyAndReturnContent } from "../ui/product-tab-content";
import CustomerRatingViewPage from "./CustomerRatingViewPage";

interface ProductDetailsMobileTabsProps {
  featuresContent: React.ReactNode;
  descriptionContent: React.ReactNode;
  deliveryContent: React.ReactNode;
  reviews: Review[];
}

export default function ProductDetailsMobileTabs({
  descriptionContent,
  deliveryContent,
  reviews,
}: ProductDetailsMobileTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  const accordionItems = [
    { id: "description", title: "Description", content: descriptionContent },
    // { id: "delivery", title: "Delivery", content: deliveryContent },
    // { id: "Warranty and return ", title: "Warranty And Return", content: warrantyAndReturnContent },
  ];

  const tabButtonClass = (tab: "details" | "reviews") =>
    `pb-3 leading-[18px] text-[16px] font-normal border-b-2 -mb-px transition-colors ${
      activeTab === tab
        ? "text-[#FD151B] border-[#FD151B]"
        : "text-[#001325]/64 border-transparent"
    }`;

  return (
    <div>
      <div className="-mx-7 lg:-mx-4 flex items-center gap-6 border-b border-[#ECECEC] px-5">
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
        <div className="pt-2">
          <Accordion items={accordionItems} variation={2} independent />
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="pt-4 pb-4">
          {reviews.length > 0 ? (
            <CustomerRatingViewPage reviews={reviews} />
          ) : (
            <p className="text-[14px] text-[#696e79]">No reviews yet.</p>
          )}
        </div>
      )}

      <div className="-mx-7 lg:-mx-4 border-t border-[#EAEAEA] lg:hidden  shadow-[0px_0px_16.1px_0px_#8E8E8E40]" />
    </div>
  );
}
