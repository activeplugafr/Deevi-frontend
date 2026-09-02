"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { jobsApi, applicationsApi, messagesApi } from "@/lib/api";
import { useAsync, usePaginated } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Avatar, VerifiedTick } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Loading, ErrorState, EmptyState, SkeletonList } from "@/components/ui/states";
import { BackLink, JobStatusBadge, UrgencyBadge } from "@/components/ui/bits";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ReviewModal } from "@/components/jobs/ReviewModal";
import { ReportModal } from "@/components/shared/ReportModal";
import { ApplicationCard } from "@/components/jobs/ApplicationCard";
import { areaLabel, budgetLabel, dateTime, fullName, humanize, naira } from "@/lib/format";
import { IconMapPin, IconClock, IconChat, IconCheck, IconFlag } from "@/components/ui/icons";

const OPEN_STATES = ["PUBLISHED", "RECEIVING_APPLICATIONS"];
const ENGAGED_STATES = ["ARTISAN_SELECTED", "ACCEPTED", "IN_PROGRESS"];

export default function CustomerJobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const { data: job, loading, error, reload } = useAsync(() => jobsApi.get(id), [id]);

  const [dialog, setDialog] = useState<null | "cancel" | "complete" | "publish">(null);
  const [review, setReview] = useState(false);
  const [report, setReport] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading label="Loading job…" />;
  if (error || !job) return <div><BackLink href="/jobs" label="My jobs" /><div className="mt-4"><ErrorState error={error} onRetry={reload} /></div></div>;

  const engagement = job.engagement ?? null;
  const engagementId = engagement?.id;

  async function run(fn: () => Promise<unknown>, okMsg: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(okMsg);
      reload();
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(false);
      setDialog(null);
    }
  }

  async function messageArtisan() {
    if (!engagement) return;
    const artisanId = (engagement as Record<string, unknown>).artisan_id as string | undefined;
    try {
      const convo = await messagesApi.open({ jobPostId: job!.id, artisanId });
      router.push(`/messages/${convo.id}`);
    } catch (err) {
      toast.error(messageFor(err));
    }
  }

  const artisanName = (() => {
    const ar = (engagement as Record<string, unknown> | null)?.artisan as Record<string, unknown> | undefined;
    return ar
      ? (ar.business_name as string) || fullName(ar.first_name as string, ar.last_name as string, "your artisan")
      : "your artisan";
  })();

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/jobs" label="My jobs" />

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <JobStatusBadge status={job.status} />
            <UrgencyBadge urgency={job.urgency} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{job.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {job.service_name ?? "Service"} · Posted {dateTime(job.created_at)}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Meta label="Location" value={areaLabel(job.neighbourhood, job.city, job.state)} icon={<IconMapPin size={16} />} />
        <Meta label="Budget" value={budgetLabel(job.budget_min, job.budget_max, job.budget_type)} />
        <Meta label="Applications" value={String(job.applications_count)} />
        {job.preferred_start_at && <Meta label="Preferred start" value={dateTime(job.preferred_start_at)} icon={<IconClock size={16} />} />}
      </div>

      {/* Description */}
      <Card className="mt-4 p-4">
        <h2 className="text-sm font-semibold text-ink">Job details</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{job.description}</p>
        {job.additional_notes && (
          <>
            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Additional notes</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{job.additional_notes}</p>
          </>
        )}
      </Card>

      {/* Draft actions */}
      {job.status === "DRAFT" && (
        <Card className="mt-4 flex flex-wrap items-center gap-2 p-4">
          <p className="mr-auto text-sm text-muted">This job is a draft — publish it so artisans can apply.</p>
          <Button variant="secondary" size="sm" onClick={() => setDialog("cancel")}>Delete</Button>
          <Button size="sm" onClick={() => run(() => jobsApi.publish(job.id), "Job published.")} loading={busy}>
            Publish job
          </Button>
        </Card>
      )}

      {/* Engagement panel */}
      {engagement && ENGAGED_STATES.includes(job.status) && (
        <Card className="mt-4 p-4">
          <h2 className="text-sm font-semibold text-ink">Your artisan</h2>
          <div className="mt-3 flex items-center gap-3">
            <Avatar
              src={((engagement as Record<string, unknown>).artisan as Record<string, unknown>)?.avatar_url as string}
              firstName={((engagement as Record<string, unknown>).artisan as Record<string, unknown>)?.first_name as string}
              lastName={((engagement as Record<string, unknown>).artisan as Record<string, unknown>)?.last_name as string}
              size={44}
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 font-semibold text-ink">{artisanName} <VerifiedTick /></p>
              <p className="text-xs text-muted">
                Agreed: {engagement.agreed_price != null ? naira(engagement.agreed_price) : "negotiable"} · {humanize(String(engagement.status ?? job.status))}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={messageArtisan}>
              <IconChat size={16} /> Message
            </Button>
            <Button size="sm" onClick={() => setDialog("complete")} disabled={!engagementId} className="ml-auto">
              <IconCheck size={16} /> Confirm work complete
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Confirm completion once the work is done and you&apos;re satisfied. You&apos;ll then be able to leave a review.
          </p>
        </Card>
      )}

      {/* Completed */}
      {job.status === "COMPLETED" && (
        <Card className="mt-4 flex flex-wrap items-center gap-2 p-4">
          <div className="mr-auto">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-success-600">
              <IconCheck size={16} /> Job completed
            </p>
            <p className="text-xs text-muted">Thanks for using Deevi. How did it go?</p>
          </div>
          <Button size="sm" onClick={() => setReview(true)}>Review artisan</Button>
        </Card>
      )}

      {/* Applications */}
      {(OPEN_STATES.includes(job.status) || job.applications_count > 0) && job.status !== "DRAFT" && (
        <ApplicationsSection jobId={job.id} jobStatus={job.status} onSelected={reload} />
      )}

      {/* Footer actions */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {!["COMPLETED", "CANCELLED", "DRAFT", "EXPIRED"].includes(job.status) && (
          <Button variant="ghost" size="sm" className="text-danger-600" onClick={() => setDialog("cancel")}>
            Cancel job
          </Button>
        )}
        <Button variant="ghost" size="sm" className="text-muted" onClick={() => setReport(true)}>
          <IconFlag size={16} /> Report a problem
        </Button>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={dialog === "cancel"}
        onClose={() => setDialog(null)}
        title={job.status === "DRAFT" ? "Delete this draft?" : "Cancel this job?"}
        message={job.status === "DRAFT" ? "This draft will be removed." : "Artisans will be notified the job is no longer available."}
        confirmLabel={job.status === "DRAFT" ? "Delete" : "Cancel job"}
        danger
        withReason={job.status !== "DRAFT"}
        reasonLabel="Reason (optional)"
        onConfirm={(reason) => run(() => jobsApi.cancel(job.id, reason ?? "Cancelled by customer"), "Job cancelled.")}
      />
      <ConfirmDialog
        open={dialog === "complete"}
        onClose={() => setDialog(null)}
        title="Confirm work is complete?"
        message="Only confirm once the artisan has finished and you're satisfied with the work."
        confirmLabel="Yes, it's complete"
        onConfirm={() => run(() => jobsApi.complete(engagementId!), "Job marked complete. You can now leave a review.")}
      />
      <ReviewModal
        open={review}
        onClose={() => setReview(false)}
        jobId={engagementId ?? job.id}
        artisanName={artisanName}
        onSubmitted={reload}
      />
      <ReportModal open={report} onClose={() => setReport(false)} context={{ jobPostId: job.id, jobId: engagementId }} />
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

function ApplicationsSection({
  jobId,
  jobStatus,
  onSelected,
}: {
  jobId: string;
  jobStatus: string;
  onSelected: () => void;
}) {
  const { data, loading, error, reload, page, setPage } = usePaginated(
    (p) => applicationsApi.forJob(jobId, { page: p, limit: 10, sort: "newest" }),
    [jobId],
  );

  function onChanged() {
    reload();
    onSelected();
  }

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-base font-semibold text-ink">
        Applications {data ? `(${data.meta.total})` : ""}
      </h2>
      {loading ? (
        <SkeletonList count={2} />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No artisans have applied yet"
          message="We'll show applications here as they come in. Relevant, approved artisans nearby can see your job."
        />
      ) : (
        <div className="space-y-3">
          {data.items.map((a) => (
            <ApplicationCard key={a.id} application={a} jobPostId={jobId} jobStatus={jobStatus} onChanged={onChanged} />
          ))}
          <Pagination meta={data.meta} page={page} onPage={setPage} />
        </div>
      )}
    </section>
  );
}
