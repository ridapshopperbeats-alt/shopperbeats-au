import type { LucideIcon } from "lucide-react";

export interface Address {
  id?: number;
  title: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  date_of_birth?: string | null;
  is_default?: boolean;
  customTitle?:string;
}
export interface AddressFormValues {

  title: string;
  customTitle?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  date_of_birth?: string  | null;
  is_default?: boolean;
}

export interface AddressFormProps {
  editingAddress?: Address | null;
  addresses?: Address[];
  onSave: (data: AddressFormValues) => void;
  onCancel?: () => void;
  isTemporaryInput?: boolean;
  from?: string;
}

export interface ConfirmAlertProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: LucideIcon;
  iconClassName?: string;
  iconWrapperClassName?: string;
  topBarClassName?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
}

export interface AddressDetails {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export type AutocompleteMode = "address" | "pincode";

export interface GooglePlacesInputProps {
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

export interface AddressPopupProps {
  show: boolean;
  onClose: () => void;
  editingAddress: Address | null;
}
