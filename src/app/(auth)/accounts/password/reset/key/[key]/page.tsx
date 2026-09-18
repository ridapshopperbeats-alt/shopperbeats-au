"use client";

import { use, useState } from "react";
import { useResetPasswordMutation } from "@/lib/redux/apis/auth-api";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ReCaptcha from "@/components/common/ReCaptcha";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { resetPasswordSchema } from "@/lib/validations/form-schemas";
import type { ResetPasswordKeyPageProps } from "@/types/auth";


export default function ResetPasswordPage({ params }: ResetPasswordKeyPageProps) {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptcha_token, setRecaptcha_token] = useState<string | null>(null);
  const { key } = use(params);

  const router = useRouter();

  const { formData, formErrors, handleChange, handleSubmit } =
    useFormValidation(resetPasswordSchema, { password1: "", password2: "" });

  const handleResetPasswordSubmit = async () => {
    if (!key) {
      setError("Invalid or missing reset token.");
      toast.error("Invalid or missing reset token.");
      return;
    }
    const isProd = process.env.NEXT_PUBLIC_ENV_VARIABLE === 'prod';
    if (isProd && !recaptcha_token) {
      toast.error("Please complete the reCAPTCHA.");
      return;
    }
    const [uid, ...tokenParts] = key.split("-");
    const token = tokenParts.join("-");

    try {
      await resetPassword({
        ...formData,
        uid,
        token,
        recaptcha_token: recaptcha_token || "",
      }).unwrap();
      setSuccess("Password has been reset successfully.");
      toast.success("Password has been reset successfully.");
      router.push("/login");
    } catch (err) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <main className="container">
      <Card className="mx-auto my-6 flex flex-col items-start gap-2 border-0 w-full max-w-[371px] px-[16px] py-[24px] rounded-[8px] bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_11.8px_-1px_rgba(0,0,0,0.10)] sm:max-w-[714px] sm:items-stretch sm:px-[34px] sm:py-6 sm:rounded-lg sm:bg-white">
        <h3 className="auth-title my-6 w-full">Reset Password</h3>

        <form className="w-full" onSubmit={handleSubmit(handleResetPasswordSubmit)} noValidate>


          <div className="form-item">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password1"
                name="password1"
                placeholder="Enter Your New Password"
                value={formData.password1}
                onChange={handleChange}
                disabled={isLoading}
                style={{ borderRadius: "30px" }}
                className="!rounded-[10px] border border-[#E5E7EB] flex h-[46px] items-center gap-[10px] px-[17px] py-[10px] flex-[1_0_0] placeholder:text-[#000] placeholder:font-montserrat placeholder:text-[16px] placeholder:not-italic placeholder:font-medium placeholder:leading-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eyeIcon"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {formErrors.password1 && (
              <p className="error">{formErrors.password1}</p>
            )}
          </div>

          <div className="form-item">
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="password2"
                name="password2"
                placeholder="Re-Enter Your New Password"
                value={formData.password2}
                onChange={handleChange}
                disabled={isLoading}
                style={{ borderRadius: "30px" }}
                className="!rounded-[10px] border border-[#E5E7EB] w-full flex h-[46px] items-center gap-[10px] px-[17px] py-[10px] flex-[1_0_0] placeholder:text-[#000] placeholder:font-montserrat placeholder:text-[16px] placeholder:not-italic placeholder:font-medium placeholder:leading-normal"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eyeIcon"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {formErrors.password2 && (
              <p className="error">{formErrors.password2}</p>
            )}
          </div>

          {process.env.NEXT_PUBLIC_ENV_VARIABLE === 'prod' && (
            <div className="form-item">
              <ReCaptcha onCaptchaChange={setRecaptcha_token} />
            </div>
          )}


          <Button
            type="submit"
            className="btn btn-red btn-filled btn-sharp w-full"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Resetting..." : "Submit"}
          </Button>


          {error && <p className="error mt-10">{error}</p>}
          {success && <p className="success mt-10">{success}</p>}


          <div className="flex link justify-center my-2">
            <p>New to ShopperBeats?<a href="/sign-up">Sign Up</a></p>
          </div>

        </form>
      </Card>
    </main>

  );
}
