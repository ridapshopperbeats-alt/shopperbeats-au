"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface StaticTopCategoryItem {
  id?: string;
  slug?: string;
  title: string;
  image: string;
  href?: string;
}

interface StaticTopCategoriesSliderProps {
  title?: string;
  items: StaticTopCategoryItem[];
  onCategoryClick?: (item: StaticTopCategoryItem) => void;
  getHref?: (item: StaticTopCategoryItem) => string;
}

export default function StaticTopCategoriesSlider({
  title = "Top Categories",
  items,
  onCategoryClick,
  getHref,
}: StaticTopCategoriesSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-center text-[20px] lg:text-[24px] font-bold leading-6 mx-auto lg:pt-4 mt-4">
          {title}
        </h2>
      )}

      <div className="relative max-w-[1700px] mx-auto">
        <button
          type="button"
          onClick={() => handleScroll("left")}
          className="hidden lg:flex absolute left-[-12px] top-20 -translate-y-3 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-all"
        >
          <ChevronLeft size={18} className="text-black" />
        </button>

        <button
          type="button"
          onClick={() => handleScroll("right")}
          className="hidden lg:flex absolute right-[-16px] top-20 -translate-y-3 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-all"
        >
          <ChevronRight size={18} className="text-black" />
        </button>

        <div
          ref={sliderRef}
          className="flex items-start gap-[16px] lg:gap-[35px] overflow-x-auto scroll-smooth no-scrollbar py-5 "
        >
          {items.map((item, index) => (
            <Link
              key={item.slug || item.id || index}
              href={getHref ? getHref(item) : (item.href ?? "#")}
              onClick={() => onCategoryClick?.(item)}
              className="shrink-0 flex flex-col gap-[8px] items-center justify-start cursor-pointer w-[72px] h-[98px] md:w-[138px] md:h-[172px] md:gap-[16px]"
            >
              <div className="relative w-[64px] h-[64px] md:w-[138px] md:h-[138px] rounded-full border border-[#D8D8D8] shadow-[0px_2px_6px_0px_#00000014] md:shadow-none bg-white overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-800 hover:scale-[1.25] ease-in-out"
                />
              </div>

              <p className="text-[11px] md:text-[12px] font-bold leading-[100%] tracking-[0%] text-center capitalize text-[#2B2B2B] line-clamp-2">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
