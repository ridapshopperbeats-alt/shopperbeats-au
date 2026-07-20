"use client";
import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface AccordionItem {
  title: string | React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
  id: string;
}

interface AccordionProps {
  items: AccordionItem[];
  variation?: 1 | 2;
  onOpenChange?: (openItems: boolean[]) => void;
  forceOpenCount?: number;
  independent?: boolean;
}

const Accordion = ({
  items,
  variation = 1,
  onOpenChange,
  forceOpenCount,
  independent = false,
}: AccordionProps) => {
  const [openItems, setOpenItems] = useState(
    items.map((item) => !!item.defaultOpen),
  );
  const [hasAppliedForceOpen, setHasAppliedForceOpen] = useState(false);
  const prevItemIdsRef = useRef(items.map((item) => item.id));

  useEffect(() => {
    const currentIds = items.map((item) => item.id);
    const idsChanged =
      currentIds.length !== prevItemIdsRef.current.length ||
      currentIds.some((id, i) => id !== prevItemIdsRef.current[i]);

    if (!idsChanged) return;
    prevItemIdsRef.current = currentIds;
    setOpenItems((prev) =>
      items.map((item, i) => item.defaultOpen || prev[i] || false),
    );
  }, [items]);

  // Adjust state during render (React's documented pattern) instead of in an
  // effect: apply the initial forceOpenCount exactly once, tracked via state
  // (not a ref, since ref reads/writes aren't allowed during render), without
  // an extra effect-triggered render pass.
  if (!hasAppliedForceOpen && forceOpenCount !== undefined) {
    setHasAppliedForceOpen(true);
    if (forceOpenCount > 0) {
      setOpenItems((prev) =>
        prev.map((isOpen, i) => isOpen || i < forceOpenCount),
      );
    }
  }

  useEffect(() => {
    onOpenChange?.(openItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openItems]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.map((isOpen, i) => {
        if (i === index) return !isOpen;
        return independent ? isOpen : false;
      }),
    );
  };

  if (variation === 2) {
    return (
      <div className="w-full">
        {items.map((item, index) => (
          <div key={item.id} className="-mx-7 lg:-mx-4 border-b border-[#ECECEC]">
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => toggleItem(index)}
                aria-expanded={openItems[index]}
                className="flex w-full items-center justify-between px-5 py-3 text-left font-medium text-[14px] md:text-[16px] cursor-pointer"
              >
                <span>{item.title}</span>

                <ChevronDown
                  size={20}
                  strokeWidth={2}
                  className={`shrink-0 transition-all duration-500 ease-in-out ${
                    openItems[index] ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
            </h3>

            <div
              className={`grid transition-all duration-500 ease-in-out ${
                openItems[index]
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-4 pt-2">{item.content}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="sticky top-0 h-full w-full overflow-hidden ">
      {items.map((item, index) => {
        const isOpen = openItems[index];

        return (
          <div
            key={item.id}
            className="border-b border-[#d8d8d8] cursor-pointer"
            onClick={() => toggleItem(index)}
            aria-expanded={isOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                toggleItem(index);
              }
            }}
          >
            <div className="w-full flex items-center justify-between px-5 lg:px-0">
              <h3 className="text-[16px] text-[#333333] font-medium lg:font-semibold leading-[18px] py-3">
                {item.title}
              </h3>

              <span
                className={`text-[16px] font-medium text-black transition-all duration-500 ease-in-out ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                {isOpen ? "−" : "+"}
              </span>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 lg:px-0 pb-4">
                <div
                  className={`w-full overflow-y-auto overscroll-contain flex flex-col gap-3 items-start text-left ${
                    item.id === "price"
                      ? "h-auto max-h-none overflow-visible"
                      : "h-[294px] max-h-[210px]"
                  }`}
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                >
                  {Array.isArray(item.content) ? (
                    item.content.map((subItem, subIndex) => (
                      <div
                        key={subIndex}
                        className="w-full text-left pl-0 ml-0 text-[14px] font-medium !text-[#000000]/56 leading-[20px] hover:text-black transition-colors duration-200"
                      >
                        {subItem}
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-left ">{item.content}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
