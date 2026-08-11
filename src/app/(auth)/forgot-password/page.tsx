"use client";

import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useForgotPasswordMutation } from "@/lib/redux/apis/auth-api";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { forgotPasswordSchema } from "@/lib/validations/form-schemas";

export default function ForgotPasswordPage() {
  
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const { formData, formErrors, handleChange, handleSubmit } =
    useFormValidation(forgotPasswordSchema, { email_address: "" });

  const handleForgotPasswordSubmit = async () => {
    try {
      await forgotPassword(formData).unwrap();
      toast.success("Password reset link sent to your email.");
    } catch (err) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  return (
    <main className="container">
      <Card className="mx-auto my-6 flex flex-col items-start gap-2 border-0 w-full max-w-[371px] px-[16px] py-[24px] rounded-[8px] bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_11.8px_-1px_rgba(0,0,0,0.10)] sm:max-w-[714px] sm:items-stretch sm:px-[34px] sm:py-6 sm:rounded-lg sm:bg-white">
        <h3 className="flex justify-center my-6 auth-form-title w-full">Reset Password</h3>

        <form className="w-full" onSubmit={handleSubmit(handleForgotPasswordSubmit)} noValidate>
          <div className="form-item">
            <input
              type="email"
              id="email_address"
              name="email_address"
              placeholder="Enter Your Email"
              value={formData.email_address}
              onChange={handleChange}
              disabled={isLoading}
              className="!rounded-[10px] border border-[#E5E7EB] flex h-[46px] items-center gap-[10px] px-[17px] py-[10px] flex-[1_0_0] placeholder:text-[#000] placeholder:font-montserrat placeholder:text-[16px] placeholder:not-italic placeholder:font-medium placeholder:leading-normal"
            />
            {formErrors.email_address && (
              <p className="error">{formErrors.email_address}</p>
            )}
          </div>

          <Button
            type="submit"
            className="btn btn-red btn-filled btn-sharp w-full"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="flex link my-6 justify-center">
            <p>
              New to ShopperBeats? <a href="/sign-up">Sign Up</a>
            </p>
          </div>
        </form>
      </Card>
    </main>

  );
}
