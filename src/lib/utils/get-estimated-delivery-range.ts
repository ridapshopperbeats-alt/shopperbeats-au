import { getHandlingDeliveryRange } from "./get-handling-delivery-range";

const getEstimatedDeliveryRange = (
  handlingTimeDays: number,
  handlingTimeMaxDays?: number | null,
) => getHandlingDeliveryRange(handlingTimeDays, handlingTimeMaxDays);

export default getEstimatedDeliveryRange;
