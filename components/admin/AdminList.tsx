"use client";

import { Input } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/bits";
import { AsyncBoundary, EmptyState, SkeletonList } from "@/components/ui/states";
import { Pagination } from "@/components/ui/Pagination";
import { IconSearch } from "@/components/ui/icons";
import type { Paginated } from "@/lib/types";

/** Shared scaffolding for admin list screens: optional search + tabs + paged rows. */
export function AdminList<T>({
  state,
  page,
  onPage,
  renderRow,
  emptyTitle,
  emptyMessage,
  search,
  onSearch,
  searchPlaceholder = "Search…",
  tabs,
  tab,
  onTab,
}: {
  state: { data: Paginated<T> | null; loading: boolean; error: unknown; reload: () => void };
  page: number;
  onPage: (p: number) => void;
  renderRow: (item: T) => React.ReactNode;
  emptyTitle: string;
  emptyMessage?: string;
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  tabs?: { value: string; label: string }[];
  tab?: string;
  onTab?: (v: string) => void;
}) {
  const { data, loading, error, reload } = state;
  return (
    <div>
      {onSearch && (
        <div className="relative mb-3">
          <IconSearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={search ?? ""} onChange={(e) => onSearch(e.target.value)} placeholder={searchPlaceholder} className="pl-11" />
        </div>
      )}
      {tabs && tab != null && onTab && (
        <div className="mb-4">
          <Segmented options={tabs} value={tab} onChange={onTab} />
        </div>
      )}
      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton={<SkeletonList count={6} />}
        isEmpty={!!data && data.items.length === 0}
        empty={<EmptyState title={emptyTitle} message={emptyMessage} />}
      >
        <div className="space-y-2.5">{data?.items.map(renderRow)}</div>
        {data && <Pagination meta={data.meta} page={page} onPage={onPage} />}
      </AsyncBoundary>
    </div>
  );
}

/** Reads the first present key from an opaque record — for backend shapes swagger left as `object`. */
export function pick<T = unknown>(obj: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj[k] != null) return obj[k] as T;
  }
  return undefined;
}
