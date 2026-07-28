"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import ConfirmAlert from "@/components/ui/ConfirmAlert";
import { useDeleteAddressMutation, useGetAddressesQuery, useUpdateAddressMutation } from "@/lib/redux/apis/address-api";
import { getApiErrorMessage } from "@/lib/utils/main-utils";
import { Address } from "@/types/address";
import { Loader } from "lucide-react";
import Button from "@/components/common/Button";
import AddressForm from "@/components/common/AddressForm";

export default function AddressesPage() {
  const { data: addresses, isLoading, isError } = useGetAddressesQuery();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const showLoader = !hasMounted || isLoading;


  const handleEdit = (address: Address) => {
    setEditingAddress(address);

    // Small delay so DOM updates first
    setTimeout(() => {
      const yOffset = -110; // adjust based on header height
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

    try {
      await deleteAddress({ id: selectedId }).unwrap();
      toast.success("Address deleted!");
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error(getApiErrorMessage(error, "Failed to delete address."));
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    const address = addresses?.find((addr) => addr.id === id);
    if (address) {
      try {
        await updateAddress({
          id,
          body: { id, title: address.title, is_default: true },
        }).unwrap();
        toast.success("Default address updated!");
      } catch (error) {
        console.error("Failed to update default address:", error);
        toast.error(getApiErrorMessage(error, "Failed to update default address."));
      }
    }
  };

  const handleSave = () => {
    setEditingAddress(null);
  };

  return (
    <>
      <div className="">
        {!showLoader && (addresses?.length ?? 0) > 0 && <h4 className="wishlist-title">Address</h4>}
        {showLoader && <Loader />}
        <div className="address-block">
          {!showLoader && addresses?.map((address: Address) => (
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
                  <label htmlFor={`address-${address.id}`}>
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
