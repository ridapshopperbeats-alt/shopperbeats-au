"use client";

import { useState } from "react";
import { useResetPasswordMutation } from "@/lib/redux/apis/auth-api";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ReCaptcha from "@/components/common/ReCaptcha";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { resetPasswordSchema } from "@/lib/validations/form-schemas";

interface PageProps {
  params: { key: string };
  searchParams: URLSearchParams;
}

export default function ResetPasswordPage({ params }: PageProps) {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptcha_token, setRecaptcha_token] = useState<string | null>(null);
  const { key } = params;

  const router = useRouter();

  const { formData, formErrors, handleChange, handleSubmit } =
    useFormValidation(resetPasswordSchema, { password1: "", password2: "" });

  const handleResetPasswordSubmit = async () => {
    if (!key) {
      setError("Invalid or missing reset token.");
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (!recaptcha_token) {
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
        recaptcha_token
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
      <div className="user-form-wrapper">
        <h3 className="align-center mb-24" style={{ fontSize: "30px" }}>Reset Password</h3>

        <form onSubmit={handleSubmit(handleResetPasswordSubmit)} noValidate>


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

          <div className="form-item">
            <ReCaptcha onCaptchaChange={setRecaptcha_token} />
          </div>


          <Button
            type="submit"
            className="btn btn-red btn-filled btn-sharp w-100"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Resetting..." : "Submit"}
          </Button>


          {error && <p className="error mt-10">{error}</p>}
          {success && <p className="success mt-10">{success}</p>}


          <div className="dflex link mt-30 justify-center">
            <p>New to ShopperBeats? <a href="/signup">Sign Up</a></p>
          </div>

        </form>
      </div>
    </main>

  );
}
