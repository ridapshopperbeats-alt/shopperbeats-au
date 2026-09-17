"use client";

import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { useGetOrderByIdQuery, useGetReturnOptionsQuery, useReturnOrderMutation, useReturnOrderItemMutation } from "@/lib/redux/apis/order-api";
import AddressForm from "@/components/common/AddressForm";
import { Address, AddressFormValues } from "@/types/address";

import { ReturnOption, ReturnOrderPopupProps } from "@/types/order";
import { toast } from "react-toastify";
import { formatPrice } from "@/lib/utils/main-utils";
import { returnMessageSchema } from "@/lib/validations/form-schemas";

const ReturnOrderPopup: React.FC<ReturnOrderPopupProps> = ({
  isOpen,
  onClose,
  orderId,
  itemId,
  product,
}) => {
  const { data: order, isLoading: isLoadingOrder } = useGetOrderByIdQuery(orderId || "", { skip: !orderId });
  const { data: returnOptions, isLoading: isLoadingOptions } = useGetReturnOptionsQuery();
  const [returnOrder, { isLoading: isReturningOrder }] = useReturnOrderMutation();
  const [returnOrderItem, { isLoading: isReturningItem }] = useReturnOrderItemMutation();

  const isReturning = isReturningOrder || isReturningItem;

  const [showAddressFormModal, setShowAddressFormModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const { formData, formErrors, handleChange, handleSubmit, resetForm } =
    useFormValidation(returnMessageSchema, {
      reason: "",
      customer_comment: "",
    });

const [prevOrderForAddress, setPrevOrderForAddress] = useState(order);
if (prevOrderForAddress !== order) {
  setPrevOrderForAddress(order);
  if (order?.order_details) {
    const addr = order.order_details;

    setSelectedAddress({
      title: "Pickup Address",
      first_name: addr.shipping_first_name,
      last_name: addr.shipping_last_name,
      address: addr.shipping_address,
      city: addr.shipping_city,
      state: addr.shipping_state,
      pincode: addr.shipping_postal_code,
      country: addr.shipping_country,
      phone_number: addr.shipping_phone,
    });
  }
}


  const handleConfirm = handleSubmit(async () => {
    if (!selectedAddress) {
      toast.error("Please select a return address.");
      return;
    }
    try {
      if (itemId) {
        await returnOrderItem({
          item_id: itemId,
          reason: formData.reason,
          customer_comment: formData.customer_comment,
          status: "requested",
          return_type: "return",
          first_name: selectedAddress.first_name,
          last_name: selectedAddress.last_name,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.pincode,
          country: selectedAddress.country,
          phone: selectedAddress.phone_number,
        }).unwrap();
        toast.success("Item return requested successfully!");
      } else {
        await returnOrder({
          order_id: order?.id,
          reason: formData.reason,
          customer_comment: formData.customer_comment,
          status: "requested",
          return_type: "return",
          first_name: selectedAddress.first_name,
          last_name: selectedAddress.last_name,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.pincode,
          country: selectedAddress.country,
          phone: selectedAddress.phone_number,
        }).unwrap();
        toast.success("Order return requested successfully!");
      }
      resetForm();
      onClose();
    } catch (err) {
      const error = err as { data?: { detail?: string; message?: string; error?: string } };
      const errorMessage =
        error?.data?.detail ||
        error?.data?.message ||
        error?.data?.error ||
        "Failed to process return. Please try again.";
      toast.error(errorMessage);
    }

  });

  const handleAddressFormSubmit = (values: AddressFormValues) => {
    const newAddress: Address = {
      ...values,
      id: undefined, // This is a temporary address, not a saved one
    };
    setSelectedAddress(newAddress);
    setShowAddressFormModal(false);
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="flex w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border-t-4 border-[#FD151B] bg-white shadow-xl">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-300 sm:hidden" />
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-[1rem] font-bold text-[#211E22]">
              {isLoadingOrder
                ? "Loading..."
                : itemId && product
                  ? `Return Item: ${product.name}`
                  : "Return Order"}
            </h2>
            {/* <p className="text-[0.8125rem] text-[#99A1AF]">
              Please provide a reason for returning {itemId ? "this item" : "this order"}.
            </p> */}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 cursor-pointer text-[#211E22] hover:text-[#211E22]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 flex flex-col gap-4"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="reason" className="text-[0.8125rem] font-semibold text-[#6A7282]">
              Reason for return
            </label>
            <div className="relative">
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                disabled={isLoadingOptions}
                className="!h-auto !w-full !appearance-none !rounded-[14px] !border !border-[#E5E7EB] !bg-white !bg-none !px-4 !py-3 !pr-10 !text-[0.8125rem] !leading-normal !text-[#6A7282] cursor-pointer disabled:cursor-not-allowed focus:!border-[#FD151B] focus:outline-none focus:ring-1 focus:ring-[#FD151B]"
              >
                <option value="">
                  {isLoadingOptions ? "Loading..." : "Select a reason"}
                </option>
                {returnOptions
                  ?.filter((option: ReturnOption) => option.is_active)
                  .map((option: ReturnOption) => (
                    <option key={option.id} value={option.reason}>
                      {option.reason}
                    </option>
                  ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#99A1AF]"
              />
            </div>

            {formErrors.reason && (
              <p className="text-[0.75rem] text-red-600">{formErrors.reason}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="fluid-text-xs font-semibold text-[#211E22]">
                Pickup Address
              </span>
              <button
                type="button"
                onClick={() => setShowAddressFormModal(true)}
                className="cursor-pointer text-[0.75rem] font-semibold text-[#FD151B] hover:underline"
              >
                Change Address
              </button>
            </div>

            {selectedAddress && (
              <div className="flex flex-col gap-1 rounded-[16px] border border-[#F3F4F6] bg-[#F9FAFB] p-4">
                <p className="text-[0.8125rem] font-semibold text-[#211E22]">
                  {selectedAddress.first_name} {selectedAddress.last_name}
                </p>
                <p className="text-[0.8125rem] text-[#726969]">{selectedAddress.address}</p>
                <p className="text-[0.8125rem] text-[#726969]">
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                </p>
                <p className="text-[0.8125rem] text-[#726969]">{selectedAddress.country}</p>
                <p className="text-[0.8125rem] text-[#726969]">Phone: {selectedAddress.phone_number}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="customer_comment" className="fluid-text-xs  font-semibold text-[#6A7282]">
              Comment (optional)
            </label>
            <textarea
              id="customer_comment"
              name="customer_comment"
              rows={3}
              value={formData.customer_comment}
              onChange={handleChange}
              className="!h-auto !w-full !resize-none !rounded-[16px] !border !border-[#E5E7EB] !p-3 !text-[0.8125rem] !leading-normal !text-[#6A7282] focus:!border-[#FD151B] focus:outline-none focus:ring-1 focus:ring-[#FD151B]"
              placeholder="Add additional details (if any)..."
            />
          </div>

          {order && (
            <div className="flex flex-col gap-3">
              <h6 className="text-[0.8125rem] font-bold text-[#211E22]">
                {itemId ? "Item Refund Estimate" : "Refund Summary"}
              </h6>

              <hr className="border-t border-[#E5E7EB]" />

              {itemId && product ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.8125rem] text-[#99A1AF]">Item Price</span>
                    <span className="text-[0.8125rem] font-semibold text-[#211E22]">
                      {order.currency} {formatPrice(product.unit_price)} x {product.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.875rem] font-bold text-[#211E22]">Estimated Refund</span>
                    <span className="text-[0.875rem] font-bold text-[#211E22]">
                      {order.currency}{" "}
                      {formatPrice((product.unit_price || 0) * (product.quantity || 1))}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.8125rem] text-[#99A1AF]">Order Subtotal</span>
                    <span className="text-[0.8125rem] font-semibold text-[#211E22]">
                      {order.currency} {formatPrice(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[0.875rem] font-bold text-[#211E22]">Estimated Refund</span>
                    <span className="text-[0.875rem] font-bold text-[#211E22]">
                      {order.currency}{" "}
                      {formatPrice(order.subtotal - order.shipping_cost)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 p-6 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto cursor-pointer rounded-full border border-[#E5E7EB] bg-white px-6 py-2.5 text-center text-[0.8125rem] font-semibold text-[#99A1AF] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isReturning}
            className="w-full sm:w-auto cursor-pointer rounded-full bg-[#FD151B] px-6 py-2.5 text-center text-[0.8125rem] font-bold text-white hover:bg-[#e11319] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isReturning ? "Submitting..." : "Submit Return"}
          </button>
        </div>
      </div>

      {showAddressFormModal && (
        <div
          className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              e.preventDefault();
              setShowAddressFormModal(false);
            }
          }}
          onClick={() => setShowAddressFormModal(false)}
        >
          <div
            className="flex w-full max-w-xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border-t-4 border-[#FD151B] bg-white shadow-xl"
            role="presentation"
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-6 pb-0">
              <div className="flex flex-col gap-1">
                <h2 className="text-[1rem] font-bold text-[#211E22]">
                  Change Pickup Address
                </h2>
                <p className="text-[0.8125rem] text-[#99A1AF]">
                  Enter the address you&apos;d like this return picked up from.
                </p>
              </div>
              <button
                onClick={() => setShowAddressFormModal(false)}
                className="shrink-0 cursor-pointer text-[#99A1AF] hover:text-[#211E22]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
              <AddressForm
                from={"refund"}
                onSave={handleAddressFormSubmit}
                onCancel={() => setShowAddressFormModal(false)}
                isTemporaryInput={true}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );


};

export default ReturnOrderPopup;
