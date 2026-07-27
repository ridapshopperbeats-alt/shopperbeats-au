"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import { Address } from "@/types/address";
import AddressForm from "@/components/common/AddressForm";
import ConfirmAlert from "@/components/ui/ConfirmAlert";

// ---------------- DUMMY DATA (static, for now) ----------------
const DUMMY_ADDRESSES: Address[] = [
  {
    id: 1,
    title: "Home",
    first_name: "John",
    last_name: "Doe",
    phone_number: "0400000000",
    address: "123 Static Street",
    city: "Melbourne",
    state: "VIC",
    pincode: "3000",
    country: "Australia",
    is_default: true,
  },
  {
    id: 2,
    title: "Office",
    first_name: "John",
    last_name: "Doe",
    phone_number: "0400000001",
    address: "45 Business Avenue",
    city: "Sydney",
    state: "NSW",
    pincode: "2000",
    country: "Australia",
    is_default: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(DUMMY_ADDRESSES);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);


  const handleEdit = (address: Address) => {
    setEditingAddress(address);

    setTimeout(() => {
      const yOffset = -110;
      const y =
        formRef.current!.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });

    }, 100);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    setAddresses((prev) => prev.filter((addr) => addr.id !== selectedId));
    toast.success("Address deleted!");
    setConfirmOpen(false);
    setSelectedId(null);
  };

  const handleSetDefault = async (id: number) => {
    const address = addresses?.find((addr) => addr.id === id);
    if (address) {
      setAddresses((prev) =>
        prev.map((addr) => ({ ...addr, is_default: addr.id === id })),
      );
      toast.success("Default address updated!");
    }
  };

  const handleSave = () => {
    setEditingAddress(null);
  };

  return (
    <>
      <div className="">
        {(addresses?.length ?? 0) > 0 && <h4 className="text-heading-lg">Address</h4>}
        <div className="address-block">
          {addresses?.map((address: Address) => (
            <div key={address.id} className="address-content">
              <div className="flex justify-between">
                <div className="form-item form-item-radio">
                  <input
                    type="radio"
                    name="defaultAddress"
                    id={`address-${address.id}`}
                    checked={address.is_default}
                    onChange={() => address.id && handleSetDefault(address.id)}
                  />
                  <label htmlFor={`address-${address.id}`} className="text-base">
                    {address.is_default ? "Default" : "Set as Default Address"}
                  </label>
                </div>
                <div className="flex">
                  <Button
                    className="edit cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(address);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    className="remove cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();

                      const isDefault = address.is_default;

                      if (isDefault) {
                        toast.error("Default address cannot be deleted.");
                        return;
                      }

                      setSelectedId(address.id ?? null);
                      setConfirmOpen(true);
                    }}
                  >
                    Remove
                  </Button>

                </div>
              </div>
              <h6>{address.title}</h6>
              <p>
                <b>Address:</b> {address.address}, {address.city}, {address.state}{" "}
                {address.pincode}, {address.country}
              </p>
            </div>
          ))}
        </div>

        <div
          ref={formRef}
          className={`transition-all duration-500`}
        >
          <h4 className="text-lg text-[24px] font-bold my-1">{editingAddress ? "Edit Address" : "Add Address"}</h4>

          <AddressForm
            editingAddress={editingAddress}
            addresses={addresses}
            onSave={handleSave}
          />
        </div>
      </div>
      <ConfirmAlert
        isOpen={confirmOpen}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedId(null);
        }}
      />
    </>
  );
}
