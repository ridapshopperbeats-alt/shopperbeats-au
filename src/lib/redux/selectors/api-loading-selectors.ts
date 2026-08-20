import type { RootState } from "../store";

const API_REDUCER_PATHS = [
  "productsApi",
  "highlightsApi",
  "authApi",
  "cartApi",
  "orderApi",
  "helpdeskApi",
  "addressApi",
  "marketingApi",
  "paymentApi",
  "vendorApi",
  "faqApi",
  "geocodeApi",
] as const;

const BACKGROUND_ENDPOINTS: Partial<Record<(typeof API_REDUCER_PATHS)[number], string[]>> = {
  cartApi: ["getWishlist", "getCart"],
  authApi: ["getSocialMediaLinks"],
  geocodeApi: ["reverseGeocode"],
};

interface RTKQueryEntry {
  status?: string;
  data?: unknown;
  endpointName?: string;
}

export function selectHasPrimaryQueryLoading(state: RootState): boolean {
  return API_REDUCER_PATHS.some((reducerPath) => {
    const apiState = (state as unknown as Record<string, { queries?: Record<string, RTKQueryEntry> }>)[
      reducerPath
    ];
    const queries = apiState?.queries;
    if (!queries) return false;

    const backgroundEndpoints = BACKGROUND_ENDPOINTS[reducerPath] ?? [];

    return Object.values(queries).some(
      (query) =>
        query?.status === "pending" &&
        query?.data === undefined &&
        !(query?.endpointName && backgroundEndpoints.includes(query.endpointName)),
    );
  });
}
