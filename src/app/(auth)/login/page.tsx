"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ReCaptcha from "@/components/common/ReCaptcha";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "@/components/common/Button";

import { LoginResponse } from "@/types/auth";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

import Link from "next/link";
import { useLoginMutation, useResendVerificationCodeMutation } from "@/lib/redux/apis/auth-api";
import { useCreateWishlistMutation } from "@/lib/redux/apis/cart-api";
import { loginSchema } from "@/lib/validations/form-schemas";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { Input } from "@/components/common/input";


export default function LoginPage() {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [resendVerificationCode, { isLoading: isResending }] =
    useResendVerificationCodeMutation();
  const [createWishlist] = useCreateWishlistMutation();
  const router = useRouter();
  const [recaptcha_token, setRecaptcha_token] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockUntil, setBlockUntil] = useState<Date | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [checking, setChecking] = useState(true);

  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedirectUrl(redirect);
 
    if (isAuthenticated) {
      router.replace(redirect || "/");
    } else {
      setChecking(false);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const { formData, formErrors, handleChange, handleSubmit } = useFormValidation(
    loginSchema,
    { email: "", password: "" }
  );

  const flushPendingWishlist = async (_loginResponse: LoginResponse) => {
    const raw = sessionStorage.getItem("pendingWishlist");
    if (!raw) return;

    let parsed: { product_id?: string; variant_id?: string | null };
    try {
      parsed = JSON.parse(raw) as {
        product_id?: string;
        variant_id?: string | null;
      };
    } catch {
      sessionStorage.removeItem("pendingWishlist");
      return;
    }

    if (!parsed.product_id) {
      sessionStorage.removeItem("pendingWishlist");
      return;
    }

    try {
      await createWishlist({
        product_id: parsed.product_id,
        variant_id: parsed.variant_id ?? undefined,
      }).unwrap();
      sessionStorage.removeItem("pendingWishlist");
      toast.success("Added to wishlist!");
    } catch {
      toast.error(
        "Could not add your saved item to wishlist. Try again from the product page.",
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleResendEmail = async () => {
    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before resending`);
      return;
    }

    try {
      await resendVerificationCode({ email: formData.email }).unwrap();
      toast.success("Verification email sent successfully!");

      // Block resend for 60s so the user doesn't spam the email API
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
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || "Failed to send verification email";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (isBlocked && blockUntil) {
      const interval = setInterval(() => {
        const now = new Date();
        const remaining = blockUntil.getTime() - now.getTime();
        if (remaining <= 0) {
          setIsBlocked(false);
          setBlockUntil(null);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBlocked, blockUntil]);

  const handleLoginSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const isProd = process.env.NEXT_PUBLIC_ENV_VARIABLE === 'prod';

    if (isProd && !recaptcha_token) {
      toast.error("Please complete the reCAPTCHA.", {
        toastId: "captcha-error",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response: LoginResponse = await login({
        ...formData,
        recaptcha_token: recaptcha_token || "",
        remember_me: rememberMe,
      }).unwrap();

      

      // NOTE: Zendesk messenger "loginUser" requires JWT authentication to be
      // configured in Zendesk Admin > Messenger > Authentication (client_id).
      // Uncomment the block below only after that setup is complete.
      //
      // if (typeof window !== "undefined" && window.zE) {
      //   try {
      //     window.zE("messenger", "loginUser", (callback) => {
      //       callback({ email: response.response.user.email || formData.email });
      //     });
      //   } catch {
      //     // Zendesk login failed silently
      //   }
      // }




      toast.success("Login successful!");
      await flushPendingWishlist(response);
      router.push(redirectUrl || "/");
    } catch (err) {
      const error = err as { data?: { detail?: string; message?: string } };
      const errorMessage =
        error.data?.detail || error.data?.message || "An error occurred";

      if (errorMessage.includes("Account blocked")) {
        const timeMatch = errorMessage.match(/at\s+(.+)/);
        const blockUntilDate = timeMatch ? new Date(timeMatch[1]) : null;

        if (blockUntilDate && !Number.isNaN(blockUntilDate.getTime())) {
          const formattedTime = blockUntilDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const msg = `Account blocked. Try again at ${formattedTime}`;
          setIsBlocked(true);
          setBlockUntil(blockUntilDate);
          toast.error(msg);
        } else {
          toast.error("Account temporarily blocked. Try again later.");
        }
      } else if (errorMessage === "User Email Not Verified") {
        setShowResendEmail(true);
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowResendEmail(false);
    setCooldown(0);
  }, [formData.email]);


  if (checking) {
    return null;
  }

  return (
    <div className="container">
      <div className="user-form-wrapper flex flex-col gap-6">
        <h3 className="auth-title">Sign In</h3>

        <form onSubmit={handleSubmit(handleLoginSubmit)} noValidate>

          <div className="form-item">
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading || isBlocked}
              className="input-rounded"
            />
            {formErrors.email && (
              <p className="error">{formErrors.email}</p>
            )}
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
                disabled={isLoading || isBlocked}
                className="input-rounded"
              />

              <button type="button" onClick={togglePasswordVisibility} className="eyeIcon">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {formErrors.password && (
              <p className="error">{formErrors.password}</p>
            )}
          </div>

          <div className="password-content">
            <p>Your password must have:</p>
            <ul>
              <li>Must be 8-24 characters long</li>
              <li>Must include uppercase and lowercase letters, numbers plus at least one special character</li>
            </ul>
          </div>
          {process.env.NEXT_PUBLIC_ENV_VARIABLE === 'prod' && (
            <div className="form-item">
              <ReCaptcha onCaptchaChange={setRecaptcha_token} />
            </div>
          )}

          <div className="form-item form-item-radio">
            <input
              type="checkbox"
              id="remember_me"
              name="remember_me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading || isBlocked}
            />
            <label htmlFor="remember_me">Remember me</label>
          </div>

          <Button
            type="submit"
            className="btn btn-red btn-filled btn-sharp w-full"
            disabled={isLoading || isBlocked || isSubmitting}
            isLoading={isLoading || isSubmitting}
          >
            {isLoading ? "Logging in..." : "Sign In"}
          </Button>

          {showResendEmail && (
            <div className="resend-email-section">
              <p className="resend-email-text">
                Your email is not verified. Click below to resend verification email.
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
                    : "Resend Verification Email"
                }
              </Button>
            </div>
          )}

          <div className="dflex link auth-links-row">
            <Link href="/forgot-password">Forgot Password</Link>
            <p>
              New to ShopperBeats? <Link href="/sign-up">Sign Up</Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}


