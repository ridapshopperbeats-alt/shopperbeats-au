
const NAMED_COLOR_ALIASES: Record<string, string> = {
  grey: "#808080",
  slate: "#64748B",
  charcoal: "#36454F",
  clear: "#F2F2F2",
  copper: "#B87333",
  "rose gold": "#B76E79",
  blush: "#F4C2C2",
  ocean: "#1CA9C9",
  pistachio: "#93C572",
  stardust: "#A9A9A9",
  sunrise: "#FF9E42",
  watermelon: "#FC6C85",
  champagne: "#F7E7CE",
  gunmetal: "#2A3439",
  ivory: "#FFFFF0",
  cream: "#FFFDD0",
  beige: "#F5F5DC",
  rosegold: "#B76E79",
};

let probeEl: HTMLSpanElement | null = null;

function isValidCssColor(value: string): boolean {
  if (typeof document === "undefined") return false;
  if (!probeEl) probeEl = document.createElement("span");
  probeEl.style.color = "";
  probeEl.style.color = value;
  return probeEl.style.color !== "";
}

function hashToHsl(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 55%, 55%)`;
}

export function getSwatchColor(value: string): string {
  const key = value.trim().toLowerCase();
  if (NAMED_COLOR_ALIASES[key]) return NAMED_COLOR_ALIASES[key];

  const cssKeyword = key.replace(/\s+/g, "");
  if (isValidCssColor(cssKeyword)) return cssKeyword;
  if (isValidCssColor(key)) return key;

  return hashToHsl(key);
}
