"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { pushLoader, popLoader } from "@/lib/redux/slices/loader-slice";

export default function DynamicImportLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(pushLoader());
    return () => {
      dispatch(popLoader());
    };
  }, [dispatch]);

  return null;
}
