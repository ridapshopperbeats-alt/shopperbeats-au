"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationProps } from "@/types/ui";


const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}: PaginationProps) => {
  if (totalItems === 0) return null;

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const pageButtonClass = (page: number) =>
    `flex items-center justify-center h-7 w-7 rounded-full text-[14px] font-medium leading-none transition-colors cursor-pointer ${
      page === currentPage
        ? "border border-[#F51721] text-[#F51721]"
        : "text-[#333333] hover:text-[#F51721]"
    }`;

  const renderPageNumbers = () => {
    const pageNumbers: React.ReactNode[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            type="button"
            key={i}
            className={pageButtonClass(i)}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>,
        );
      }
      return pageNumbers;
    }

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      startPage = 1;
      endPage = 5;
    }

    if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
      endPage = totalPages;
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          type="button"
          key="start"
          className={pageButtonClass(1)}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>,
      );

      if (startPage > 2) {
        pageNumbers.push(
          <span
            key="start-ellipsis"
            className="px-1 text-[14px] text-[#333333]"
          >
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          type="button"
          key={`page-${i}`}
          className={pageButtonClass(i)}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="end-ellipsis" className="px-1 text-[14px] text-[#333333]">
            ...
          </span>,
        );
      }

      pageNumbers.push(
        <button
          type="button"
          key="end"
          className={pageButtonClass(totalPages)}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>,
      );
    }

    return pageNumbers;
  };

  return (
    <div className="w-full flex flex-col items-center gap-2 pt-[33px]">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex items-center justify-center h-7 w-7 text-[#333333] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="w-[30px] h-[30px] rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center cursor-pointer">
            <ChevronLeft size={18} className="text-black" />
          </div>
        </button>

        {renderPageNumbers()}

        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex items-center justify-center h-7 w-7 text-[#333333] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="w-[30px] h-[30px] rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center cursor-pointer">
            <ChevronRight size={18} className="text-black" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
