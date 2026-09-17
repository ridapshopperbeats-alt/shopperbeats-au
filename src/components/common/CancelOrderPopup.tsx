"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import Button from "@/components/common/Button";
import { useGetOrderByIdQuery } from "@/lib/redux/apis/order-api";
import { formatPrice } from "@/lib/utils/main-utils";
import { APIProduct, CancelOrderPopupProps } from "@/types/order";
import { cancelMessageSchema } from "@/lib/validations/form-schemas";

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Wrong address added",
  "No longer needed",
  "Better price elsewhere",
  "Other",
];

const CancelOrderPopup: React.FC<CancelOrderPopupProps> = ({
  isOpen,
  onClose,
  orderId,
  itemId,
  itemName,
  onCancelConfirm,
}) => {
  const { formData, formErrors, handleChange, handleSubmit, resetForm } =
    useFormValidation(cancelMessageSchema, { reason: "", comment: "" });

  const { data: order, isLoading: isOrderLoading } = useGetOrderByIdQuery(orderId, { skip: !orderId });
  console.log("CancelOrderPopup order data:", order);

  const handleConfirm = handleSubmit(() => {
    const finalReason = formData.reason === "Other" ? formData.comment : formData.reason;
    if (itemId) {
      onCancelConfirm(itemId, finalReason, true);
    } else {
      onCancelConfirm(orderId, finalReason, false);
    }
    resetForm();
    onClose();
  });

  if (!isOpen) return null;

  return (
    <div className="bg-black/50 fixed inset-0 flex items-end sm:items-center justify-center z-[1100] px-0 sm:px-4">
      <div className="w-full max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border-t-4 border-[#FD151B] bg-white shadow-xl">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-300 sm:hidden" />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[1rem] font-bold text-[#211E22]">
              {itemId ? "Cancel Item" : `Cancel Order #${order?.order_number || orderId}`}
            </h2>
            <p className="text-[0.8125rem] text-[#99A1AF]">
              {itemId && itemName
                ? `Are you sure you want to cancel the item ${itemName}? Please provide a reason.`
                : "Please provide a reason for cancelling this order."}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reason" className="text-[0.8125rem] font-semibold text-[#211E22]">
              Reason for cancellation
            </label>
            <div className="relative">
              <select
                id="reason"
                name="reason"
                className="!h-auto !w-full !appearance-none !rounded-[14px] !border !border-[#E5E7EB] !bg-white !bg-none !px-4 !py-3 !pr-10 !text-[0.8125rem] !leading-normal !text-[#211E22] cursor-pointer focus:!border-[#FD151B] focus:outline-none focus:ring-1 focus:ring-[#FD151B]"
                value={formData.reason}
                onChange={handleChange}
              >
                <option value="" className="text-[#99A1AF]">
                  Select a reason
                </option>
                {CANCEL_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
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

          {formData.reason === "Other" && (
            <div className="flex flex-col gap-2">
              <label htmlFor="comment" className="text-[0.8125rem] font-semibold text-[#211E22]">
                Please specify
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                className="!h-auto !w-full !rounded-[14px] !border !border-[#E5E7EB] !p-3 !text-[0.8125rem] !leading-normal !text-[#211E22] focus:!border-[#FD151B] focus:outline-none focus:ring-1 focus:ring-[#FD151B]"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Provide more details..."
              ></textarea>
              {formErrors.comment && (
                <p className="text-[0.75rem] text-red-600">{formErrors.comment}</p>
              )}
            </div>
          )}

          {order && !isOrderLoading && (
            <div className="flex flex-col gap-3">
              <h6 className="text-[0.8125rem] font-bold text-[#211E22]">
                {itemId ? "Item Refund Estimate" : "Refund Summary"}
              </h6>

              <hr className="border-t border-[#E5E7EB]" />

              {itemId ? (() => {
                const snapshotProducts = order?.order_details?.customer_snapshot?.products || [];
                const item = snapshotProducts.find((p: APIProduct) => String(p.id) === itemId || String(p.item_id) === itemId || String(p.product_id) === itemId);

                return item ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.8125rem] text-[#99A1AF]">Item Price</span>
                      <span className="text-[0.8125rem] font-semibold text-[#211E22]">
                        {order.currency} {formatPrice(item.unit_price)} x {item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.875rem] font-bold text-[#211E22]">Estimated Refund</span>
                      <span className="text-[0.875rem] font-bold text-[#211E22]">
                        {order.currency}{" "}
                        {formatPrice((Number(item.unit_price) || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-[0.8125rem] text-[#99A1AF]">Could not calculate item refund estimate.</p>
                );
              })() : (
                <div className="flex items-center justify-between">
                  <span className="text-[0.875rem] font-bold text-[#211E22]">Total Refund Amount</span>
                  <span className="text-[0.875rem] font-bold text-[#211E22]">
                    {order.currency}{" "}
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <Button
              type="button"
              disabled={!formData.reason}
              className="w-full sm:flex-1 cursor-pointer rounded-full bg-[#FD151B] px-5 py-2.5 text-center text-[0.8125rem] font-bold text-white hover:bg-[#e11319] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleConfirm}
            >
              Confirm Cancellation
            </Button>
            <Button
              type="button"
              className="w-full sm:flex-1 cursor-pointer rounded-full border border-[#E5E7EB] bg-white px-5 py-2.5 text-center text-[0.8125rem] font-semibold text-[#99A1AF] hover:bg-gray-50"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderPopup;
