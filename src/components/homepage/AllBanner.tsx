
// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";

// const categoryImages = [
//   {
//     id: 1,
//     title: "Dresses",
//     image: "/images/home/card-dresses.svg",
//     href: "/category/dresses",
//   },
//   {
//     id: 2,
//     title: "Tops",
//     image: "/images/home/card-tops.svg",
//     href: "/category/dresses",
//   },
//   {
//     id: 3,
//     title: "Lingerie and Sleepwear",
//     image: "/images/home/card-lingerie.svg",
//     href: "/category/clothing",
//   },
//   {
//     id: 4,
//     title: "Living Room Furniture",
//     image: "/images/home/card-living-room.svg",
//     href: "/category/living-room-furniture",
//   },
//   {
//     id: 5,
//     title: "Home Office Furniture",
//     image: "/images/home/card-home-office.svg",
//     href: "/category/home-office-furniture",
//   },
//   {
//     id: 6,
//     title: "Patio Furniture",
//     image: "/images/home/card-patio.svg",
//     href: "/categories/furniture",
//   },
//   {
//     id: 7,
//     title: "Braclets",
//     image: "/images/home/card-bracelets.svg",
//     href: "/category/bracelets",
//   },
//   {
//     id: 8,
//     title: "Necklaces",
//     image: "/images/home/card-necklaces.svg",
//     href: "/category/necklaces",
//   },
//   {
//     id: 9,
//     title: "Earings",
//     image: "/images/home/card-earrings.svg",
//     href: "/category/earrings",
//   },
//   {
//     id: 10,
//     title: "Rings",
//     image: "/images/home/card-rings.svg",
//     href: "/category/rings",
//   },
// ];

// export default function PopularCategories() {
//   const [showAll, setShowAll] = useState(false);
//   const topCategories = categoryImages.slice(0, 4);
//   const bottomCategories = categoryImages.slice(4, 10);

//   return (
//     <div className="container">
//       {/* Heading */}
//       <div className="flex items-center justify-between pt-3 lg:pt-0">
//         <div>
//           <h2 className="fluid-text-18-32 font-bold text-black">
//             Popular Categories
//           </h2>
//         </div>

//         <Link
//           href="/categories"
//           className="flex items-center gap-2 fluid-text-sm text-[#FD151B] font-bold cursor-pointer"
//         >
//           View All
//           <ChevronRight size={13} />
//         </Link>
//       </div>

//       {/* TOP */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 md:pt-2">
//         {topCategories.map((item) => (
//           <Link
//             key={item.id}
//             href={item.href}
//             className="banner-card banner-card-top group block relative overflow-hidden"
//           >
//             <Image
//               src={item.image}
//               alt={item.title}
//               fill
//               loading="lazy"
//               className="object-cover group-hover:scale-[1.3] transition-transform duration-600 ease-in-out"
//             />

//             <div className="absolute bottom-0 left-0 w-full h-[10%] bg-linear-to-t from-[#050B1E]/80 to-transparent" />

//             <div className="absolute left-4 bottom-3 md:p-3">
//               <div className="banner-card-content">
//                 <h3 className="text-white fluid-text-13-18 font-bold leading-[100%]">
//                   {item.title}
//                 </h3>

//                 <span className="flex items-center gap-2 text-white fluid-text-2xs font-medium mt-1">
//                   Shop Now
//                   <ArrowRight size={14} />
//                 </span>
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>

//       {!showAll && (
//         <div className="relative flex justify-center -translate-y-4 z-50 lg:hidden">
//           <button
//             type="button"
//             onClick={() => setShowAll(true)}
//             aria-label="Show more categories"
//             className="relative z-50 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center cursor-pointer"
//           >
//             <ChevronDown size={18} />
//           </button>
//         </div>
//       )}

//       {/* BOTTOM */}
//       <div
//         className={`grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 my-3.5 ${
//           showAll ? "grid" : "hidden lg:grid"
//         }`}
//       >
//         {bottomCategories.map((item) => (
//           <Link
//             key={item.id}
//             href={item.href}
//             className="banner-card banner-card-bottom group block relative overflow-hidden"
//           >
//             <Image
//               src={item.image}
//               alt={item.title}
//               fill
//               loading="lazy"
//               className="object-cover group-hover:scale-[1.3] transition-transform duration-600 ease-in-out"
//             />

