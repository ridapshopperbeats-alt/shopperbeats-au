import { useState, useMemo, useCallback } from "react";
import { Variant } from "@/types/product";

type SelectedAttributes = Record<string, string>;

const getAllAttributeNames = (variants: Variant[]) => {
  const set = new Set<string>();
  variants.forEach(v =>
    v.attributes.forEach(a => set.add(a.name.toLowerCase()))
  );
  return Array.from(set);
};

export function useVariantSelection(variants: Variant[] = []) {
  const attributeNames = useMemo(
    () => getAllAttributeNames(variants),
    [variants]
  );

  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttributes>(() => {
    const attrs: SelectedAttributes = {};
    attributeNames.forEach(name => {
      const firstValue = variants
        .map(v => v.attributes.find(a => a.name.toLowerCase() === name)?.value)
        .filter(Boolean)[0];
      if (firstValue) attrs[name] = firstValue;
    });
    return attrs;
  });

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Keep `selectedVariant` derived from `selectedAttributes` (and `variants`).
  // This mirrors React's "adjust state during render" pattern instead of a
  // useEffect, so the derivation runs synchronously in the same render pass
  // rather than triggering an extra render via a setState-in-effect. `useState`
  // (rather than a ref) tracks the last-seen inputs, since refs may not be
  // read or written during render.
  const [lastDerivedAttributes, setLastDerivedAttributes] =
    useState(selectedAttributes);
  const [lastDerivedVariants, setLastDerivedVariants] = useState(variants);

  if (
    variants.length > 0 &&
    (lastDerivedAttributes !== selectedAttributes ||
      lastDerivedVariants !== variants)
  ) {
    setLastDerivedAttributes(selectedAttributes);
    setLastDerivedVariants(variants);

    const allSelected = Object.values(selectedAttributes).every(Boolean);
    const nextVariant = allSelected
      ? variants.find(variant =>
          variant.attributes.every(
            attr => selectedAttributes[attr.name.toLowerCase()] === attr.value
          )
        ) || null
      : null;

    if (nextVariant !== selectedVariant) {
      setSelectedVariant(nextVariant);
    }
  }

  const filteredAttributes = useMemo(() => {
    const options: Record<string, Array<{ value: string; stock: number | undefined }>> = {};

    attributeNames.forEach(attrName => {
      options[attrName] = [];

      const processedValues = new Set<string>(); 

      variants.forEach(variant => {
        const matchesOtherAttributes = Object.entries(selectedAttributes).every(
          ([key, value]) => {
            if (!value) return true;
            if (key === attrName) return true; 
            return variant.attributes.some(
              a => a.name.toLowerCase() === key && a.value === value
            );
          }
        );

        if (matchesOtherAttributes) {
          const attr = variant.attributes.find(a => a.name.toLowerCase() === attrName);
          if (attr && !processedValues.has(attr.value)) {
            options[attrName].push({ value: attr.value, stock: variant.stock });
            processedValues.add(attr.value);
          }
        }
      });
    });

    return options;
  }, [variants, selectedAttributes, attributeNames]);

  const handleAttributeChange = useCallback(
    (attrName: string, attrValue: string) => {
      const next = { ...selectedAttributes, [attrName]: attrValue };

      attributeNames.forEach(name => {
        if (name === attrName) return;

        const validValues = variants
          .filter(v =>
            Object.entries(next).every(([k, v2]) =>
              !v2 || v.attributes.some(a => a.name.toLowerCase() === k && a.value === v2)
            )
          )
          .map(v => v.attributes.find(a => a.name.toLowerCase() === name)?.value)
          .filter(Boolean) as string[];

        if (!validValues.includes(next[name])) {
          next[name] = "";
        }
      });

      setSelectedAttributes(next);
    },
    [selectedAttributes, variants, attributeNames]
  );

  const resetAttributes = useCallback(() => {
    const reset: SelectedAttributes = {};
    attributeNames.forEach(name => (reset[name] = ""));
    setSelectedAttributes(reset);
  }, [attributeNames]);

  return {
    attributeNames,
    selectedAttributes,
    selectedVariant,
    filteredAttributes,
    handleAttributeChange,
    resetAttributes,
    setSelectedVariant,
    setSelectedAttributes
  };
}
