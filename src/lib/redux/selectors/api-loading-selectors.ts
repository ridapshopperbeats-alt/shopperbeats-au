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

interface RTKQueryEntry {
  status?: string;
  data?: unknown;
}

export function selectHasPrimaryQueryLoading(state: RootState): boolean {
  return API_REDUCER_PATHS.some((reducerPath) => {
    const apiState = (state as unknown as Record<string, { queries?: Record<string, RTKQueryEntry> }>)[
      reducerPath
    ];
    const queries = apiState?.queries;
    if (!queries) return false;

    return Object.values(queries).some(
      (query) => query?.status === "pending" && query?.data === undefined,
    );
  });
}
