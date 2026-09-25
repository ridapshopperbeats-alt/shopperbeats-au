import type { BuildFilterTagsParams, FilterTag } from "@/types/product";

export function formatPriceRangeLabel(value: string): string {
  if (value === "200+") return "$200 and Above";
  if (value === "0-50") return "Under $50";
  const [min, max] = value.split("-");
  return min && max ? `$${min} to $${max}` : value;
}

export function buildFilterTags({
  selectedCategories,
  toggleSelectedCategory,
  selectedPrices,
  handlePriceChange,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  selectedFilters,
  handleFilterChange,
}: BuildFilterTagsParams): FilterTag[] {
  const tags: FilterTag[] = [];

  selectedCategories.forEach((cat) => {
    tags.push({
      key: `category-${cat}`,
      label: cat,
      onRemove: () => toggleSelectedCategory(cat),
    });
  });

  const customRangeKey =
    minPrice && maxPrice
      ? `${minPrice}-${maxPrice}`
      : minPrice
        ? `${minPrice}+`
        : maxPrice
          ? `0-${maxPrice}`
          : null;

  selectedPrices.forEach((price) => {
    tags.push({
      key: `price-${price}`,
      label: formatPriceRangeLabel(price),
      onRemove: () => {
        handlePriceChange(price);
        setMinPrice("");
        setMaxPrice("");
      },
    });
  });

  if ((minPrice || maxPrice) && !selectedPrices.includes(customRangeKey || "")) {
    tags.push({
      key: "price-range",
      label: `$${minPrice || 0} to $${maxPrice || "Any"}`,
      onRemove: () => {
        setMinPrice("");
        setMaxPrice("");
      },
    });
  }

  Object.entries(selectedFilters).forEach(([attribute, values]) => {
    values.forEach((value) => {
      tags.push({
        key: `${attribute}-${value}`,
        label: value,
        onRemove: () => handleFilterChange(attribute, value),
      });
    });
  });

  return tags;
}
