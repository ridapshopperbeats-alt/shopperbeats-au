"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import ConfirmAlert from "@/components/ui/ConfirmAlert";
import {
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from "@/lib/redux/apis/address-api";
import { getApiErrorMessage } from "@/lib/utils/main-utils";
import { Address } from "@/types/address";
import { RootState } from "@/lib/redux/store";
import { Loader, Plus } from "lucide-react";
import Button from "@/components/common/Button";
import AddressForm from "@/components/common/AddressForm";
import { Card } from "@/components/common/Card";

export default function AddressesPage() {
  const { isAuthenticated, authChecked } = useSelector(
    (state: RootState) => state.auth,
  );
  const {
    data: addresses,
    isLoading,
  } = useGetAddressesQuery(undefined, {
    skip: !authChecked || !isAuthenticated,
  });
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
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
    setShowForm(true);

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
      console.error(
        "Failed to delete address, status:",
        (error as { status?: number | string })?.status,
      );
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
        console.error(
          "Failed to update default address, status:",
          (error as { status?: number | string })?.status,
        );
        toast.error(
          getApiErrorMessage(error, "Failed to update default address."),
        );
      }
    }
  };

  const handleSave = () => {
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleAddNewClick = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="w-full gap-0 p-0">
        <div
          className={`flex h-[62px] w-full items-center justify-between pt-5 pr-6 pb-5 pl-6 ${
            !showLoader && (addresses?.length ?? 0) > 0
              ? "border-b border-[#E5E7EB]"
              : ""
          }`}
        >
          <h4 className="text-[14px] font-bold text-black leading-[21px]">
            Address
          </h4>

          <button
            type="button"
            onClick={handleAddNewClick}
            className="flex cursor-pointer items-center gap-1 text-[12px] font-semibold  leading-[18px] text-[#FD151B]"
          >
            <Plus size={14} />
            Add New
          </button>
        </div>

        {showLoader && <Loader className="m-6" />}

        {!showLoader && (
          <div className="w-full">
            {addresses?.map((address: Address) => (
              <div
                key={address.id}
                className="min-h-[86px] w-full border-b last:border-0 border-[#E5E7EB] px-6 py-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="defaultAddress"
                      id={`address-${address.id}`}
                      checked={address.is_default}
                      onChange={() =>
                        address.id && handleSetDefault(address.id)
                      }
                      className="h-5 w-2.5 accent-[#FD151B]!"
                    />
                    <label
                      htmlFor={`address-${address.id}`}
                      className="cursor-pointer text-[12px] leading-[18px] font-bold text-black"
                    >
                      {address.title}
                    </label>

                    {address.is_default && (
                      <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] leading-[15px] font-bold text-[#FD151B]">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 font-semibold items-center text-[#6A7282] gap-2 text-[13px]">
                    <Button
                      className="cursor-pointer "
                      onClick={(e) => {
                        e.preventDefault();
                        handleEdit(address);
                      }}
                    >
                      Edit
                    </Button>
                    <span className="text-gray-300">|</span>
                    <Button
                      className="cursor-pointer "
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

                <p className="mt-1.5 pl-6 text-[12px] leading-[18px] font-normal text-[#6A7282]">
                  <span className="font-normal">Address:</span>{" "}
                  {address.address}, {address.city}, {address.state}{" "}
                  {address.pincode}, {address.country}
                </p>

                {!address.is_default && (
                  <label
                    htmlFor={`address-${address.id}`}
                    className="mt-1.5 block cursor-pointer pl-6 text-[12px] font-medium text-[#99A1AF]"
                  >
                    Set as Default Address
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {showForm && (
        <Card className="w-full gap-0 p-0">
          <div className="flex h-[62px] w-full items-center justify-between border-b border-[#F3F4F6] pt-5 pr-6 pb-5 pl-6">
            <h4 className="text-[14px] font-bold text-black leading-[21px]">
              {editingAddress ? "Edit Address" : "Add Address"}
            </h4>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingAddress(null);
              }}
              className="cursor-pointer text-[12px] font-semibold leading-[18px] text-[#FD151B]"
            >
              Close
            </button>
          </div>

          <div
            ref={formRef}
            className="w-full px-6 pb-6 transition-all duration-500"
          >
            <AddressForm
              editingAddress={editingAddress}
              addresses={addresses}
              onSave={handleSave}
            />
          </div>
        </Card>
      )}
      
      <ConfirmAlert
        isOpen={confirmOpen}
        title="Remove Address?"
        message="This address will be permanently removed. You can always add it back later."
        confirmText="Yes, Remove"
        cancelText="No, Keep It"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedId(null);
        }}
      />
    </div>
  );
}
