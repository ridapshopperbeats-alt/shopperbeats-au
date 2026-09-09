"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { API_ENDPOINTS } from "@/lib/constants/api";
import { applyImageVariant } from "@/lib/utils/imageUtils";

interface HeroBannerContent {
  image: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
}

interface HeroBannerItem {
  content: HeroBannerContent[];
}

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
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prevBanner, setPrevBanner] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadHeroBanner() {
      try {
        const url = `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.HOMEPAGE_SECTION_BY_ID(
          API_ENDPOINTS.PRODUCTS.HERO_BANNER
        )}`;

        const res = await fetch(url);

        if (!res.ok) {
          if (isMounted) setBanners(STATIC_BANNERS);
          return;
        }

        const data: {
          config?: {
            items?: HeroBannerItem[];
          };
        } = await res.json();

        const items = Array.isArray(data?.config?.items)
          ? data.config.items
          : [];

        const mappedBanners: BannerSlide[] = items
          .map((item, index) => ({
            id: index + 1,
            image: applyImageVariant(
              item.content?.[0]?.image ?? "",
              "public"
            ),
            link: item.content?.[0]?.cta_link ?? "#",
          }))
          .filter((banner) => banner.image);

        if (!isMounted) return;

        // API banners use karne hain to yaha mappedBanners karo
        // setBanners(mappedBanners);

        // Static banners
        setBanners(STATIC_BANNERS);
        setCurrentBanner(0);
      } catch (error) {
        console.error("Error fetching hero banner:", error);

        if (isMounted) {
          setBanners(STATIC_BANNERS);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHeroBanner();

    return () => {
      isMounted = false;
    };
  }, []);

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
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {!isLoading &&
          banners.map((banner, index) => {
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
                  loading={index === 0 ? undefined : "eager"}
                  quality={100}
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