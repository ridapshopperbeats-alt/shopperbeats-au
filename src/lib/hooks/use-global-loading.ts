"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { selectHasPrimaryQueryLoading } from "@/lib/redux/selectors/api-loading-selectors";

const SHOW_DELAY_MS = 150;
const MIN_VISIBLE_MS = 500;

// Last-resort escape hatch for a request that never settles — not a cap on how
// long a slow response may take. It has to sit well above any realistic server
// render (and above RouteChangeLoader's own 25s safety), otherwise the overlay
// disappears while filtered results are still on the wire and the grid swaps in
// silently a moment later.
const SAFETY_TIMEOUT_MS = 30000;

export function useGlobalLoading(): boolean {
  const routeLoaderCount = useSelector(
    (state: RootState) => state.loader.count,
  );
  const hasPrimaryQueryLoading = useSelector(selectHasPrimaryQueryLoading);
  const isActive = routeLoaderCount > 0 || hasPrimaryQueryLoading;

  const [visible, setVisible] = useState(isActive);
  const visibleRef = useRef(isActive);
  const shownAtRef = useRef<number>(0);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const isFirstRun = !hasMountedRef.current;

    if (isFirstRun) {
      hasMountedRef.current = true;
      shownAtRef.current = Date.now();
    }

    if (isActive) {
      if (!isFirstRun && !visibleRef.current) {
        timer = setTimeout(() => {
          shownAtRef.current = Date.now();
          visibleRef.current = true;
          setVisible(true);
        }, SHOW_DELAY_MS);
      }
    } else if (visibleRef.current) {
      const elapsed = Date.now() - shownAtRef.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

      timer = setTimeout(() => {
        visibleRef.current = false;
        setVisible(false);
      }, remaining);
    }

    return () => clearTimeout(timer);
  }, [isActive]);

  useEffect(() => {
    if (!visible) return;

    const maxTimer = setTimeout(() => {
      visibleRef.current = false;
      setVisible(false);
    }, SAFETY_TIMEOUT_MS);

    return () => clearTimeout(maxTimer);
  }, [visible]);

  return visible;
}
