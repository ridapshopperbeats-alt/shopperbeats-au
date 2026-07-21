"use client";

import { toast } from "react-toastify";
import Button from "@/components/common/Button";
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
      <div className="user-form-wrapper">
        <h3 className="flex justify-center my-6 auth-form-title">Reset Password</h3>

        <form onSubmit={handleSubmit(handleForgotPasswordSubmit)} noValidate>
          <div className="form-item">
            <input
              type="email"
              id="email_address"
              name="email_address"
              placeholder="Enter Your Email"
              value={formData.email_address}
              onChange={handleChange}
              disabled={isLoading}
              className="input-rounded-lg"
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
              New to ShopperBeats? <a href="/signup">Sign Up</a>
            </p>
          </div>
        </form>
      </div>
    </main>

  );
}
