const formatDeliveryDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

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

  return `Estimated Delivery in  ${formatDeliveryDate(minDate)} - ${formatDeliveryDate(maxDate)}`;
};
