import * as React from "react";

import { cn } from "@/lib/utils";
import type { CardProps } from "@/types/ui";


function Card({ width, height, className, style, children, ...props }: Readonly<CardProps>) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex w-full flex-col items-start rounded-2xl border border-[#F3F4F6] bg-white shadow-[0_0_8px_2px_rgba(75,75,75,0.10)]",
        className
      )}
      style={{
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
