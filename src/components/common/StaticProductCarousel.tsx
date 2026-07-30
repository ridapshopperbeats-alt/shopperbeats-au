import ReusableSlider from "./ReusableSlider";
import StaticProductCard from "./StaticProductCard";
import { ProductCardProps } from "@/types/product";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface StaticProductCarouselProps {
  title: ReactNode;
  products: ProductCardProps[];
  link?: string;
}

export default function StaticProductCarousel({
  title,
  products,
  link,
}: StaticProductCarouselProps) {
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

        {link && (
          <Link
            href={link}
            className="text-[13px] font-bold flex items-center text-[#F51721] whitespace-nowrap"
          >
            View All <ChevronRight size={13} />
          </Link>
        )}
      </div>

      <div className="pt-3 lg:pt-5 overflow-visible">
        <ReusableSlider<ProductCardProps>
          items={products}
          slidesToScroll={3}
          gap={20}
          speed={600}
          infinite={false}
          autoplaySpeed={0}
          arrows={true}
          autoResponsive
          className="pc-carousel"
          slideClassName=""
          keyExtractor={(product) => product.unique_code || product.id || ""}
          renderItem={(product) => (
            <div className="w-[180px] h-[340px] md:w-[270px] md:h-[450px]">
              <StaticProductCard {...product} />
            </div>
          )}
        />
      </div>
    </div>
  );
}
