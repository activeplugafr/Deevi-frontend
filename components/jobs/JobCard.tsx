import Link from "next/link";
import { Card } from "@/components/ui/primitives";
import { JobStatusBadge, UrgencyBadge } from "@/components/ui/bits";
import { areaLabel, budgetLabel, timeAgo } from "@/lib/format";
import { IconMapPin, IconUsers, IconClock } from "@/components/ui/icons";
import type { JobSummary } from "@/lib/types";

export function CustomerJobCard({ job }: { job: JobSummary }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="p-4 transition hover:border-brand-200 hover:shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 font-semibold text-ink line-clamp-1">{job.title}</h3>
          <div className="flex shrink-0 items-center gap-1.5">
            <UrgencyBadge urgency={job.urgency} />
            <JobStatusBadge status={job.status} />
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{job.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <IconMapPin size={14} /> {areaLabel(job.neighbourhood, job.city)}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-ink-soft">
            {budgetLabel(job.budget_min, job.budget_max)}
          </span>
          <span className="inline-flex items-center gap-1">
            <IconUsers size={14} /> {job.applications_count} application{job.applications_count === 1 ? "" : "s"}
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <IconClock size={14} /> {timeAgo(job.created_at)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
