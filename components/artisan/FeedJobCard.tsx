import Link from "next/link";
import { Card } from "@/components/ui/primitives";
import { UrgencyBadge } from "@/components/ui/bits";
import { areaLabel, budgetLabel, timeAgo } from "@/lib/format";
import { IconMapPin, IconClock, IconUsers } from "@/components/ui/icons";
import Image from "next/image";
import type { FeedJob } from "@/lib/types";

export function FeedJobCard({ job }: { job: FeedJob }) {
  return (
    <Link href={`/artisan/jobs/${job.id}`}>
      <Card className="p-3 transition hover:border-brand-200 hover:shadow-sm">
        {job.media && job.media.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            {job.media.slice(0, 4).map((m, i) => (
              <div key={i} className="relative aspect-[4/5] rounded-control overflow-hidden bg-canvas">
                <Image
                  src={m.url ?? m.storage_path ?? ""}
                  alt={`Job photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 25vw"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
            {job.service_name}
          </span>
          <div className="flex items-center gap-1.5">
            <UrgencyBadge urgency={job.urgency} />
            {job.distance_km != null && (
              <span className="text-xs text-muted">{job.distance_km.toFixed(1)} km</span>
            )}
          </div>
        </div>
        <h3 className="mt-2 font-semibold text-ink line-clamp-1">{job.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{job.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <IconMapPin size={14} /> {areaLabel(job.neighbourhood, job.city, job.state)}
          </span>
          <span className="font-medium text-ink-soft">
            {budgetLabel(job.budget_min, job.budget_max, job.budget_type)}
          </span>
          {job.applications_count > 0 && (
            <span className="inline-flex items-center gap-1">
              <IconUsers size={14} /> {job.applications_count} applied
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1">
            <IconClock size={14} /> {timeAgo(job.published_at ?? undefined)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
