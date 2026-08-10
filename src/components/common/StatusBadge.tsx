import { cn } from "@/lib/utils";

export enum BadgeColor {
  Blue = "blue",
  Green = "green",
  Red = "red",
  Orange = "orange",
  Gray = "gray",
}

const BADGE_COLOR_STYLES: Record<BadgeColor, string> = {
  [BadgeColor.Blue]: "bg-[#EFF6FF] text-[#0066CC]",
  [BadgeColor.Green]: "bg-[#F0FDF4] text-[#166534]",
  [BadgeColor.Red]: "bg-[#FDECEC] text-[#fd151b]",
  [BadgeColor.Orange]: "bg-[#FFF4E5] text-[#B76E00]",
  [BadgeColor.Gray]: "bg-[#F3F4F6] text-[#6A7282]",
};

export interface StatusBadgeProps {
  label: string;
  color: BadgeColor;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ label, color, showDot = true, className }: Readonly<StatusBadgeProps>) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-1 !text-[12px] font-semibold whitespace-nowrap",
        BADGE_COLOR_STYLES[color],
        className,
      )}
    >
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}
