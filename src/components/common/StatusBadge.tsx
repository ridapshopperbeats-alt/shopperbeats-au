import { cn } from "@/lib/utils";
import { BadgeColor, type StatusBadgeProps } from "@/types/ui";

// Re-exported so the existing `import { BadgeColor } from ".../StatusBadge"`
// call sites keep working now that the enum lives with the types.
export { BadgeColor };
export type { StatusBadgeProps };

const BADGE_COLOR_STYLES: Record<BadgeColor, string> = {
  [BadgeColor.Blue]: "bg-[#EFF6FF] text-[#0066CC]",
  [BadgeColor.Green]: "bg-[#F0FDF4] text-[#166534]",
  [BadgeColor.Red]: "bg-[#FDECEC] text-[#fd151b]",
  [BadgeColor.Orange]: "bg-[#FFF4E5] text-[#B76E00]",
  [BadgeColor.Gray]: "bg-[#F3F4F6] text-[#6A7282]",
  [BadgeColor.BlueDark]: "bg-[#01295F] text-[#FFFFFF]",
};

export function StatusBadge({ label, color, showDot = true, icon, className }: Readonly<StatusBadgeProps>) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-1 !text-[12px] font-semibold whitespace-nowrap",
        BADGE_COLOR_STYLES[color],
        className,
      )}
    >
      {icon
        ? icon
        : showDot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}
