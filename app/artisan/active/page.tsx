"use client";

import { useState } from "react";
import { jobsApi } from "@/lib/api";
import { usePaginated } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { AsyncBoundary, EmptyState, SkeletonList } from "@/components/ui/states";
import { PageHeader, JobStatusBadge } from "@/components/ui/bits";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconBriefcase, IconMapPin, IconCheck } from "@/components/ui/icons";
import { areaLabel, naira } from "@/lib/format";
import type { JobSummary } from "@/lib/types";

/** Read engagement ids defensively — swagger left the shape opaque. */
function ids(item: JobSummary & Record<string, unknown>) {
  return {
    engagementId: (item.engagement_id as string) ?? (item.id as string),
    agreedPrice: (item.agreed_price as number) ?? null,
  };
}

export default function ArtisanActive() {
  const { data, loading, error, reload, page, setPage } = usePaginated(
    (p) => jobsApi.engagements({ page: p, limit: 10 }),
    [],
  );

  return (
    <div>
      <PageHeader title="Active jobs" subtitle="Jobs you've been selected for." />
      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton={<SkeletonList count={3} />}
        isEmpty={!!data && data.items.length === 0}
        empty={
          <EmptyState
            title="No active jobs yet"
            message="When a customer selects you for a job, it'll appear here and you can manage it through to completion."
            icon={<IconBriefcase size={32} />}
          />
        }
      >
        <div className="space-y-3">
          {data?.items.map((job) => (
            <EngagementCard key={job.id} job={job} onChanged={reload} />
          ))}
        </div>
        {data && <Pagination meta={data.meta} page={page} onPage={setPage} />}
      </AsyncBoundary>
    </div>
  );
}

function EngagementCard({ job, onChanged }: { job: JobSummary; onChanged: () => void }) {
  const toast = useToast();
  const { engagementId, agreedPrice } = ids(job as JobSummary & Record<string, unknown>);
  const [busy, setBusy] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "decline" | "complete">(null);
  const status = job.status;

  async function act(label: string, fn: () => Promise<unknown>, done: string) {
    setBusy(label);
    try {
      await fn();
      toast.success(done);
      onChanged();
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(null);
      setDialog(null);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink line-clamp-1">{job.title}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <IconMapPin size={13} /> {areaLabel(job.neighbourhood, job.city)}
            {agreedPrice != null && <span className="ml-1">· {naira(agreedPrice)}</span>}
          </p>
        </div>
        <JobStatusBadge status={status} />
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted">{job.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {status === "ARTISAN_SELECTED" && (
          <>
            <Button variant="ghost" size="sm" className="text-muted" onClick={() => setDialog("decline")}>
              Decline
            </Button>
            <Button size="sm" className="ml-auto" loading={busy === "accept"} onClick={() => act("accept", () => jobsApi.accept(engagementId), "Job accepted. You can start when ready.")}>
              Accept job
            </Button>
          </>
        )}
        {status === "ACCEPTED" && (
          <Button size="sm" className="ml-auto" loading={busy === "start"} onClick={() => act("start", () => jobsApi.start(engagementId), "Marked as started.")}>
            Start work
          </Button>
        )}
        {status === "IN_PROGRESS" && (
          <Button size="sm" className="ml-auto" loading={busy === "complete"} onClick={() => setDialog("complete")}>
            <IconCheck size={16} /> Mark work done
          </Button>
        )}
        {status === "COMPLETED" && (
          <span className="ml-auto flex items-center gap-1.5 text-sm font-medium text-success-600">
            <IconCheck size={16} /> Completed
          </span>
        )}
      </div>

      {status === "IN_PROGRESS" && (
        <p className="mt-2 text-xs text-muted">
          Once you mark the work done, the customer confirms completion on their side.
        </p>
      )}

      <ConfirmDialog
        open={dialog === "decline"}
        onClose={() => setDialog(null)}
        title="Decline this job?"
        message="The customer will be able to select another artisan."
        confirmLabel="Decline"
        danger
        withReason
        reasonLabel="Reason (optional)"
        onConfirm={(reason) => act("decline", () => jobsApi.decline(engagementId, reason), "Job declined.")}
      />
      <ConfirmDialog
        open={dialog === "complete"}
        onClose={() => setDialog(null)}
        title="Mark the work as done?"
        message="Let the customer know you've finished. They'll then confirm completion."
        confirmLabel="Yes, it's done"
        onConfirm={() => act("complete", () => jobsApi.artisanComplete(engagementId), "Marked as done. Waiting for the customer to confirm.")}
      />
    </Card>
  );
}
