"use client";

import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "@/lib/stripe";

export default function StripeProvider({
  children,
  clientSecret,
}: {
  children: React.ReactNode;
  clientSecret: string;
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
}