"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { useGetAddressesQuery } from "@/lib/redux/apis/address-api";
import { Address } from "@/types/address";
import { RootState } from "@/lib/redux/store";
import GooglePlacesInput from "@/components/common/AddressAutocomplete";
import type { LocationPopupProps } from "@/types/ui";


export default function LocationPopup({
  open,
  onClose,
  selectedAddressId,
  onApply,
}: LocationPopupProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: addresses } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [localAddressId, setLocalAddressId] = useState<number | null>(null);
  const [pincodeQuery, setPincodeQuery] = useState("");
  const [pendingPincode, setPendingPincode] = useState<{
    pincode: string;
    city: string;
    state: string;
  } | null>(null);


  const [prevTriggers, setPrevTriggers] = useState({
    open,
    addresses,
    selectedAddressId,
  });

  if (
    open &&
    (prevTriggers.open !== open ||
      prevTriggers.addresses !== addresses ||
      prevTriggers.selectedAddressId !== selectedAddressId)
  ) {
    setPrevTriggers({ open, addresses, selectedAddressId });

    setPincodeQuery("");
    setPendingPincode(null);

    if (selectedAddressId) {
      setLocalAddressId(selectedAddressId);
    } else {
      const defaultAddress = addresses?.find((addr) => addr.is_default);
      setLocalAddressId(defaultAddress?.id ?? null);
    }
  } else if (prevTriggers.open !== open) {
    setPrevTriggers((prev) => ({ ...prev, open }));
  }

  useEffect(() => {
    if (!open) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.lenisInstance?.stop();
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.lenisInstance?.start();
    };
  }, [open]);

  if (!open) return null;

  const handleApply = () => {
    if (pendingPincode) {
      onApply({
        pincode: pendingPincode.pincode,
        suburb: pendingPincode.city,
        state: pendingPincode.state,
        addressId: null,
      });
      onClose();
      return;
    }

    const selectedAddress = addresses?.find(
      (addr) => addr.id === localAddressId,
    );
    if (selectedAddress) {
      onApply({
        pincode: selectedAddress.pincode,
        suburb: selectedAddress.city,
        state: selectedAddress.state,
        addressId: selectedAddress.id ?? null,
      });
      onClose();
      return;
    }

    toast.error("Please select an address or enter a postcode");
  };

  const handleAddAddress = () => {
    onClose();
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/user/addresses")}`);
    } else {
      router.push("/user/addresses");
    }
  };

  return (
    <>
      <div className="popup-backdrop" onClick={onClose} />

      <div className="popup-container">
        <div
          className="relative w-[calc(100%+32px)] -mx-4 lg:mx-0 lg:w-full lg:max-w-[430px] max-h-[414px] lg:max-h-none flex flex-col bg-white rounded-t-[24px] lg:rounded-[15px] shadow-[#000000]/20 overflow-hidden lg:overflow-visible px-5 lg:px-6 pt-2 lg:pt-6 pb-4 lg:pb-6"
        >
          <div className="flex lg:hidden justify-center py-2 shrink-0">
            <span className="popup-drag-handle" />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute bg-white/90 w-8 h-8 text-black flex items-center justify-center p-1 rounded-full top-2 right-3 lg:-top-4 lg:-right-2 cursor-pointer shadow-[0_0px_10px_0_#0000001F]"
          >
            <X size={20} className="text-center" />
          </button>

          <h3 className="text-[16px] lg:text-[20px] font-bold text-black text-center shrink-0">
            Choose Your Location
          </h3>
          <div className="border-b border-[#DBDBDB] mt-2 lg:mt-3 shrink-0 -mx-5 lg:-mx-6" />

          <div className="flex flex-col flex-1 min-h-0 lg:flex-none w-full lg:max-w-[400px] lg:h-[301px] rounded-[10px] border border-[#F5F5F5] overflow-hidden mx-auto mt-3 lg:mt-4">
            <p className="text-[12px] lg:text-[13px] text-[#696e79] px-4 py-3 lg:py-4 border-b border-[#F5F5F5] shrink-0 text-start">
              Select a delivery location to see product availability and
              delivery options
            </p>

            <div
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain "
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
            >
              {isAuthenticated ? (
                addresses && addresses.length > 0 ? (
                  addresses.map((address: Address, index) => (
                    <label
                      key={address.id ?? index}
                      htmlFor={`location-address-${address.id}`}
                      className={`flex items-start gap-2 px-4 py-3 cursor-pointer  ${index !== 0 ? "border-t border-[#F5F5F5]" : ""
                        }`}
                    >
                      <input
                        type="radio"
                        id={`location-address-${address.id}`}
                        name="location-address"
                        className=" mt-1 accent-[#01295F]"
                        checked={localAddressId === address.id}
                        onChange={() => {
                          setLocalAddressId(address.id ?? null);
                          setPincodeQuery("");
                          setPendingPincode(null);
                        }}
                      />
                      <div className="flex flex-col gap-2">
                        <span className="text-[14px] leading-[100%] font-semibold text-black">
                          {address.is_default
                            ? "Default Address"
                            : address.title || "Address"}
                        </span>

                        <span className="text-[14px] font-medium text-[#726969] leading-[100%] w-full h-[34px]">
                          {[address.address, address.state, address.pincode]
                            .filter(Boolean)
                            .join(" ")}
                          {", "}
                          {[address.city, address.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-[13px] text-[#696e79] text-center py-4 px-4">
                    No saved addresses yet.
                  </p>
                )
              ) : (
                <p className="text-[13px] text-[#696e79] text-center py-4 px-4">
                  Login to view and select your saved addresses.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddAddress}
              className="hidden lg:block w-full bg-[#F5F5F5] text-[#FD151B] font-bold text-[14px] underline py-3 cursor-pointer border-t border-[#F5F5F5] shrink-0"
            >
              Add an address
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddAddress}
            className="lg:hidden text-[#FD151B] font-bold text-[13px] underline text-center py-2 cursor-pointer shrink-0"
          >
            Add an address
          </button>

          <div className="flex items-center gap-2 mt-1 -translate-y-2 lg:translate-y-0 lg:mt-4 shrink-0 -mx-5 lg:mx-0 px-4 -mb-4 lg:mb-0">
            <div className="flex-1">
              <GooglePlacesInput
                id="locationPopupPincode"
                mode="pincode"
                placeholder="enter postcode"
                value={pincodeQuery}
                onChange={(val) => {
                  setPincodeQuery(val);
                  setPendingPincode(null);
                }}
                onPlaceSelect={(data) => {
                  if (!data.pincode) {
                    toast.error("Please select a valid pincode");
                    return;
                  }
                  setPincodeQuery(
                    [data.pincode, data.city].filter(Boolean).join(" "),
                  );
                  setPendingPincode({
                    pincode: data.pincode,
                    city: data.city,
                    state: data.state,
                  });
                  setLocalAddressId(null);
                }}
                onClear={() => {
                  setPincodeQuery("");
                  setPendingPincode(null);
                }}
                inputClassName="w-full h-[46px] lg:max-w-[232px] px-4 border border-[#CCCCCC] !rounded-full text-[14px] focus:outline-none focus:border-[#FD151B] placeholder:text-center placeholder:!text-[#B8B8B8]"
              />
            </div>
            <button
              type="button"
              onClick={handleApply}
              className="h-[46px] w-full max-w-[152px] rounded-full bg-[#FD151B] text-white font-semibold text-[14px] shrink-0 cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
