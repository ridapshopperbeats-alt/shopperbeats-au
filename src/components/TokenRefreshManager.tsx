"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { triggerSilentRefresh } from "@/lib/redux/apis/base-query";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 min

export default function TokenRefreshManager() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    const refresh = () => {
      triggerSilentRefresh(dispatch);
    };

    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", refresh);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", refresh);
    };
  }, [isAuthenticated, dispatch]);

  return null;
}
