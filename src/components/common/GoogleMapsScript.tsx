"use client";

import Script from "next/script";

/**
 * Rendered by the components that actually read `window.google`, so the ~312 KiB
 * Maps payload is fetched when an address field appears rather than on every
 * page. Next dedupes concurrent mounts by id.
 *
 * No nonce: the CSP allowlists https://maps.googleapis.com by host and sets no
 * 'strict-dynamic', which is also what lets Maps pull its own sub-bundles.
 */
export default function GoogleMapsScript() {
  return (
    <Script
      id="google-maps-places"
      src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&v=beta&loading=async`}
      strategy="afterInteractive"
    />
  );
}
