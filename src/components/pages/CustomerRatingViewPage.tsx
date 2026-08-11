"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import StarRating from "../common/StarRating";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../common/select";
import { Review } from "@/types/product";
import { getReviewImage } from "@/lib/utils/main-utils";

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
    verified: true,
    reviewer_profile_image: review.reviewer_profile_image,
    images: review.images,
  };
}

const STORE_REVIEWS: DisplayReview[] = [
  {
    id: "store-review-1",
    name: "Amelia Clarke",
    rating: 5,
    date: "18 Jul 2026",
    comment:
      "Great experience shopping with this store — fast dispatch and the packaging was excellent.",
    verified: true,
    reviewer_profile_image: null,
  },
  {
    id: "store-review-2",
    name: "Noah Bennett",
    rating: 4,
    date: "10 Jul 2026",
    comment:
      "Customer support was quick to respond when I had a question about my order.",
    verified: true,
    reviewer_profile_image: null,
  },
  {
    id: "store-review-3",
    name: "Sophia Turner",
    rating: 5,
    date: "02 Jul 2026",
    comment:
      "Reliable seller, this is my third order and everything arrived as described.",
    verified: false,
    reviewer_profile_image: null,
  },
  {
    id: "store-review-4",
    name: " work",
    rating: 5,
    date: "02 Jul 2026",
    comment:
      "Reliable seller, this is my third order and everything arrived as described.",
    verified: false,
    reviewer_profile_image: null,
  },
  {
    id: "store-review-5",
    name: "Sophia here",
    rating: 5,
    date: "02 Jul 2026",
    comment:
      "Reliable seller, this is my third order and everything arrived as described.",
    verified: false,
    reviewer_profile_image: null,
  },
  {
    id: "store-review-6",
    name: "Sophia work",
    rating: 5,
    date: "02 Jul 2026",
    comment:
      "Reliable seller, this is my third order and everything arrived as described.",
    verified: false,
    reviewer_profile_image: null,
  },
];

const QUESTIONS: {
  id: string;
  name: string;
  date: string;
  question: string;
  answer?: string;
}[] = [
  {
    id: "question-1",
    name: "Liam Foster",
    date: "20 Jul 2026",
    question: "Does this come with a warranty?",
    answer: "Yes, it includes a 1-year manufacturer warranty.",
  },
  {
    id: "question-2",
    name: "Emma Johnson",
    date: "14 Jul 2026",
    question: "Is this true to size?",
    answer: "Yes, most buyers found it fits true to size.",
  },
  {
    id: "question-3",
    name: "Oliver Smith",
    date: "05 Jul 2026",
    question: "Can I return this if it doesn't fit?",
    answer: "Yes, returns are accepted within 30 days of delivery.",
  },
];

const TABS = ["Product Reviews", "Store Reviews", "Questions"] as const;
type Tab = (typeof TABS)[number];

const REVIEWS_PAGE_SIZE = 2;

interface CustomerRatingViewPageProps {
  reviews?: Review[];
}

