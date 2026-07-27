"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NewTopCategoryItem {
  title: string;
  image: string;
  href: string;
}

const NEW_TOP_CATEGORIES: NewTopCategoryItem[] = [
  {
    title: "Women's Clothing",
    image: "/images/image-coming-soon.jpg",
    href: "/all-categories",
  },
  {
    title: "Fragrance",
    image: "/images/image-coming-soon.jpg",
    href: "/all-categories",
  },
  {
    title: "Furniture",
    image: "/images/tc_furniture.jpg",
    href: "/all-categories",
  },
  {
    title: "Patio Furniture",
    image: "/images/tc_outdoor_living.jpg",
    href: "/all-categories",
  },
  {
    title: "Baby & Kids",
    image: "/images/tc_babykids.jpg",
    href: "/all-categories",
  },
  {
    title: "Home Décor",
    image: "/images/tc_homegarden.jpg",
    href: "/all-categories",
  },
  {
    title: "Jewelry",
    image: "/images/image-coming-soon.jpg",
    href: "/all-categories",
  },
  {
    title: "Men's Clothing",
    image: "/images/image-coming-soon.jpg",
    href: "/all-categories",
  },
  {
    title: "Footwear",
    image: "/images/image-coming-soon.jpg",
    href: "/all-categories",
  },
  {
    title: "Watches",
    image: "/images/image-coming-soon.jpg",
    href: "/all-categories",
  },
  {
    title: "Children Clothing",
    image: "/images/image-coming-soon.jpg",
    href: "/all-categories",
  },
  {
    title: "Fashion",
    image: "/images/image-coming-soon.jpg",
    href: "/all-categories",
  },
];

export default function NewTopCategories() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -500 : 500,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full container">
      <h2 className="text-center text-[20px] lg:text-[24px] font-bold leading-6 mx-auto lg:pt-4">
        Top Categories
      </h2>

      <div className="relative max-w-[1700px] mx-auto">
        <button
          type="button"
          onClick={() => handleScroll("left")}
          className="hidden lg:flex absolute left-[-12px] top-20 -translate-y-3 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-all"
        >
          <ChevronLeft size={18} className="text-[#979797]" />
        </button>

        <button
          type="button"
          onClick={() => handleScroll("right")}
          className="hidden lg:flex absolute right-[-16px] top-20 -translate-y-3 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-all"
        >
          <ChevronRight size={18} className="text-[#979797]" />
        </button>

        <div
          ref={sliderRef}
          className="flex items-start gap-[16px] lg:gap-[35px] overflow-x-auto scroll-smooth no-scrollbar py-5"
        >
          {NEW_TOP_CATEGORIES.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="shrink-0 flex flex-col gap-[8px] items-center justify-start cursor-pointer w-[72px] h-[98px] md:w-[138px] md:h-[172px] md:gap-[16px]"
            >
              <div className="relative w-[64px] h-[64px] md:w-[138px] md:h-[138px] rounded-full border border-[#D8D8D8] shadow-[0px_2px_6px_0px_#00000014] md:shadow-none bg-white overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  loading="lazy"
                  className="object-cover"
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
