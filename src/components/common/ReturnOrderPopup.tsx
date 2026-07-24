"use client";

import React, { useState } from "react";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { useGetOrderByIdQuery, useGetReturnOptionsQuery, useReturnOrderMutation, useReturnOrderItemMutation } from "@/lib/redux/apis/order-api";
import AddressForm from "@/components/common/AddressForm";
import { Address, AddressFormValues } from "@/types/address";

import { APIProduct, ReturnOption, ReturnOrderPopupProps } from "@/types/order";
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
    <div className="fixed inset-0 top-20 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl max-h-[70vh] rounded-2xl shadow-2xl flex flex-col rounded-[8px]">

        <div className="px-4 py-5 flex justify-between items-center">
          <h6 className="text-[20px] lg:text-[24px]  font-semibold text-black">
            {isLoadingOrder ? "Loading..." : itemId && product ? `Return Item: ${product.name}` : `Return Order #${order?.order_number || order?.id}`}
          </h6>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto overscroll-contain px-4 space-y-4"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >

          <p className="text-sm text-gray-500">
            Please provide a reason for returning {itemId ? "this item" : "this order"}.
          </p>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for return
            </label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              disabled={isLoadingOptions}
              className="w-full rounded-lg border border-gray-300 px-4  text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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

            {formErrors.reason && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.reason}
              </p>
            )}
          </div>

          <div className="">
            <h5 className="font-semibold text-gray-800 ">
              Pickup Address
            </h5>

            {selectedAddress && (
            <div className="selected-address-summary bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">{selectedAddress.first_name} {selectedAddress.last_name}</p>
              <p className="text-sm text-gray-700">{selectedAddress.address}</p>
              <p className="text-sm text-gray-700">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}</p>
              <p className="text-sm text-gray-700">{selectedAddress.country}</p>
              <p className="text-sm text-gray-700">Phone: {selectedAddress.phone_number}</p>
            </div>
            )}
          </div>

          <div>
            <label htmlFor="customer_comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment (optional)
            </label>
            <textarea
              id="customer_comment"
              name="customer_comment"
              rows={4}
              value={formData.customer_comment}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              placeholder="Add additional details (if any)..."
            />
          </div>

          {order && (
            <div className="bg-gray-50 rounded-xl p-5 ">
              <h6 className="font-semibold text-gray-800 mb-4 text-lg" style={{ marginBottom: "10px" }}>
                {itemId ? "Item Refund Estimate" : "Refund Summary"}
              </h6>

              {itemId && product ? (
                <>
                  <div className="flex justify-between text-sm mb-2 text-gray-600">
                    <span>Item Price</span>
                    <span>{order.currency} {formatPrice(product.unit_price)} x {product.quantity}</span>
                  </div>
                  <div className="flex justify-between font-semibold  pt-3 mt-3 text-gray-800">
                    <span>Estimated Refund</span>
                    <span>
                      {order.currency}{" "}
                      {formatPrice((product.unit_price || 0) * (product.quantity || 1))}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-2 text-gray-600">
                    <span>Order Subtotal</span>
                    <span>{order.currency} {order.subtotal}</span>
                  </div>

                  <div className="flex justify-between font-semibold  pt-3 mt-3 text-gray-800">
                    <span>Estimated Refund</span>
                    <span>
                      {order.currency}{" "}
                      {formatPrice(order.subtotal - order.shipping_cost)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-8 py-3 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isReturning}
            style={{ padding: "12px 20px " }}
            className=" btn btn-red btn-filled btn-sharp"
          >
            {isReturning ? "Submitting..." : "Submit Return"}
          </button>
        </div>
      </div>

      {showAddressFormModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60] p-4"
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
            className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto overscroll-contain"
            role="presentation"
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <AddressForm
              from={"refund"}
              onSave={handleAddressFormSubmit}
              onCancel={() => setShowAddressFormModal(false)}
              isTemporaryInput={true}
            />
          </div>
        </div>
      )}

    </div>
  );


};

export default ReturnOrderPopup;
