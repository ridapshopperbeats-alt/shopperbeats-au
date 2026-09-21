"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TopCategoryTile } from "@/types/homepage";


const CATEGORIES: TopCategoryTile[] = [
  { id: 1, title: 'Home & Garden', imageUrl: '/images/tc_homegarden.jpg', href: "/category/home-garden" },
  { id: 2, title: 'Furniture', imageUrl: '/images/tc_furniture.jpg', href: "/category/furniture" },
  { id: 3, title: 'Health & Beauty', imageUrl: '/images/tc_health_beauty.jpg', href: "/category/health-beauty" },
  { id: 4, title: 'Toys & Games', imageUrl: '/images/tc_toygames.jpg', href: "/category/toys-games" },   
  { id: 5, title: 'Baby & Kids', imageUrl: '/images/tc_babykids.jpg', href: "/category/baby-kids" },  
  { id: 6, title: 'Sports & Outdoor', imageUrl: '/images/tc_sports_outdoor.jpg', href: "/category/sports-outdoor" },   
  { id: 7, title: 'Appliances', imageUrl: '/images/tc_appliances.jpg', href: "/category/appliances" },
  { id: 8, title: 'Electronics', imageUrl: '/images/tc_electronics.jpg', href: "/category/electronics" },
];

export const NewTopCategories = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Dynamic scrolling based on container viewport width
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      const currentScroll = scrollRef.current.scrollLeft;

      scrollRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="w-full bg-transparent mb-4 md:mb-8">
      <div className="container mx-auto px-4 md:px-8 max-w-[1750px]">

        <h3 className="font-bold text-gray-900 tracking-tight text-[35px]" style={{ marginTop: "10px", marginBottom: "20px" }} >
          Top Categories
        </h3>

        <div className="relative">

          <button
            onClick={() => scroll('left')}
            className="handlePrev-inset"
            aria-label="Previous categories"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollRef}
            className="container flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 mask-edge-fade"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style jsx global>{`
              .mask-edge-fade::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="w-[130px] sm:w-[160px] md:w-[220px] lg:w-[240px] flex-shrink-0 snap-start bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 rounded-[12px]"
              >
                <Link href={category.href || "/"} className="flex flex-col h-full group">

                  <div className="relative w-full aspect-[4/3] sm:aspect-video md:aspect-[5/4] bg-gray-50 overflow-hidden">
                    <Image
                      src={category.imageUrl}
                      alt={category.title}
                      fill
                      sizes="(max-width: 640px) 130px, (max-width: 768px) 160px, 240px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                      priority={category.id <= 4}
                    />
                  </div>

                  <div className="flex items-center justify-center p-3 flex-grow bg-white">
                    <h5 className="font-semibold text-center text-gray-800 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                      {category.title}
                    </h5>
                  </div>

                </Link>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="handleNext-inset"
          >
            <ChevronRight size={20} />
          </button>

        </div>
      </div>
    </section>
  );
};