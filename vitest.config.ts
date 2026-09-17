import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// No React plugin: these suites exercise plain modules, and pulling it in
// drags a second copy of Vite's types into tsc --noEmit.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    environmentOptions: {
      // jsdom refuses localStorage on an opaque origin, which is what the
      // default about:blank document gives you.
      jsdom: { url: "http://localhost:3000" },
    },
  },
});
