"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { applyImageVariant } from "@/lib/utils/imageUtils";
import type { CategorySliderProps } from "@/types/product";

const FALLBACK_IMAGE = "/images/image-coming-soon.jpg";



const CategorySlider: React.FC<CategorySliderProps> = ({
  title = "Shop by Category",
  items = [],
  className = "",
  arrows = true,
  onCategoryClick,
  getHref,
  titleClassName = "",
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -500 : 500,
      behavior: "smooth",
    });
  };

  return (
    <div className={`w-full ${className} `}>
      {title && (
        <h1
          className={`text-center text-[20px] font-bold leading-[30px] text-black lg:pt-4 ${titleClassName}`}
        >
          {title}
        </h1>
      )}

      {/* Arrows aur Items ke liye Wrapper */}
      <div className="relative max-w-[1700px] mx-auto ">
        {arrows && (
          <>
            {/* Left Arrow */}
            <button
              onClick={() => handleScroll("left")}
              className="hidden lg:flex absolute left-[-6] top-20 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-all"
            >
              <ChevronLeft size={18} className="text-[#979797]" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => handleScroll("right")}
              className="hidden lg:flex absolute right-[-16] top-20 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-all"
            >
              <ChevronRight size={18} className="text-[#979797]" />
            </button>
          </>
        )}

        {/* Scroll Slider */}
        <div
          ref={sliderRef}
          className="flex items-start gap-[24px] lg:gap-[33px] overflow-x-auto scroll-smooth no-scrollbar py-4"
        >
          {items.map((item, index) => (
            <Link
              key={item?.slug || item?.id || index}
              href={getHref ? getHref(item) : (item.href ?? "#")}
              onClick={() => onCategoryClick?.(item)}
              className="shrink-0 flex flex-col gap-[16px] items-center justify-start cursor-pointer group w-[60px] md:w-[141px]"
            >
              <div className="w-[56px] h-[56px] md:w-[129px] md:h-[129px] rounded-full border-2 lg:border bg-white overflow-hidden flex items-center justify-center transition-all duration-300 border-[#D8D8D8]">
                <Image
                  src={item.image ? applyImageVariant(item.image, "public") : FALLBACK_IMAGE}
                  alt={item.title}
                  width={98}
                  height={98}
                  loading="lazy"
                  className="object-contain w-[64px] h-[64px] md:h-[138px] md:w-[138px]"
                />
              </div>

              <p className="text-[12px] font-bold text-center text-[#2B2B2B] leading-tight line-clamp-2">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;
