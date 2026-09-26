"use client";

import { useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { usePaginated } from "@/lib/hooks";
import { Card, Badge } from "@/components/ui/primitives";
import { PageHeader } from "@/components/ui/bits";
import { AdminList, pick } from "@/components/admin/AdminList";
import { humanize, timeAgo } from "@/lib/format";
import { IconChevronRight } from "@/components/ui/icons";

const TABS = [
  { value: "OPEN", label: "Open" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

function priorityTone(p: string) {
  if (p === "URGENT") return "bg-warn-500 text-white";
  if (p === "HIGH") return "bg-warn-50 text-warn-600";
  return "bg-canvas text-muted border border-line";
}

export default function AdminReports() {
  const [tab, setTab] = useState("OPEN");
  const state = usePaginated((p) => adminApi.reports({ page: p, limit: 15, status: tab }), [tab]);

  return (
    <div>
      <PageHeader title="Reports" subtitle="Issues raised by customers and artisans." />
      <AdminList
        state={state}
        page={state.page}
        onPage={state.setPage}
        tabs={TABS}
        tab={tab}
        onTab={setTab}
        emptyTitle="Nothing here"
        emptyMessage="Reports with this status will appear here."
        renderRow={(item) => {
          const r = item as Record<string, unknown>;
          const priority = pick<string>(r, "priority") ?? "NORMAL";
          return (
            <Link key={pick<string>(r, "id")} href={`/admin/reports/${pick<string>(r, "id")}`}>
              <Card className="flex items-center gap-3 p-3.5 transition hover:border-brand-200">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{humanize(pick<string>(r, "category") ?? "Report")}</p>
                  <p className="truncate text-xs text-muted">
                    {pick<string>(r, "reference")} · {timeAgo(pick<string>(r, "created_at"))}
                  </p>
                </div>
                <Badge className={priorityTone(priority)}>{humanize(priority)}</Badge>
                <IconChevronRight size={18} className="text-muted" />
              </Card>
            </Link>
          );
        }}
      />
    </div>
  );
}
