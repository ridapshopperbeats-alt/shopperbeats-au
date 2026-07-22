import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string | null
}

function Input({ className, type, label, error, id, ...props }: Readonly<InputProps>) {
  const inputEl = (
    <input
      type={type}
      id={id}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )

  if (!label && !error) return inputEl

  return (
    <>
      {label && (
        <label htmlFor={id} className="text-md font-medium leading-[normal]">
          {label}
        </label>
      )}
      {inputEl}
      {error && <p className="error">{error}</p>}
    </>
  )
}

export { Input }
