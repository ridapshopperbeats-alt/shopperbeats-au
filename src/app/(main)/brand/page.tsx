import Image from "next/image";
import Link from "next/link";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import BrandsExplorer from "@/components/pages/BrandsExplorer";
import Banner from "@/components/common/Banner";

// Types
interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  image_url: string | null;
  is_active: boolean;
  total_products: number;
  active_products: number;
  inactive_products: number;
  slug: string;
}

interface BrandsResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: Brand[];
}

async function fetchBrands() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_PRODUCTS;

    const response = await fetch(
      `${apiUrl}/api/v1/brand/list-brands?page=1&limit=1000`,
      { next: { revalidate: 60 } },
    );

    if (!response.ok) {
      console.warn("Failed to fetch brands, status:", response.status);
      return [];
    }
    const data: BrandsResponse = await response.json();

    return data.data || [];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

async function fetchFeaturedBrands() {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL_PRODUCTS}`;

    const response = await fetch(`${apiUrl}/api/v1/featured-brand/`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn("Failed to fetch featured brands, status:", response.status);
      return [];
    }

    const data = await response.json();

    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Error fetching featured brands:", error);
    return [];
  }
}

export default async function BrandsSection() {
  const [allBrands, featuredBrands] = await Promise.all([
    fetchBrands(),
    fetchFeaturedBrands(),
  ]);
  console.log(allBrands, "allBrands=====");
  return (
    <div>
      <div className="flex w-full flex-col items-start gap-3 self-stretch border-b border-[#E5E7EB] bg-gradient-to-b from-[#FFF7F3] to-[#FFFDFC] px-5 py-9 lg:hidden">
        <h1 className="font-montserrat text-[24px] font-bold leading-tight text-[#01295F]">
          Our Brands
        </h1>
        <p className="font-montserrat text-[14px] font-medium text-[#6A7282]">
          Explore top brands available on ShopperBeats.
        </p>
      </div>
      <Banner
        title="Our Brands"
        subtitle="Explore top brands available on ShopperBeats."
        titleClassName="font-montserrat text-[32px]! font-semibold! leading-[24px]! text-[#01295F]!"
        subtitleClassName="font-montserrat text-[16px]! font-semibold! leading-[19.5px]! text-[#6A7282]!"
        image={
          <Image
            src="/images/Group 1261155781.png"
            alt="Our Brands Banner"
            width={1920}
            height={218}
            priority
            fetchPriority="high"
          />
        }
      />
      <div className="container">
      {/* ======== Brands Grid Section ======== */}
      {/* <h4 className="text-[24px] font-bold pt-3">Featured Brands</h4> */}
      <div className="hidden grid-cols-2 gap-5 sm:grid-cols-3 lg:grid lg:grid-cols-6">
        {featuredBrands
          .map((featuredBrand: { brand_id: string }) => {
            const brand = allBrands.find(
              (b: Brand) => b.id === featuredBrand.brand_id,
            );

            return brand;
          })
          .filter((brand: Brand | undefined): brand is Brand => !!brand)
          .map((brand: Brand) => {
            const logoSrc = brand.logo_url || brand.image_url || "/no-product-bg.svg";
            return (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="
              group
              relative
              overflow-hidden
              h-[150px]
              rounded-[28px]
              bg-white
              border border-[#ececec]
              flex items-center justify-center
              p-6
              transition-all duration-500
              hover:-translate-y-1
              hover:shadow-[0_10px_30px_rgba(1,41,97,0.08)]
              hover:border-[#01296120]
            "
              >
                {/* Background Glow */}
                <div
                  className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                transition duration-500
                bg-gradient-to-br from-[#01296108] via-transparent to-[#ff000008]
              "
                />

                {/* Logo */}
                <div className="relative z-10 flex items-center justify-center">
                  <Image
                    src={logoSrc}
                    alt={brand.name}
                    width={140}
                    height={80}
                    loading="lazy"
                    className="
                  max-h-[70px]
                  w-auto
                  object-contain
                  transition duration-500
                  group-hover:scale-105
                "
                  />
                </div>

                {/* Bottom Brand Name */}
                <div
                  className="
                absolute bottom-3 left-0 right-0
                text-center
                opacity-0
                translate-y-2
                group-hover:opacity-100
                group-hover:translate-y-0
                transition-all duration-300
              "
                >
                  <span className="text-[13px] font-semibold text-[#012961]">
                    {brand.name}
                  </span>
                </div>
              </Link>
            );
          })}
      </div>

      {/* ======== Alphabetic Brands List Section ======== */}
      <div className="-mx-5 mt-0 lg:mx-0 lg:mt-8">
        {/* <h1 className="pb-[30px] text-center text-[24px] font-extrabold text-black">
          ALL Brands
        </h1> */}

        <BrandsExplorer brands={allBrands} />
      </div>
      <ScrollToTopButton />
      </div>
    </div>
  );
}
