"use client";

import { useState } from "react";
import { feedApi } from "@/lib/api";
import { usePaginated, useDebounced } from "@/lib/hooks";
import { Input } from "@/components/ui/primitives";
import { AsyncBoundary, EmptyState, SkeletonList } from "@/components/ui/states";
import { PageHeader, Segmented } from "@/components/ui/bits";
import { Pagination } from "@/components/ui/Pagination";
import { FeedJobCard } from "./FeedJobCard";
import { IconSearch, IconLayers } from "@/components/ui/icons";
import type { Urgency } from "@/lib/types";

type UrgencyFilter = "ALL" | Urgency;

const URGENCY_TABS: { value: UrgencyFilter; label: string }[] = [
  { value: "ALL", label: "All jobs" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "HIGH", label: "Urgent" },
  { value: "NORMAL", label: "Normal" },
];

export function JobFeed() {
  const [q, setQ] = useState("");
  const debounced = useDebounced(q, 300);
  const [urgency, setUrgency] = useState<UrgencyFilter>("ALL");

  const { data, loading, error, reload, page, setPage } = usePaginated(
    (p) =>
      feedApi.jobs({
        page: p,
        limit: 10,
        q: debounced.trim() || undefined,
        urgency: urgency === "ALL" ? undefined : urgency,
      }),
    [debounced, urgency],
  );

  return (
    <div>
      <PageHeader title="Jobs for you" subtitle="Ranked by relevance to your services and area." />

      <div className="relative mb-3">
        <IconSearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search jobs"
          className="pl-11"
          aria-label="Search jobs"
        />
      </div>
      <div className="mb-4">
        <Segmented options={URGENCY_TABS} value={urgency} onChange={setUrgency} />
      </div>

      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton={<SkeletonList count={5} />}
        isEmpty={!!data && data.items.length === 0}
        empty={
          <EmptyState
            title="No matching jobs right now"
            message="New jobs in your services and area will appear here. Try widening your service areas or travel distance in your profile."
            icon={<IconLayers size={32} />}
          />
        }
      >
        <div className="space-y-3">
          {data?.items.map((job) => (
            <FeedJobCard key={job.id} job={job} />
          ))}
        </div>
        {data && <Pagination meta={data.meta} page={page} onPage={setPage} />}
      </AsyncBoundary>
    </div>
  );
}
