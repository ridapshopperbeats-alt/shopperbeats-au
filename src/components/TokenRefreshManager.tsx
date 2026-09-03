"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { triggerSilentRefresh } from "@/lib/redux/apis/base-query";
import { getMsUntilExpiry } from "@/lib/utils/jwt";


const FALLBACK_INTERVAL_MS = 10 * 60 * 1000;
const REFRESH_MARGIN_MS = 60 * 1000;
const MIN_REMAINING_MS_TO_SKIP = 2 * 60 * 1000;

export default function TokenRefreshManager() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const accessTokenRef = useRef(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const refresh = () => {
      triggerSilentRefresh(dispatch);
    };

    const scheduleNextRefresh = () => {
      if (cancelled) return;
      const token = accessTokenRef.current;
      const msUntilExpiry = token ? getMsUntilExpiry(token) : null;

      const delay =
        msUntilExpiry === null
          ? FALLBACK_INTERVAL_MS
          : Math.max(msUntilExpiry - REFRESH_MARGIN_MS, 0);

      timeoutId = setTimeout(() => {
        refresh();
        scheduleNextRefresh();
      }, delay);
    };

    scheduleNextRefresh();

    const refreshIfStale = () => {
      const token = accessTokenRef.current;
      const msUntilExpiry = token ? getMsUntilExpiry(token) : null;
      if (msUntilExpiry === null || msUntilExpiry < MIN_REMAINING_MS_TO_SKIP) {
        refresh();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshIfStale();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", refreshIfStale);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", refreshIfStale);
    };
  }, [isAuthenticated, dispatch]);

  return null;
}
