// import Image from "next/image";
// import { ArrowRight, ChevronRight } from "lucide-react";
// import { getRawCategories } from "@/lib/utils/main-utils";
// import { Category } from "@/types/product";

// const FALLBACK_IMAGE = "/images/image-coming-soon.jpg";

// const toBannerItem = (category: Category) => ({
//   id: category.id,
//   title: category.name,
//   image: category.image_url || category.icon_url || FALLBACK_IMAGE,
// });

// export default async function PopularCategories() {
//   const categories = await getRawCategories().catch(() => []);

//   const topCategories = categories.slice(0, 4).map(toBannerItem);
//   const bottomCategories = categories.slice(4, 10).map(toBannerItem);

//   return (
//     <div className="container">
//       {/* Heading */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-[24px] font-bold text-black ">
//             Popular Categories
//           </h2>
//         </div>

//         <button className="hidden md:flex items-center gap-2 text-[#FD151B] font-semibold">
//           View All
//           <ChevronRight size={13} />
//         </button>
//       </div>

//       {/* TOP */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 lg:pt-5 ">
//         {topCategories.map((item) => (
//           <div
//             key={item.id}
//             className="banner-card"
//           >
//             <Image
//               src={item.image}
//               alt={item.title}
//               fill
//               className="object-cover"
//             />

//             <div className="absolute inset-0 bg-linear-to-b from-[#050B1E]/0 to-[#050B1E]/80" />

//             <div className="absolute left-4 bottom-3 md:left-6 md:right-6 md:bottom-6">
//               <div className="banner-card-content">
//                 <h3 className="banner-card-title">
//                   {item.title}
//                 </h3>

//                 <button className="flex items-center gap-2 text-white text-[10px] md:text-[12px] font-medium uppercase">
//                   Shop Now
//                   <ArrowRight size={14} className="" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* BOTTOM */}

//       <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//         {bottomCategories.map((item) => (
//           <div
//             key={item.id}
//             className="banner-card"
//           >
//             <Image
//               src={item.image}
//               alt={item.title}
//               fill
//               className="object-cover"
//             />

//             <div className="absolute inset-0 bg-linear-to-b from-[#050B1E]/0 to-[#050B1E]/80" />

//             <div className="absolute left-4 bottom-3 md:left-6 md:right-6 md:bottom-6">
//               <div className="banner-card-content">
//                 <h3 className="banner-card-title">
//                   {item.title}
//                 </h3>

//                 <button className="flex items-center gap-2 text-white text-[10px] md:text-[12px] font-medium uppercase">
//                   Shop Now
//                   <ArrowRight size={14} className="" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";

const categoryImages = [
  {
    id: 1,
    title: "Dresses",
    image: "/images/home/card-dresses.svg",
  },
  {
    id: 2,
    title: "Tops",
    image: "/images/home/card-tops.svg",
  },
  {
    id: 3,
    title: "Lingerie and Sleepwear",
    image: "/images/home/card-lingerie.svg",
  },
  {
    id: 4,
    title: "Living Room Furniture",
    image: "/images/home/card-living-room.svg",
  },
  {
    id: 5,
    title: "Home Office Furniture",
    image: "/images/home/card-home-office.svg",
  },
  {
    id: 6,
    title: "Patio Furniture",
    image: "/images/home/card-patio.svg",
  },
  {
    id: 7,
    title: "Braclets",
    image: "/images/home/card-bracelets.svg",
  },
  {
    id: 8,
    title: "Necklaces",
    image: "/images/home/card-necklaces.svg",
  },
  {
    id: 9,
    title: "Earnings",
    image: "/images/home/card-earrings.svg",
  },
  {
    id: 10,
    title: "Rings",
    image: "/images/home/card-rings.svg",
  },
];

export default function PopularCategories() {
  const [showAll, setShowAll] = useState(false);
  const topCategories = categoryImages.slice(0, 4);
  const bottomCategories = categoryImages.slice(4, 10);

  return (
    <div className="container">
      {/* Heading */}
      <div className="flex items-center justify-between pt-3 lg:pt-2">
        <div>
          <h2 className="fluid-text-18-32 font-bold text-black">
            Popular Categories
          </h2>
        </div>

        <button className="flex items-center gap-2 fluid-text-sm text-[#FD151B] font-bold cursor-pointer">
          View All
          <ChevronRight size={13} />
        </button>
      </div>

      {/* TOP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 md:pt-2 ">
        {topCategories.map((item) => (
          <div key={item.id} className="banner-card banner-card-top group">
            <Image
              src={item.image}
              alt={item.title}
              fill
              loading="lazy"
              className="object-cover group-hover:scale-[1.3] transition-transform duration-600 ease-in-out"
            />

            <div className="absolute bottom-0 left-0 w-full h-[10%] bg-linear-to-t from-[#050B1E]/80 to-transparent" />

            <div className="absolute left-4 bottom-3 md:p-3">
              <div className="banner-card-content">
                <h3 className="text-white fluid-text-13-18 font-bold leading-[100%]">
                  {item.title}
                </h3>

                <button className="flex items-center gap-2 text-white fluid-text-2xs font-medium cursor-pointer">
                  Shop Now
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!showAll && (
        <div className="relative flex justify-center -translate-y-4 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            aria-label="Show more categories"
            className="relative z-50 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center cursor-pointer"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      )}

      {/* BOTTOM */}
      <div
        className={`grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 my-3.5 ${
          showAll ? "grid" : "hidden lg:grid"
        }`}
      >
        {bottomCategories.map((item) => (
          <div key={item.id} className="banner-card banner-card-bottom group">
            <Image
              src={item.image}
              alt={item.title}
              fill
              loading="lazy"
              className="object-cover group-hover:scale-[1.3] transition-transform duration-600 ease-in-out"
            />

            <div className="absolute bottom-0 left-0 w-full h-[10%] bg-linear-to-t from-[#050B1E]/80 to-transparent" />

            <div className="absolute left-4 bottom-3 md:p-3 ">
              <div className="banner-card-content">
                <h3 className="text-white fluid-text-13-18 font-bold leading-[100%]">
                  {item.title}
                </h3>

                <button className="flex items-center gap-2 text-white fluid-text-2xs font-medium cursor-pointer">
                  Shop Now
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
