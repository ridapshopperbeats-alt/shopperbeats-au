import { Address } from "./address";
import { CheckoutFormData } from "./order";

export interface CheckoutFormProps {
  formData: CheckoutFormData;
  formErrors: Partial<Record<keyof CheckoutFormData, string>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handlePayNow: (e: React.FormEvent<HTMLFormElement>) => void;
  setFormData: (data: React.SetStateAction<CheckoutFormData>) => void;
  setFormErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof CheckoutFormData, string>>>
  >;
  isCreatingOrder: boolean;
  useSavedAddress: boolean;
  setUseSavedAddress: (value: boolean) => void;
  savedAddresses: Address[];
  selectedAddressId: number | null;
  setSelectedAddressId: (id: number | null) => void;
  onShippingAddressValid: (valid: boolean) => void;
  onBillingAddressValid: (valid: boolean) => void;
  shippingCost: number;
  isAuthenticated: boolean;
  setSelectedAddressData: React.Dispatch<
    React.SetStateAction<{
      city: string;
      state: string;
      postcode: string;
    } | null>
  >;
}

export interface DeliveryDetailsFormProps {
  formData: CheckoutFormData;
  formErrors: Partial<Record<keyof CheckoutFormData, string>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: (data: React.SetStateAction<CheckoutFormData>) => void;
  setFormErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof CheckoutFormData, string>>>
  >;
  useSavedAddress: boolean;
  setUseSavedAddress: (value: boolean) => void;
  savedAddresses: Address[];
  selectedAddressId: number | null;
  setSelectedAddressId: (id: number | null) => void;
  onShippingAddressValid: (valid: boolean) => void;
  setSelectedAddressData: React.Dispatch<
    React.SetStateAction<{
      city: string;
      state: string;
      postcode: string;
    } | null>
  >;
  isAuthenticated: boolean;
}