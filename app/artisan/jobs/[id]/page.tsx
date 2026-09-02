"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { jobsApi, messagesApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Loading, ErrorState } from "@/components/ui/states";
import { BackLink, UrgencyBadge } from "@/components/ui/bits";
import { ApplyModal } from "@/components/artisan/ApplyModal";
import { ReportModal } from "@/components/shared/ReportModal";
import { areaLabel, budgetLabel, dateTime, humanize, timeAgo } from "@/lib/format";
import { IconMapPin, IconClock, IconChat, IconFlag, IconCheck } from "@/components/ui/icons";

export default function ArtisanJobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const { data: job, loading, error, reload } = useAsync(() => jobsApi.get(id), [id]);
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (loading) return <Loading label="Loading job…" />;
  if (error || !job) {
    return (
      <div>
        <BackLink href="/artisan" label="Jobs" />
        <div className="mt-4"><ErrorState error={error} onRetry={reload} /></div>
      </div>
    );
  }

  // The backend tells us if we've already applied; be tolerant of field names.
  const alreadyApplied = Boolean(
    (job as Record<string, unknown>).has_applied ??
      (job as Record<string, unknown>).my_application ??
      (job as Record<string, unknown>).applied,
  );
  const isOpen = ["PUBLISHED", "RECEIVING_APPLICATIONS"].includes(job.status);

  async function message() {
    try {
      const convo = await messagesApi.open({ jobPostId: job!.id });
      router.push(`/artisan/messages/${convo.id}`);
    } catch (err) {
      toast.error(messageFor(err));
    }
  }

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <BackLink href="/artisan" label="Jobs" />

      <div className="mt-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
            {job.service_name ?? "Service"}
          </span>
          <UrgencyBadge urgency={job.urgency} />
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">{job.title}</h1>
        <p className="mt-1 text-sm text-muted">Posted {timeAgo(job.published_at ?? job.created_at)}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Meta label="Area" value={areaLabel(job.neighbourhood, job.city, job.state)} icon={<IconMapPin size={16} />} />
        <Meta label="Budget" value={budgetLabel(job.budget_min, job.budget_max, job.budget_type)} />
        {job.preferred_start_at && <Meta label="Preferred start" value={dateTime(job.preferred_start_at)} icon={<IconClock size={16} />} />}
      </div>

      <Card className="mt-4 p-4">
        <h2 className="text-sm font-semibold text-ink">What the customer needs</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{job.description}</p>
        {job.additional_notes && (
          <>
            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Additional notes</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{job.additional_notes}</p>
          </>
        )}
        {job.preferred_time_notes && (
          <p className="mt-3 text-sm text-muted">
            <span className="font-medium text-ink-soft">Timing: </span>{job.preferred_time_notes}
          </p>
        )}
      </Card>

      <p className="mt-4 text-xs text-muted">
        The exact street address is shared once the customer selects you.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="secondary" onClick={message}>
          <IconChat size={18} /> Message customer
        </Button>
        <Button variant="ghost" size="sm" className="text-muted" onClick={() => setReportOpen(true)}>
          <IconFlag size={16} /> Report
        </Button>
      </div>

      {/* Sticky apply bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:static md:mt-6 md:rounded-xl md:border md:px-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {alreadyApplied ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-success-600">
              <IconCheck size={18} /> You&apos;ve applied to this job
            </p>
          ) : isOpen ? (
            <>
              <p className="hidden text-sm text-muted sm:block">Ready to take this on?</p>
              <Button className="ml-auto" onClick={() => setApplyOpen(true)}>Apply for job</Button>
            </>
          ) : (
            <p className="text-sm text-muted">This job is {humanize(job.status).toLowerCase()} and not accepting applications.</p>
          )}
        </div>
      </div>

      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} jobPostId={job.id} onApplied={reload} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} context={{ jobPostId: job.id }} />
    </div>
  );
}

function Meta({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-ink">
        {icon && <span className="text-muted">{icon}</span>}
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}
