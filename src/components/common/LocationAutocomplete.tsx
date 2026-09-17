"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type LocationType = "city" | "state" | "country";

interface LocationAutocompleteProps {
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

const PRIMARY_TYPES: Record<LocationType, string[]> = {
  city: ["locality"],
  state: ["administrative_area_level_1"],
  country: ["country"],
};

// City/State searches are scoped to Australia since the rest of the address
// form (see AddressAutocomplete) only supports Australian addresses. Country
// search is left unrestricted so any country can be selected.
const REGION_CODES: Record<LocationType, string[] | undefined> = {
  city: ["AU"],
  state: ["AU"],
  country: undefined,
};

export default function LocationAutocomplete({
  id,
  name,
  type,
  label,
  error,
  placeholder,
  value,
  labelClassName,
  onChange,
}: Readonly<LocationAutocompleteProps>) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] =
    useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const isUserTypingRef = useRef(false);

  const [mapsReady, setMapsReady] = useState(
    () => typeof window !== "undefined" && !!window.google?.maps?.places,
  );

  useEffect(() => {
    if (mapsReady) return;
    const intervalId = setInterval(() => {
      if (window.google?.maps?.places) {
        setMapsReady(true);
        clearInterval(intervalId);
      }
    }, 150);
    return () => clearInterval(intervalId);
  }, [mapsReady]);

  useEffect(() => {
    if (!isUserTypingRef.current) {
      setQuery(value || "");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (
      !isUserTypingRef.current ||
      !mapsReady ||
      !window.google?.maps?.places ||
      !query.trim()
    ) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoading(true);

      const regionCodes = REGION_CODES[type];

      google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
        includedPrimaryTypes: PRIMARY_TYPES[type],
        ...(regionCodes ? { includedRegionCodes: regionCodes } : {}),
      })
        .then((res) => setSuggestions(res.suggestions))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query, type, mapsReady]);

  const emitChange = (val: string) => {
    onChange({
      target: { name, value: val, type: "text" },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserTypingRef.current = true;
    const val = e.target.value;
    setQuery(val);
    emitChange(val);
    setActiveIndex(-1);
  };

  const handleSelect = (suggestion: google.maps.places.AutocompleteSuggestion) => {
    const name =
      suggestion.placePrediction?.mainText?.text ||
      suggestion.placePrediction?.text.text ||
      "";

    isUserTypingRef.current = false;
    setQuery(name);
    emitChange(name);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        setSuggestions([]);
        setActiveIndex(-1);
        break;
    }
  };

  const isRequired = !!label?.endsWith("*");
  const labelText = isRequired ? label!.slice(0, -1) : label;

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "mb-1 block text-[#272727] text-[clamp(0.75rem,0.75rem,0.75rem)] font-medium leading-[16.5px]",
            labelClassName,
          )}
        >
          {labelText}
          {isRequired && (
            <span className="font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-medium leading-[16.5px] text-[#FD151B]">
              *
            </span>
          )}
        </label>
      )}
      <input
        type="text"
        id={id}
        name={name}
        autoComplete="off"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex h-[41px] w-full min-w-0 shrink-0 items-center justify-between rounded-[10px]! border-[1.167px]! border-[#E5E7EB]! bg-transparent px-[13px] py-0 sm:h-[40.75px] sm:border-[1px]! sm:px-3 sm:py-2.5 font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)]! font-normal! leading-[18.75px] text-[#2A2A2A] transition-colors outline-none placeholder:font-montserrat placeholder:text-[#2A2A2A] placeholder:text-[clamp(0.75rem,0.75rem,0.75rem)]! placeholder:font-normal placeholder:leading-[18.75px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
      />

      {loading && (
        <div className="absolute z-10 bg-white w-full px-4 py-2 text-[clamp(0.75rem,0.75rem,0.75rem)] border border-gray-300 rounded-b-[5px] mt-1 shadow-lg">
          Loading...
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="absolute z-10 bg-white w-full border border-gray-300 rounded-b-[5px] mt-1 shadow-lg max-h-[220px] overflow-y-auto">
          {suggestions.map((sug, i) => (
            <div
              key={sug.placePrediction?.placeId || i}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(sug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(sug);
                }
              }}
              className={`px-4 py-2 cursor-pointer text-[clamp(0.75rem,0.75rem,0.75rem)] ${
                i === activeIndex
                  ? "bg-gray-200"
                  : "hover:bg-[#FD151B] hover:text-white"
              }`}
            >
              {sug.placePrediction?.mainText?.text || sug.placePrediction?.text.text}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="error text-[clamp(0.75rem,0.75rem,0.75rem)]! font-medium!">
          {error}
        </p>
      )}
    </div>
  );
}
