"use client";

import { useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { usePaginated } from "@/lib/hooks";
import { Card, Avatar } from "@/components/ui/primitives";
import { PageHeader, VerificationBadge } from "@/components/ui/bits";
import { AdminList, pick } from "@/components/admin/AdminList";
import { fullName, timeAgo } from "@/lib/format";
import { IconChevronRight } from "@/components/ui/icons";

const TABS = [
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function VerificationQueue() {
  const [tab, setTab] = useState("PENDING");
  const state = usePaginated((p) => adminApi.verificationQueue({ page: p, limit: 15, status: tab }), [tab]);

  return (
    <div>
      <PageHeader title="Artisan verification" subtitle="Review and approve artisans joining the marketplace." />
      <AdminList
        state={state}
        page={state.page}
        onPage={state.setPage}
        tabs={TABS}
        tab={tab}
        onTab={setTab}
        emptyTitle="Nothing in this queue"
        emptyMessage="Applications with this status will appear here."
        renderRow={(item) => {
          const r = item as Record<string, unknown>;
          const id = pick<string>(r, "id", "application_id");
          const status = pick<string>(r, "status", "verification_status") ?? tab;
          return (
            <Link key={id} href={`/admin/verification/${id}`}>
              <Card className="flex items-center gap-3 p-3.5 transition hover:border-brand-200">
                <Avatar
                  src={pick<string>(r, "avatar_url")}
                  firstName={pick<string>(r, "first_name")}
                  lastName={pick<string>(r, "last_name")}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">
                    {pick<string>(r, "business_name") || fullName(pick<string>(r, "first_name"), pick<string>(r, "last_name"), "Artisan")}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {pick<string>(r, "base_city", "city") ?? "—"} · submitted {timeAgo(pick<string>(r, "submitted_at", "created_at"))}
                  </p>
                </div>
                <VerificationBadge status={status} />
                <IconChevronRight size={18} className="text-muted" />
              </Card>
            </Link>
          );
        }}
      />
    </div>
  );
}
