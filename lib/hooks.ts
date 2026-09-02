"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Paginated } from "@/lib/types";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
  reload: () => void;
  setData: (updater: T | ((prev: T | null) => T | null)) => void;
}

/**
 * Runs an async fetcher, tracking loading/error/data. Re-runs when any value in
 * `deps` changes. Aborts stale results so a fast tab-switch can't overwrite
 * fresh data with a slow earlier response.
 */
export function useAsync<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
  options: { enabled?: boolean } = {},
): AsyncState<T> {
  const enabled = options.enabled ?? true;
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<unknown>(null);
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  // Keep the latest fetcher without making it a dependency of the fetch effect
  // (callers pass inline closures). Declared before the fetch effect so the ref
  // is current when that effect runs in the same commit.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync loading when disabled
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(null);
    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (active) {
          setDataState(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!active || controller.signal.aborted) return;
        if ((err as Error)?.name === "AbortError") return;
        setError(err);
        setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, nonce, ...deps]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback(
    (updater: T | ((prev: T | null) => T | null)) =>
      setDataState((prev) =>
        typeof updater === "function" ? (updater as (p: T | null) => T | null)(prev) : updater,
      ),
    [],
  );

  return { data, loading, error, reload, setData };
}

/** Debounce a rapidly-changing value (e.g. a search box). */
export function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Convenience wrapper for a paginated list endpoint on a single page. */
export function usePaginated<T>(
  fetcher: (page: number, signal: AbortSignal) => Promise<Paginated<T>>,
  deps: unknown[],
) {
  const [page, setPage] = useState(1);
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    // Reset to the first page whenever the filter inputs change.
    setPage(1);
  }, deps);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  const state = useAsync((signal) => fetcher(page, signal), [page, ...deps]);
  return { ...state, page, setPage };
}
