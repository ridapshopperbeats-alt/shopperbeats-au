// 'use client'
import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SingleBanner from "./Banner";
import TopCategories from "./TopCategories";
import {
  getBestSellers,
  getPopularProducts,
  getNewReleases,
  transformProductData,
} from "@/lib/utils/main-utils";
import PopularCategories from "./AllBanner";
import TopBrands from "./TopRated";
import ProductCarousel from "../common/ProductCarousel";

function CarouselSkeleton({ title, link }: { title: string; link: string }) {
  return (
    <div className="w-full">
      <div className="flex justify-between gap-4">
        <div className="w-full">
          <div className="flex flex-col gap-1 w-full my-1">
            <h3 className="font-bold text-[18px] md:text-[32px] leading-4.5 tracking-[0.78px] text-black">
              {title}
            </h3>
          </div>
        </div>

        <Link
          href={link}
          className="text-[13px] font-bold flex items-center text-[#F51721] whitespace-nowrap"
        >
          View All <ChevronRight size={13} />
        </Link>
      </div>

      <div className="pt-3 lg:pt-4 overflow-hidden px-[10px] lg:px-0">
        <div className="flex gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="w-[180px] h-[320px] md:w-[260px] md:h-[410px] bg-gray-200 animate-pulse rounded-lg shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

async function BestSellersCarousel() {
  const bestSellers = await getBestSellers().catch(() => []);
  const products = transformProductData(bestSellers);

  if (products.length === 0) return null;

  return (
    <ProductCarousel
      title="Best Sellers"
      products={products}
      link="/product-listing/best-sellers"
    />
  );
}

async function PopularProductsCarousel() {
  const popular = await getPopularProducts().catch(() => []);
  const popularProducts = transformProductData(popular);

  if (popularProducts.length === 0) return null;

  return (
    <ProductCarousel
      title="Popular Products"
      products={popularProducts}
      link="/product-listing/popular"
    />
  );
}

async function NewArrivalsCarousel() {
  const newReleases = await getNewReleases().catch(() => []);
  const newArrivals = transformProductData(newReleases);

  if (newArrivals.length === 0) return null;

  return (
    <ProductCarousel
      title="New Arrivals"
      products={newArrivals}
      link="/product-listing/new-releases"
    />
  );
}

const Home = () => {
  return (
    <TopCategories>
      <SingleBanner />
      <div className="flex flex-col">
        <div className="container">
          <Suspense
            fallback={
              <CarouselSkeleton
                title="Best Sellers"
                link="/product-listing/best-sellers"
              />
            }
          >
            <BestSellersCarousel />
          </Suspense>
        </div>

        <PopularCategories />

        <div className="container  md:py-3 lg:py-3">
          <Suspense
            fallback={
              <CarouselSkeleton
                title="Popular Products"
                link="/product-listing/popular"
              />
            }
          >
            <PopularProductsCarousel />
          </Suspense>
        </div>

        <TopBrands />

        <div className="container pt-4 md:pt-5 lg:pt-3">
          <Suspense
            fallback={
              <CarouselSkeleton
                title="New Arrivals"
                link="/product-listing/new-releases"
              />
            }
          >
            <NewArrivalsCarousel />
          </Suspense>
        </div>
      </div>
    </TopCategories>
  );
};

export default Home;
