"use client";

import { TriangleAlert } from "lucide-react";
import { ConfirmAlertProps } from "@/types/address";

export default function ConfirmAlert({
  isOpen,
  title = "Are you sure?",
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  icon: Icon = TriangleAlert,
  iconClassName = "text-[#FD151B]",
  iconWrapperClassName = "bg-[#FEF2F2]",
  topBarClassName = "bg-[#FD151B]",
  confirmButtonClassName = "bg-[#FD151B] text-white",
  cancelButtonClassName = "bg-white border border-[#E5E7EB] text-[#4A5565]",
}: ConfirmAlertProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:px-4">
      <div className="w-full max-w-none overflow-hidden rounded-t-[24px] bg-white shadow-lg sm:max-w-[385px] sm:rounded-2xl">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <span className="h-1 w-9 rounded-full bg-[#D9D2D2]" />
        </div>

        <div className={`hidden h-1 w-full sm:block ${topBarClassName}`} />

        <div className="flex flex-col items-center gap-4 p-3 md:p-5 text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${iconWrapperClassName}`}
          >
            <Icon size={24} className={iconClassName} />
          </div>

          <h5 className="text-[16px] font-bold leading-[22px] text-black">{title}</h5>
          <p className="text-[14px] md:text-[12px] leading-[20px] text-[#6A7282] font-normal">
            {message}
          </p>

          <div className="mt-2 flex w-full items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className={`h-[40px] w-[150px] flex-1 cursor-pointer rounded-[27px] text-[12px] border-[#E5E7EB] font-semibold  ${cancelButtonClassName}`}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={`h-[40px] w-[150px] flex-1 cursor-pointer rounded-[27px] text-[12px] font-semibold  ${confirmButtonClassName}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
