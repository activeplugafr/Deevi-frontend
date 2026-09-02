"use client";

import { use } from "react";
import { adminApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { Card, Badge } from "@/components/ui/primitives";
import { Loading, ErrorState } from "@/components/ui/states";
import { BackLink, JobStatusBadge } from "@/components/ui/bits";
import { pick } from "@/components/admin/AdminList";
import { areaLabel, budgetLabel, dateTime, humanize } from "@/lib/format";

export default function AdminJobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsync(() => adminApi.job(id) as Promise<Record<string, unknown>>, [id]);

  if (loading) return <Loading label="Loading job…" />;
  if (error || !data) return <div><BackLink href="/admin/jobs" label="Jobs" /><div className="mt-4"><ErrorState error={error} onRetry={reload} /></div></div>;

  const job = (pick<Record<string, unknown>>(data, "job") ?? data) as Record<string, unknown>;
  const applications = (pick<Record<string, unknown>[]>(data, "applications") ?? []) as Record<string, unknown>[];
  const history = (pick<Record<string, unknown>[]>(data, "history") ?? []) as Record<string, unknown>[];

  return (
    <div>
      <BackLink href="/admin/jobs" label="Jobs" />

      <Card className="mt-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-ink">{pick<string>(job, "title") ?? "Job"}</h1>
            <p className="mt-0.5 text-xs text-muted">Created {dateTime(pick<string>(job, "created_at"))}</p>
          </div>
          <JobStatusBadge status={pick<string>(job, "status") ?? "PUBLISHED"} />
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{pick<string>(job, "description")}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
          <Info label="Location" value={areaLabel(pick<string>(job, "neighbourhood"), pick<string>(job, "city"), pick<string>(job, "state"))} />
          <Info label="Budget" value={budgetLabel(pick<number>(job, "budget_min"), pick<number>(job, "budget_max"), pick<string>(job, "budget_type"))} />
          <Info label="Applications" value={String(pick<number>(job, "applications_count") ?? applications.length)} />
        </div>
      </Card>

      {applications.length > 0 && (
        <Card className="mt-4 p-5">
          <h2 className="text-sm font-semibold text-ink">Applications ({applications.length})</h2>
          <ul className="mt-3 space-y-2">
            {applications.map((a, i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5 text-sm">
                <span className="truncate text-ink">
                  {pick<string>(a, "artisan_name") ?? pick<string>(a, "business_name") ?? "Artisan"}
                </span>
                <Badge className="border border-line bg-canvas text-ink-soft">{humanize(pick<string>(a, "status") ?? "SUBMITTED")}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {history.length > 0 && (
        <Card className="mt-4 p-5">
          <h2 className="text-sm font-semibold text-ink">Lifecycle history</h2>
          <ol className="mt-3 space-y-3 border-l border-line pl-4">
            {history.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-600" />
                <p className="text-sm font-medium text-ink">{humanize(pick<string>(h, "to_status", "status") ?? "")}</p>
                <p className="text-xs text-muted">{dateTime(pick<string>(h, "created_at"))}</p>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="truncate text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
