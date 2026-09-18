"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReusableSliderProps, ReusableSliderRef, BreakpointConfig } from "@/types/ui";




function SliderComponent<T>(
  {
    items,
    renderItem,
    effect = "slide",
    slidesToShow = 5,
    speed = 600,
    autoplaySpeed = 0,
    infinite = true,
    arrows = true,
    pauseOnHover = true,
    centered = false,
    gap = 30,
    orientation = "horizontal",
    onSlideChange,
    keyExtractor,
    className = "",
    breakpoints,
    autoResponsive = false,
    slideClassName = "",
  }: ReusableSliderProps<T>,
  ref: React.Ref<ReusableSliderRef>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureSlideRef = useRef<HTMLDivElement | null>(null);

  const [containerSize, setContainerSize] = useState(0);
  const [measuredSlideSize, setMeasuredSlideSize] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const isVertical = orientation === "vertical";
  const isFade = effect === "fade";

  const axisProp = isVertical ? "clientHeight" : "clientWidth";

  const responsiveBreakpoints = useMemo(
    () =>
      breakpoints || {
        0: { slidesPerView: 1, spaceBetween: 12 },
        480: { slidesPerView: 2, spaceBetween: 14 },
        640: { slidesPerView: 2.5, spaceBetween: 16 },
        768: { slidesPerView: 3, spaceBetween: 18 },
        1024: { slidesPerView: 4, spaceBetween: 20 },
        1280: { slidesPerView: 5, spaceBetween: 24 },
        1536: { slidesPerView: slidesToShow, spaceBetween: gap },
      },
    [breakpoints, slidesToShow, gap],
  );

  const sortedBreakpointKeys = useMemo(
    () =>
      Object.keys(responsiveBreakpoints)
        .map(Number)
        .sort((a, b) => a - b),
    [responsiveBreakpoints],
  );

  const activeConfig: BreakpointConfig = useMemo(() => {
    let matched: BreakpointConfig = { slidesPerView: 1, spaceBetween: gap };

    for (const key of sortedBreakpointKeys) {
      if (containerSize >= key) {
        const entry = responsiveBreakpoints[key];
        matched = {
          slidesPerView: entry.slidesPerView ?? matched.slidesPerView,
          spaceBetween: entry.spaceBetween ?? matched.spaceBetween,
        };
      }
    }

    return matched;
  }, [containerSize, sortedBreakpointKeys, responsiveBreakpoints, gap]);

  const spaceBetween = autoResponsive ? gap : activeConfig.spaceBetween;

  const measuredSlidesPerView =
    containerSize > 0 && measuredSlideSize > 0
      ? containerSize / (measuredSlideSize + spaceBetween)
      : 1;

  const slidesPerView = isFade
    ? 1
    : autoResponsive
      ? measuredSlidesPerView
      : activeConfig.slidesPerView;

  // -----------------------------
  // MEASURE CONTAINER
  // -----------------------------

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateSize = () => setContainerSize(node[axisProp]);
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, [axisProp]);

  // -----------------------------
  // MEASURE RENDERED SLIDE (autoResponsive only)
  // -----------------------------

  useLayoutEffect(() => {
    if (!autoResponsive) return;
    const node = measureSlideRef.current;
    if (!node) return;

    const updateSlideSize = () =>
      setMeasuredSlideSize(isVertical ? node.offsetHeight : node.offsetWidth);
    updateSlideSize();

    const observer = new ResizeObserver(updateSlideSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, [autoResponsive, isVertical, containerSize]);

  // -----------------------------
  // LOOP / CLONES (slide effect only)
  // -----------------------------

  const isLoopEnabled = infinite && !isFade && items.length > slidesPerView;

  const cloneCount = isLoopEnabled
    ? Math.min(items.length, Math.ceil(slidesPerView) + 1)
    : 0;

  const slides = useMemo(() => {
    if (isFade || !isLoopEnabled) {
      return items.map((item, index) => ({ item, index, isClone: false }));
    }

    const head = items.slice(-cloneCount).map((item, i) => ({
      item,
      index: items.length - cloneCount + i,
      isClone: true,
    }));

    const tail = items.slice(0, cloneCount).map((item, i) => ({
      item,
      index: i,
      isClone: true,
    }));

    const main = items.map((item, index) => ({ item, index, isClone: false }));

    return [...head, ...main, ...tail];
  }, [items, isFade, isLoopEnabled, cloneCount]);

  const startIndex = isLoopEnabled ? cloneCount : 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTransitioning(false);
    setCurrent(startIndex);
    const raf = requestAnimationFrame(() => setIsTransitioning(true));
    return () => cancelAnimationFrame(raf);
  }, [startIndex, items.length, isFade]);

  // -----------------------------
  // SIZING
  // -----------------------------

  const slideSize = autoResponsive
    ? measuredSlideSize
    : slidesPerView > 0
      ? (containerSize - spaceBetween * (slidesPerView - 1)) / slidesPerView
      : containerSize;

  const centerOffset =
    centered && !isFade ? (containerSize - slideSize) / 2 : 0;

  const slideUnit = slideSize + spaceBetween;

  const maxOffsetPx =
    !isLoopEnabled && !isFade && slides.length > 0
      ? Math.max(0, slides.length * slideUnit - spaceBetween - containerSize)
      : Infinity;

  const rawOffsetPx = current * slideUnit;
  const clampedOffsetPx = Math.min(rawOffsetPx, maxOffsetPx);

  const trackOffset = -clampedOffsetPx + centerOffset;

  // -----------------------------
  // NAVIGATION
  // -----------------------------

  const goTo = useCallback((nextIndex: number, animate = true) => {
    setIsTransitioning(animate);
    setCurrent(nextIndex);
  }, []);

  const maxNonLoopCurrent = Math.max(
    0,
    Math.ceil(slides.length - slidesPerView),
  );

  const handleNext = useCallback(() => {
    if (isFade) {
      setCurrent((c) => {
        const next = c + 1;
        if (next >= items.length) return infinite ? 0 : c;
        return next;
      });
      return;
    }
    goTo(
      isLoopEnabled ? current + 1 : Math.min(current + 1, maxNonLoopCurrent),
    );
  }, [
    isFade,
    infinite,
    items.length,
    isLoopEnabled,
    current,
    maxNonLoopCurrent,
    goTo,
  ]);

  const handlePrev = useCallback(() => {
    if (isFade) {
      setCurrent((c) => {
        const prev = c - 1;
        if (prev < 0) return infinite ? items.length - 1 : c;
        return prev;
      });
      return;
    }
    goTo(isLoopEnabled ? current - 1 : Math.max(current - 1, 0));
  }, [isFade, infinite, items.length, isLoopEnabled, current, goTo]);

  const handleTransitionEnd = () => {
    if (!isLoopEnabled) return;

    if (current >= items.length + cloneCount) {
      goTo(current - items.length, false);
    } else if (current < cloneCount) {
      goTo(current + items.length, false);
    }
  };

  useEffect(() => {
    if (isTransitioning) return;
    const raf = requestAnimationFrame(() => setIsTransitioning(true));
    return () => cancelAnimationFrame(raf);
  }, [isTransitioning]);

  // -----------------------------
  // REF METHODS
  // -----------------------------

  useImperativeHandle(ref, () => ({
    goToSlide: (index: number) => {
      if (isFade) {
        setCurrent(Math.max(0, Math.min(items.length - 1, index)));
        return;
      }
      goTo(startIndex + index);
    },

    next: handleNext,

    prev: handlePrev,
  }));

  // -----------------------------
  // AUTOPLAY
  // -----------------------------

  useEffect(() => {
    if (!autoplaySpeed || autoplaySpeed <= 0) return;
    if (pauseOnHover && isHovered) return;

    const timer = setInterval(handleNext, autoplaySpeed);
    return () => clearInterval(timer);
  }, [autoplaySpeed, pauseOnHover, isHovered, handleNext]);

  // -----------------------------
  // SLIDE CHANGE CALLBACK
  // -----------------------------

  const lastReportedIndex = useRef<number | null>(null);

  useEffect(() => {
    const realIndex = isFade
      ? current
      : (((current - startIndex) % items.length) + items.length) % items.length;

    if (lastReportedIndex.current === realIndex) return;
    lastReportedIndex.current = realIndex;
    onSlideChange?.(realIndex, items[realIndex]);
  }, [current, startIndex, items, isFade, onSlideChange]);

  // -----------------------------
  // HOVER / AUTOPLAY PAUSE
  // -----------------------------

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // -----------------------------
  // DRAG / SWIPE
  // -----------------------------

  const dragState = useRef({ start: 0, dragging: false, delta: 0 });

  const getPoint = (e: React.PointerEvent) =>
    isVertical ? e.clientY : e.clientX;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isFade || slides.length <= slidesPerView) return;
    dragState.current = { start: getPoint(e), dragging: true, delta: 0 };
    setIsTransitioning(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const delta = getPoint(e) - dragState.current.start;
    dragState.current.delta = delta;
    setDragOffset(delta);
  };

  const endDrag = () => {
    if (!dragState.current.dragging) return;
    const { delta } = dragState.current;
    dragState.current.dragging = false;
    setDragOffset(0);
    setIsTransitioning(true);

    const threshold = slideSize / 4;
    if (delta <= -threshold) {
      handleNext();
    } else if (delta >= threshold) {
      handlePrev();
    }
  };

  // -----------------------------
  // NAV BUTTON DISABLED STATE
  // -----------------------------

  const canGoPrev = isFade
    ? infinite || current > 0
    : isLoopEnabled || current > 0;

  const canGoNext = isFade
    ? infinite || current < items.length - 1
    : isLoopEnabled || current < maxNonLoopCurrent;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-visible   ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="overflow-hidden select-none"
        style={{
          height: "100%",
          position: isFade ? "relative" : undefined,
          touchAction: isFade ? undefined : isVertical ? "pan-x" : "pan-y",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className="flex slider-track"
          style={{
            height: "100%",
            flexDirection: isVertical ? "column" : "row",
            gap: isFade ? undefined : `${spaceBetween}px`,
            transform: isFade
              ? undefined
              : `translate${isVertical ? "Y" : "X"}(${trackOffset + dragOffset}px)`,
            transition: isTransitioning ? `transform ${speed}ms ease` : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map(({ item, index, isClone }, i) => {
            const itemRecord = item as Record<string, unknown>;
            const itemKey = keyExtractor
              ? keyExtractor(item, index)
              : (itemRecord?.id as string | number | undefined) ||
                (itemRecord?._id as string | number | undefined) ||
                (itemRecord?.slug as string | number | undefined) ||
                (itemRecord?.url as string | number | undefined) ||
                `${index}-${isClone ? "clone" : "real"}`;

            const isActive = isFade && i === current;
            const isMeasureTarget =
              autoResponsive && !isFade && !isClone && index === 0;

            return (
              <div
                key={`${itemKey}-${i}`}
                ref={isMeasureTarget ? measureSlideRef : undefined}
                className={`h-full flex-shrink-0 ${
                  autoResponsive && !isFade ? slideClassName : ""
                }`}
                style={
                  isFade
                    ? {
                        position: "absolute",
                        inset: 0,
                        opacity: isActive ? 1 : 0,
                        transition: `opacity ${speed}ms ease`,
                        pointerEvents: isActive ? "auto" : "none",
                      }
                    : autoResponsive
                      ? undefined
                      : {
                          width: isVertical ? "100%" : `${slideSize}px`,
                          height: isVertical ? `${slideSize}px` : "100%",
                        }
                }
              >
                <div className="w-full h-full" style={{ height: "100%" }}>
                  {renderItem(item, index)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {arrows && !isFade && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="handlePrev !w-[30px] !h-[31px] bg-white border border-[#EAEAEA] shadow-[0_0_6px_0_rgba(0,0,0,0.15)] cursor-pointer disabled:cursor-not-allowed"
            disabled={!canGoPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="translate-x-[-2px]" size={20} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="handleNext !w-[30px] !h-[31px] bg-white border border-[#EAEAEA] shadow-[0_0_6px_0_rgba(0,0,0,0.15)] ml-20 cursor-pointer disabled:cursor-not-allowed"
            disabled={!canGoNext}
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}

const ReusableSlider = forwardRef(SliderComponent) as <T>(
  props: ReusableSliderProps<T> & {
    ref?: React.Ref<ReusableSliderRef>;
  },
) => React.ReactElement;

export default ReusableSlider;
