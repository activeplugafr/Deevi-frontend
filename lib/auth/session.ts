/**
 * Session token storage. Kept deliberately tiny and separate from the API
 * client and React so both can import it without cycles.
 *
 * Tokens live in localStorage: this is a token-based (non-cookie) API, the app
 * is client-rendered, and the refresh token lets us restore sessions across
 * reloads. We store only tokens here — never profile data.
 */

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

const KEY = "deevi.session";
const listeners = new Set<() => void>();

let memory: StoredSession | null = null;

function read(): StoredSession | null {
  if (memory) return memory;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    memory = JSON.parse(raw) as StoredSession;
    return memory;
  } catch {
    return null;
  }
}

export function getSession(): StoredSession | null {
  return read();
}

export function setSession(session: StoredSession): void {
  memory = session;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage may be unavailable (private mode) — memory copy still works */
  }
  listeners.forEach((l) => l());
}

export function clearSession(): void {
  memory = null;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/** Subscribe to session changes (e.g. sign-out from another tab). */
export function onSessionChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
