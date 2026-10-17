"use client";

import { useState } from "react";
import { feedApi } from "@/lib/api";
import { usePaginated, useDebounced } from "@/lib/hooks";
import { Input } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";
import { AsyncBoundary, EmptyState, SkeletonList } from "@/components/ui/states";
import { Segmented } from "@/components/ui/bits";
import { WorkspaceHeader, SectionCard, RailLayout, FeatureCard } from "@/components/ui/patterns";
import { Pagination } from "@/components/ui/Pagination";
import { FeedJobCard } from "./FeedJobCard";
import { IconSearch, IconLayers, IconShield } from "@/components/ui/icons";
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

  const total = data?.meta.total;

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Live Dispatch Stream"
        title="Jobs for you"
        description="Ranked in real-time by relevance to your verified trades and proximity."
      />

      <RailLayout
        rail={
          <>
            <SectionCard title="Feed at a glance">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-display text-2xl font-bold text-ink tnum">{total ?? "—"}</p>
                  <p className="text-xs text-muted">Matching jobs</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-ink tnum">{data?.items.filter((j) => j.urgency === "EMERGENCY" || j.urgency === "HIGH").length ?? 0}</p>
                  <p className="text-xs text-muted">Urgent now</p>
                </div>
              </div>
            </SectionCard>
            <FeatureCard eyebrow="Get more requests" title="Widen your service areas" className="flex-col">
              <p>Adding nearby areas and increasing your travel distance unlocks more jobs in your feed. </p>
              <LinkButton href="/artisan/profile" variant="secondary" size="sm" className="mt-3">
                Edit coverage
              </LinkButton>
            </FeatureCard>
            <SectionCard icon={<IconShield size={18} />} title="Applying is free">
              <p className="text-sm text-ink-soft">
                There&apos;s no fee to apply, and no platform cut on your price. Payment is arranged
                directly with the customer.
              </p>
            </SectionCard>
          </>
        }
      >
        <div className="relative mb-3">
          <IconSearch size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by problem keyword, equipment, or neighbourhood…"
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
      </RailLayout>
    </div>
  );
}
