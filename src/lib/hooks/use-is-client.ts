import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns `true` once the component has hydrated on the client, `false` during
 * server rendering and the initial client render (before hydration).
 *
 * This replaces the common `useState(false)` + `useEffect(() => setMounted(true), [])`
 * "mount detection" pattern, which triggers an avoidable extra render pass and is
 * flagged by the `react-hooks/set-state-in-effect` lint rule.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
