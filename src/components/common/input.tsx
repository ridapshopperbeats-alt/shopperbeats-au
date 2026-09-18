import * as React from "react"

import { cn } from "@/lib/utils"
import type { InputProps } from "@/types/ui";


function Input({ className, type, label, error, id, labelClassName, ...props }: Readonly<InputProps>) {
  const isRequired = !!label?.endsWith("*")
  const labelText = isRequired ? label!.slice(0, -1) : label

const inputEl = (
  <input
    type={type}
    id={id}
    data-slot="input"
    className={cn(
      "flex h-[41px] w-full min-w-0 shrink-0 items-center justify-between rounded-[10px]! border-[1.167px]! border-[#E5E7EB]! bg-transparent px-[13px] py-0 sm:h-[40.75px] sm:border-[1px]! sm:px-3 sm:py-2.5 font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)]! font-normal! leading-[18.75px] text-[#2A2A2A] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:font-montserrat placeholder:text-[#2A2A2A] placeholder:text-[clamp(0.75rem,0.75rem,0.75rem)]! placeholder:font-normal placeholder:leading-[18.75px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
      className
    )}
    {...props}
  />
)

  if (!label && !error) return inputEl

  return (
    <>
      {label && (
        <label htmlFor={id} className={cn("mb-1 block text-[#272727] text-[clamp(0.75rem,0.75rem,0.75rem)] font-medium leading-[16.5px]", labelClassName)}>
          {labelText}
          {isRequired && (
            <span className="font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-medium leading-[16.5px] text-[#FD151B]">
              *
            </span>
          )}
        </label>
      )}
      {inputEl}
      {error && <p className="error text-[clamp(0.75rem,0.75rem,0.75rem)]! font-medium!">{error}</p>}
    </>
  )
}

export { Input }
