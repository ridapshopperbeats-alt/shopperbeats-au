"use client";

import { useState } from "react";
import Accordion from "../common/Accordion";
import ReviewCard from "../ui/ReviewCard";
import { Review } from "@/types/product";

interface ProductDetailsMobileTabsProps {
  featuresContent: React.ReactNode;
  descriptionContent: React.ReactNode;
  productDetailsContent: React.ReactNode;
  styleContent: React.ReactNode;
  itemsDetailsContent: React.ReactNode;
  reviews: Review[];
}

export default function ProductDetailsMobileTabs({
  featuresContent,
  descriptionContent,
  productDetailsContent,
  styleContent,
  itemsDetailsContent,
  reviews,
}: ProductDetailsMobileTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  const accordionItems = [
    {
      id: "features",
      title: "Features",
      defaultOpen: true,
      content: featuresContent,
    },
    { id: "description", title: "Description", content: descriptionContent },
    {
      id: "product-details",
      title: "Product Details",
      content: productDetailsContent,
    },
    { id: "style", title: "Style", content: styleContent },
    { id: "items-details", title: "Item Details", content: itemsDetailsContent },
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
        <div className="flex flex-col gap-4 pt-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <p className="text-[14px] text-[#696e79]">No reviews yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
