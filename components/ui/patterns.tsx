"use client";

import { cn } from "@/lib/cn";
import { Card } from "./primitives";
import { IconCheck } from "./icons";

/**
 * Higher-level layout patterns that recur across the Stitch design. Compose
 * these instead of re-writing the same card/header markup on every page.
 */

// ---- WorkspaceHeader: eyebrow + big title + description + actions ----------

export function WorkspaceHeader({
  eyebrow,
  eyebrowTone = "brand",
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  eyebrowTone?: "brand" | "muted" | "success";
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  const toneClass =
    eyebrowTone === "success"
      ? "text-success-600"
      : eyebrowTone === "muted"
        ? "text-muted"
        : "text-brand-700";
  return (
    <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className={cn("eyebrow mb-1.5 flex items-center gap-1.5", toneClass)}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---- SectionCard: card with an icon + title + description header -----------

export function SectionCard({
  icon,
  title,
  description,
  aside,
  children,
  className,
  bodyClassName,
}: {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      {(title || icon || aside) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            {icon && (
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                {icon}
              </span>
            )}
            <div>
              {title && <h2 className="font-display text-base font-semibold text-ink">{title}</h2>}
              {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            </div>
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </Card>
  );
}

// ---- StatTile: label + big value (dashboard / summary metrics) -------------

export function StatTile({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      {icon && <div className="mb-2 text-brand-600">{icon}</div>}
      <p className="font-display text-2xl font-bold tracking-tight text-ink tnum">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
      {hint && <div className="mt-1">{hint}</div>}
    </Card>
  );
}

// ---- FeatureCard: the deep-blue promotional panel (white text) -------------

export function FeatureCard({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card p-5 text-white shadow-pop",
        "bg-gradient-to-br from-brand-600 to-brand-950",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-brand-100">
          {eyebrow}
        </p>
      )}
      {title && <div className="font-display text-lg font-bold">{title}</div>}
      {children && <div className="mt-1 text-sm text-brand-100">{children}</div>}
    </div>
  );
}

// ---- Stepper: horizontal numbered steps -----------------------------------

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number; // zero-based index of the active step
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex flex-1 items-center gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition",
                  done
                    ? "bg-brand-600 text-white"
                    : active
                      ? "bg-brand-600 text-white ring-4 ring-brand-100"
                      : "bg-canvas text-muted ring-1 ring-line",
                )}
              >
                {done ? <IconCheck size={15} /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  active ? "text-ink" : done ? "text-brand-700" : "text-muted",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={cn("h-0.5 flex-1 rounded-full", done ? "bg-brand-600" : "bg-line")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- StickyActionBar: pinned footer with a note + actions -----------------

export function StickyActionBar({
  note,
  children,
  className,
}: {
  note?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-card sm:border sm:shadow-float",
        className,
      )}
    >
      {note && <div className="mr-auto text-sm text-muted">{note}</div>}
      <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

// ---- RightRail: the secondary column on wide layouts -----------------------

export function RightRail({ children, className }: { children: React.ReactNode; className?: string }) {
  return <aside className={cn("space-y-4 lg:w-80 lg:shrink-0", className)}>{children}</aside>;
}

/** Two-column wrapper: main content + right rail (stacks on mobile). */
export function RailLayout({
  children,
  rail,
}: {
  children: React.ReactNode;
  rail: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-4">{children}</div>
      <RightRail>{rail}</RightRail>
    </div>
  );
}
