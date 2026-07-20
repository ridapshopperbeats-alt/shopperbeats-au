"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus } from "lucide-react";

interface Product {
    brand_name?: string;
    price?: number;
    category_name?: string;
}

interface Props {
    products: Product[];
}

type SectionKey = "categories" | "price" | "brand" | "offers" | "colour" | "size";

function SidebarSection({
    title,
    sectionKey,
    isOpen,
    onToggle,
    children,
}: {
    title: string;
    sectionKey: SectionKey;
    isOpen: boolean;
    onToggle: (section: SectionKey) => void;
    children?: React.ReactNode;
}) {
    return (
        <div className="border-b border-gray-200 cursor-pointer bg-white shadow-lg rounded-md px-4" style={{ boxShadow: "0 0 14px rgba(0, 0, 0, .08" }}>
            <button
                onClick={() => onToggle(sectionKey)}
                className="flex w-full items-center justify-between px-6 py-5"
            >
                <h4 className="!text-[16px] font-semibold text-black  !py-4">
                    {title}
                </h4>

                {isOpen ? (
                    <Minus size={18} />
                ) : (
                    <Plus size={18} />
                )}
            </button>

            {isOpen && (
                <div className="px-6 pb-5">
                    {children}
                </div>
            )}
        </div>
    );
}

export default function CustomSidebar({ products }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [openSections, setOpenSections] = useState({
        categories: true,
        price: false,
        brand: false,
        offers: false,
        colour: false,
        size: false,
    });

    const brandCounts: Record<string, number> = {};

    products.forEach((product) => {
        if (product.brand_name) {
            brandCounts[product.brand_name] =
                (brandCounts[product.brand_name] || 0) + 1;
        }
    });

    const categoryCounts: Record<string, number> = {};

    products.forEach((product) => {
        if (product.category_name) {
            categoryCounts[product.category_name] =
                (categoryCounts[product.category_name] || 0) + 1;
        }
    });

    const updateQuery = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        params.set(key, value);

        router.push(`?${params.toString()}`);
    };

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    return (
        <aside className="w-[320px] overflow-hidden rounded-md border border-gray-200 bg-[#f8f8f8]">

            <SidebarSection
                title="Brand"
                sectionKey="brand"
                isOpen={openSections.brand}
                onToggle={toggleSection}
            >
                <div
                    className="max-h-[220px] overflow-y-auto overscroll-contain pr-2 space-y-3"
                    data-lenis-prevent
                    onWheel={(e) => e.stopPropagation()}
                >

                    {Object.entries(brandCounts).map(
                        ([brand, count]) => (
                            <label
                                key={brand}
                                className="flex items-center justify-between text-[15px] text-[#6d6d6d]"
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        onChange={() =>
                                            updateQuery("brand", brand)
                                        }
                                    />

                                    <span>{brand}</span>
                                </div>

                                <span>({count})</span>
                            </label>
                        )
                    )}
                </div>
            </SidebarSection>
        </aside>
    );
}