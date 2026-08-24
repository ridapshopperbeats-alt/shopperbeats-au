import { getHandlingDeliveryRange } from "./get-handling-delivery-range";

// Thin wrapper kept for call sites already importing this name — the
// calculation itself lives in get-handling-delivery-range.ts so every
// "delivery date" display in the app (product card, PDP, cart) uses the
// exact same handling_time_days / handling_time_max_days logic.
const getEstimatedDeliveryRange = (
  handlingTimeDays: number,
  handlingTimeMaxDays?: number | null,
) => getHandlingDeliveryRange(handlingTimeDays, handlingTimeMaxDays);

export default getEstimatedDeliveryRange;
