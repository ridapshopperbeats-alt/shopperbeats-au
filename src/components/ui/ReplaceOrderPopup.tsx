"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Plus, X } from "lucide-react";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import {
  useGetOrderByIdQuery,
  useGetReturnOptionsQuery,
  useReplaceOrderMutation,
  useReplaceOrderItemMutation,
} from "@/lib/redux/apis/order-api";
import { useUploadAnyImageMutation } from "@/lib/redux/apis/products-api";
import { Address } from "@/types/address";
import {
  ReplaceOrderPopupProps,
  ReturnOption,
} from "@/types/order";
import { toast } from "react-toastify";
import { formatPrice } from "@/lib/utils/main-utils";
import { replaceMessageSchema as schema } from "@/lib/validations/form-schemas";

const ReplaceOrderPopup: React.FC<ReplaceOrderPopupProps> = ({
  isOpen,
  onClose,
  orderId,
  itemId,
  product,
}) => {
  const { data: order, isLoading: isLoadingOrder } = useGetOrderByIdQuery(
    orderId || "",
    { skip: !orderId },
  );
  const { data: returnOptions, isLoading: isLoadingOptions } =
    useGetReturnOptionsQuery();
  const [replaceOrder, { isLoading: isReplacingOrder }] =
    useReplaceOrderMutation();
  const [replaceOrderItem, { isLoading: isReplacingItem }] =
    useReplaceOrderItemMutation();
  const [uploadImage] = useUploadAnyImageMutation();

  const isReplacing = isReplacingOrder || isReplacingItem;

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { formData, formErrors, handleChange, handleSubmit, resetForm } =
    useFormValidation(schema, {
      reason: "",
      customer_comment: "",
    });

  const [prevOrderForAddress, setPrevOrderForAddress] = useState(order);
  if (prevOrderForAddress !== order) {
    setPrevOrderForAddress(order);
    if (order?.order_details) {
      const addr = order.order_details;
      setSelectedAddress({
        title: "Shipping Address",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...selectedFiles]);
      // Reset input value so the same file could be selected again if needed
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleConfirm = handleSubmit(async () => {
    if (!selectedAddress) {
      toast.error("No shipping address found.");
      return;
    }

    if (attachedFiles.length === 0) {
      setFileError("Please attach at least one image.");
      return;
    }
    setFileError("");

    try {
      const uploadedImageUrls: string[] = [];

      // Upload each image one by one as per customer review upload logic
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_type", "product");
          formData.append("media_type", "image");
          const uploadRes = await uploadImage(formData).unwrap();
          if (uploadRes?.image_url || uploadRes?.url) {
            uploadedImageUrls.push(uploadRes.image_url || uploadRes.url || "");
          }
        }
      }

      const payload = {
        reason: formData.reason,
        customer_comment: formData.customer_comment || "",
        first_name: selectedAddress.first_name || "",
        last_name: selectedAddress.last_name || "",
        address: selectedAddress.address || "",
        city: selectedAddress.city || "",
        state: selectedAddress.state || "",
        postal_code: selectedAddress.pincode || "",
        country: selectedAddress.country || "",
        phone: selectedAddress.phone_number,
        status: "requested",
        return_type: "replacement",
        house_no: "",
        landmark: "",
        images: uploadedImageUrls,
      };

      if (itemId) {
        await replaceOrderItem({ ...payload, item_id: itemId }).unwrap();
        toast.success("Item replacement requested successfully!");
      } else {
        await replaceOrder({ ...payload, order_id: order?.id }).unwrap();
        toast.success("Order replacement requested successfully!");
      }
      resetForm();
      setAttachedFiles([]);
      onClose();
    } catch (err) {
      const error = err as {
        data?: { detail?: string; message?: string; error?: string };
      };
      const errorMessage =
        error?.data?.detail ||
        error?.data?.message ||
        error?.data?.error ||
        "Failed to process replacement. Please try again.";
      toast.error(errorMessage);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-lg max-h-[85vh] flex-col overflow-hidden rounded-2xl border-t-4 border-[#FD151B] bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-[1rem] font-bold text-[#211E22]">
              {isLoadingOrder
                ? "Loading..."
                : itemId && product
                  ? `Replace Item: ${product.name}`
                  : `Replace Order #${order?.order_number || order?.id}`}
            </h2>
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
              Reason for replacement
            </label>
            <div className="relative">
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                disabled={isLoadingOptions}
                className="!h-auto !w-full !appearance-none !rounded-[16px] !border !border-[#E5E7EB] !bg-white !bg-none !px-4 !py-3 !pr-10 !text-[0.8125rem] !leading-normal !text-[#211E22] focus:!border-[#FD151B] focus:outline-none focus:ring-1 focus:ring-[#FD151B]"
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
            <label htmlFor="file-upload" className="text-[0.8125rem] font-semibold text-[#6A7282]">
              Attach Images <span className="text-[#FD151B]">*</span>
            </label>

            <label
              htmlFor="file-upload"
              className="flex h-[110px] w-full shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA] text-[#99A1AF] hover:border-[#FD151B] hover:text-[#FD151B]"
            >
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#99A1AF]">
                <Plus size={18} />
              </span>
              <span className="text-[0.8125rem] font-medium">Add Images</span>
            </label>

            {fileError && <p className="text-[0.75rem] text-red-600">{fileError}</p>}

            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="relative">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      width={74}
                      height={74}
                      unoptimized
                      className="h-[74px] w-[74px] rounded-[14px] border border-[#F3F4F6] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FD151B] text-white cursor-pointer"
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="customer_comment" className="text-[0.8125rem] font-semibold text-[#6A7282]">
              Comment (optional)
            </label>
            <textarea
              id="customer_comment"
              name="customer_comment"
              rows={3}
              value={formData.customer_comment}
              onChange={handleChange}
              className="!h-auto !w-full !resize-none !rounded-[16px] !border !border-[#E5E7EB] !p-3 !text-[0.8125rem] !leading-normal !text-[#211E22] focus:!border-[#FD151B] focus:outline-none focus:ring-1 focus:ring-[#FD151B]"
              placeholder="Add additional details (if any)..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="fluid-text-xs font-bold text-[#211E22]">
              Pickup Address
            </span>

            {selectedAddress && (
              <div className="flex flex-col gap-1 rounded-[14px] border border-[#F3F4F6] bg-[#F9FAFB] p-4">
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

          {order && (
            <div className="flex flex-col gap-3">
              <h6 className="text-[0.8125rem] font-bold text-[#211E22]">
                {itemId ? "Item Summary" : "Order Summary"}
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
                    <span className="text-[0.875rem] font-bold text-[#211E22]">Item Total</span>
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
                    <span className="text-[0.8125rem] text-[#99A1AF]">Shipping Cost</span>
                    <span className="text-[0.8125rem] font-semibold text-[#211E22]">
                      {order.currency} {formatPrice(order.shipping_cost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.875rem] font-bold text-[#211E22]">Order Total</span>
                    <span className="text-[0.875rem] font-bold text-[#211E22]">
                      {order.currency} {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-2">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full border border-[#E5E7EB] bg-white px-6 py-2.5 text-center text-[0.8125rem] font-semibold text-[#99A1AF] hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isReplacing}
            className="cursor-pointer rounded-full bg-[#FD151B] px-6 py-2.5 text-center text-[0.8125rem] font-bold text-white hover:bg-[#e11319] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isReplacing ? "Submitting..." : "Submit Replacement"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplaceOrderPopup;
