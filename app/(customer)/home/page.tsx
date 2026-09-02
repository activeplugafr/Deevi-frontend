"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { catalogueApi, jobsApi } from "@/lib/api";
import { useAsync, useDebounced } from "@/lib/hooks";
import { useAuth } from "@/lib/auth/context";
import { Card } from "@/components/ui/primitives";
import { Input } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { JobStatusBadge } from "@/components/ui/bits";
import { IconSearch, IconChevronRight, IconWrench, IconScissors, IconTruck, IconGrid } from "@/components/ui/icons";
import { timeAgo } from "@/lib/format";
import type { CategoryGroup } from "@/lib/types";

const GROUP_META: Record<CategoryGroup, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  HOME_REPAIR: { label: "Home & repair", icon: IconWrench },
  PERSONAL: { label: "Personal & beauty", icon: IconScissors },
  MOBILITY: { label: "Moving & delivery", icon: IconTruck },
  GENERAL: { label: "More services", icon: IconGrid },
};

export default function CustomerHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 300);

  const { data: tree, loading: treeLoading } = useAsync(() => catalogueApi.tree(), []);
  const { data: results, loading: searching } = useAsync(
    () =>
      debounced.trim().length >= 2
        ? catalogueApi.services({ q: debounced.trim(), limit: 8 })
        : Promise.resolve(null),
    [debounced],
  );
  const { data: recent } = useAsync(() => jobsApi.mine({ limit: 3 }), []);

  function goToJob(serviceId: string, serviceName: string) {
    const params = new URLSearchParams({ serviceId, serviceName });
    if (query.trim()) params.set("title", query.trim());
    router.push(`/jobs/new?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Hero prompt */}
      <section className="rounded-2xl bg-brand-600 px-5 py-6 text-white sm:px-7 sm:py-8">
        <h1 className="text-xl font-bold sm:text-2xl">
          Hi{user?.firstName ? `, ${user.firstName}` : ""} — what do you need help with?
        </h1>
        <p className="mt-1 text-sm text-brand-100">
          Describe it in your own words. We&apos;ll match you with the right artisans.
        </p>
        <div className="relative mt-4">
          <IconSearch size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. fix my leaking kitchen pipe"
            className="h-12 pl-11 text-base"
            aria-label="Describe what you need"
          />
          {/* Search results dropdown */}
          {debounced.trim().length >= 2 && (
            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
              {searching ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
                  <Spinner size={16} /> Searching…
                </div>
              ) : results && results.items.length > 0 ? (
                results.items.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => goToJob(s.id, s.name)}
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-ink hover:bg-canvas"
                  >
                    <span className="text-sm font-medium">{s.name}</span>
                    <IconChevronRight size={16} className="text-muted" />
                  </button>
                ))
              ) : (
                <div className="px-4 py-3">
                  <p className="text-sm text-ink-soft">
                    No exact match — you can still post it and describe it freely.
                  </p>
                  <Link href="/jobs/new" className="mt-1 inline-block text-sm font-semibold text-brand-600">
                    Post this job →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Browse categories */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Browse services</h2>
          <LinkButton href="/jobs/new" size="sm" variant="subtle">
            Post a job
          </LinkButton>
        </div>
        {treeLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {(Object.keys(GROUP_META) as CategoryGroup[]).map((group) => {
              const cats = (tree ?? []).filter((c) => c.group_key === group);
              if (cats.length === 0) return null;
              const Meta = GROUP_META[group];
              return (
                <div key={group}>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-soft">
                    <Meta.icon size={18} className="text-brand-600" />
                    {Meta.label}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {cats.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/discover/${cat.slug}`}
                        className="group rounded-xl border border-line bg-surface p-3.5 transition hover:border-brand-200 hover:shadow-sm"
                      >
                        <p className="text-sm font-semibold text-ink">{cat.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                          {cat.services?.length ?? 0} service{(cat.services?.length ?? 0) === 1 ? "" : "s"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent jobs */}
      {recent && recent.items.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Your recent jobs</h2>
            <Link href="/jobs" className="text-sm font-semibold text-brand-600">
              View all
            </Link>
          </div>
          <div className="space-y-2.5">
            {recent.items.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="flex items-center justify-between gap-3 p-3.5 transition hover:border-brand-200">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{job.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {job.applications_count} application{job.applications_count === 1 ? "" : "s"} · {timeAgo(job.created_at)}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
