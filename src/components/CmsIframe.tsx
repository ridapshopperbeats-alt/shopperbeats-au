"use client";

import { useEffect, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import type { ShadowDomContentProps } from "@/types/cms";


const RESIZE_MESSAGE_TYPE = "cms-iframe-resize";

export default function ShadowDomContent({ content }: ShadowDomContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data;
      if (!data || data.type !== RESIZE_MESSAGE_TYPE) return;
      const height = Number(data.height);
      if (!Number.isFinite(height) || height <= 0) return;
      iframe.style.height = `${height}px`;
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [content]);

  const safeDocument = DOMPurify.sanitize(content, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ["link"],
    ADD_ATTR: ["crossorigin"],
  });

  const nonce =
    typeof document !== "undefined"
      ? document.querySelector('meta[name="csp-nonce"]')?.getAttribute("content")
      : null;
  const nonceAttr = nonce ? ` nonce="${nonce}"` : "";

  const injectedHead = `
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="/vendor/tailwind-cdn.js"${nonceAttr}></script>
    <style>
      html, body, * {
        font-family: "Montserrat", sans-serif !important;
      }
      html, body {
        margin: 0;
        overflow: hidden;
      }
    </style>
    <script${nonceAttr}>
      (function () {
        function reportHeight() {
          var body = document.body;
          var html = document.documentElement;
          if (!body || !html) return;
          var height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.scrollHeight,
            html.offsetHeight
          );
          window.parent.postMessage(
            { type: "${RESIZE_MESSAGE_TYPE}", height: height },
            "*"
          );
        }
        var observer = new ResizeObserver(reportHeight);
        function start() {
          if (document.body) observer.observe(document.body);
          reportHeight();
        }
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", start);
        } else {
          start();
        }
        window.addEventListener("load", reportHeight);
        setTimeout(reportHeight, 100);
        setTimeout(reportHeight, 500);
        setTimeout(reportHeight, 1000);
      })();
    </script>`;

  const safeContent = safeDocument.includes("<head>")
    ? safeDocument.replace("<head>", `<head>${injectedHead}`)
    : `<html><head>${injectedHead}</head><body>${safeDocument}</body></html>`;

  return (
    <iframe
      key={content}
      ref={iframeRef}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation"
      scrolling="no"
      className="w-full border-0"
      style={{ minHeight: "300px" }}
      srcDoc={`<!doctype html>${safeContent}`}
    />
  );
}
