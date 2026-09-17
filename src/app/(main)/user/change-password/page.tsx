"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Check, CircleCheck, Lock } from "lucide-react";
import Button from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import {
  useChangePasswordMutation,
  useGetPersonalDataQuery,
  useLogoutMutation,
} from "@/lib/redux/apis/auth-api";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { changePasswordValidationSchema } from "@/lib/validations/form-schemas";
import { ChangePasswordFormData } from "@/types/auth";
import { RootState } from "@/lib/redux/store";

const PASSWORD_TIPS = [
  "Use a mix of uppercase, lowercase, numbers and symbols",
  "Avoid using your name, birthday or common words",
  "Don't reuse passwords from other websites",
  "Consider using a password manager for extra security",
];

export default function ChangePasswordPage() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordUpdate, setPasswordUpdate] = useState(false);
  const [logout] = useLogoutMutation();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  useGetPersonalDataQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { formData, formErrors, handleChange, handleSubmit, resetForm } =
    useFormValidation(changePasswordValidationSchema, {
      current_password: "",
      new_password: "",
      confirm_password: "",
    });

  const newPassword = formData.new_password;
  const passwordChecks = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "Number (0-9)", met: /[0-9]/.test(newPassword) },
    { label: "Uppercase letter (A-Z)", met: /[A-Z]/.test(newPassword) },
    {
      label: "Special character (!@#$...)",
      met: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];
  const passwordScore = passwordChecks.filter((check) => check.met).length;
  const strengthLevels = [
    { label: "", color: "bg-[#E5E7EB]" },
    { label: "Weak", color: "bg-[#EF4444]" },
    { label: "Fair", color: "bg-[#F59E0B]" },
    { label: "Good", color: "bg-[#3B82F6]" },
    { label: "Strong", color: "bg-[#22C55E]" },
  ];
  const strength = strengthLevels[passwordScore];

  const isPasswordFormFilled =
    formData.current_password.trim() !== "" &&
    formData.new_password.trim() !== "" &&
    formData.confirm_password.trim() !== "";

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      }).unwrap();
      toast.success("Password changed successfully!");
      try {
        await logout().unwrap();
      } catch {}
      setPasswordUpdate(true);
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

      console.error("Failed to change password, status:", apiError?.status);
      toast.error(message);
    }
  };

  if (passwordUpdate) {
    return (
      <Card className="mx-auto w-full max-w-[1118px] items-center gap-3 p-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF5]">
          <CircleCheck size={24} className="text-[#00BC7D]" />
        </div>
        <h2 className="font-montserrat text-[clamp(1.125rem,1.125rem,1.125rem)] font-extrabold leading-[27px] text-center text-[#211E22]">
          Password Updated!
        </h2>
        <p className="max-w-md font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-normal leading-[18.75px] text-center text-[#99A1AF]">
          Your password has been changed successfully. Please use your new
          password next time you log in.
        </p>
      </Card>
    );
  }

  const inputClass =
    "h-[44px]! w-full rounded-[10px]! border border-[#E5E7EB]! bg-white px-4! pr-10! text-[13px]! text-black! placeholder:text-[#BBBBBB]! border-[#E5E7EB]! placeholder:font-normal!";

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="gap-0 p-0">
        <div className="w-full border-b border-[#F3F4F6] px-6 py-5 ">
          <h4 className="text-[14px] font-bold text-[#211E22] leading-[20px]">
            Change Password
          </h4>
          <p className="mt-1 text-[12px] font-normal leading-[16px] text-[#99A1AF]">
            Choose a strong password to keep your account safe
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full max-w-[450px] p-6"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="current_password"
              className="text-[12px] font-medium text-[#2F2F2F] leading-[16px]"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="current_password"
                type={showOldPassword ? "text" : "password"}
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                placeholder="Enter your current password"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#99A1AF]"
              >
                {showOldPassword ? (
                  <FaEyeSlash size={14} />
                ) : (
                  <FaEye size={14} />
                )}
              </button>
            </div>
            {formErrors.current_password && (
              <p className="text-[12px] text-[#FD151B]">
                {formErrors.current_password}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="new_password"
              className="text-[12px] font-medium text-[#2F2F2F] leading-[16px]"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="new_password"
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Create a strong new password"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#99A1AF]"
              >
                {showNewPassword ? (
                  <FaEyeSlash size={14} />
                ) : (
                  <FaEye size={14} />
                )}
              </button>
            </div>
            {formErrors.new_password && (
              <p className="text-[12px] text-[#FD151B]">
                {formErrors.new_password}
              </p>
            )}

            {newPassword.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      key={index}
                      className={`h-[4px] w-[95.25px] rounded-[34px] ${
                        index < passwordScore ? strength.color : "bg-[#E5E7EB]"
                      }`}
                    />
                  ))}
                  <span
                    className="ml-2 text-[12px] font-bold"
                    style={{
                      color:
                        passwordScore === 4
                          ? "#22C55E"
                          : passwordScore === 3
                            ? "#3B82F6"
                            : passwordScore === 2
                              ? "#F59E0B"
                              : "#EF4444",
                    }}
                  >
                    {strength.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                  {passwordChecks.map((check) => (
                    <div
                      key={check.label}
                      className="flex items-center gap-1.5"
                    >
                      <Check
                        size={13}
                        className={
                          check.met ? "text-[#22C55E]" : "text-[#D1D5DC]"
                        }
                      />
                      <span
                        className={`text-[12px] ${
                          check.met ? "text-[#22C55E]" : "text-[#99A1AF]"
                        }`}
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirm_password"
              className="text-[12px] font-medium text-[#2F2F2F] leading-[16px]"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter new password"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#99A1AF]"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={14} />
                ) : (
                  <FaEye size={14} />
                )}
              </button>
            </div>
            {formErrors.confirm_password && (
              <p className="text-[12px] text-[#FD151B]">
                {formErrors.confirm_password}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isLoading || !isPasswordFormFilled}
              isLoading={isLoading}
              className="flex h-[40px] cursor-pointer items-center justify-center gap-2 rounded-[25px] bg-[#FD151B] px-6 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock size={14} />
              {isLoading ? "Changing Password..." : "Update Password"}
            </Button>

            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer text-[13px] font-medium text-[#99A1AF]"
            >
              Clear
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h5 className="text-[12px] font-bold leading-[16px] text-[#99A1AF]">
          Password Tips
        </h5>

        <ul className="mt-4 flex w-full flex-col gap-3">
          {PASSWORD_TIPS.map((tip, index) => (
            <li key={tip} className="flex items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full leading-[14px] bg-[#FD151B] text-[9px] font-bold text-white">
                {index + 1}
              </span>
              <span className="text-[12px] font-normal leading-[18px] text-[#6A7282]">
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
