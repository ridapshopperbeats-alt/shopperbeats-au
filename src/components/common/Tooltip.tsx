"use client";

import { Clock3, LucideIcon } from "lucide-react";

interface StatusBannerProps {
  icon?: LucideIcon;
  text: string;
  highlightText?: string;
  suffixText?: string;

  backgroundClass?: string;
  borderClass?: string;
  textClass?: string;
  highlightClass?: string;
  iconClass?: string;

  className?: string;
}

export default function StatusBanner({
  icon: Icon = Clock3,
  text,
  highlightText,
  suffixText,
  backgroundClass = "bg-white",
  borderClass = "border-[#F3F4F6]",
  textClass = "text-[#6B7280]",
  highlightClass = "text-[#111827]",
  iconClass = "text-[#9CA3AF]",
  className = "",
}: StatusBannerProps) {
  return (
    <div
      className={`w-full h-12 rounded-2xl border ${backgroundClass} ${borderClass} shadow-[0px_2px_16px_0px_#0000000D] flex items-center px-4 ${className}`}
    >
      <Icon
        size={16}
        strokeWidth={1.8}
        className={`shrink-0 ${iconClass}`}
      />

      <p
        className={`ml-3 text-[12px] leading-[18px] font-normal ${textClass}`}
      >
        {text}

        {highlightText && (
          <span className={`font-bold ${highlightClass}`}>
            {highlightText}
          </span>
        )}

        {suffixText && <span>{suffixText}</span>}
      </p>
    </div>
  );
}