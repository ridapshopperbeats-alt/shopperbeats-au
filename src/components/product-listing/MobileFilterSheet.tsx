"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Sidebar, { SidebarProps } from "./Sidebar";

type MobileFilterSheetProps = Omit<
  SidebarProps,
  "onClose" | "onClearAllFilters" | "hideHeader"
> & {
  open: boolean;
  onClose: () => void;
  onClearAll?: () => void;
};

export default function MobileFilterSheet({
  open,
  onClose,
  onClearAll,
  ...sidebarProps
}: MobileFilterSheetProps) {
 
  const [hasExpandedFilter, setHasExpandedFilter] = useState(false);
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
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      
      <div
        className={`fixed bottom-0 left-0 right-0 z-[60] flex flex-col overflow-hidden bg-white shadow-xl rounded-t-[10px] transition-all duration-300 ease-out ${
          hasExpandedFilter
            ? "h-auto max-h-auto lg:h-[85vh] lg:max-h-[85vh]"
            : "h-[370px] max-h-[370px] lg:h-[85vh] lg:max-h-[85vh]"
        } ${open ? "translate-y-0" : "translate-y-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
      >
        <div className="border-b border-[#EAEAEA] shrink-0">
          <div className="relative flex items-center px-5 py-4  border-[#EAEAEA]">
            <h3 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium texxt-[14px] leading-[18px] text-black">
              Filters
            </h3>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="ml-auto cursor-pointer text-[#1D265F]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          className="flex-1 w-full min-h-0 overflow-y-auto overscroll-contain"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          <Sidebar
            {...sidebarProps}
            onClose={onClose}
            hideHeader
            onExpandedChange={setHasExpandedFilter}
          />
        </div>

        <div className="flex items-center justify-between gap-4  py-4 border-t border-[#EAEAEA] shrink-0 px-[53px]">
          {onClearAll ? (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[12px] font-normal leading-[18px    ] text-[#001325]/64  cursor-pointer"
            >
              Clear All
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] font-medium leading-[18px] text-[#001325] cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
