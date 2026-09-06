"use client";

import { useRouter } from "next/navigation";
import { notificationsApi } from "@/lib/api";
import { usePaginated } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { AsyncBoundary, EmptyState, SkeletonList } from "@/components/ui/states";
import { WorkspaceHeader } from "@/components/ui/patterns";
import { Pagination } from "@/components/ui/Pagination";
import { IconBell, IconCheck, IconStar, IconBriefcase } from "@/components/ui/icons";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Notification } from "@/lib/types";

/** Icon + tint for a notification's leading tile, derived from its type/priority. */
function tileFor(n: Notification): { icon: typeof IconBell; className: string } {
  const t = `${n.type} ${n.entity_type ?? ""}`.toUpperCase();
  if (["URGENT", "HIGH"].includes((n.priority ?? "").toUpperCase()))
    return { icon: IconBell, className: "bg-warn-50 text-warn-600" };
  if (t.includes("REVIEW")) return { icon: IconStar, className: "bg-warn-50 text-warn-500" };
  if (t.includes("APPLICATION") || t.includes("JOB") || t.includes("ENGAGEMENT"))
    return { icon: IconBriefcase, className: "bg-brand-50 text-brand-600" };
  if (t.includes("COMPLETE") || t.includes("APPROVED"))
    return { icon: IconCheck, className: "bg-success-50 text-success-600" };
  return { icon: IconBell, className: "bg-brand-50 text-brand-600" };
}

/** Maps a notification's entity to an in-app route for the given role base. */
function linkFor(n: Notification, base: string): string | null {
  const type = (n.entity_type ?? "").toUpperCase();
  const id = n.entity_id;
  if (!id) return null;
  if (type.includes("JOB")) return base === "/artisan" ? `/artisan/jobs/${id}` : `/jobs/${id}`;
  if (type.includes("APPLICATION")) return base === "/artisan" ? `/artisan/applications` : null;
  if (type.includes("CONVERSATION") || type.includes("MESSAGE"))
    return `${base === "/home" ? "" : base}/messages/${id}`;
  return null;
}

export function NotificationsFeed({ base }: { base: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data, loading, error, reload, page, setPage } = usePaginated(
    (p) => notificationsApi.list({ page: p, limit: 20 }),
    [],
  );

  async function markAll() {
    try {
      await notificationsApi.markAllRead();
      toast.success("All caught up.");
      reload();
    } catch (err) {
      toast.error(messageFor(err));
    }
  }

  async function open(n: Notification) {
    if (!n.read_at) notificationsApi.markRead(n.id).catch(() => {});
    const href = linkFor(n, base);
    if (href) router.push(href);
    else reload();
  }

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Live Activity"
        title="Notifications"
        description="Updates on your jobs, applications, messages and reviews."
        actions={
          <Button variant="secondary" size="sm" onClick={markAll}>
            <IconCheck size={16} /> Mark all read
          </Button>
        }
      />
      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton={<SkeletonList count={5} />}
        isEmpty={!!data && data.items.length === 0}
        empty={
          <EmptyState
            title="You're all caught up"
            message="Updates about your jobs, applications and messages will show up here."
            icon={<IconBell size={32} />}
          />
        }
      >
        <div className="space-y-2">
          {data?.items.map((n) => {
            const tile = tileFor(n);
            const Icon = tile.icon;
            return (
              <Card
                key={n.id}
                as="button"
                onClick={() => open(n)}
                interactive
                className={cn(
                  "flex w-full items-start gap-3 p-3.5 text-left",
                  !n.read_at && "border-brand-200 bg-brand-50/40",
                )}
              >
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-control", tile.className)}>
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                    {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                  </div>
                  {n.body && <p className="mt-0.5 text-sm text-muted">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted">{timeAgo(n.created_at)}</p>
                </div>
              </Card>
            );
          })}
        </div>
        {data && <Pagination meta={data.meta} page={page} onPage={setPage} />}
      </AsyncBoundary>
    </div>
  );
}
