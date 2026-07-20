export {};

declare global {
  interface Window {
    google?: typeof google & {
      grecaptcha: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options?: { action: string }) => Promise<string>;
      };
    };
    lenisInstance?: {
      scrollTo: (target: string | number | HTMLElement, options?: Record<string, unknown>) => void;
      stop: () => void;
      start: () => void;
    };
  }
}

declare module '*.css';
