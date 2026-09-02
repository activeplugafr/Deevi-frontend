"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Avatar, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Textarea } from "@/components/ui/primitives";
import { Loading, ErrorState } from "@/components/ui/states";
import { BackLink, VerificationBadge } from "@/components/ui/bits";
import { pick } from "@/components/admin/AdminList";
import { fullName, humanize, dateTime } from "@/lib/format";
import { IconMapPin } from "@/components/ui/icons";

export default function VerificationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(
    () => adminApi.verificationPacket(id) as Promise<Record<string, unknown>>,
    [id],
  );
  const [reject, setReject] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  if (loading) return <Loading label="Loading application…" />;
  if (error || !data) return <div><BackLink href="/admin/verification" label="Queue" /><div className="mt-4"><ErrorState error={error} onRetry={reload} /></div></div>;

  const artisan = (pick<Record<string, unknown>>(data, "artisan", "profile") ?? data) as Record<string, unknown>;
  const status = pick<string>(data, "status", "verification_status") ?? pick<string>(artisan, "verification_status") ?? "PENDING";
  const documents = (pick<Record<string, unknown>[]>(data, "documents", "verification_documents") ?? []) as Record<string, unknown>[];
  const services = (pick<Record<string, unknown>[]>(artisan, "services") ?? []) as Record<string, unknown>[];
  const areas = (pick<Record<string, unknown>[]>(artisan, "service_areas", "areas") ?? []) as Record<string, unknown>[];
  const appId = pick<string>(data, "id", "application_id") ?? id;

  async function review(decision: "APPROVED" | "REJECTED" | "UNDER_REVIEW", rejectionReason?: string) {
    setBusy(decision);
    try {
      await adminApi.reviewApplication(appId, { decision, rejectionReason });
      toast.success(
        decision === "APPROVED" ? "Artisan approved." : decision === "REJECTED" ? "Application rejected." : "Marked under review.",
      );
      reload();
      if (decision === "APPROVED") router.push("/admin/verification");
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(null);
      setReject(false);
    }
  }

  async function openDoc(docId: string) {
    try {
      const { url } = await adminApi.documentUrl(docId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(messageFor(err));
    }
  }

  const name = pick<string>(artisan, "business_name") || fullName(pick<string>(artisan, "first_name"), pick<string>(artisan, "last_name"), "Artisan");

  return (
    <div>
      <BackLink href="/admin/verification" label="Verification queue" />

      <Card className="mt-3 p-5">
        <div className="flex items-start gap-4">
          <Avatar src={pick<string>(artisan, "avatar_url")} firstName={pick<string>(artisan, "first_name")} lastName={pick<string>(artisan, "last_name")} size={60} />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-ink">{name}</h1>
            {pick<string>(artisan, "headline") && <p className="text-sm text-ink-soft">{pick<string>(artisan, "headline")}</p>}
            <p className="mt-1 text-xs text-muted">
              {pick<string>(artisan, "base_city", "city") ?? "—"} · submitted {dateTime(pick<string>(data, "submitted_at", "created_at"))}
            </p>
          </div>
          <VerificationBadge status={status} />
        </div>
        {pick<string>(artisan, "bio") && <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{pick<string>(artisan, "bio")}</p>}
        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3 text-center">
          <Stat label="Experience" value={pick<number>(artisan, "years_of_experience") != null ? `${pick<number>(artisan, "years_of_experience")} yr` : "—"} />
          <Stat label="Email" value={pick<string>(artisan, "email") ?? pick<string>(data, "email") ?? "—"} />
          <Stat label="Phone" value={pick<string>(artisan, "phone") ?? pick<string>(data, "phone") ?? "—"} />
        </div>
      </Card>

      {/* Documents */}
      <Card className="mt-4 p-5">
        <h2 className="text-sm font-semibold text-ink">Submitted documents</h2>
        {documents.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {documents.map((d, i) => {
              const docId = pick<string>(d, "id");
              return (
                <li key={docId ?? i} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
                  <span className="flex-1 text-sm text-ink">
                    {humanize(pick<string>(d, "document_type") ?? "Document")}
                    {pick<string>(d, "original_filename") && <span className="text-muted"> · {pick<string>(d, "original_filename")}</span>}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => docId && openDoc(docId)} disabled={!docId}>
                    Open
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No documents were submitted.</p>
        )}
        <p className="mt-2 text-xs text-muted">Documents open in a new tab via a short-lived secure link.</p>
      </Card>

      {/* Services & areas */}
      {(services.length > 0 || areas.length > 0) && (
        <Card className="mt-4 p-5">
          {services.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-ink">Services</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {services.map((s, i) => (
                  <Badge key={i} className="border border-line bg-canvas text-ink-soft">{pick<string>(s, "service_name", "name") ?? "Service"}</Badge>
                ))}
              </div>
            </>
          )}
          {areas.length > 0 && (
            <>
              <h2 className="mt-4 text-sm font-semibold text-ink">Areas</h2>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-ink-soft">
                {areas.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1">
                    <IconMapPin size={13} className="text-muted" />
                    {[pick<string>(a, "neighbourhood"), pick<string>(a, "city")].filter(Boolean).join(", ") || pick<string>(a, "city")}
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Decision bar */}
      {["PENDING", "UNDER_REVIEW"].includes(status) && (
        <div className="sticky bottom-0 mt-4 flex flex-wrap gap-2 border-t border-line bg-surface/95 py-3 backdrop-blur">
          <Button variant="ghost" onClick={() => review("UNDER_REVIEW")} loading={busy === "UNDER_REVIEW"}>
            Put on hold
          </Button>
          <Button variant="danger" className="ml-auto" onClick={() => setReject(true)}>Reject</Button>
          <Button onClick={() => review("APPROVED")} loading={busy === "APPROVED"}>Approve</Button>
        </div>
      )}

      <RejectModal open={reject} onClose={() => setReject(false)} busy={busy === "REJECTED"} onReject={(reason) => review("REJECTED", reason)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function RejectModal({ open, onClose, onReject, busy }: { open: boolean; onClose: () => void; onReject: (reason: string) => void; busy: boolean }) {
  const [reason, setReason] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Reject application"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" loading={busy} disabled={!reason.trim()} onClick={() => onReject(reason.trim())}>Reject</Button></>}>
      <Field label="Reason (shown to the artisan)" required>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain what needs to change so they can resubmit." className="min-h-[100px]" />
      </Field>
    </Modal>
  );
}
