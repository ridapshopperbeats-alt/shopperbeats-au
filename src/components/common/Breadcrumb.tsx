"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  from?: string;
}

const Breadcrumb = ({ from }: BreadcrumbProps) => {
  interface BreadcrumbState {
    categoryHistory: BreadcrumbItem[];
  }

  const categoryHistory = useSelector(
    (state: { breadcrumb: BreadcrumbState }) =>
      state.breadcrumb.categoryHistory,
  );

  if (!categoryHistory || categoryHistory.length === 0) return null;

  return (
    <div className="w-full mt-3 lg:mt-0 mb-3 lg:mb-4">
      <div className={from === "detail" ? "" : "w-full"}>
        <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto whitespace-nowrap text-[12px] sm:text-[14px] font-medium leading-[100%]">
          {categoryHistory.map((item, index) => (
            <li key={item.path} className="flex items-center gap-1 shrink-0">
              {index > 0 && (
                <span className="text-gray-400 flex items-center justify-center shrink-0">
                  <ChevronRight className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] font-medium text-black" />
                </span>
              )}
              <Link
                href={item.path}
                className="hover:text-black transition-colors duration-200 "
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Breadcrumb;
