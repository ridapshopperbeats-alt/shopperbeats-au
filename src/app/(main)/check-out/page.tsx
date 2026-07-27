"use client";

import SecureCheckout from "@/components/pages/CheckoutPage";
import stripePromise from "@/lib/stripe";
import { Elements } from "@stripe/react-stripe-js";
import React, { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Elements stripe={stripePromise}>
        <SecureCheckout />
      </Elements>
    </Suspense>
  );
}
