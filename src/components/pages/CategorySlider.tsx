"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CategorySliderItem {
  id?: string;
  slug?: string;
  title: string;
  image: string;
}

interface CategorySliderProps {
  items: CategorySliderItem[];
  className?: string;
  arrows?: boolean;
  onCategoryClick?: (item: CategorySliderItem) => void;
  getHref?: (item: CategorySliderItem) => string;
}

const CategorySlider: React.FC<CategorySliderProps> = ({
  items = [],
  className = "",
  arrows = true,
  onCategoryClick,
  getHref,
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
    <div className={`relative w-full ${className}`}>
      <h1 className="text-center text-[20px] font-bold leading-[30px] text-black lg:pt-4">
        Shop by Category
      </h1>

      {arrows && (
        <>
          <button
            onClick={() => handleScroll("left")}
            className="hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-gray-200  items-center justify-center cursor-pointer "
          >
            <ChevronLeft size={18} className="text-[#979797]" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-gray-200  items-center justify-center cursor-pointer"
          >
            <ChevronRight size={18} className="text-[#979797]" />
          </button>
        </>
      )}

      <div
        ref={sliderRef}
        className="flex items-start gap-[24px] lg:gap-[32px] overflow-x-auto scroll-smooth no-scrollbar  max-w-[1694px] mx-auto py-4"
      >
        {items.map((item, index) => (
          <Link
            key={item?.slug || item?.id || index}
            href={getHref ? getHref(item) : "#"}
            onClick={() => onCategoryClick?.(item)}
            className="flex-shrink-0 flex flex-col gap-[16px] items-center justify-start cursor-pointer group w-[60px] md:w-[141px]"
          >
            <div className="w-[56px] h-[56px] md:w-[129px] md:h-[129px] rounded-full border-2 lg:border bg-white overflow-hidden flex items-center justify-center transition-all duration-300 border-[#D8D8D8]">
              <Image  
                src={item.image}
                alt={item.title}
                width={98}
                height={98}
                loading="lazy"
                className="object-contain w-[50px] h-[50px] md:h-[98px] md:w-[98px]"
              />
            </div>

            <p className="text-[12px] font-bold text-center text-[#2B2B2B] leading-tight line-clamp-2">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySlider;
