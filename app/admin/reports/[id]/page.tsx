"use client";

import { use, useState } from "react";
import { adminApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Badge, Field, Select, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Loading, ErrorState } from "@/components/ui/states";
import { BackLink } from "@/components/ui/bits";
import { pick } from "@/components/admin/AdminList";
import { humanize, dateTime } from "@/lib/format";
import type { ReportStatus } from "@/lib/types";

export default function AdminReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminApi.report(id) as Promise<Record<string, unknown>>, [id]);

  const [status, setStatus] = useState<ReportStatus>("UNDER_REVIEW");
  const [priority, setPriority] = useState("NORMAL");
  const [resolution, setResolution] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading label="Loading report…" />;
  if (error || !data) return <div><BackLink href="/admin/reports" label="Reports" /><div className="mt-4"><ErrorState error={error} onRetry={reload} /></div></div>;

  const report = (pick<Record<string, unknown>>(data, "report") ?? data) as Record<string, unknown>;
  const currentStatus = pick<string>(report, "status") ?? "OPEN";

  async function save() {
    setBusy(true);
    try {
      await adminApi.updateReport(id, {
        status,
        priority,
        resolution: resolution.trim() || undefined,
      });
      toast.success("Report updated.");
      reload();
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <BackLink href="/admin/reports" label="Reports" />

      <Card className="mt-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-ink">{humanize(pick<string>(report, "category") ?? "Report")}</h1>
            <p className="mt-0.5 text-xs text-muted">
              Ref {pick<string>(report, "reference")} · filed {dateTime(pick<string>(report, "created_at"))}
            </p>
          </div>
          <Badge className="border border-line bg-canvas text-ink-soft">{humanize(currentStatus)}</Badge>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{pick<string>(report, "description")}</p>
        {pick<string>(report, "resolution") && (
          <div className="mt-3 rounded-lg bg-canvas p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Resolution</p>
            <p className="mt-1 text-ink-soft">{pick<string>(report, "resolution")}</p>
          </div>
        )}
      </Card>

      {/* Update */}
      <Card className="mt-4 p-5">
        <h2 className="text-sm font-semibold text-ink">Update report</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)}>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Resolution (shown to the reporter)" hint="Required when resolving.">
            <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="What was done about this report." />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={save} loading={busy}>Save update</Button>
        </div>
      </Card>
    </div>
  );
}
