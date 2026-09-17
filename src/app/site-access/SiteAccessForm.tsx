"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { SITE_LOCK_API_PATH } from "@/lib/utils/site-lock";

/** Only allow same-origin, single-slash paths back from ?redirect=. */
function safeRedirect(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default function SiteAccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!password.trim()) {
      setError("Please enter the password.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(SITE_LOCK_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setError(data?.message || "Incorrect password. Please try again.");
        setPassword("");
        setIsSubmitting(false);
        return;
      }

      const target = safeRedirect(searchParams.get("redirect"));
      router.replace(target);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sb-gray px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-sb-white p-8 shadow-lg sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo.svg"
            alt="ShopperBeats"
            width={180}
            height={40}
            priority
          />

          <h1 className="mt-6 text-2xl font-semibold text-sb-charcoal">
            Enter the password
          </h1>
          <p className="mt-2 text-sm text-sb-gray-mid">
            This site is password protected. Please enter the password to
            continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
          <div>
            <label
              htmlFor="site-access-password"
              className="mb-1.5 block text-sm font-medium text-sb-charcoal"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="site-access-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                autoFocus
                placeholder="Enter password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full rounded-lg border border-sb-gray-light bg-sb-white px-4 py-3 pr-11 text-sm text-sb-charcoal outline-none focus:border-sb-red"
              />

              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-sb-gray-dark"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-sm text-sb-red" role="alert">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer rounded-lg bg-sb-red py-3 text-sm font-semibold text-sb-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Verifying..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
