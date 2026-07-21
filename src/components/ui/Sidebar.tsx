"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

interface SidebarLink {
  href: string;
  label: string;
}

interface SidebarProps {
  links: SidebarLink[];
  active?: string;
  extraClass?: string;
  onChange?: (label: string) => void;
  style?: CSSProperties;
  textStyle?: CSSProperties;
}

export default function Sidebar({
  links,
  active,
  onChange,
  extraClass,
  style,
  textStyle,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={`bg-white w-full md:max-w-[260px] lg:max-w-[280px] overflow-x-auto pt-4  rounded-[8px] xl:p-4 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none
        ${extraClass || ""} 
      `}
      style={style}
    >
      {/* Mobile Horizontal Scroll */}
      <ul className="flex md:flex-col gap-1 lg:gap-4 w-full">
        {links.map((link) => {
          const isActive =
            active === link.label || pathname.startsWith(link.href);

          return (
            <li
              key={link.href}
              className="flex-1 md:w-full flex justify-center"
            >
              <Link
                href={link.href}
                scroll={false}
                style={textStyle}
                className={`
            flex md:block items-center justify-center
            w-full
            px-3 md:px-2
           md:py-1
            text-center
            text-[14px]
            leading-[20px]
            transition-colors
            duration-200 
            ${isActive
                    ? "bg-[#FD151B] text-white"
                    : "text-[rgba(0,0,0,0.56)] hover:text-black"
                  }
          `}
                onClick={() => onChange?.(link.label)}
              >
                <span
                  className={` inline-block whitespace-nowrap md:flex items-center justify-center w-fit ${isActive ? "bg-[#FD151B] text-white px-3 py-2 " : ""}`}
                >
                  {link.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