//             <div className="absolute bottom-0 left-0 w-full h-[10%] bg-linear-to-t from-[#050B1E]/80 to-transparent" />

//             <div className="absolute left-4 bottom-3 md:p-3">
//               <div className="banner-card-content">
//                 <h3 className="text-white fluid-text-13-18 font-bold leading-[100%]">
//                   {item.title}
//                 </h3>

//                 <span className="flex items-center gap-2 text-white fluid-text-2xs font-medium mt-1">
//                   Shop Now
//                   <ArrowRight size={14} />
//                 </span>
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { applyImageVariant } from "@/lib/utils/imageUtils";

interface CategoryGridApiItem {
  id: string;
  category_name: string;
  title: string;
  image: string;
  slug: string;
  cta_text?: string;
  cta_link?: string;
}

interface CategoryGridRow {
  items: CategoryGridApiItem[];
}

interface CategoryGridItem {
  id: string;
  title: string;
  image: string;
  href: string;
}

const FALLBACK_IMAGE = "/images/image-coming-soon.jpg";

const toCategoryGridItem = (item: CategoryGridApiItem): CategoryGridItem => ({
  id: item.id,
  title: item.title || item.category_name,
  image: item.image ? applyImageVariant(item.image, "public") : FALLBACK_IMAGE,
  href: item.cta_link || `/category/${item.slug}`,
});

export default function PopularCategories() {
  const [showAll, setShowAll] = useState(false);
  const [topCategories, setTopCategories] = useState<CategoryGridItem[]>([]);
  const [bottomCategories, setBottomCategories] = useState<CategoryGridItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCategoryGrid() {
      try {
        const url = `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.HOMEPAGE_SECTION_BY_ID(
          API_ENDPOINTS.PRODUCTS.CATEGORY_GRID,
        )}`;

        const res = await fetch(url);

        if (!res.ok) return;

        const data: { config?: { rows?: CategoryGridRow[] } } = await res.json();

        const rows = Array.isArray(data?.config?.rows) ? data.config.rows : [];

        if (!isMounted || rows.length === 0) return;

        const topRowItems = (rows[0]?.items ?? []).map(toCategoryGridItem);
        const bottomRowItems = rows
          .slice(1)
          .flatMap((row) => row.items ?? [])
          .map(toCategoryGridItem);

        setTopCategories(topRowItems);
        setBottomCategories(bottomRowItems);
      } catch (error) {
        console.error("Error fetching category grid:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCategoryGrid();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container">
      {/* Heading */}
      <div className="flex items-center justify-between md:pt-3">
        <div>
          <h2 className="fluid-text-18-32 font-bold text-black">
            Popular Categories
          </h2>
        </div>

        <Link
          href="/categories"
          className="flex items-center gap-2 fluid-text-sm text-[#FD151B] font-bold cursor-pointer"
        >
          View All
          <ChevronRight size={13} />
        </Link>
      </div>

      {/* TOP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 md:pt-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`top-skeleton-${index}`}
              className="banner-card banner-card-top bg-gray-200 animate-pulse rounded-lg"
            />
          ))}

        {!isLoading && topCategories.map((item, index) => (
          <Link
            key={`${item.id}-${index}`}
            href={item.href}
            className="banner-card banner-card-top group block relative overflow-hidden"
          >
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

                <span className="flex items-center gap-2 text-white fluid-text-2xs font-medium mt-1">
                  Shop Now
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
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
        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`bottom-skeleton-${index}`}
              className="banner-card banner-card-bottom bg-gray-200 animate-pulse rounded-lg"
            />
          ))}

        {!isLoading && bottomCategories.map((item, index) => (
          <Link
            key={`${item.id}-${index}`}
            href={item.href}
            className="banner-card banner-card-bottom group block relative overflow-hidden"
          >
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

                <span className="flex items-center gap-2 text-white fluid-text-2xs font-medium mt-1">
                  Shop Now
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}