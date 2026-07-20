"use client";

import { useEffect, useRef, useState } from "react";

interface AddressDetails {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

type AutocompleteMode = "address" | "pincode";

interface GooglePlacesInputProps {
  onPlaceSelect: (details: AddressDetails) => void;
  placeholder?: string;
  mode?: AutocompleteMode;
  onClear?: () => void;
  onChange?: (val: string) => void;
  value?: string;
  onValidPlace?: (valid: boolean) => void;
  id?: string;
  inputClassName?: string;
}

export default function GooglePlacesInput({
  onPlaceSelect,
  placeholder = "Enter address",
  mode = "address",
  onClear,
  value,
  onValidPlace,
  id,
  inputClassName,
  ...props
}: GooglePlacesInputProps) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] =
    useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const isSelectingRef = useRef(false);
  const isUserTypingRef = useRef(false);

  const lastSyncedValueRef = useRef(value);

  useEffect(() => {
    if (value !== undefined && value !== lastSyncedValueRef.current) {
      lastSyncedValueRef.current = value;
      isUserTypingRef.current = false;
      setQuery(value);
      setSuggestions([]);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
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

  useEffect(() => {
    if (
      !isUserTypingRef.current ||
      isSelectingRef.current ||
      !window.google?.maps?.places ||
      !query
    ) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    google.maps.places.AutocompleteSuggestion
      .fetchAutocompleteSuggestions(
        mode === "pincode"
          ? {
            input: query,
            includedPrimaryTypes: ["postal_code"],
            includedRegionCodes: ["AU"],
          }
          : {
            input: query,
            includedRegionCodes: ["AU"],
          }
      )
      .then((res) => {
        const filtered =
          mode === "pincode"
            ? res.suggestions.filter((s) => {
              const types = s.placePrediction?.types || [];
              return types.includes("postal_code");
            })
            : res.suggestions;
        setSuggestions(filtered);
      })
      .finally(() => setLoading(false));
  }, [query, mode]);

  const handleSelect = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!suggestion.placePrediction) return;

    isSelectingRef.current = true;
    isUserTypingRef.current = false;

    const fullAddress = suggestion.placePrediction.text.text; 

    const place = suggestion.placePrediction.toPlace();

    await place.fetchFields({
      fields: ["addressComponents"],
    });

    const components = place.addressComponents ?? [];
    const get = (type: string) =>
      components.find((c) => c.types.includes(type));

    const cityComp = get("locality");
    const stateComp = get("administrative_area_level_1");
    const pincodeComp = get("postal_code");
    const countryComp = get("country");

    const city = cityComp?.longText || "";
    const state = stateComp?.longText || "";
    const stateShort = stateComp?.shortText || "";
    const pincode = pincodeComp?.longText || "";
    const country = countryComp?.longText || "";

    const stripParts = [
      city,
      state,
      stateShort,
      pincode,
      country,
    ].filter(Boolean);

    let streetAddress = fullAddress;

    stripParts.forEach((part) => {
      if (typeof part !== "string") return;

      const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      streetAddress = streetAddress.replace(
        new RegExp(`,?\\s*${escaped}`, "gi"),
        ""
      );
    });

    streetAddress = streetAddress
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");

    const details = {
      address: streetAddress,
      city,
      state,
      pincode,
      country,
    };

    onPlaceSelect(details);
    onValidPlace?.(true);

    setQuery(mode === "pincode" ? (pincode ? `${pincode} ${city}`.trim() : city) : streetAddress);
    setSuggestions([]);
    setActiveIndex(-1);

    setTimeout(() => {
      isSelectingRef.current = false;
    }, 0);
  };


  return (
    <div className="relative">
      <input
        type="text"
        inputMode="text"
        id={id}
        value={query}
        {...props}
        onChange={(e) => {
          isUserTypingRef.current = true;
          onValidPlace?.(false);

          const val = e.target.value;

          setQuery(val);
          setActiveIndex(-1);

          if (props.onChange) {
            props.onChange(val);
          }

          if (!val && onClear) {
            onClear();
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName || "w-full px-4 py-2 border border-gray-300 rounded-md"}
      />

      {loading && (
        <div className="absolute bg-white w-full px-4 py-2 text-sm">
          Loading...
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute z-10 bg-white w-full border  border-gray-300 rounded-b-[5px] mt-2 shadow-lg min-w-[280px] lg:min-w-[300px]">
          {suggestions.map((sug, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(sug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(sug);
                }
              }}
              className={`px-4 py-2 cursor-pointer ${i === activeIndex ? "bg-gray-200" : "hover:bg-[#FD151B] hover:text-white"
                }`}
            >
              {sug.placePrediction?.text.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
