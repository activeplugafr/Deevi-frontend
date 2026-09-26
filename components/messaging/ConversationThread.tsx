"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { messagesApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/primitives";
import { Loading, ErrorState } from "@/components/ui/states";
import { BackLink } from "@/components/ui/bits";
import { Spinner } from "@/components/ui/Spinner";
import { IconSend } from "@/components/ui/icons";
import { fullName, dateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Message } from "@/lib/types";

export function ConversationThread({ id, backHref }: { id: string; backHref: string }) {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: convo, loading, error, reload } = useAsync(() => messagesApi.get(id), [id]);

  // Initial page of messages + mark read.
  const { loading: msgLoading, error: msgError } = useAsync(async () => {
    const res = await messagesApi.messages(id, { limit: 30 });
    // API returns newest-first pages; show oldest-at-top.
    const ordered = [...res.items].reverse();
    setMessages(ordered);
    setHasMore(res.meta.hasNextPage);
    messagesApi.markRead(id).catch(() => {});
    return res;
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [msgLoading]);

  async function loadOlder() {
    if (!messages.length) return;
    setLoadingMore(true);
    try {
      const oldest = messages[0];
      const res = await messagesApi.messages(id, { limit: 30, before: oldest.created_at });
      const older = [...res.items].reverse();
      setMessages((m) => [...older, ...m]);
      setHasMore(res.meta.hasNextPage);
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setLoadingMore(false);
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    setBody("");
    try {
      const msg = await messagesApi.send(id, { body: text });
      setMessages((m) => [...m, msg]);
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
    } catch (err) {
      toast.error(messageFor(err));
      setBody(text); // preserve on failure
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Loading label="Opening conversation…" />;
  if (error || !convo) {
    return (
      <div>
        <BackLink href={backHref} label="Messages" />
        <div className="mt-4">
          <ErrorState error={error} onRetry={reload} />
        </div>
      </div>
    );
  }

  const cp = convo.counterparty;
  const name = cp?.business_name || fullName(cp?.first_name, cp?.last_name, "Conversation");

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col md:h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line bg-surface px-1 pb-3">
        <BackLink href={backHref} label="" />
        <Avatar src={cp?.avatar_url} firstName={cp?.first_name} lastName={cp?.last_name} size={38} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          {convo.job?.title && (
            <Link href="#" className="truncate text-xs text-muted">
              Re: {convo.job.title}
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="scroll-slim flex-1 space-y-2 overflow-y-auto py-4">
        {msgLoading ? (
          <Loading label="Loading messages…" />
        ) : msgError ? (
          <ErrorState error={msgError} />
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            No messages yet — send the first one below.
          </p>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={loadOlder}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft hover:bg-canvas"
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading…" : "Load earlier messages"}
                </button>
              </div>
            )}
            {messages.map((m) => (
              <Bubble key={m.id} message={m} mine={m.sender_id === user?.id} />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={send} className="flex items-end gap-2 border-t border-line bg-surface pt-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(e);
            }
          }}
          rows={1}
          placeholder="Write a message…"
          className="scroll-slim max-h-32 flex-1 resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={!body.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-brand-300"
          aria-label="Send"
        >
          {sending ? <Spinner size={18} /> : <IconSend size={20} />}
        </button>
      </form>
    </div>
  );
}

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm",
          mine ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm bg-surface border border-line text-ink",
        )}
        title={dateTime(message.created_at)}
      >
        {message.attachment_url && (
          <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="mb-1 block underline">
            Attachment
          </a>
        )}
        {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
      </div>
    </div>
  );
}
