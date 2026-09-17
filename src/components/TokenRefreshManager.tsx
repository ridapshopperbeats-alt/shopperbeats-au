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

    const scheduleNextRefresh = (token: string | null) => {
      if (cancelled) return;
      const msUntilExpiry = token ? getMsUntilExpiry(token) : null;

      const delay =
        msUntilExpiry === null
          ? FALLBACK_INTERVAL_MS
          : Math.max(msUntilExpiry - REFRESH_MARGIN_MS, 0);

      timeoutId = setTimeout(async () => {
        // Wait for the refresh to actually land before scheduling the next
        // one off its result — using the pre-refresh token here (via a
        // ref updated by a later effect) raced ahead of the dispatch and
        // scheduled a second refresh almost immediately, which then hit
        // the backend with an already-rotated/invalidated refresh token.
        const result = await triggerSilentRefresh(dispatch);
        if (cancelled) return;
        scheduleNextRefresh(result.accessToken ?? accessTokenRef.current);
      }, delay);
    };

    scheduleNextRefresh(accessTokenRef.current);

    const refreshIfStale = () => {
      const token = accessTokenRef.current;
      const msUntilExpiry = token ? getMsUntilExpiry(token) : null;
      if (msUntilExpiry === null || msUntilExpiry < MIN_REMAINING_MS_TO_SKIP) {
        triggerSilentRefresh(dispatch);
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
