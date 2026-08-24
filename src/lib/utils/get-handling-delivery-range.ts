const formatDeliveryDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

// Computes the delivery date range from a product's handling-time window:
// minimum date = today + handling_time_days, maximum date = today +
// handling_time_max_days. Collapses to a single date when both resolve to
// the same day (equal min/max, or a missing max falling back to min).
export const getHandlingDeliveryRange = (
  handlingTimeDays: number,
  handlingTimeMaxDays?: number | null,
): string => {
  const minDays = handlingTimeDays;
  const maxDays = handlingTimeMaxDays ?? handlingTimeDays;

  const today = new Date();

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + minDays);

  if (maxDays === minDays) {
    return formatDeliveryDate(minDate);
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDays);

  return `${formatDeliveryDate(minDate)} - ${formatDeliveryDate(maxDate)}`;
};
