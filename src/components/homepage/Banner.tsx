"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface BannerSlide {
  id: number;
  image: string;
  link: string;
}

const STATIC_BANNERS: BannerSlide[] = [
  {
    id: -1,
    image: "/images/banners/winter-collection-banner.png",
    link: "/category/cardigans",
  },
  {
    id: -2,
    image: "/images/banners/newSession.png",
    link: "/category/blouse",
  },
  {
    id: -3,
    image: "/images/banners/fashion-suits-banner.png",
    link: "/category/dresses",
  },
  // {
  //   id: -4,
  //   image: "/images/banners/halloween-banner.png",
  //   link: "/category/halloween",
  // },
  {
    id: -5,
    image: "/images/banners/sb_ecom_fragrance_bnr.jpg",
    link: "/category/womens-fragrance",
  },
];

function getSlideOffset(
  index: number,
  currentBanner: number,
  total: number
) {
  let diff = index - currentBanner;
  const half = total / 2;

  if (diff > half) diff -= total;
  else if (diff < -half) diff += total;

  return diff;
}

export default function SingleBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = STATIC_BANNERS;
  const [prevBanner, setPrevBanner] = useState(0);

  useEffect(() => {
    setPrevBanner(currentBanner);
  }, [currentBanner]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleDotClick = (index: number) => {
    if (index === currentBanner) return;

    setPrevBanner(currentBanner);
    setCurrentBanner(index);
  };

  return (
    <div className="container lg:pt-3">
      {/* Banner */}
      <div className="relative hidden lg:flex w-full aspect-1694/540 overflow-hidden rounded-lg">
        {banners.map((banner, index) => {
          const isTransitioning =
            index === currentBanner || index === prevBanner;

          return (
            <Link
              key={banner.id || index}
              href={banner.link}
              className="absolute inset-0"
              style={{
                transform: `translateX(calc(${
                  getSlideOffset(
                    index,
                    currentBanner,
                    banners.length
                  ) * 100
                }% + ${
                  getSlideOffset(
                    index,
                    currentBanner,
                    banners.length
                  ) * 24
                }px))`,
              }}
            >
              <Image
                src={banner.image}
                alt={`Banner ${index + 1}`}
                fill
                priority={index === 0}
                quality={80}
                className={`absolute inset-0 object-cover ease-in-out ${
                  isTransitioning
                    ? "transition-transform duration-1500"
                    : ""
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Dots */}
      <div className="hidden lg:flex justify-center items-center gap-2 mt-5">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleDotClick(index)}
            aria-label={`Go to banner ${index + 1}`}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              currentBanner === index
                ? "bg-[#FD151B]"
                : "bg-[#D9D9D9]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}