import { getCategoryData } from "@/lib/utils/main-utils";
import Image from "next/image";
import Link from "next/link";
import type { AllCategoriesPageProps } from "@/types/product";


export default async function AllCategories({ searchParams }: AllCategoriesPageProps) {
  const parentId = searchParams.parent;
  const categories = await getCategoryData(parentId);

  return (
    <section className="container">
      <h2 className="text-center pt-40 font-extrabold">
        All Categories
      </h2>

      <div className="
    grid 
    grid-cols-5 
    gap-6 
    max-xl:grid-cols-3 
    max-md:grid-cols-2 
    max-[480px]:grid-cols-1
    py-40
  ">
        {categories.map((item) => {
          const hasSubcategories =
            item.subcategories && item.subcategories.length > 0;

          const href = hasSubcategories
            ? `/all-categories?parent=${item.slug}`
            : `/category/${item.slug}`;

          return (
            <Link
              key={item.id}
              href={href}
              className="text-center"
            >
              <div
                className="
              bg-white
              h-[254px]
              p-4
              cursor-pointer
              rounded-[30px]
              transition-all
              duration-200
              ease-in-out
              hover:-translate-y-1
              hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]
            "
              >
                <div className="relative w-full h-full">
                  <Image
                    src={item.icon_url || "/images/image-coming-soon.jpg"}
                    alt={item.name}
                    fill
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
                    loading="lazy"
                    className="object-contain"
                  />
                </div>
              </div>

              <p className="text-[20px] font-bold text-black mt-2.5">
                {item.name}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