export default function CustomerRatingViewPage({
  reviews,
}: CustomerRatingViewPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  const [sortBy, setSortBy] = useState("latest");
  const [isMobile, setIsMobile] = useState(false);
  const pageSize = isMobile ? 1 : REVIEWS_PAGE_SIZE;
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);
    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    setVisibleCount(pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ startX: 0, scrollLeft: 0, moved: false });
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);

  const handleTabsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    setIsDraggingTabs(true);
    dragState.current = {
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const handleTabsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tabsScrollRef.current;
    if (!isDraggingTabs || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 5) dragState.current.moved = true;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const stopTabsDragging = () => setIsDraggingTabs(false);

  const productReviews = (reviews ?? []).map(normalizeReview);

  const visibleTabs = TABS;

  const currentTab = activeTab;

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setVisibleCount(pageSize);
  };

  const isQuestionsTab = currentTab === "Questions";
  const activeReviews =
    currentTab === "Store Reviews" ? STORE_REVIEWS : productReviews;

  const visibleReviews = activeReviews.slice(0, visibleCount);
  const hasMoreReviews = visibleCount < activeReviews.length;
  const canToggleReviews = activeReviews.length > pageSize;

  const visibleQuestions = QUESTIONS.slice(0, visibleCount);
  const hasMoreQuestions = visibleCount < QUESTIONS.length;
  const canToggleQuestions = QUESTIONS.length > pageSize;

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
      <div className="flex flex-col xl:flex-row xl:flex-wrap xl:items-center xl:justify-between gap-3 mb-2 lg:gap-4 lg:mb-4 xl:mb-6">
        <h2 className="text-[14px] lg:text-[26px] leading-[18px] font-bold">
          <span className="text-[#FD151B]">Customer ratings123</span>{" "}
          <span className="text-[#012A62]">&amp; reviews</span>
        </h2>

        <div className="flex flex-row items-center justify-between xl:gap-3 w-full xl:w-auto xl:flex-1 xl:min-w-0">
          <div
            ref={tabsScrollRef}
            onMouseDown={handleTabsMouseDown}
            onMouseMove={handleTabsMouseMove}
            onMouseUp={stopTabsDragging}
            onMouseLeave={stopTabsDragging}
            className={`no-scrollbar flex flex-1 min-w-0 justify-start items-center gap-2 overflow-x-auto whitespace-nowrap select-none ${
              isDraggingTabs ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  if (dragState.current.moved) return;
                  handleTabClick(tab);
                }}
                className={` shrink-0 h-[30px] md:h-[38px] px-2 md:px-5 rounded-full text-[10px] md:text-[13px] font-semibold border items-center justify-center cursor-pointer whitespace-nowrap transition-colors ${
                  currentTab === tab
                    ? "bg-[#FD151B] border-[#FD151B] text-white"
                    : "bg-white border-[#E2E2E2] text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="w-auto 2xl:w-[240px] shrink-0">
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
                <SelectItem value="latest" className="mb-2">
                  Latest
                </SelectItem>

                <SelectItem value="highest_rating" className="mb-2">
                  Highest Rating
                </SelectItem>

                <SelectItem value="lowest_rating">Lowest Rating</SelectItem>

                <SelectItem value="most_helpful" className="mb-2">
                  Most Helpful
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 xl:gap-7 my-6">
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
                  <span
                    className="w-9 shrink-0  text-[13px] font-normal leading-[18px] text-[#535766] 
                  "
                  >
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex lg:hidden w-[calc(100%+64px)] -ml-8 border-t border-[#ECECEC]" />

        <div className="relative flex-1 min-w-0 xl:pl-10">
          {!isQuestionsTab && (
            <div className="hidden xl:block absolute left-0 top-4 bottom-0 w-px bg-[#D2D2D2]" />
          )}
          {isQuestionsTab ? (
            visibleQuestions.length > 0 ? (
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
                      <span className="font-semibold">Q:</span> {item.question}
                    </p>

                    {item.answer && (
                      <p className="mt-1 text-[13px] text-[#696e79]">
                        <span className="font-semibold">A:</span> {item.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-[13px] text-[#696e79]">
                No questions yet.
              </p>
            )
          ) : visibleReviews.length > 0 ? (
            <div
              className="flex flex-col max-h-[520px] overflow-y-auto overscroll-contain pr-2 scrollbar scrollbar-track-[#F2F2F2] scrollbar-thumb-[#BDBDBD] scrollbar-track-rounded-[15px] scrollbar-thumb-rounded-[15px]"
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
            >
              {visibleReviews.map((review) => (
                <div key={review.id} className="py-3">
                  {/* Mobile / tablet (below lg): compact layout with avatar + product image */}
                  <div className="lg:hidden flex items-start gap-3">
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
                      <span className="font-semibold text-[13px] leading-[13px] capitalize text-[#0F0F0F]">
                        {review.name}
                      </span>

                      <div className="mt-1 flex items-center gap-2">
                        <StarRating rating={review.rating} size={13} />

                        {review.verified && (
                          <span className="whitespace-nowrap font-normal text-[12px] leading-[18px] capitalize text-[#00AD34]">
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[12px] md:text-[13px] text-[#696e79]">
                        {review.comment}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[12px] text-[#696e79]">
                        {review.date}
                      </span>

                      <Image
                        src={getReviewImage(review)}
                        alt="Reviewed product"
                        width={75}
                        height={75}
                        className="rounded-[6px] w-14 h-14 object-cover shrink-0"
                      />
                    </div>
                  </div>

                  {/* Desktop (lg and up): original layout with avatar + product image */}
                  <div className="hidden lg:flex items-start gap-3">
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
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-6">
                          <span className="font-semibold text-[16px] leading-[13px] capitalize text-[#0F0F0F]">
                            {review.name}
                          </span>

                          <div className="shrink-0">
                            <StarRating rating={review.rating} size={13} />
                          </div>

                          {review.verified && (
                            <span className="whitespace-nowrap font-normal text-[14px] leading-[18px] capitalize text-[#00AD34]">
                              Verified Purchase
                            </span>
                          )}
                          <span className="text-[12px] text-[#696e79] ml-auto">
                            {review.date}
                          </span>
                        </div>
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
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-[13px] text-[#696e79]">
              No {currentTab === "Store Reviews" ? "store reviews" : "reviews"}{" "}
              yet.
            </p>
          )}

          <div className="flex justify-center">
            {isQuestionsTab
              ? canToggleQuestions && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((count) =>
                        hasMoreQuestions
                          ? Math.min(count + pageSize, QUESTIONS.length)
                          : pageSize,
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
                          ? Math.min(count + pageSize, activeReviews.length)
                          : pageSize,
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
