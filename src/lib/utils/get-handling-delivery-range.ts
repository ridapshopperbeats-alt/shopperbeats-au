const addBusinessDays = (date: Date, days: number) => {
  const result = new Date(date);
  let added = 0;

  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();

    if (day !== 0 && day !== 6) added++;
  }

  return result;
};

const formatDeliveryDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const getHandlingDeliveryRange = (handlingDays: number) => {
  const today = new Date();
  const start = addBusinessDays(today, 1);
  const end = addBusinessDays(today, Math.max(handlingDays, 1));

  return `${formatDeliveryDate(start)} – ${formatDeliveryDate(end)}`;
};
