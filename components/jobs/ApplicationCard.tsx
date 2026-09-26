"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { applicationsApi, messagesApi } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Avatar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Stars, ApplicationStatusBadge } from "@/components/ui/bits";
import { VerifiedTick } from "@/components/ui/primitives";
import { fullName, naira, humanize, timeAgo } from "@/lib/format";
import { IconChat, IconCheck, IconClock } from "@/components/ui/icons";
import type { Application } from "@/lib/types";

export function ApplicationCard({
  application,
  jobPostId,
  jobStatus,
  onChanged,
}: {
  application: Application;
  jobPostId: string;
  jobStatus: string;
  onChanged: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const a = application;
  const artisan = a.artisan ?? {};
  const artisanId = artisan.id ?? artisan.artisan_id ?? a.artisan_id;
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmSelect, setConfirmSelect] = useState(false);

  const rating = artisan.rating_average ?? 0;
  const ratingCount = artisan.rating_count ?? 0;
  const verified = artisan.verification_status === "APPROVED";
  // Selection is only offered while the job is still open for it.
  const selectable = ["PUBLISHED", "RECEIVING_APPLICATIONS"].includes(jobStatus) &&
    ["SUBMITTED", "SHORTLISTED"].includes(a.status);

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
    }
  }

  async function message() {
    setBusy("message");
    try {
      const convo = await messagesApi.open({ jobPostId, artisanId });
      router.push(`/messages/${convo.id}`);
    } catch (err) {
      toast.error(messageFor(err));
      setBusy(null);
    }
  }

  async function select() {
    setConfirmSelect(false);
    await act("select", () => applicationsApi.select(a.id, a.proposed_price ?? undefined), "Artisan selected — we've let them know.");
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Link href={artisanId ? `/artisans/${artisanId}` : "#"}>
          <Avatar src={artisan.avatar_url} firstName={artisan.first_name} lastName={artisan.last_name} size={48} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={artisanId ? `/artisans/${artisanId}` : "#"}
              className="truncate font-semibold text-ink hover:text-brand-700"
            >
              {artisan.business_name || fullName(artisan.first_name, artisan.last_name, "Artisan")}
            </Link>
            {verified && <VerifiedTick />}
          </div>
          {artisan.headline && <p className="truncate text-xs text-muted">{artisan.headline}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {ratingCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Stars value={rating} size={13} /> {rating.toFixed(1)} ({ratingCount})
              </span>
            ) : (
              <span>New to Deevi</span>
            )}
            {artisan.jobs_completed_count != null && artisan.jobs_completed_count > 0 && (
              <span>{artisan.jobs_completed_count} jobs completed</span>
            )}
            {artisan.years_of_experience != null && artisan.years_of_experience > 0 && (
              <span>{artisan.years_of_experience} yr experience</span>
            )}
          </div>
        </div>
        <ApplicationStatusBadge status={a.status} />
      </div>

      {/* Their proposal */}
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-canvas p-3 sm:grid-cols-3">
        <Stat label="Proposed price" value={a.proposed_price != null ? naira(a.proposed_price) : "Negotiable"} />
        {a.estimated_duration_value != null && (
          <Stat label="Est. duration" value={`${a.estimated_duration_value} ${humanize(a.estimated_duration_unit ?? "").toLowerCase()}`} />
        )}
        <Stat label="Applied" value={timeAgo(a.created_at)} />
      </div>

      {a.message && <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{a.message}</p>}
      {a.relevant_experience && (
        <p className="mt-2 text-xs text-muted">
          <span className="font-medium text-ink-soft">Relevant experience: </span>
          {a.relevant_experience}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={message} loading={busy === "message"}>
          <IconChat size={16} /> Message
        </Button>
        {selectable && a.status !== "SHORTLISTED" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => act("shortlist", () => applicationsApi.shortlist(a.id), "Shortlisted.")}
            loading={busy === "shortlist"}
          >
            Shortlist
          </Button>
        )}
        {selectable && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => act("reject", () => applicationsApi.reject(a.id), "Application declined.")}
              loading={busy === "reject"}
              className="text-muted"
            >
              Decline
            </Button>
            <Button size="sm" className="ml-auto" onClick={() => setConfirmSelect(true)}>
              <IconCheck size={16} /> Select artisan
            </Button>
          </>
        )}
      </div>

      <Modal
        open={confirmSelect}
        onClose={() => setConfirmSelect(false)}
        title="Select this artisan?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmSelect(false)}>Cancel</Button>
            <Button onClick={select} loading={busy === "select"}>Confirm selection</Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          You&apos;re about to hire{" "}
          <span className="font-semibold text-ink">
            {artisan.business_name || fullName(artisan.first_name, artisan.last_name, "this artisan")}
          </span>{" "}
          for {a.proposed_price != null ? naira(a.proposed_price) : "a negotiable price"}. Other
          applicants will be notified the job is taken. You can still message them here.
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <IconClock size={14} /> Payment is arranged directly between you and the artisan.
        </p>
      </Modal>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
