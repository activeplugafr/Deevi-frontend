"use client";

import { useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { usePaginated, useDebounced } from "@/lib/hooks";
import { Card } from "@/components/ui/primitives";
import { PageHeader, JobStatusBadge } from "@/components/ui/bits";
import { AdminList, pick } from "@/components/admin/AdminList";
import { areaLabel, timeAgo } from "@/lib/format";
import { IconChevronRight } from "@/components/ui/icons";

const TABS = [
  { value: "all", label: "All" },
  { value: "RECEIVING_APPLICATIONS", label: "Open" },
  { value: "IN_PROGRESS", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DISPUTED", label: "Disputed" },
];

export default function AdminJobs() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const debounced = useDebounced(q, 350);
  const state = usePaginated(
    (p) => adminApi.jobs({ page: p, limit: 15, status: tab === "all" ? undefined : tab, q: debounced.trim() || undefined }),
    [tab, debounced],
  );

  return (
    <div>
      <PageHeader title="Jobs" subtitle="Every job across the marketplace." />
      <AdminList
        state={state}
        page={state.page}
        onPage={state.setPage}
        search={q}
        onSearch={setQ}
        searchPlaceholder="Search jobs"
        tabs={TABS}
        tab={tab}
        onTab={setTab}
        emptyTitle="No jobs found"
        renderRow={(item) => {
          const j = item as Record<string, unknown>;
          return (
            <Link key={pick<string>(j, "id")} href={`/admin/jobs/${pick<string>(j, "id")}`}>
              <Card className="flex items-center gap-3 p-3.5 transition hover:border-brand-200">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{pick<string>(j, "title") ?? "Job"}</p>
                  <p className="truncate text-xs text-muted">
                    {areaLabel(pick<string>(j, "neighbourhood"), pick<string>(j, "city"))} · {pick<number>(j, "applications_count") ?? 0} applications · {timeAgo(pick<string>(j, "created_at"))}
                  </p>
                </div>
                <JobStatusBadge status={pick<string>(j, "status") ?? "PUBLISHED"} />
                <IconChevronRight size={18} className="text-muted" />
              </Card>
            </Link>
          );
        }}
      />
    </div>
  );
}
