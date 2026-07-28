"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { useChangePasswordMutation, useLogoutMutation } from "@/lib/redux/apis/auth-api";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { changePasswordValidationSchema } from "@/lib/validations/form-schemas";
import { ChangePasswordFormData } from "@/types/auth";

export default function ChangePasswordPage() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logout] = useLogoutMutation();

  const { formData, formErrors, handleChange, handleSubmit } =
    useFormValidation(changePasswordValidationSchema, {
      current_password: "",
      new_password: "",
      confirm_password: "",
    });

  const router = useRouter();
  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      }).unwrap();
      toast.success("Password changed successfully!");
      try {
        await logout().unwrap();
      } catch {
      }
      router.push("/login");
    } catch (error) {
      const apiError = error as {
        status?: number | string;
        data?: { message?: string; errors?: { message: string }[] };
        message?: string;
      };

      const message =
        apiError?.data?.errors?.[0]?.message ||
        apiError?.data?.message ||
        apiError?.message ||
        "Failed to change password. Please check your current password.";

      console.error("Failed to change password:", apiError);
      toast.error(message);
    }
  };
  return (
    <div className="wishlist-content">
      <h4 className="text-heading-lg my-2">Change Password</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-item text-[14px] font-montserrat">
          <label htmlFor="current_password">Current Password</label>
          <div className="password-input">
            <input
              id="current_password"
              type={showOldPassword ? "text" : "password"}
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              placeholder="Enter Password"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="eyeIcon"
            >
              {showOldPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formErrors.current_password && (
            <p className="error">{formErrors.current_password}</p>
          )}
        </div>

        <div className="form-item text-[14px] font-montserrat">
          <label htmlFor="new_password">New Password</label>
          <div className="password-input">
            <input
              id="new_password"
              type={showNewPassword ? "text" : "password"}
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter New Password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="eyeIcon"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formErrors.new_password && (
            <p className="error">{formErrors.new_password}</p>
          )}
          <div className="password-content mt-[20px]">
            <p>Your password must have:</p>
            <ul>
              <li>Minimum character requirements (e.g., 8-24 characters)</li>
              <li>Enforce strong password rules (uppercase, lowercase, numbers, symb)</li>
            </ul>
          </div>
        </div>

        <div className="form-item text-[14px] font-montserrat">
          <label htmlFor="confirm_password">Confirm New Password</label>
          <div className="password-input">
            <input
              id="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Re-enter New Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="eyeIcon"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formErrors.confirm_password && (
            <p className="error">{formErrors.confirm_password}</p>
          )}
        </div>

        <div className="flex justify-center w-full">
          <Button type="submit" className="btn btn-red btn-filled btn-sharp w-30" style={{ alignItems: "center", justifyContent: "center", display: "flex", marginTop: "10px" }} disabled={isLoading} isLoading={isLoading}>
            {isLoading ? "Changing Password..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
