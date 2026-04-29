// Browser storage helpers for app state.
// Handles old plain-string values as well as current JSON-encoded values.

export function safeRead<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      if (raw === "true") return true as T;
      if (raw === "false") return false as T;
      return raw as T;
    }
  } catch {
    return fallback;
  }
}

export function safeWrite(key: string, value: unknown): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function getFallbackPath(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const saved = params.get("sa_route");
    if (!saved) return null;
    const target = decodeURIComponent(saved);
    return target.startsWith("/") ? target : "/";
  } catch {
    return null;
  }
}

