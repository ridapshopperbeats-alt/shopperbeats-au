import { useState, useEffect, useRef, useMemo } from "react";

// This hook provides a debounced value that updates after a specified delay. It can be useful for scenarios like search input where you want to limit the number of times a function is called as the user types.
export function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// This hook using useDebounce to create a debounced version of a function, which can be useful for scenarios like search input where you want to limit the number of times a function is called as the user types.
export function useDebouncedFunction<T extends (...args: Parameters<T>) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedFunction = useMemo(() => {
    return (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }, [func, delay]);

  return debouncedFunction;
}