"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      value={value}
      min={min}
      max={max}
      className={cn("relative flex w-full touch-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[#CECECE]">
        <SliderPrimitive.Range className="absolute h-full bg-[#F51721]" />
      </SliderPrimitive.Track>

      {value?.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="block h-4 w-4 shrink-0 rounded-full bg-[#F51721] outline-none
    ring-0
    focus:outline-none
    focus:ring-0
    focus-visible:ring-0
    focus-visible:outline-none
    active:ring-0"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
