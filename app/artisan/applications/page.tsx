"use client";

import { useState } from "react";
import Link from "next/link";
import { applicationsApi } from "@/lib/api";
import { usePaginated } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { AsyncBoundary, EmptyState, SkeletonList } from "@/components/ui/states";
import { PageHeader, Segmented, ApplicationStatusBadge } from "@/components/ui/bits";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconClipboard } from "@/components/ui/icons";
import { naira, humanize, timeAgo } from "@/lib/format";
import type { Application, ApplicationStatus } from "@/lib/types";

type Tab = "all" | ApplicationStatus;
const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "ACCEPTED", label: "Won" },
  { value: "REJECTED", label: "Closed" },
];

export default function ArtisanApplications() {
  const [tab, setTab] = useState<Tab>("all");
  const status = tab === "all" ? undefined : tab;
  const { data, loading, error, reload, page, setPage } = usePaginated(
    (p) => applicationsApi.mine({ page: p, limit: 10, status }),
    [status],
  );

  return (
    <div>
      <PageHeader title="My applications" subtitle="Jobs you've applied to." />
      <div className="mb-4">
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </div>
      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton={<SkeletonList count={4} />}
        isEmpty={!!data && data.items.length === 0}
        empty={
          <EmptyState
            title="No applications here"
            message="When you apply to jobs, they'll show up here so you can track them."
            icon={<IconClipboard size={32} />}
          />
        }
      >
        <div className="space-y-3">
          {data?.items.map((a) => (
            <ApplicationRow key={a.id} application={a} onChanged={reload} />
          ))}
        </div>
        {data && <Pagination meta={data.meta} page={page} onPage={setPage} />}
      </AsyncBoundary>
    </div>
  );
}

function ApplicationRow({ application: a, onChanged }: { application: Application; onChanged: () => void }) {
  const toast = useToast();
  const [withdraw, setWithdraw] = useState(false);
  const job = a.job;
  const canWithdraw = ["SUBMITTED", "SHORTLISTED"].includes(a.status);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {job ? (
            <Link href={`/artisan/jobs/${a.job_post_id}`} className="font-semibold text-ink hover:text-brand-700 line-clamp-1">
              {job.title}
            </Link>
          ) : (
            <Link href={`/artisan/jobs/${a.job_post_id}`} className="font-semibold text-ink hover:text-brand-700">
              View job
            </Link>
          )}
          <p className="mt-0.5 text-xs text-muted">Applied {timeAgo(a.created_at)}</p>
        </div>
        <ApplicationStatusBadge status={a.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="font-medium text-ink-soft">
          {a.proposed_price != null ? naira(a.proposed_price) : "Negotiable"}
          {a.price_type && a.price_type !== "FIXED" && (
            <span className="text-muted"> · {humanize(a.price_type).toLowerCase()}</span>
          )}
        </span>
        {a.status === "ACCEPTED" && (
          <Link href="/artisan/active" className="text-sm font-semibold text-brand-600">
            Go to active job →
          </Link>
        )}
      </div>

      {a.message && <p className="mt-2 line-clamp-2 text-sm text-muted">{a.message}</p>}

      {canWithdraw && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" className="text-muted" onClick={() => setWithdraw(true)}>
            Withdraw
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={withdraw}
        onClose={() => setWithdraw(false)}
        title="Withdraw your application?"
        message="The customer will no longer see your application for this job."
        confirmLabel="Withdraw"
        danger
        onConfirm={async () => {
          try {
            await applicationsApi.withdraw(a.id);
            toast.success("Application withdrawn.");
            onChanged();
          } catch (err) {
            toast.error(messageFor(err));
          }
        }}
      />
    </Card>
  );
}
