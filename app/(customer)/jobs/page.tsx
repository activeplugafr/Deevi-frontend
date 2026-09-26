"use client";

import { useState } from "react";
import { jobsApi } from "@/lib/api";
import { usePaginated } from "@/lib/hooks";
import { WorkspaceHeader, SectionCard, RailLayout } from "@/components/ui/patterns";
import { Segmented } from "@/components/ui/bits";
import { AsyncBoundary, EmptyState, SkeletonList } from "@/components/ui/states";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { CustomerJobCard } from "@/components/jobs/JobCard";
import { IconBriefcase, IconCheck } from "@/components/ui/icons";
import type { JobStatus } from "@/lib/types";

const HIRING_STEPS = [
  { t: "Compare quotes & ratings", d: "Review verified reviews, portfolios and prices from artisans who apply." },
  { t: "Message to confirm scope", d: "Clarify materials, arrival timing and requirements before you commit." },
  { t: "Select & settle directly", d: "Pick your artisan. Payment is arranged directly with them — no platform cut." },
];

type Tab = "all" | "open" | "active" | "completed" | "drafts";

const TABS: { value: Tab; label: string; status?: JobStatus }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Receiving applications", status: "RECEIVING_APPLICATIONS" },
  { value: "active", label: "In progress", status: "IN_PROGRESS" },
  { value: "completed", label: "Completed", status: "COMPLETED" },
  { value: "drafts", label: "Drafts", status: "DRAFT" },
];

export default function MyJobsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const status = TABS.find((t) => t.value === tab)?.status;

  const { data, loading, error, reload, page, setPage } = usePaginated(
    (p) => jobsApi.mine({ page: p, limit: 10, status }),
    [status],
  );

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Live Portfolio"
        title="My jobs"
        description="Track active requests, review artisan quotes and manage ongoing projects."
        actions={<LinkButton href="/jobs/new" size="sm">Post a new job</LinkButton>}
      />

      <RailLayout
        rail={
          <>
            <SectionCard title="How hiring works on Deevi">
              <ol className="space-y-3">
                {HIRING_STEPS.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{s.t}</p>
                      <p className="text-xs text-muted">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </SectionCard>
            <SectionCard icon={<IconCheck size={18} />} title="Need help?">
              <p className="text-sm text-ink-soft">
                Have a question about an ongoing job? You can report a problem from any job, and our
                team will follow up.
              </p>
            </SectionCard>
          </>
        }
      >
        <div className="mb-4">
          <Segmented options={TABS} value={tab} onChange={setTab} />
        </div>

        <AsyncBoundary
          loading={loading}
          error={error}
          onRetry={reload}
          skeleton={<SkeletonList count={5} />}
          isEmpty={!!data && data.items.length === 0}
          empty={
            <EmptyState
              title={tab === "all" ? "No jobs yet" : "Nothing here"}
              message={
                tab === "all"
                  ? "Post your first job and relevant artisans will start applying."
                  : "No jobs match this filter right now."
              }
              icon={<IconBriefcase size={32} />}
              action={<LinkButton href="/jobs/new" size="sm">Post a job</LinkButton>}
            />
          }
        >
          <div className="space-y-3">
            {data?.items.map((job) => (
              <CustomerJobCard key={job.id} job={job} />
            ))}
          </div>
          {data && <Pagination meta={data.meta} page={page} onPage={setPage} />}
        </AsyncBoundary>
      </RailLayout>
    </div>
  );
}
