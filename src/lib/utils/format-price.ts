export const formatPrice = (
  price: number | string | undefined | null
): string => {
  if (price === undefined || price === null || price === "") return "0";

  const numPrice =
    typeof price === "string" ? Number.parseFloat(price) : price;

  if (Number.isNaN(numPrice)) return "0";

  return numPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const formatPriceFixed2 = (
  price: number | string | undefined | null
): string => {
  return Number(price).toFixed(2);
};