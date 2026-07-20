// Falls back to the production domain when NEXT_PUBLIC_SITE_URL isn't set,
// so behavior is unchanged for existing deployments that haven't added it
// yet — but staging/preprod can now emit correct canonicals by setting it.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shopperbeats.com";
