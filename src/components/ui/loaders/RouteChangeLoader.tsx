"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { pushLoader, popLoader } from "@/lib/redux/slices/loader-slice";

const SAFETY_TIMEOUT_MS = 25000;

function toAbsoluteUrl(href: string): string {
  return new URL(href, window.location.href).href;
}

function isSameHostname(a: string, b: string): boolean {
  const ua = new URL(toAbsoluteUrl(a));
  const ub = new URL(toAbsoluteUrl(b));
  return (
    ua.hostname.replace(/^www\./, "") === ub.hostname.replace(/^www\./, "")
  );
}

function isHashOnlyNavigation(a: string, b: string): boolean {
  const ua = new URL(toAbsoluteUrl(a));
  const ub = new URL(toAbsoluteUrl(b));
  return (
    ua.hostname === ub.hostname &&
    ua.pathname === ub.pathname &&
    ua.search === ub.search &&
    ua.hash !== ub.hash
  );
}

function findClosestAnchor(el: EventTarget | null): HTMLAnchorElement | null {
  let node = el as HTMLElement | null;
  while (node && node.tagName?.toLowerCase() !== "a") {
    node = node.parentElement;
  }
  return node as HTMLAnchorElement | null;
}

const INTERACTIVE_TAGS = new Set(["button", "input", "select", "textarea"]);

// True if a nested control (Add to Cart, wishlist toggle, quantity stepper,
// etc.) sits between the click target and the surrounding link — e.g. a
// product card wraps its whole layout in <Link>, with action buttons nested
// inside it. Those buttons call preventDefault()/stopPropagation() on click,
// but this listener is on `document` (the same node React's own delegated
// handler uses), so stopPropagation from a descendant never reaches it —
// only checking the DOM structure itself reliably tells the two apart.
function hasInteractiveControlBefore(
  target: EventTarget | null,
  anchor: HTMLAnchorElement,
): boolean {
  let node = target as HTMLElement | null;
  while (node && node !== anchor) {
    const tag = node.tagName?.toLowerCase();
    if (
      (tag && INTERACTIVE_TAGS.has(tag)) ||
      node.getAttribute?.("role") === "button"
    ) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}


export default function RouteChangeLoader() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const pendingRef = useRef(false);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstPathnameCommitRef = useRef(true);

  const complete = useCallback(() => {
    if (!pendingRef.current) return;
    pendingRef.current = false;
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dispatch(popLoader());
      });
    });
  }, [dispatch]);

  useEffect(() => {
    const start = () => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      dispatch(pushLoader());

      safetyTimerRef.current = setTimeout(() => {
        if (pendingRef.current) {
          pendingRef.current = false;
          dispatch(popLoader());
        }
      }, SAFETY_TIMEOUT_MS);
    };

    const handleClick = (e: MouseEvent) => {
      try {
        const anchor = findClosestAnchor(e.target);
        const href = anchor?.href;
        if (!anchor || !href) return;
        if (hasInteractiveControlBefore(e.target, anchor)) return;

        const currentUrl = window.location.href;
        const opensNewTab = anchor.target !== "";
        const isSpecialProtocol = ["tel:", "mailto:", "sms:", "blob:"].some(
          (protocol) => href.startsWith(protocol),
        );

        if (!isSameHostname(currentUrl, href)) return;
        if (
          href === currentUrl ||
          opensNewTab ||
          isSpecialProtocol ||
          isHashOnlyNavigation(currentUrl, href) ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }

        start();
      } catch {
      }
    };

    const handlePageHide = () => complete();

    document.addEventListener("click", handleClick);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("pagehide", handlePageHide);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      if (pendingRef.current) {
        pendingRef.current = false;
        dispatch(popLoader());
      }
    };
  }, [dispatch, complete]);

  // Complete only once the destination route has actually committed.
  // `usePathname()` updates when Next.js swaps in the new page's tree,
  // which only happens once that page's data is ready — unlike
  // history.pushState, which can fire while the transition is still in
  // flight and was popping the loader before the new page (e.g. a
  // product detail page's server-side data fetches) had actually
  // rendered.
  useEffect(() => {
    if (isFirstPathnameCommitRef.current) {
      isFirstPathnameCommitRef.current = false;
      return;
    }
    complete();
  }, [pathname, complete]);

  return null;
}
