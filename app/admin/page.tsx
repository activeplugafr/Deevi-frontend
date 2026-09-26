"use client";

import Link from "next/link";
import { adminApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { Card } from "@/components/ui/primitives";
import { AsyncBoundary } from "@/components/ui/states";
import { WorkspaceHeader, StatTile } from "@/components/ui/patterns";
import { Skeleton } from "@/components/ui/states";
import { humanize } from "@/lib/format";
import { IconShield, IconFlag, IconBriefcase, IconUsers } from "@/components/ui/icons";

/** Flatten one level of the opaque metrics object into label/number tiles. */
function toTiles(metrics: Record<string, unknown> | null): { label: string; value: number }[] {
  if (!metrics) return [];
  const tiles: { label: string; value: number }[] = [];
  const walk = (obj: Record<string, unknown>, prefix = "") => {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "number") tiles.push({ label: humanize(prefix ? `${prefix} ${k}` : k), value: v });
      else if (v && typeof v === "object" && !Array.isArray(v)) walk(v as Record<string, unknown>, k);
    }
  };
  walk(metrics);
  return tiles;
}

const QUICK_LINKS = [
  { href: "/admin/verification", label: "Verification queue", icon: IconShield, desc: "Review artisan applications" },
  { href: "/admin/reports", label: "Reports", icon: IconFlag, desc: "Investigate flagged issues" },
  { href: "/admin/jobs", label: "Jobs", icon: IconBriefcase, desc: "Oversee marketplace jobs" },
  { href: "/admin/users", label: "Users", icon: IconUsers, desc: "Manage customers & artisans" },
];

export default function AdminDashboard() {
  const { data, loading, error, reload } = useAsync(
    () => adminApi.metrics() as Promise<Record<string, unknown>>,
    [],
  );
  const tiles = toTiles(data ?? null);

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Operations Overview"
        title="Operations dashboard"
        description="Marketplace health at a glance."
      />

      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton={
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        }
      >
        {tiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {tiles.map((t) => (
              <StatTile key={t.label} label={t.label} value={t.value.toLocaleString()} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-sm text-muted">No metrics available right now.</Card>
        )}
      </AsyncBoundary>

      <h2 className="mb-3 mt-8 text-base font-semibold text-ink">Jump to</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {QUICK_LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="flex items-center gap-3 p-4 transition hover:border-brand-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <l.icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-ink">{l.label}</p>
                <p className="text-xs text-muted">{l.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
