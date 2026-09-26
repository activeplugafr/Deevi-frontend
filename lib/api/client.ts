/**
 * The single HTTP layer for the Deevi frontend.
 *
 * - Talks to the backend via the same-origin `/bff` proxy (see next.config.ts),
 *   so there is no CORS and the backend URL stays server-side.
 * - Attaches the Bearer access token from the session store.
 * - On a 401 it transparently refreshes the session once and retries.
 * - Normalises every failure into ApiError / NetworkError so callers never see
 *   a raw response object.
 */

import { ApiError, NetworkError, type ApiErrorBody } from "@/lib/errors";
import { getSession, setSession, clearSession, type StoredSession } from "@/lib/auth/session";

// const BASE = "/bff/api/v1";

// const BASE = "https://deevi-backend.onrender.com/api/v1";

const BASE = process.env.NEXT_PUBLIC_DEEVI_API_URL;

console.log(BASE, "BASE")



type Query = Record<string, unknown>;

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Query;
  auth?: boolean; // attach bearer token (default true)
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Query): string {
  // const url = path.startsWith("/bff") ? path : `${BASE}${path}`;
  const url = path.startsWith("/bff") ? path : `${BASE}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => v != null && params.append(key, String(v)));
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

let refreshInFlight: Promise<StoredSession | null> | null = null;

/** Exchange the refresh token for a fresh session. De-duplicated across calls. */
async function refreshSession(): Promise<StoredSession | null> {
  const current = getSession();
  if (!current?.refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: current.refreshToken }),
        });
        if (!res.ok) {
          clearSession();
          return null;
        }
        const data = await res.json();
        const session = data.session ?? data;
        if (!session?.accessToken) {
          clearSession();
          return null;
        }
        const stored: StoredSession = {
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? current.refreshToken,
          expiresAt: session.expiresAt ?? current.expiresAt,
        };
        setSession(stored);
        return stored;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    body = {
      statusCode: res.status,
      code: `HTTP_${res.status}`,
      message: res.statusText || "Request failed",
      path: res.url,
    };
  }
  if (typeof body.statusCode !== "number") body.statusCode = res.status;
  if (!body.code) body.code = `HTTP_${res.status}`;
  return new ApiError(body);
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true, signal } = opts;
  const url = buildUrl(path, query);

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth) {
      const session = getSession();
      if (session?.accessToken) headers["Authorization"] = `Bearer ${session.accessToken}`;
    }
    try {
      return await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
        cache: "no-store",
      });
    } catch (e) {
      if ((e as Error)?.name === "AbortError") throw e;
      throw new NetworkError();
    }
  };

  let res = await doFetch();

  // Transparent single refresh-and-retry on auth expiry.
  if (res.status === 401 && auth && getSession()?.refreshToken) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await doFetch();
    }
  }

  if (res.status === 204) return undefined as T;
  if (!res.ok) throw await parseError(res);

  // Some endpoints (logout) return empty bodies with 200/201.
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const http = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) =>
    request<T>(path, { method: "GET", query, signal }),
  post: <T>(path: string, body?: unknown, query?: Query) =>
    request<T>(path, { method: "POST", body, query }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  del: <T>(path: string, body?: unknown) => request<T>(path, { method: "DELETE", body }),
  // Public (no bearer) — used for auth + catalogue browsing before login.
  publicGet: <T>(path: string, query?: Query, signal?: AbortSignal) =>
    request<T>(path, { method: "GET", query, auth: false, signal }),
  publicPost: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body, auth: false }),
};
