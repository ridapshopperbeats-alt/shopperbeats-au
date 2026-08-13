// "use client";

// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { API_ENDPOINTS } from "@/lib/constants/api";
// import type { Category } from "@/types/product";

// interface NewTopCategoryItem {
//   title: string;
//   image: string;
//   href: string;
// }

// const FALLBACK_TOP_CATEGORIES: NewTopCategoryItem[] = [
//   {
//     title: "Women's Clothing",
//     image: "/images/womentop.png",
//     href: "/",
//   },
//   {
//     title: "Fragrance",
//     image: "/images/fragrance.png",
//     href: "/",
//   },
//   {
//     title: "Furniture",
//     image: "/images/furniture.png",
//     href: "/",
//   },
//   {
//     title: "Patio Furniture",
//     image: "/images/patioFurniture.png",
//     href: "/",
//   },
//   {
//     title: "Baby & Kids",
//     image: "/images/baby-kids.png",
//     href: "/",
//   },
//   {
//     title: "Home Decor",
//     image: "/images/homeDecor.png",
//     href: "/",
//   },
//   {
//     title: "Jewelry",
//     image: "/images/jewelry.png",
//     href: "/",
//   },
//   {
//     image: "/images/menClothing.png",
//     title: "Men's Clothing",
//     href: "/",
//   },
//   {
//     title: "Footwear",
//     image: "/images/footwear.png",
//     href: "/",
//   },
//   {
//     title: "Watches",
//     image: "/images/watches.png",
//     href: "/",
//   },
//   {
//     title: "Children Clothing",
//     image: "/images/baby-kids.png",
//     href: "/",
//   },
//   {
//     title: "Fashion",
//     image: "/images/womentop.png",
//     href: "/",
//   },
// ];

// export default function NewTopCategories() {
//   const sliderRef = useRef<HTMLDivElement>(null);
//   const [categories, setCategories] = useState<NewTopCategoryItem[]>(
//     FALLBACK_TOP_CATEGORIES,
//   );

//   useEffect(() => {
//     let isMounted = true;

//     async function loadCategories() {
//       try {
//         const url = `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.CATEGORIES.LIST}`;

//         console.log("CATEGORY API URL:", url);

//         const res = await fetch(url);

//         console.log("CATEGORY API STATUS:", res.status);
//         console.log("CATEGORY API OK:", res.ok);

//         if (!res.ok) return;

//         const data: Category[] = await res.json();

//         console.log("CATEGORY API RESULT:", data);
//         console.log("CATEGORY COUNT:", data.length);

//         const topLevel = (Array.isArray(data) ? data : []).filter(
//           (category) => !category.parent_id,
//         );

//         console.log("TOP LEVEL CATEGORIES:", topLevel);
//         console.log("TOP LEVEL COUNT:", topLevel.length);

//         if (!isMounted || topLevel.length === 0) return;

//         const mappedCategories = topLevel.map((category) => ({
//           title: category.name,
//           image:
//             category.icon_url ||
//             category.image_url ||
//             "/images/image-coming-soon.jpg",
//           href: `/category/${category.slug}`,
//         }));

//         console.log("MAPPED CATEGORIES:", mappedCategories);

//         setCategories(mappedCategories);
//       } catch (error) {
//         console.error("Error fetching top categories:", error);
//       }
//     }

//     loadCategories();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   const handleScroll = (direction: "left" | "right") => {
//     if (!sliderRef.current) return;

//     sliderRef.current.scrollBy({
//       left: direction === "left" ? -300 : 300,
//       behavior: "smooth",
//     });
//   };

//   return (
//     <div className="w-full container">
//       <h2 className="text-center fluid-text-20-24 font-bold leading-7.5 mx-auto mt-6">
//         Top Categories
//       </h2>

//       <div className="relative max-w-[1700px] mx-auto">
//         <button
//           type="button"
//           onClick={() => handleScroll("left")}
//           className="hidden lg:flex absolute left-[-12px] top-22 -translate-y-3 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-all"
//         >
//           <ChevronLeft size={18} className="text-black" />
//         </button>

//         <button
//           type="button"
//           onClick={() => handleScroll("right")}
//           className="hidden lg:flex absolute right-[-16px] top-22 -translate-y-3 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-all"
//         >
//           <ChevronRight size={18} className="text-black" />
//         </button>

//         <div
//           ref={sliderRef}
//           className="flex items-start gap-[16px] lg:gap-[35px] overflow-x-auto scroll-smooth no-scrollbar py-6"
//         >
//           {categories.map((item) => (
//             <Link
//               key={item.title}
//               href={item.href}
//               className="shrink-0 flex flex-col gap-[8px] items-center justify-start cursor-pointer w-[72px] h-[98px] md:w-[138px] md:h-[172px] md:gap-[16px]"
//             >
//               <div className="relative w-[64px] h-[64px] md:w-[138px] md:h-[138px] rounded-full border border-[#D8D8D8] shadow-[0px_2px_6px_0px_#00000014] md:shadow-none bg-white overflow-hidden">
//                 <Image
//                   src={item.image}
//                   alt={item.title}
//                   fill
//                   sizes="(max-width: 768px) 64px, 138px"
//                   quality={100}
//                   loading="lazy"
//                   className="object-cover transition-transform duration-800 hover:scale-[1.25] ease-in-out"
//                 />
//               </div>

//               <p className="text-12px font-bold leading-[normal] tracking-[0%] text-center capitalize text-[#2B2B2B] line-clamp-2">
//                 {item.title}
//               </p>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NewTopCategoryItem {
  title: string;
  image: string;
  href: string;
}

const DUMMY_TOP_CATEGORIES: NewTopCategoryItem[] = [
  {
    title: "Women's Clothing",
    image: "/images/womentop.png",
    href: "/",
  },
  {
    title: "Fragrance",
    image: "/images/fragrance.png",
    href: "/",
  },
  {
    title: "Furniture",
    image: "/images/furniture.png",
    href: "/",
  },
  {
    title: "Patio Furniture",
    image: "/images/patioFurniture.png",
    href: "/",
  },
  {
    title: "Baby & Kids",
    image: "/images/baby-kids.png",
    href: "/",
  },
  {
    title: "Home Decor",
    image: "/images/homeDecor.png",
    href: "/",
  },
  {
    title: "Jewelry",
    image: "/images/jewelry.png",
    href: "/",
  },
  {
    title: "Men's Clothing",
    image: "/images/menClothing.png",
    href: "/",
  },
  {
    title: "Footwear",
    image: "/images/footwear.png",
    href: "/",
  },
  {
    title: "Watches",
    image: "/images/watches.png",
    href: "/",
  },
  {
    title: "Children Clothing",
    image: "/images/baby-kids.png",
    href: "/",
  },
  {
    title: "Fashion",
    image: "/images/womentop.png",
    href: "/",
  },
];

export default function NewTopCategories() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const [categories] = useState<NewTopCategoryItem[]>(
    DUMMY_TOP_CATEGORIES
  );

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
          {categories.map((item) => (
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
                  sizes="(max-width: 768px) 64px, 138px"
                  quality={100}
                  loading="lazy"
                  className="object-cover transition-transform duration-800 hover:scale-[1.25] ease-in-out"
                />
              </div>

              <p className="text-12px font-bold leading-[normal] tracking-[0%] text-center capitalize text-[#2B2B2B] line-clamp-2">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}