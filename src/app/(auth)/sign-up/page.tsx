"use client";

import { useState, useEffect } from "react";

import ReCaptcha from "@/components/common/ReCaptcha";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "@/components/common/Button";
import { useRouter } from "next/navigation";

import Link from "next/link";
import {
  useResendVerificationCodeMutation,
  useSignupMutation,
} from "@/lib/redux/apis/auth-api";
import { signupSchema } from "@/lib/validations/form-schemas";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { Input } from "@/components/common/input";

export default function SignupPage() {
  const [signup, { isLoading }] = useSignupMutation();
  const router = useRouter();
  const [recaptcha_token, setRecaptcha_token] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mailing_list, setMailing_list] = useState(false);
  const [resendVerificationCode, { isLoading: isResending }] =
    useResendVerificationCodeMutation();

  const [showResendEmail, setShowResendEmail] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const getInitialFormValues = () => ({
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });

  const handleResendEmail = async () => {
    if (!formData.email.trim()) {
      toast.error("Please enter your email address", {
        toastId: "resend-email-error",
      });

      return;
    }

    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before resending`, {
        toastId: "resend-cooldown",
      });
      return;
    }

    try {
      await resendVerificationCode({ email: formData.email }).unwrap();
      toast.success("Verification email sent successfully!");

      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
      const errorMessage =
        (err as { data?: { detail?: string } })?.data?.detail ||
        "An unexpected error occurred.";

      if (errorMessage.trim() === "User Email Not Verified") {
        setShowResendEmail(true);
      }

      toast.error(errorMessage, {
        toastId: "signup-error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { formData, formErrors, handleChange, handleSubmit } =
    useFormValidation(signupSchema, getInitialFormValues());

  const handleSignupSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const isProd = process.env.NEXT_PUBLIC_ENV_VARIABLE === "prod";

    if (isProd && !recaptcha_token) {
      toast.error("Please complete the reCAPTCHA.", {
        toastId: "captcha-error",
      });
      setIsSubmitting(false);
      return;
    }
    if (!termsAccepted) {
      toast.error("Please accept the Terms and Conditions.", {
        toastId: "terms-error",
      });
      setIsSubmitting(false);
      return;
    }
    try {
      await signup({
        ...formData,
        recaptcha_token: recaptcha_token || "",
        mailing_list,
      }).unwrap();

      toast.success("Signup successful! Please verify your email");
      router.push("/email-verification");
    } catch (err) {
      setIsSubmitting(false);
      const errorMessage =
        (err as { data?: { detail?: string } })?.data?.detail ||
        "An unexpected error occurred.";

      if (errorMessage.trim() == "User Email Not Verified") {
        setShowResendEmail(true);
      }

      toast.error(errorMessage, {
        toastId: "signup-error",
      });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowResendEmail(false);
    setCooldown(0);
  }, [formData.email]);

  return (
    <div className="container">
      <div className="user-form-wrapper">
        <h3 className="flex justify-center py-6 auth-form-title">
          Create an Account
        </h3>

        <form onSubmit={handleSubmit(handleSignupSubmit)} noValidate>
          <div className="flex gap-4">
            <div className="form-item w-1/2">
              <Input
                type="text"
                id="first_name"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full"
                required
              />
              {formErrors.first_name && (
                <p className="error">{formErrors.first_name}</p>
              )}
            </div>

            <div className="form-item w-1/2">
              <Input
                type="text"
                id="last_name"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full"
                required
              />
              {formErrors.last_name && (
                <p className="error">{formErrors.last_name}</p>
              )}
            </div>
          </div>

          <div className="form-item">
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            {formErrors.email && <p className="error">{formErrors.email}</p>}
          </div>

          <div className="form-item">
            <div className="password-wrapper">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter Your Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eyeIcon"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {formErrors.password && (
              <p className="error">{formErrors.password}</p>
            )}
          </div>

          <div className="form-item">
            <div className="password-wrapper">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="password2"
                name="password2"
                placeholder="Re-Enter Your New Password"
                value={formData.password2}
                onChange={handleChange}
                disabled={isLoading}
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

          <div className="password-content">
            <p>Your password must have:</p>
            <ul>
              <li>Must be 8-24 characters long</li>
              <li>
                Must include uppercase and lowercase letters, numbers plus at
                least one special character
              </li>
            </ul>
          </div>

          {process.env.NEXT_PUBLIC_ENV_VARIABLE === "prod" && (
            <div className="form-item">
              <ReCaptcha onCaptchaChange={setRecaptcha_token} />
            </div>
          )}

          <div className="form-item form-item-radio link">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="terms" style={{ fontSize: "14px " }}>
              I Agree to all the
              <Link href="/cms/terms-condition" target="_blank">
                {" "}
                Terms & Conditions
              </Link>
            </label>
          </div>

          <div className="form-item form-item-radio link">
            <input
              type="checkbox"
              id="mailing_list"
              name="mailing_list"
              checked={mailing_list}
              onChange={(e) => setMailing_list(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="mailing_list" style={{ fontSize: "14px " }}>
              Add me to the mailing list
            </label>
          </div>

          <Button
            type="submit"
            className="btn btn-red btn-filled btn-sharp w-full"
            disabled={isLoading || isSubmitting}
            isLoading={isLoading || isSubmitting}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </Button>
          {showResendEmail && (
            <div className="resend-email-section mt-20 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">
                Your email is not verified. Click below to resend verification
                email.
              </p>

              <Button
                type="button"
                className="btn btn-outline btn-sharp w-100"
                onClick={handleResendEmail}
                disabled={isResending || cooldown > 0}
                isLoading={isResending}
              >
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : isResending
                    ? "Sending..."
                    : "Resend Verification Email"}
              </Button>
            </div>
          )}

          <div className="flex link my-6 justify-center">
            <p>
              Already have an account? <Link href="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
