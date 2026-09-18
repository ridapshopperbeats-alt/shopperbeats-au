"use client";

import { SendIcon } from "lucide-react";
import Button from "./Button";
import type { StatusBannerProps } from "@/types/ui";


export default function StatusBanner({
  icon: Icon,
  text,
  highlightText,
  suffixText,
  cancelText,
  onCancel,
  submitText,
  SubmitIcon,
  onSubmitText,
  onSubmit,
  isLoading = false,
  disabled = false,
  backgroundClass = "bg-white",
  borderClass = "border-[#F3F4F6]",
  textClass = "text-[#6A7282]",
  highlightClass = "text-black",
  iconClass = "text-[#9CA3AF]",
  className = "",
}: StatusBannerProps) {
  return (
    <div
      className={`w-full h-12 rounded-2xl border ${backgroundClass} ${borderClass} shadow-[0px_2px_16px_0px_#0000000D] flex items-center px-4 lg:px-6 ${className}`}
    >
      <div
        className={`no-scrollbar flex items-center overflow-x-auto ${Icon ? "gap-3" : ""}`}
      >
        {Icon && <Icon size={16} className={`shrink-0 ${iconClass}`} />}

        <div className="flex items-center gap-1 whitespace-nowrap text-[11px] leading-[18px] md:text-[12px]">
          <span className={`font-normal ${textClass}`}>{text}</span>

          {highlightText && (
            <span className={`font-bold ${highlightClass}`}>
              {highlightText}
            </span>
          )}

          {suffixText && (
            <span className={`font-normal ${textClass}`}>{suffixText}</span>
          )}
        </div>
      </div>

      {(cancelText || submitText) && (
        <div className="ml-auto flex items-center gap-6">
          {cancelText && (
            <span
              onClick={onCancel}
              className="cursor-pointer text-[12px] font-normal text-[#99A1AF]"
            >
              {cancelText}
            </span>
          )}

          {submitText && (
            <Button
              type="button"
              onClick={onSubmit}
              isLoading={isLoading}
              disabled={disabled}
              className={`h-[40px] w-[160px] rounded-[26px] bg-[#FD151B] inline-flex items-center justify-center text-[12px] font-bold text-white gap-2 ${
                disabled ? "opacity-40 cursor-not-allowed" : "opacity-100 cursor-pointer"
              }`}
            >
              {SubmitIcon && <SendIcon size={14} />}
              <span>{isLoading ? onSubmitText : submitText}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
