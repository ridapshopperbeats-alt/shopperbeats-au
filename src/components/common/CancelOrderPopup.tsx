"use client";

import React from "react";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import Button from "@/components/common/Button";
import { useGetOrderByIdQuery } from "@/lib/redux/apis/order-api";
import { formatPrice } from "@/lib/utils/main-utils";
import { APIProduct, CancelOrderPopupProps } from "@/types/order";
import { cancelMessageSchema } from "@/lib/validations/form-schemas";


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
    <div className="bg-black/75 fixed inset-0 flex items-center justify-center z-50 ordermodal">
      <div className="bg-white p-6 rounded-[10px] shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-10">
          {itemId ? "Cancel Item" : `Cancel Order #${order?.order_number || orderId}`}
        </h2>
        <p className="mb-4">
          {itemId && itemName
            ? `Are you sure you want to cancel the item ${itemName}? Please provide a reason.`
            : "Please provide a reason for cancelling this order."}
        </p>

        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for cancellation
          </label>
          <select
            id="reason"
            name="reason"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
            value={formData.reason}
            onChange={handleChange}
          >
            <option value="">Select a reason</option>
            <option value="Ordered by mistake">Ordered by mistake</option>
            <option value="Wrong address added">Wrong address added</option>
            <option value="No longer needed">No longer needed</option>
            <option value="Better price elsewhere">Better price elsewhere</option>
            <option value="Other">Other</option>
          </select>
          {formErrors.reason && (
            <p className="error">{formErrors.reason}</p>
          )}
        </div>

        {formData.reason === "Other" && (
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Please specify
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Provide more details..."
            ></textarea>
            {formErrors.comment && (
              <p className="error">{formErrors.comment}</p>
            )}
          </div>
        )}

        {order && !isOrderLoading && (
          <div className="rounded-xl mb-4">
            <h6 className="font-semibold text-gray-800 mb-4 text-lg" style={{ marginBottom: "10px" }}>
              {itemId ? "Item Refund Estimate" : "Refund Summary"}
            </h6>

            {itemId ? (() => {
              const snapshotProducts = order?.order_details?.customer_snapshot?.products || [];
              const item = snapshotProducts.find((p: APIProduct) => String(p.id) === itemId || String(p.item_id) === itemId || String(p.product_id) === itemId);

              return item ? (
                <>
                   <div className="flex justify-between font-semibold pt-1 text-gray-800 " style={{ justifyContent: "space-between" }}>
                    <span>Item Price</span>
                    <span>{order.currency} {formatPrice(item.unit_price)} x {item.quantity}</span>
                  </div>
                    <div className="flex justify-between font-semibold pt-1 text-gray-800 " style={{ justifyContent: "space-between" }}>
                    <span>Estimated Refund</span>
                    <span>
                      {order.currency}{" "}
                      {formatPrice((Number(item.unit_price) || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Could not calculate item refund estimate.</p>
              );
            })() : (
              <>
                <div className="flex justify-between font-semibold pt-1 text-gray-800 mb-40" style={{ justifyContent: "space-between" }}>
                  <span>Total Refund Amount</span>
                  <span>
                    {order.currency}{" "}
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex  space-x-3" style={{justifyContent:"flex-end"}}>
          <Button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={handleConfirm}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderPopup;
