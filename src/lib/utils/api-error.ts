type ErrorPayload = {
  detail?: unknown;
  message?: unknown;
  error?: unknown;
  msg?: unknown;
};

const MAX_UNWRAP_DEPTH = 5;

function readMessage(value: unknown): string | null {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = readMessage(item);
      if (message) return message;
    }
    return null;
  }

  if (value && typeof value === "object") {
    const payload = value as ErrorPayload;
    return (
      readMessage(payload.detail) ||
      readMessage(payload.message) ||
      readMessage(payload.error) ||
      readMessage(payload.msg)
    );
  }

  return null;
}

function unwrapNestedDetail(message: string): string {
  let current = message;

  for (let depth = 0; depth < MAX_UNWRAP_DEPTH; depth += 1) {
    const start = current.indexOf("{");
    const end = current.lastIndexOf("}");
    if (start === -1 || end <= start) break;

    let parsed: unknown;
    try {
      parsed = JSON.parse(current.slice(start, end + 1));
    } catch {
      break;
    }

    const inner = readMessage(parsed);
    if (!inner || inner === current) break;

    current = inner;
  }

  return current;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const message = readMessage((err as { data?: unknown } | undefined)?.data);

  if (!message) return fallback;

  return unwrapNestedDetail(message) || fallback;
}
