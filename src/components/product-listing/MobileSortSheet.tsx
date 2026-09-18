"use client";

import { useEffect } from "react";
import { X, Check } from "lucide-react";
import type { MobileSortSheetProps } from "@/types/product";



const SORT_OPTIONS = [
  { value: "price_asc", label: "Low to High" },
  { value: "price_desc", label: "High to Low" },
  { value: "newly_added", label: "Newly Added" },
  { value: "top_rated", label: "Highest Rated" },
  { value: "biggest_saving", label: "Biggest Saving" },
];

export default function MobileSortSheet({
  open,
  onClose,
  sortBy,
  onSortChange,
}: MobileSortSheetProps) {
  useEffect(() => {
    if (!open) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.lenisInstance?.stop();
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.lenisInstance?.start();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-[60] flex flex-col bg-white rounded-t-[10px] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Sort by"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA]">
          <h3 className="text-[18px] font-semibold text-black">Sort By</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sort options"
            className="cursor-pointer text-[#1D265F]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col py-2 pb-6">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSortChange(option.value);
                onClose();
              }}
              className="flex items-center justify-between px-5 py-3 text-left text-[15px] text-[#333333] cursor-pointer"
            >
              {option.label}
              {sortBy === option.value && (
                <Check size={18} className="text-[#F51721]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
