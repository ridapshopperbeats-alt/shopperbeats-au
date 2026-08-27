"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpDown } from "lucide-react";
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
import { applyImageVariant } from "@/lib/utils/imageUtils";

interface DisplayReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
  reviewer_profile_image?: string | null;
  images?: (string | { image_url?: string; url?: string })[] | null;
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

const REVIEW_SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "highest_rating", label: "Highest Rating" },
  { value: "lowest_rating", label: "Lowest Rating" },
  { value: "most_helpful", label: "Most Helpful" },
];

const REVIEWS_PAGE_SIZE = 2;

interface CustomerRatingViewPageProps {
  reviews?: Review[];
}

export default function CustomerRatingViewPage({
  reviews,
}: CustomerRatingViewPageProps) {
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

  const activeReviews = (reviews ?? []).map(normalizeReview);

  const visibleReviews = activeReviews.slice(0, visibleCount);
  const hasMoreReviews = visibleCount < activeReviews.length;
  const canToggleReviews = activeReviews.length > pageSize;

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
          <span className="text-[#FD151B]">Customer ratings</span>{" "}
          <span className="text-[#012A62]">&amp; reviews</span>
        </h2>

        <div className="hidden xl:block w-auto 2xl:w-[240px] shrink-0">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-[32px] w-full max-w-none rounded-[152px] border border-[#001325A3]/64 bg-white pl-4 pr-9 shadow-none focus:ring-0">
              <div className="flex items-center gap-2 flex-1">
                <ArrowUpDown size={18} className="text-[#001325]/64 shrink-0" />

                <span className="text-[12px] font-normal text-[#001325]/64 leading-[18px] whitespace-nowrap">
                  Sort by :
                </span>

                <SelectValue placeholder="Price" />
              </div>
            </SelectTrigger>

            <SelectContent
              position="popper"
              className="w-[240px] max-w-[230px] border !border-[#F6F6F6] bg-white p-2 shadow-[#000000]/25 rounded-[5px] ring-0 outline-none focus:outline-none focus:ring-0 text-[14px] font-normal leading-[17px] "
            >
              {REVIEW_SORT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="mb-2 rounded-none"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 xl:gap-7 my-6">
        <div className="w-full xl:w-[320px] xl:shrink-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] leading-[20px] lg:text-[30px] font-bold text-black">
              {averageRating.toFixed(1)} Out Of 5
            </p>

            <div className="flex xl:hidden shrink-0">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-[32px] w-full max-w-none rounded-[20px] border border-[#001325]/64 bg-white pl-4 pr-9 shadow-none focus:ring-0">
                  <div className="flex items-center gap-2 flex-1">
                    <ArrowUpDown
                      size={18}
                      className="text-[#001325]/64 shrink-0"
                    />

                    <span className="text-[12px] font-normal text-[#001325]/64 leading-[18px] whitespace-nowrap">
                      Sort by :
                    </span>

                    <SelectValue placeholder="Price" />
                  </div>
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  className="w-[240px] max-w-[230px] border !border-[#F6F6F6] bg-white p-2 shadow-[#000000]/25 rounded-[5px] ring-0 outline-none focus:outline-none focus:ring-0 text-[14px] font-normal leading-[17px] "
                >
                  {REVIEW_SORT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="mb-2"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={averageRating} size={16} />
            <span className="fluid-text-xs text-[#211E22] font-normal leading-[18px]">
              {totalReviews.toLocaleString()}{" "}
              {totalReviews === 1 ? "Review" : "Reviews"}
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-5">
            {ratingBreakdown.map((row) => (
              <div
                key={row.stars}
                className="flex items-center gap-2 fluid-text-xs font-normal leading-[18px] text-[#535766]"
              >
                <span className="w-12 shrink-0 whitespace-nowrap">
                  {row.stars} Star
                </span>
                <div className="flex-1 rounded-[12px] bg-[#DBDEE1] overflow-hidden h-[10px]">
                  <div
                    className="h-full bg-[#FBBC05] rounded-[12px]"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <span className="w-9 shrink-0 fluid-text-xs font-normal leading-[18px] text-[#535766]">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex xl:hidden w-[calc(100%+64px)] -ml-8 lg:-ml-0 border-t border-[#ECECEC]" />

        <div className="relative flex-1 min-w-0 xl:pl-15">
          <div className="hidden xl:block absolute left-10 top-0 bottom-0 w-px bg-[#D2D2D2]" />

          {visibleReviews.length > 0 ? (
            <div
              className="flex flex-col max-h-[520px] overflow-y-auto pr-2 scrollbar scrollbar-track-[#F2F2F2] scrollbar-thumb-[#BDBDBD] scrollbar-track-rounded-[15px] scrollbar-thumb-rounded-[15px]"
              data-lenis-prevent
            >
              {visibleReviews.map((review) => (
                <div key={review.id} className="py-3">
                  {/* Mobile / tablet (below lg): compact layout with avatar + product image */}
                  <div className="lg:hidden flex items-start gap-3">
                    <Image
                      src={
                        review.reviewer_profile_image
                          ? applyImageVariant(review.reviewer_profile_image, "public")
                          : "/images/default_user_icon.jpg"
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
                        className="rounded-[5px] bg-[lightgray] object-cover object-center w-14 h-14 shrink-0"
                      />
                    </div>
                  </div>

                  {/* Desktop (lg and up): original layout with avatar + product image */}
                  <div className="hidden lg:flex items-start gap-3 pb-3 border-b border-[#ECECEC]">
                    <Image
                      src={
                        review.reviewer_profile_image
                          ? applyImageVariant(review.reviewer_profile_image, "public")
                          : "/images/default_user_icon.jpg"
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
                      src={applyImageVariant(getReviewImage(review), "public")}
                      alt="Reviewed product"
                      width={75}
                      height={75}
                      className="rounded-[5px] bg-[lightgray] object-cover object-center w-14 h-14 shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-[13px] text-[#696e79]">
              No reviews yet.
            </p>
          )}

          <div className="flex justify-center">
            {canToggleReviews && (
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
