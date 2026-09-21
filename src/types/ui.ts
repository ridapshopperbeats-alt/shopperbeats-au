import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import type { MegaMenuCategory } from "./megamenu";
import type { FooterMenuData } from "./menu";

/* ------------------------------------------------------------------ *
 * Accordion
 * ------------------------------------------------------------------ */

export interface AccordionItem {
  title: string | React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
  id: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  variation?: 1 | 2;
  onOpenChange?: (openItems: boolean[]) => void;
  forceOpenCount?: number;
  independent?: boolean;
}

/* ------------------------------------------------------------------ *
 * Layout
 * ------------------------------------------------------------------ */

export type LayoutProps = {
  children: React.ReactNode;
  megaMenuData: MegaMenuCategory[];
  footerMenuData: FooterMenuData;
};

/* ------------------------------------------------------------------ *
 * Status badge
 * ------------------------------------------------------------------ */

export enum BadgeColor {
  Blue = "blue",
  Green = "green",
  Red = "red",
  Orange = "orange",
  Gray = "gray",
  BlueDark = "blue-dark",
}

export interface StatusBadgeProps {
  label: string;
  color: BadgeColor;
  showDot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ *
 * Primitives
 * ------------------------------------------------------------------ */

export interface BannerProps {
  title: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  image: React.ReactNode;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  debounceDelay?: number;
  isLoading?: boolean;
  lockOnClick?: boolean;
}

export interface CardProps extends React.ComponentProps<"div"> {
  width?: string | number;
  height?: string | number;
}

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string | null;
  labelClassName?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  totalItems: number;
  limitOptions?: number[];
}

export interface RetryPaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

/* ------------------------------------------------------------------ *
 * Slider
 * ------------------------------------------------------------------ */

export interface ReusableSliderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  effect?: "slide" | "fade";
  slidesToShow?: number;
  speed?: number;
  autoplaySpeed?: number;
  infinite?: boolean;
  slidesToScroll?: number;
  arrows?: boolean;
  pauseOnHover?: boolean;
  centered?: boolean;
  gap?: number;
  orientation?: "horizontal" | "vertical";
  onSlideChange?: (currentIndex: number, currentItem: T) => void;
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
  breakpoints?: {
    [width: number]: {
      slidesPerView?: number;
      spaceBetween?: number;
    };
  };
  autoResponsive?: boolean;
  slideClassName?: string;
}

export interface ReusableSliderRef {
  goToSlide: (index: number) => void;
  next: () => void;
  prev: () => void;
}

export interface BreakpointConfig {
  slidesPerView: number;
  spaceBetween: number;
}

/* ------------------------------------------------------------------ *
 * Sidebar (account / tab rail)
 * ------------------------------------------------------------------ */

export interface SidebarLink {
  href: string;
  label: string;
}

export interface SidebarProps {
  links: SidebarLink[];
  active?: string;
  extraClass?: string;
  onChange?: (label: string) => void;
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  variant?: "tabs" | "account";
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

/* ------------------------------------------------------------------ *
 * Tooltip / status banner
 * ------------------------------------------------------------------ */

export interface StatusBannerProps {
  icon?: LucideIcon;
  text: string;
  highlightText?: string;
  suffixText?: string;
  cancelText?: string;
  onCancel?: () => void;
  submitText?: string;
  SubmitIcon?: LucideIcon;
  onSubmitText?: string;
  onSubmit?: () => void;
  isLoading?: boolean;
  disabled?: boolean;

  backgroundClass?: string;
  borderClass?: string;
  textClass?: string;
  highlightClass?: string;
  iconClass?: string;

  className?: string;
}

export type LocationType = "city" | "state" | "country";

export interface LocationAutocompleteProps {
  id: string;
  name: string;
  type: LocationType;
  label?: string;
  error?: string | null;
  placeholder?: string;
  value: string;
  labelClassName?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface LocationPopupProps {
  open: boolean;
  onClose: () => void;
  selectedAddressId: number | null;
  onApply: (data: {
    pincode: string;
    suburb: string;
    state?: string;
    addressId: number | null;
  }) => void;
}

export interface CartPopupProps {
  isVisible: boolean;
  className?: string;
}

export interface HeaderIconProps {
  href: string;
  iconSrc: string;
  alt: string;
  className?: string;
  count?: number;
}

export interface MobileAccountSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ScrollToTopLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export interface TopNavbarProps {
  megaMenuData: MegaMenuCategory[];
  initialWishlistCount?: number;
  initialCartCount?: number;
}

export interface HeaderProps {
  megaMenuData: MegaMenuCategory[];
}

export interface SuggestionItem {
  id: string;
  type: "product" | "category" | "brand";
  displayLabel: string;
  linkHref: string;
  thumbnailUrl?: string | null;
  price?: number;
}
