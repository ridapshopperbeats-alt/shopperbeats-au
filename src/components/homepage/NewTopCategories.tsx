"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { applyImageVariant } from "@/lib/utils/imageUtils";

interface TopCategoryApiItem {
  id: string;
  category_name: string;
  title: string;
  image: string;
  slug: string;
  cta_text?: string;
  cta_link?: string;
}

interface NewTopCategoryItem {
  title: string;
  image: string;
  href: string;
}

export default function NewTopCategories() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<NewTopCategoryItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const url = `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.HOMEPAGE_SECTION_BY_ID(
          API_ENDPOINTS.PRODUCTS.TOP_CATEGORIES,
        )}`;

        const res = await fetch(url);

        if (!res.ok) return;

        const data: { config?: { items?: TopCategoryApiItem[] } } = await res.json();

        const items = Array.isArray(data?.config?.items) ? data.config.items : [];

        if (!isMounted || items.length === 0) return;

        const mappedCategories = items.map((category) => ({
          title: category.title || category.category_name,
          image: category.image
            ? applyImageVariant(category.image, "public")
            : "/images/image-coming-soon.jpg",
          href: category.cta_link || `/category/${category.slug}`,
        }));

        setCategories(mappedCategories);
      } catch (error) {
        console.error("Error fetching top categories:", error);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full container">
      <h2 className="text-center fluid-text-20-24 font-bold leading-7.5 mx-auto mt-6">
        Top Categories
      </h2>

      <div className="relative max-w-[1700px] mx-auto">
        <button
          type="button"
          onClick={() => handleScroll("left")}
          className="hidden lg:flex absolute left-[-12px] top-22 -translate-y-3 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-all"
        >
          <ChevronLeft size={18} className="text-black" />
        </button>

        <button
          type="button"
          onClick={() => handleScroll("right")}
          className="hidden lg:flex absolute right-[-16px] top-22 -translate-y-3 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-all"
        >
          <ChevronRight size={18} className="text-black" />
        </button>

        <div
          ref={sliderRef}
          className="flex items-start gap-[16px] lg:gap-[35px] overflow-x-auto scroll-smooth no-scrollbar py-6"
        >
         {categories.map((item, index) => (
          <Link
            key={`${item.title}-${index}`}
              href={item.href}
              className="shrink-0 flex flex-col gap-[8px] items-center justify-start cursor-pointer w-[72px] min-h-[98px] md:w-[138px] md:min-h-[172px] md:gap-[16px]"
            >
              <div className="relative w-[64px] h-[64px] md:w-[138px] md:h-[138px] shrink-0 rounded-full border border-[#D8D8D8] shadow-[0px_2px_6px_0px_#00000014] md:shadow-none bg-white overflow-hidden flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={100}
                  height={100}
                  quality={100}
                  loading="lazy"
                  className="object-contain w-[70px] h-[70px] md:w-[200px] md:h-[200px] transition-transform duration-500 ease-in-out hover:scale-110"
                />
              </div>

              <p className="text-[12px] font-bold leading-tight tracking-[0%] text-center capitalize text-[#2B2B2B] line-clamp-2">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
