"use client";

import ReusableSlider from "./ReusableSlider";
import { Product, BundleProduct, ProductCarouselProps } from "@/types/product";
import ProductCard from "./ProductCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ProductCarousel({
  title,
  // subtitle,
  products,
  bundleProducts,
  from,
  link,
  isLoading = false
}: ProductCarouselProps) {
  const items = (bundleProducts || products || []) as (Product | BundleProduct)[];

  return (

    <div className={from == "details" ? "products" : "w-full"}>
        <div className="flex justify-between  gap-4">
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

      <div className={isLoading ? "" : ""}>
        <div className="pt-3 lg:pt-4 overflow-visible px-[10px] lg:px-0">
          {!isLoading && (
            <ReusableSlider<Product | BundleProduct>
              items={items}
              slidesToScroll={3}
              gap={20}
              speed={600}
              infinite={false}
              autoplaySpeed={0}
              arrows={true}
              autoResponsive
              className="pc-carousel"
              slideClassName=""
              renderItem={(item, _index) => {
                if (bundleProducts) {
                  const bundleItem = item as BundleProduct;

                  return (
                    <div
                      className="w-[180px] h-[350px] md:w-[270px] md:h-[465px]"
                      key={
                        bundleItem.product_id ||
                        bundleItem.unique_code
                      }
                    >
                      <ProductCard
                        id={bundleItem.product_id}
                        title={bundleItem.title}
                        mainPrice={bundleItem.price}
                        wasPrice={bundleItem.rrp_price}
                        showWasPrice={
                          bundleItem.rrp_price >
                          bundleItem.price
                        }
                        image={
                          bundleItem.images?.[0]?.image_url ||
                          "/images/image-coming-soon.jpg"
                        }
                        unique_code={bundleItem.unique_code}
                        defaultVariantId={bundleItem.variant_id}
                        promotion_name={bundleItem.promotion_name}
                        tags={bundleItem.tags}
                      />
                    </div>
                  );
                }

                const product = item as Product;

                return (
                  <div
                    className="w-[180px] h-[350px] md:w-[260px] md:h-[465px]"
                    key={product.id || product.unique_code}
                  >
                    <ProductCard
                      {...product}
                      image={
                        product.image ||
                        "/images/image-coming-soon.jpg"
                      }
                      id={
                        product.id ||
                        product.product_unique_code
                      }
                      unique_code={
                        product.unique_code ||
                        product.product_unique_code
                      }
                      defaultVariantId={
                        product.variants?.[0]?.id ||
                        product.variant_id
                      }
                    />
                  </div>
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
