"use client";

import Link from "next/link";
import { messagesApi } from "@/lib/api";
import { usePaginated } from "@/lib/hooks";
import { Avatar } from "@/components/ui/primitives";
import { AsyncBoundary, EmptyState, SkeletonList } from "@/components/ui/states";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/bits";
import { fullName, timeAgo } from "@/lib/format";
import { IconChat } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Conversation } from "@/lib/types";

/** Shared conversation list. `basePath` is /messages for customers, /artisan/messages for artisans. */
export function ConversationList({ basePath }: { basePath: string }) {
  const { data, loading, error, reload, page, setPage } = usePaginated(
    (p) => messagesApi.list({ page: p, limit: 20 }),
    [],
  );

  return (
    <div>
      <PageHeader title="Messages" subtitle="Chat with people about jobs." />
      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton={<SkeletonList count={5} />}
        isEmpty={!!data && data.items.length === 0}
        empty={
          <EmptyState
            title="No conversations yet"
            message="When you message someone about a job, it'll appear here."
            icon={<IconChat size={32} />}
          />
        }
      >
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {data?.items.map((c) => (
            <ConversationRow key={c.id} conversation={c} href={`${basePath}/${c.id}`} />
          ))}
        </div>
        {data && <Pagination meta={data.meta} page={page} onPage={setPage} />}
      </AsyncBoundary>
    </div>
  );
}

function ConversationRow({ conversation: c, href }: { conversation: Conversation; href: string }) {
  const cp = c.counterparty;
  const name = cp?.business_name || fullName(cp?.first_name, cp?.last_name, "Conversation");
  const unread = c.unread_count > 0;
  return (
    <Link href={href} className="flex items-center gap-3 p-3.5 transition hover:bg-canvas">
      <Avatar src={cp?.avatar_url} firstName={cp?.first_name} lastName={cp?.last_name} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("truncate text-sm", unread ? "font-bold text-ink" : "font-semibold text-ink")}>{name}</p>
          <span className="shrink-0 text-xs text-muted">{timeAgo(c.last_message_at)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={cn("truncate text-sm", unread ? "text-ink-soft" : "text-muted")}>
            {c.last_message_preview || "Say hello"}
          </p>
          {unread && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
              {c.unread_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
