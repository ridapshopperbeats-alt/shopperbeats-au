import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { getRawCategories } from "@/lib/utils/main-utils";
import { Category } from "@/types/product";

const FALLBACK_IMAGE = "/images/image-coming-soon.jpg";

const toBannerItem = (category: Category) => ({
  id: category.id,
  title: category.name,
  image: category.image_url || category.icon_url || FALLBACK_IMAGE,
});

export default async function PopularCategories() {
  const categories = await getRawCategories().catch(() => []);

  const topCategories = categories.slice(0, 4).map(toBannerItem);
  const bottomCategories = categories.slice(4, 10).map(toBannerItem);

  return (
    <div className="container">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-black ">
            Popular Categories
          </h2>
        </div>

        <button className="hidden md:flex items-center gap-2 text-[#FD151B] font-semibold">
          View All
          <ChevronRight size={13} />
        </button>
      </div>

      {/* TOP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 lg:pt-5 ">
        {topCategories.map((item) => (
          <div
            key={item.id}
            className="relative w-full h-30 md:h-80 rounded-lg overflow-hidden group cursor-pointer"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-b from-[#050B1E]/0 to-[#050B1E]/80" />

            <div className="absolute left-4 bottom-3 md:left-6 md:right-6 md:bottom-6">
              <div className="w-full max-w-[145px] md:max-w-[368px] flex flex-col gap-[6px]">
                <h3 className="text-white text-[13px] md:text-[18px] font-bold leading-[100%]">
                  {item.title}
                </h3>

                <button className="flex items-center gap-2 text-white text-[10px] md:text-[12px] font-medium uppercase">
                  Shop Now
                  <ArrowRight size={14} className="" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM */}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {bottomCategories.map((item) => (
          <div
            key={item.id}
            className="relative w-full h-30 md:h-80 rounded-lg overflow-hidden group cursor-pointer"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-b from-[#050B1E]/0 to-[#050B1E]/80" />

            <div className="absolute left-4 bottom-3 md:left-6 md:right-6 md:bottom-6">
              <div className="w-full max-w-[145px] md:max-w-[368px] flex flex-col gap-[6px]">
                <h3 className="text-white text-[13px] md:text-[18px] font-bold leading-[100%]">
                  {item.title}
                </h3>

                <button className="flex items-center gap-2 text-white text-[10px] md:text-[12px] font-medium uppercase">
                  Shop Now
                  <ArrowRight size={14} className="" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
