"use client";

import { use, useState } from "react";
import { jobsApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { Loading, ErrorState } from "@/components/ui/states";
import { BackLink, UrgencyBadge } from "@/components/ui/bits";
import { RailLayout, SectionCard } from "@/components/ui/patterns";
import { ApplyModal } from "@/components/artisan/ApplyModal";
import { ReportModal } from "@/components/shared/ReportModal";
import { areaLabel, budgetLabel, dateTime, humanize, timeAgo } from "@/lib/format";
import { IconMapPin, IconClock, IconFlag, IconCheck } from "@/components/ui/icons";

export default function ArtisanJobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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

  return (
    <div>
      <BackLink href="/artisan" label="Job Feed" />

      <div className="mb-4 mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
            {job.service_name ?? "Service"}
          </span>
          <UrgencyBadge urgency={job.urgency} />
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{job.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {areaLabel(job.neighbourhood, job.city, job.state)} · Posted {timeAgo(job.published_at ?? job.created_at)}
        </p>
      </div>

      <RailLayout
        rail={
          <>
            <SectionCard title="Client budget range">
              <p className="font-display text-2xl font-bold text-ink tnum">
                {budgetLabel(job.budget_min, job.budget_max, job.budget_type)}
              </p>
              <p className="mt-1 text-xs text-muted">{humanize(job.budget_type ?? "NEGOTIABLE")} pricing</p>
              <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
                <Stat icon={<IconMapPin size={15} />} label="Area" value={areaLabel(job.neighbourhood, job.city, job.state)} />
                {job.preferred_start_at && (
                  <Stat icon={<IconClock size={15} />} label="Preferred" value={dateTime(job.preferred_start_at)} />
                )}
                <Stat label="Applicants" value={String(job.applications_count)} />
              </dl>

              <div className="mt-4 space-y-2">
                {alreadyApplied ? (
                  <p className="flex items-center justify-center gap-1.5 rounded-control bg-success-50 py-2.5 text-sm font-medium text-success-600">
                    <IconCheck size={18} /> You&apos;ve applied
                  </p>
                ) : isOpen ? (
                  <Button fullWidth onClick={() => setApplyOpen(true)}>Apply for this job</Button>
                ) : (
                  <p className="text-center text-sm text-muted">
                    This job is {humanize(job.status).toLowerCase()} and not accepting applications.
                  </p>
                )}
              </div>
              <p className="mt-3 text-xs text-muted">
                The exact street address is shared once the customer selects you.
              </p>
            </SectionCard>

            <button
              onClick={() => setReportOpen(true)}
              className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-muted hover:text-danger-600"
            >
              <IconFlag size={16} /> Report this listing
            </button>
          </>
        }
      >
        <SectionCard title="What the customer needs">
          <p className="whitespace-pre-wrap text-sm text-ink-soft">{job.description}</p>
          {job.additional_notes && (
            <>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Additional notes</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{job.additional_notes}</p>
            </>
          )}
          {job.preferred_time_notes && (
            <p className="mt-3 text-sm text-muted">
              <span className="font-medium text-ink-soft">Timing: </span>
              {job.preferred_time_notes}
            </p>
          )}
        </SectionCard>
      </RailLayout>

      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} jobPostId={job.id} onApplied={reload} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} context={{ jobPostId: job.id }} />
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="flex items-center gap-1.5 text-muted">
        {icon}
        {label}
      </dt>
      <dd className="truncate text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
