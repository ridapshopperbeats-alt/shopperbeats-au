"use client";

import React, { useState } from "react";
import Image from "next/image";
import StarRating from "../ui/StarRating";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Review } from "@/types/product";
import { getReviewImage } from "@/lib/utils/image-utils";

interface DisplayReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
  reviewer_profile_image?: string | null;
  images?: string[] | null;
}

function formatReviewDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeReview(review: Review): DisplayReview {
  return {
    id: review.id,
    name: review.reviewer_name || review.user || "Anonymous",
    rating: Number(review.rating) || 0,
    date: formatReviewDate(review.created_at),
    comment: review.comment,
    reviewer_profile_image: review.reviewer_profile_image,
    images: review.images,
  };
}

const STORE_REVIEWS: DisplayReview[] = [];
const QUESTIONS: {
  id: string;
  name: string;
  date: string;
  question: string;
  answer?: string;
}[] = [];

const TABS = ["Product Reviews", "Store Reviews", "Questions"] as const;
type Tab = (typeof TABS)[number];

const REVIEWS_PAGE_SIZE = 4;

interface CustomerRatingViewPageProps {
  reviews?: Review[];
}

export default function CustomerRatingViewPage({
  reviews,
}: CustomerRatingViewPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  const [sortBy, setSortBy] = useState("Latest");
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE);

  const productReviews = (reviews ?? []).map(normalizeReview);

  const tabHasData: Record<Tab, boolean> = {
    "Product Reviews": productReviews.length > 0,
    "Store Reviews": STORE_REVIEWS.length > 0,
    Questions: QUESTIONS.length > 0,
  };
  const visibleTabs = TABS.filter((tab) => tabHasData[tab]);

  if (visibleTabs.length === 0) return null;

  const currentTab = tabHasData[activeTab] ? activeTab : visibleTabs[0];

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setVisibleCount(REVIEWS_PAGE_SIZE);
  };

  const isQuestionsTab = currentTab === "Questions";
  const activeReviews =
    currentTab === "Store Reviews" ? STORE_REVIEWS : productReviews;

  const visibleReviews = activeReviews.slice(0, visibleCount);
  const hasMoreReviews = visibleCount < activeReviews.length;
  const canToggleReviews = activeReviews.length > REVIEWS_PAGE_SIZE;

  const visibleQuestions = QUESTIONS.slice(0, visibleCount);
  const hasMoreQuestions = visibleCount < QUESTIONS.length;
  const canToggleQuestions = QUESTIONS.length > REVIEWS_PAGE_SIZE;

  const totalReviews = activeReviews.length;
  const averageRating =
    totalReviews > 0
      ? activeReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = activeReviews.filter(
      (r) => Math.round(r.rating) === stars,
    ).length;
    return {
      stars,
      count,
      percent: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
    };
  });

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-center lg:justify-between gap-4 mb-2 lg:mb-6">
        <h2 className="text-[14px] lg:text-[26px] leading-[18px] font-bold">
          <span className="text-[#FD151B]">Customer ratings</span>{" "}
          <span className="text-black">&amp; reviews</span>
        </h2>

        <div className="flex flex-col gap-3 w-full lg:w-auto lg:flex-1 lg:min-w-0 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={`shrink-0 h-[38px] px-5 rounded-full text-[10px] lg:text-[13px] font-semibold border cursor-pointer whitespace-nowrap transition-colors ${
                  currentTab === tab
                    ? "bg-[#FD151B] border-[#FD151B] text-white"
                    : "bg-white border-[#E2E2E2] text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-auto md:w-auto 2xl:w-[240px] shrink-0">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-[32px] w-full rounded-[20px] border border-[#001325]/64 bg-white px-4 shadow-none focus:ring-0">
                <div className="flex items-center gap-2 flex-1">
                  <Image
                    src="/images/sortBy.svg"
                    alt="sort"
                    width={18}
                    height={18}
                  />

                  <span className="text-[12px] font-normal text-[#001325]/64 leading-[18px] whitespace-nowrap">
                    Sort by :
                  </span>

                  <SelectValue placeholder="Price" />
                </div>
              </SelectTrigger>

              <SelectContent
                position="popper"
                className="w-(--radix-select-trigger-width)  2xl:w-[230px]  border !border-[#F6F6F6] bg-white p-2 shadow-[#000000]/25 rounded-[5px] ring-0 outline-none focus:outline-none focus:ring-0 text-[14px] font-normal leading-[17px] "
              >
                <SelectItem value="price_asc" className="mb-2">
                  Latest
                </SelectItem>

                <SelectItem value="price_desc" className="mb-2">
                  Highest Rating
                </SelectItem>

                <SelectItem value="newly_added">Lowest Rating</SelectItem>

                <SelectItem value="top_rated" className="mb-2">
                  Most Helpful
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 xl:gap-10">
        {!isQuestionsTab && (
          <div className="w-full xl:w-[320px] xl:shrink-0">
            <p className="text-[15px] leading-[20px] lg:text-[30px] font-bold text-black">
              {averageRating.toFixed(1)} Out Of 5
            </p>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={averageRating} size={16} />
              <span className="text-[13px] text-[#211E22]">
                {totalReviews.toLocaleString()}{" "}
                {totalReviews === 1 ? "Review" : "Reviews"}
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-5">
              {ratingBreakdown.map((row) => (
                <div
                  key={row.stars}
                  className="flex items-center gap-2 text-[13px] font-normal leading-[18px] text-[#535766]"
                >
                  <span className="w-10 shrink-0">{row.stars} Star</span>
                  <div className="flex-1 rounded-[12px] bg-[#DBDEE1] overflow-hidden h-[10px]">
                    <div
                      className="h-full bg-[#FBBC05] rounded-[12px]"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                  <span className="w-9 shrink-0  text-[13px] font-normal leading-[18px] text-[#535766] 
                  ">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative flex-1 min-w-0 xl:pl-10">
          <div className="hidden xl:block absolute left-0 top-4 bottom-20 w-px bg-[#D2D2D2]" />
          {isQuestionsTab
            ? visibleQuestions.length > 0 && (
                <div
                  className="flex flex-col divide-y divide-[#F0F0F0] max-h-[520px] overflow-y-auto overscroll-contain pr-2 scrollbar scrollbar-track-[#F2F2F2] scrollbar-thumb-[#BDBDBD] scrollbar-track-rounded-[15px] scrollbar-thumb-rounded-[15px]"
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                >
                  {visibleQuestions.map((item) => (
                    <div key={item.id} className="py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[13px] lg:text-[16px] leading-[13px] capitalize text-[#0F0F0F]">
                          {item.name}
                        </span>
                        <span className="text-[12px] text-[#696e79]">
                          {item.date}
                        </span>
                      </div>

                      <p className="mt-1 text-[13px] text-[#0F0F0F]">
                        <span className="font-semibold">Q:</span>{" "}
                        {item.question}
                      </p>

                      {item.answer && (
                        <p className="mt-1 text-[13px] text-[#696e79]">
                          <span className="font-semibold">A:</span>{" "}
                          {item.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
            : visibleReviews.length > 0 && (
                <div
                  className="flex flex-col divide-y divide-[#F0F0F0] max-h-[520px] overflow-y-auto overscroll-contain pr-2 scrollbar scrollbar-track-[#F2F2F2] scrollbar-thumb-[#BDBDBD] scrollbar-track-rounded-[15px] scrollbar-thumb-rounded-[15px]"
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                >
                  {visibleReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-start gap-3 py-4"
                    >
                      <Image
                        src={
                          review.reviewer_profile_image ||
                          "/images/default_user_icon.jpg"
                        }
                        alt={review.name}
                        width={54}
                        height={54}
                        className="rounded-full w-10 h-10 object-cover shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 lg:flex-nowrap">
                          <div className="order-1 flex flex-wrap items-center gap-2 lg:gap-6">
                            <span className="font-semibold text-[13px] lg:text-[16px] leading-[13px] capitalize text-[#0F0F0F]">
                              {review.name}
                            </span>

                            <div className="shrink-0">
                              <StarRating rating={review.rating} size={13} />
                            </div>

                            {review.verified && (
                              <span className="whitespace-nowrap font-normal text-[12px] lg:text-[14px] leading-[18px] capitalize text-[#00AD34]">
                                Verified Purchase
                              </span>
                            )}
                          </div>

                          <span className="order-2 text-[12px] text-[#696e79] lg:ml-auto">
                            {review.date}
                          </span>
                        </div>

                        <p className="mt-1 text-[13px] text-[#696e79]">
                          {review.comment}
                        </p>
                      </div>

                      <Image
                        src={getReviewImage(review)}
                        alt="Reviewed product"
                        width={75}
                        height={75}
                        className="rounded-[6px] w-14 h-14 object-cover shrink-0"
                      />
                    </div>
                  ))}
                </div>
              )}

          <div className="flex justify-center py-6">
            {isQuestionsTab
              ? canToggleQuestions && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((count) =>
                        hasMoreQuestions
                          ? Math.min(
                              count + REVIEWS_PAGE_SIZE,
                              QUESTIONS.length,
                            )
                          : REVIEWS_PAGE_SIZE,
                      )
                    }
                    className="h-[45px] px-8 rounded-full bg-[#FD151B] text-white font-semibold text-[14px] cursor-pointer"
                  >
                    {hasMoreQuestions
                      ? "View More Questions"
                      : "View Less Questions"}
                  </button>
                )
              : canToggleReviews && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((count) =>
                        hasMoreReviews
                          ? Math.min(
                              count + REVIEWS_PAGE_SIZE,
                              activeReviews.length,
                            )
                          : REVIEWS_PAGE_SIZE,
                      )
                    }
                    className="h-[45px] px-8 rounded-full bg-[#FD151B] text-white font-semibold text-[14px] cursor-pointer"
                  >
                    {hasMoreReviews ? "View More Reviews" : "View Less Reviews"}
                  </button>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}
