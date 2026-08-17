"use client";

import { useEffect, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";

interface ShadowDomContentProps {
  content: string;
}

export default function ShadowDomContent({ content }: ShadowDomContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const resize = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const body = doc.body;
      const html = doc.documentElement;

      if (!body || !html) return;

      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      iframe.style.height = `${height + 0}px`;
    };

    const observer = new ResizeObserver(resize);
    const observeBody = () => {
      if (iframe.contentDocument?.body) {
        observer.observe(iframe.contentDocument.body);
      }
    };

    observeBody();

    const timers = [
      setTimeout(resize, 100),
      setTimeout(resize, 500),
      setTimeout(resize, 1000),
    ];

    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [content]);

  const safeDocument = DOMPurify.sanitize(content, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ["link"],
    ADD_ATTR: ["crossorigin"],
  });

  const injectedHead = `
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      html, body, * {
        font-family: "Montserrat", sans-serif !important;
      }
      html, body {
        margin: 0;
        overflow: hidden;
      }
    </style>`;

  const safeContent = safeDocument.includes("<head>")
    ? safeDocument.replace("<head>", `<head>${injectedHead}`)
    : `<html><head>${injectedHead}</head><body>${safeDocument}</body></html>`;

  return (
    <iframe
      key={content}
      ref={iframeRef}
      onLoad={() => {
        const iframe = iframeRef.current;
        if (iframe) {
          const doc = iframe.contentDocument;
          if (doc) {
            const body = doc.body;
            const html = doc.documentElement;
            if (body && html) {
              const height = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.scrollHeight,
                html.offsetHeight
              );
              iframe.style.height = `${height + 0}px`;
            }
          }
        }
      }}
      scrolling="no"
      className="w-full border-0"
      style={{ minHeight: "300px" }}
      srcDoc={`<!doctype html>${safeContent}`}
    />
  );
}
