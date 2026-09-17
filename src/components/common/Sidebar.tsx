"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ComponentType } from "react";
import {
  User,
  Package,
  MapPin,
  Heart,
  Lock,
  LogOut,
  CircleX,
} from "lucide-react";
import { Card } from "@/components/common/Card";

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
  variant?: "tabs" | "account";
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const ACCOUNT_ICONS: Record<
  string,
  ComponentType<{ size?: number; className?: string }>
> = {
  "Personal Information": User,
  "My Orders": Package,
  "Manage Address": MapPin,
  Wishlist: Heart,
  "Change Password": Lock,
  Logout: LogOut,
};

export default function Sidebar({
  links,
  active,
  onChange,
  extraClass,
  style,
  textStyle,
  title = "My Account",
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <Card
         className={`fixed top-0 right-0 z-50 h-screen w-[250px] overflow-hidden border-0 bg-white shadow-[0_0_8px_2px_#4B4B4B1A] transform transition-transform duration-300 ease-in-out ${
         
          isOpen ? "translate-x-0" : "translate-x-full"
        
        } lg:static lg:h-auto lg:w-[250px] lg:translate-x-0 lg:rounded-[14px] ${
          extraClass || ""
        }`}
        style={style}
      >
        <div className="flex w-full items-center justify-between px-4 py-3.5 border-b border-[#E5E7EB]">
          <span className="font-montserrat text-[12px] font-semibold capitalize leading-[16px] tracking-[1.2px] text-[#99A1AF]">
            {title}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden cursor-pointer text-[#99A1AF]"
          >
            <CircleX size={18} />
          </button>
        </div>

          <ul className="flex w-full flex-col gap-[2px] p-2">
          {links.map((link) => {
            const isActive =
              active === link.label || pathname.startsWith(link.href);

            const isLogout = link.label === "Logout";

            const Icon = ACCOUNT_ICONS[link.label];

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  scroll={false}
                  style={textStyle}
                  onClick={() => {
                    onChange?.(link.label);
                    onClose?.();
                  }}
                  className={`flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 transition-colors duration-200 ${
                    isActive ? "bg-[#FEF2F2]" : ""
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {Icon && (
                      <Icon
                        size={16}
                        className={
                          isActive || isLogout
                            ? "text-[#FD151B]"
                            : "text-[#99A1AF]"
                        }
                      />
                    )}

                    <span
                      className={`text-[14px] ${
                        isActive
                          ? "font-semibold text-[#FD151B]"
                          : isLogout
                          ? "font-medium text-[#FD151B]"
                          : "font-medium text-[#4A5565]"
                      }`}
                    >
                      {link.label}
                    </span>
                  </span>

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FD151B] shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
