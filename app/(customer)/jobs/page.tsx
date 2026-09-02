"use client";

import { useState } from "react";
import { jobsApi } from "@/lib/api";
import { usePaginated } from "@/lib/hooks";
import { PageHeader, Segmented } from "@/components/ui/bits";
import { AsyncBoundary, EmptyState, SkeletonList } from "@/components/ui/states";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { CustomerJobCard } from "@/components/jobs/JobCard";
import { IconBriefcase } from "@/components/ui/icons";
import type { JobStatus } from "@/lib/types";

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
      <PageHeader
        title="My jobs"
        subtitle="Track applications and manage your posted jobs."
        action={<LinkButton href="/jobs/new" size="sm">Post a job</LinkButton>}
      />

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
    </div>
  );
}
