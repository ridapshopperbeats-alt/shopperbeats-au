"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/common/Card";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  image_url: string | null;
  slug: string;
}

const AVATAR_COLORS = [
  "#EF4444",
  "#111827",
  "#2563EB",
  "#6B7280",
  "#F97316",
  "#0EA5E9",
  "#7C3AED",
  "#059669",
  "#DB2777",
  "#CA8A04",
];

function getAvatarColor(name: string) {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

const limitWords = (text: string, maxWords = 2) => {
  if (!text) return "";
  const words = text.split(" ");
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }
  return text;
};

function BrandCard({ brand }: { brand: Brand }) {
  const formattedName =
    brand.name.charAt(0).toUpperCase() + brand.name.slice(1).toLowerCase();
  const logoSrc = brand.logo_url || brand.image_url;

  return (
    <Link
      href={`/brand/${brand.slug}`}
      className="group flex h-auto w-full flex-col items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#FFFFFF] p-3 text-center shadow-[0_1px_4px_0_rgba(0,0,0,0.02)] transition-colors hover:border-[#012961] hover:shadow-[0_4px_16px_rgba(1,41,97,0.08)] lg:h-[131px] lg:w-[258px] lg:self-start lg:justify-self-start lg:gap-3 lg:rounded-[14px] lg:border-[#F3F4F6] lg:p-4 lg:shadow-none"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full lg:h-12 lg:w-12"
        style={!logoSrc ? { backgroundColor: getAvatarColor(brand.name) } : undefined}
      >
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt={brand.name}
            width={48}
            height={48}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-[14px] font-bold text-white lg:text-[16px]">
            {brand.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="w-full truncate text-[14px] font-bold capitalize text-[#211E22] lg:text-[14px] leading-[18px]">
        {limitWords(formattedName, 2)}
      </span>
    </Link>
  );
}

export default function BrandsExplorer({
  brands,
}: {
  brands: Brand[];
}) {
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim().toLowerCase();
  const filteredBrands = useMemo(
    () =>
      trimmedQuery
        ? brands.filter((brand) =>
          brand.name.toLowerCase().includes(trimmedQuery),
        )
        : [],
    [brands, trimmedQuery],
  );

  return (
    <Card
      width="100%"
      className="mx-auto flex h-[655px] max-w-[1129px] shrink-0 flex-col overflow-hidden rounded-none p-5 shadow-[0_2px_16px_0_rgba(0,0,0,0.05)] lg:rounded-2xl"
    >
      <span className="mb-2 block w-full shrink-0 text-left !text-[14px] !font-semibold !text-[#211E22] !leading-[normal] lg:hidden">
        Search directory
      </span>
      <div className="relative mx-auto mb-4 w-full max-w-[1068px] shrink-0">
        {/* <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
        /> */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brands..."
          style={{ fontFamily: "var(--font-montserrat)" }}
          className="flex h-11 w-full items-center self-stretch rounded-lg border !border-[#E5E7EB] !bg-[#F9FAFB] px-4 py-3 !text-[12.5px] !font-normal leading-[18.75px] !text-[rgba(10,10,10,0.50)] outline-none placeholder:text-[rgba(10,10,10,0.50)] focus:border-[#012961] lg:h-[40.75px] lg:flex-col lg:items-start lg:justify-center lg:!rounded-[14px] lg:py-2.5 lg:pl-9 lg:pr-4"
        />
      </div>

      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        {trimmedQuery ? (
          filteredBrands.length > 0 ? (
            <ul className="grid w-full grid-cols-2 justify-center gap-3 lg:grid-cols-[repeat(auto-fill,258px)]">
              {filteredBrands.map((brand) => (
                <li key={brand.id}>
                  <BrandCard brand={brand} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="w-full py-10 text-center text-[14px] text-[#6B7280]">
              No brands found for &ldquo;{query}&rdquo;.
            </p>
          )
        ) : (
          <ul className="grid w-full grid-cols-2 justify-center gap-3 lg:grid-cols-[repeat(auto-fill,258px)]">
            {brands.map((brand) => (
              <li key={brand.id}>
                <BrandCard brand={brand} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
