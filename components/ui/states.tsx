"use client";

import { cn } from "@/lib/cn";
import { messageFor } from "@/lib/errors";
import { statusFor } from "@/lib/errors";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

// ---- Skeletons -------------------------------------------------------------

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ---- Centered spinner ------------------------------------------------------

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <Spinner size={28} className="text-brand-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ---- Empty state -----------------------------------------------------------

export function EmptyState({
  title,
  message,
  icon,
  action,
  className,
}: {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-3 rounded-xl border border-dashed border-line bg-surface px-6 py-14",
        className,
      )}
    >
      {icon && <div className="text-muted">{icon}</div>}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {message && <p className="text-sm text-muted max-w-sm mx-auto">{message}</p>}
      </div>
      {action}
    </div>
  );
}

// ---- Error state -----------------------------------------------------------

export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  const status = statusFor(error);
  const title =
    status === 403
      ? "You don't have access"
      : status === 404
        ? "Not found"
        : status === 401
          ? "Please sign in"
          : "Something went wrong";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-3 rounded-xl border border-line bg-surface px-6 py-12",
        className,
      )}
      role="alert"
    >
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="text-sm text-muted max-w-sm">{messageFor(error)}</p>
      {onRetry && status !== 403 && status !== 404 && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/**
 * Standard async region: shows skeleton while loading, error state on failure,
 * empty state when the resolved list is empty, else the children.
 */
export function AsyncBoundary({
  loading,
  error,
  isEmpty,
  onRetry,
  skeleton,
  empty,
  children,
}: {
  loading: boolean;
  error: unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  skeleton?: React.ReactNode;
  empty?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (loading) return <>{skeleton ?? <SkeletonList />}</>;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty && empty) return <>{empty}</>;
  return <>{children}</>;
}
