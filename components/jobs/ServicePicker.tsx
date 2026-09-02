"use client";

import { useState } from "react";
import { catalogueApi } from "@/lib/api";
import { useAsync, useDebounced } from "@/lib/hooks";
import { Input } from "@/components/ui/primitives";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

export interface PickedService {
  serviceId: string;
  serviceName: string;
}

/** Search + browse the live catalogue to pick a single service. */
export function ServicePicker({
  value,
  onChange,
}: {
  value: PickedService | null;
  onChange: (v: PickedService) => void;
}) {
  const [q, setQ] = useState("");
  const debounced = useDebounced(q, 300);
  const { data, loading } = useAsync(
    () =>
      debounced.trim().length >= 2
        ? catalogueApi.services({ q: debounced.trim(), limit: 12 })
        : catalogueApi.services({ limit: 30 }),
    [debounced],
  );

  return (
    <div className="space-y-3">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search services (e.g. plumbing, makeup, moving)"
        aria-label="Search services"
      />
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-muted">
          <Spinner size={16} /> Loading services…
        </div>
      ) : (
        <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto scroll-slim sm:grid-cols-2">
          {data?.items.map((s) => {
            const selected = value?.serviceId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ serviceId: s.id, serviceName: s.name })}
                className={cn(
                  "rounded-lg border p-3 text-left transition",
                  selected
                    ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                    : "border-line bg-surface hover:border-brand-200",
                )}
              >
                <p className="text-sm font-semibold text-ink">{s.name}</p>
                {s.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">{s.description}</p>
                )}
              </button>
            );
          })}
          {data && data.items.length === 0 && (
            <p className="col-span-full py-4 text-sm text-muted">No services matched that search.</p>
          )}
        </div>
      )}
    </div>
  );
}
