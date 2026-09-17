/**
 * The jsdom environment here exposes window.localStorage as a bare object with
 * no Storage methods, so anything reading it throws. Install a minimal
 * in-memory Storage so the modules under test behave as they do in a browser.
 */
function createStorage(): Storage {
  let entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear: () => {
      entries = new Map();
    },
    getItem: (key: string) => entries.get(String(key)) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => {
      entries.delete(String(key));
    },
    setItem: (key: string, value: string) => {
      entries.set(String(key), String(value));
    },
  } satisfies Storage;
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  if (typeof window[name]?.setItem !== "function") {
    Object.defineProperty(window, name, {
      configurable: true,
      value: createStorage(),
    });
  }
}
