"use client";

import { useState, useMemo } from "react";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { toast } from "react-toastify";
import {
  useCreateAddressMutation,
  useUpdateAddressMutation,
} from "@/lib/redux/apis/address-api";
import AddressAutocomplete from "@/components/common/AddressAutocomplete";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/input";
import { Address, AddressFormProps, AddressFormValues } from "@/types/address";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { toYYYYMMDD, handleUSPhoneNumberChange } from "@/lib/utils/main-utils";
import { addressSchema } from "@/lib/validations/form-schemas";

export default function AddressForm({
  editingAddress,
  addresses,
  onSave,
  isTemporaryInput,
  from,
}: AddressFormProps) {
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();

  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

  const [autoAddress, setAutoAddress] = useState("");

  const [manualAddress, setManualAddress] = useState("");

  const [resetKey, setResetKey] = useState(0);

  const [addressValid, setAddressValid] = useState(false);

  const isTitleTaken = (title: string, excludeId?: number) =>
    addresses?.some((addr) => addr.title === title && addr.id !== excludeId) ??
    false;

  const defaultInitialValues: AddressFormValues = useMemo(
    () => ({
      title: !isTitleTaken("Home")
        ? "Home"
        : !isTitleTaken("Work")
          ? "Work"
          : "Others",
      first_name: "",
      last_name: "",
      phone_number: "",
      customTitle: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      date_of_birth: null,
      is_default: false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addresses],
  );

  const {
    formData,
    formErrors,
    handleChange,
    handleSubmit,
    setFormData,
    setFormErrors,
  } = useFormValidation<AddressFormValues>(
    addressSchema,
    editingAddress || defaultInitialValues,
  );

  const [prevEditingAddress, setPrevEditingAddress] = useState<
    Address | null | undefined
  >(editingAddress);
  if (prevEditingAddress !== editingAddress) {
    setPrevEditingAddress(editingAddress);
    if (editingAddress) {
      setFormData({
        title: editingAddress.title || "Home",
        customTitle:
          editingAddress.title !== "Home" && editingAddress.title !== "Work"
            ? editingAddress.title
            : "",
        first_name: editingAddress.first_name || "",
        last_name: editingAddress.last_name || "",
        phone_number: editingAddress.phone_number || "",
        address: editingAddress.address || "",
        city: editingAddress.city || "",
        state: editingAddress.state || "",
        pincode: editingAddress.pincode || "",
        country: editingAddress.country || "",
        date_of_birth: editingAddress.date_of_birth || null,
        is_default: editingAddress.is_default || false,
      });

      setManualAddress(editingAddress.address || "");
      setAutoAddress("");
      setAddressValid(true);
    } else {
      setFormData(defaultInitialValues);
      setManualAddress("");
      setAutoAddress("");
      setAddressValid(false);
    }
  }
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, error } = handleUSPhoneNumberChange(
      e,
      formData.phone_number,
    );

    setFormData((prev) => ({
      ...prev,
      phone_number: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      phone_number: error,
    }));
  };

  const handleSave = async (data: AddressFormValues) => {
    if (!manualAddress && !autoAddress) {
      toast.error("Address is required");
      return;
    }

    const combinedAddress = [manualAddress.trim(), autoAddress.trim()]
      .filter(Boolean)
      .join(", ");

    const finalData = { ...data };
    if (finalData.title === "Others") {
      finalData.title = finalData.customTitle || "";
    }

    if (isTemporaryInput) {
      onSave({ ...finalData, address: combinedAddress });
      return;
    }

    try {
      if (editingAddress) {
        if (!editingAddress.id) {
          toast.error("Invalid address ID");
          return;
        }

        const updatePayload: Address = {
          ...(finalData as Address),
          id: editingAddress.id,
          address: combinedAddress,
        };

        await updateAddress({
          id: editingAddress.id,
          body: updatePayload,
        }).unwrap();

        toast.success("Address updated!");
      } else {
        const isFirstAddress = !addresses || addresses.length === 0;

        const createPayload: Address = {
          ...(finalData as Address),
          address: combinedAddress,
          is_default: isFirstAddress ? true : finalData.is_default,
        };

        await createAddress(createPayload).unwrap();
        toast.success("Address added!");
      }

      onSave(finalData);
      setManualAddress("");
      setAutoAddress("");
      setAddressValid(false);
      setFormData(defaultInitialValues);
      setResetKey((prev) => prev + 1);
    } catch (error) {
      let message = "Failed to save address.";
      if (typeof error === "object" && error !== null && "data" in error) {
        const err = error as FetchBaseQueryError & {
          data?: { detail?: string };
        };
        message = err.data?.detail ?? message;
      }
      toast.error(message);
    }
  };

  return (
    <form  onSubmit={handleSubmit(handleSave)}>
      <div className="form-fields flex-col gap-y-0 sm:flex-row sm:gap-y-0">
        <div className="mb-3! mb-0!">
          <Input
            id="first_name"
            label="First Name*"
            error={formErrors.first_name}
            type="text"
            name="first_name"
            placeholder="First name"
            value={formData.first_name}
            onChange={handleChange}
            labelClassName="text-[#4A5565] font-semibold"
          />
        </div>
        <div className="mb-3! ">
          <Input
            id="last_name"
            label="Last Name*"
            error={formErrors.last_name}
            type="text"
            name="last_name"
            placeholder="Last name"
            value={formData.last_name}
            onChange={handleChange}
            labelClassName="text-[#4A5565] font-semibold"
          />
        </div>
      </div>

      <div className="mb-3! ">
        <Input
          id="phone_number"
          label="Phone Number*"
          error={formErrors.phone_number}
          type="tel"
          name="phone_number"
          placeholder="e.g. 1234567890 or +11234567890"
          value={formData.phone_number}
          onChange={handlePhoneChange}
          inputMode="numeric"
          labelClassName="text-[#4A5565] font-semibold"
          pattern="[0-9+]*"
        />
      </div>

      {from != "refund" && (
        <div className="mb-3!">
          <Input
            id="date_of_birth"
            label="Date of Birth (Optional)"
            error={formErrors.date_of_birth}
            type="date"
            name="date_of_birth"
            value={toYYYYMMDD(formData.date_of_birth)}
            onChange={handleChange}
            min="1900-01-01"
            max="2025-12-31"
            labelClassName="text-[#4A5565]"
          />
        </div>
      )}

      <div className="mb-3!">
        <label htmlFor="address-autocomplete" className="text-[#4A5565] font-semibold text-[12px]">Address Line <span className="text-[#FF4D4F]">*</span></label>
        <AddressAutocomplete
          id="address-autocomplete"
          key={resetKey}
          placeholder="Address Line"
          value={autoAddress}
          onChange={(val) => {
            setAutoAddress(val);
            setFormData((prev) => ({ ...prev, address: val }));
            if (val) {
              setFormErrors((prev) => ({ ...prev, address: "" }));
            }
          }}
          onValidPlace={setAddressValid}
          onPlaceSelect={(details) => {
            setAutoAddress(details.address);
            setManualAddress("");
            setFormData((prev) => ({
              ...prev,
              address: details.address,
              city: details.city,
              state: details.state,
              pincode: details.pincode,
              country: details.country,
            }));
            setFormErrors((prev) => ({
              ...prev,
              pincode: "",
              address: "",
              city: "",
              state: "",
              country: "",
            }));
          }}
        />
      </div>
      <div className="mb-3!">
        <Input
          id="manual_address"
          label="Address Line 1/ Street Address"
          error={formErrors.address}
          type="text"
          name="address"
          placeholder="Address Line 1/ Street Address"
          value={manualAddress}
          labelClassName="text-[#4A5565] font-semibold"
          onChange={(e) => {
            const val = e.target.value;
            setManualAddress(val);
            setFormData((prev) => ({ ...prev, address: val }));
            if (val) {
              setFormErrors((prev) => ({ ...prev, address: "" }));
            } else {
              setAutoAddress("");
            }
          }}
        />
      </div>

      <div className="mb-3!">
        <Input
          id="country"
          label="Country"
          error={formErrors.country}
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          labelClassName="text-[#4A5565] font-semibold"
          onChange={(e) => {
            handleChange(e);
            setAddressValid(false);
          }}
        />
      </div>
      <div className="form-fields flex-col  sm:flex-row sm:gap-y-0">
        <div className="mb-3! ">
          <Input
            id="city"
            label="City"
            error={formErrors.city}
            type="text"
            name="city"
            labelClassName="text-[#4A5565] font-semibold"
            placeholder="City"
            value={formData.city}
            onChange={(e) => {
              handleChange(e);
              setAddressValid(false);
            }}
          />
        </div>
        <div className="mb-3! ">
          <Input
            id="state"
            label="State"
            error={formErrors.state}
            type="text"
            name="state"
            labelClassName="text-[#4A5565] font-semibold"
            placeholder="State"
            value={formData.state}
            onChange={(e) => {
              handleChange(e);
              setAddressValid(false);
            }}
          />
        </div>
        <div className="mb-3!">
          <Input
            id="pincode"
            label="Postcode"
            error={formErrors.pincode}
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            name="pincode"
            labelClassName="text-[#4A5565] font-semibold"
            placeholder="Postcode"
            value={formData.pincode}
            onChange={(e) => {
              handleChange(e);
              setAddressValid(false);
            }}
          />
        </div>
      </div>
      {formData.title === "Others" && (
        <div className="mb-3! ">
          <Input
            id="customTitle"
            label="Please Specify*"
            labelClassName="text-[#4A5565] font-semibold"
            error={formErrors.customTitle}
            name="customTitle"
            type="text"
            placeholder="Enter address type"
            value={formData.customTitle}
            onChange={handleChange}
          />
        </div>
      )}

      <div className="form-fields flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="radio"
            name="title"
            id="Home"
            value="Home"
            checked={formData.title === "Home"}
            disabled={isTitleTaken("Home", editingAddress?.id)}
            onChange={handleChange}
            className="sr-only"
          />
          <label
            htmlFor="Home"
            className={`flex h-[36px] min-w-[80px] cursor-pointer items-center justify-center border pt-2 pr-5 pb-2 pl-5 text-[13px] font-semibold transition-colors ${
              isTitleTaken("Home", editingAddress?.id)
                ? "rounded-[10px] cursor-not-allowed border-[#E5E7EB] bg-white text-[#99A1AF] opacity-60"
                : formData.title === "Home"
                  ? "rounded-[21px] border-[#FD151B] bg-[#FD151B] text-white"
                  : "rounded-[10px] border-[#E5E7EB] bg-white text-[#4A5565]"
            }`}
          >
            Home
            {isTitleTaken("Home", editingAddress?.id) ? " (already added)" : ""}
          </label>

          <input
            type="radio"
            name="title"
            id="Work"
            value="Work"
            checked={formData.title === "Work"}
            disabled={isTitleTaken("Work", editingAddress?.id)}
            onChange={handleChange}
            className="sr-only"
          />
          <label
            htmlFor="Work"
            className={`flex h-[36px] min-w-[80px] cursor-pointer items-center justify-center border pt-2 pr-5 pb-2 pl-5 text-[13px] font-semibold transition-colors ${
              isTitleTaken("Work", editingAddress?.id)
                ? "rounded-[10px] cursor-not-allowed border-[#E5E7EB] bg-white text-[#99A1AF] opacity-60"
                : formData.title === "Work"
                  ? "rounded-[21px] border-[#FD151B] bg-[#FD151B] text-white"
                  : "rounded-[10px] border-[#E5E7EB] bg-white text-[#4A5565]"
            }`}
          >
            Work
            {isTitleTaken("Work", editingAddress?.id) ? " (already added)" : ""}
          </label>

          <input
            type="radio"
            name="title"
            id="Others"
            value="Others"
            checked={formData.title === "Others"}
            onChange={(e) => {
              handleChange(e);
              setFormData((prev) => ({ ...prev, customTitle: "" }));
            }}
            className="sr-only"
          />
          <label
            htmlFor="Others"
            className={`flex h-[36px] min-w-[80px] cursor-pointer items-center justify-center border pt-2 pr-5 pb-2 pl-5 text-[13px] font-semibold transition-colors ${
              formData.title === "Others"
                ? "rounded-[21px] border-[#FD151B] bg-[#FD151B] text-white"
                : "rounded-[10px] border-[#E5E7EB] bg-white text-[#4A5565]"
            }`}
          >
            Others
          </label>
        </div>

        <div className="">
          <input
            id="is_default"
            type="checkbox"
            name="is_default"
            checked={formData.is_default}
            onChange={handleChange}
            className="h-4! w-4!"
          />
          <label
            htmlFor="is_default"
            className="text-[12px] font-medium leading-[19px] text-[#4A5565]"
          >
            Set as Default Address
          </label>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <Button
          className="btn btn-red btn-filled btn-sharp w-full mt-6"
          type="submit"
          disabled={isTemporaryInput ? false : isCreating || isUpdating}
          isLoading={isTemporaryInput ? false : isCreating || isUpdating}
          debounceDelay={500}
        >
          {isUpdating ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
