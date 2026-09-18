
import { useDebouncedFunction } from '@/lib/hooks/use-debounce';
import React from 'react';
import type { ButtonProps } from "@/types/ui";


const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  debounceDelay = 500, 
  isLoading = false,
  disabled,
  ...rest
}) => {
  const debouncedOnClick = useDebouncedFunction(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
      }
    },
    debounceDelay
  );

  return (
    <button
      onClick={debouncedOnClick}
      disabled={disabled || isLoading}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
