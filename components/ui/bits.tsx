"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Badge } from "./primitives";
import { IconArrowLeft, IconStar } from "./icons";
import {
  jobStatusTone,
  applicationStatusTone,
  verificationTone,
  urgencyTone,
} from "@/lib/format";

export function JobStatusBadge({ status }: { status: string }) {
  const t = jobStatusTone(status);
  return <Badge className={t.className}>{t.label}</Badge>;
}
export function ApplicationStatusBadge({ status }: { status: string }) {
  const t = applicationStatusTone(status);
  return <Badge className={t.className}>{t.label}</Badge>;
}
export function VerificationBadge({ status }: { status: string }) {
  const t = verificationTone(status);
  return <Badge className={t.className}>{t.label}</Badge>;
}
export function UrgencyBadge({ urgency }: { urgency: string }) {
  const t = urgencyTone(urgency);
  if (!t) return null;
  return <Badge className={t.className}>{t.label}</Badge>;
}

/** Marks a screen (or section) as showing fabricated placeholder data. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge className={`border border-warn-500/30 bg-warn-50 text-warn-600 ${className ?? ""}`}>
      Demo data
    </Badge>
  );
}

// ---- Star rating -----------------------------------------------------------

export function Stars({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar
          key={i}
          size={size}
          className={i <= rounded ? "text-warn-500" : "text-line"}
        />
      ))}
    </span>
  );
}

export function StarInput({
  value,
  onChange,
  size = 30,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          className="p-0.5 transition hover:scale-110"
        >
          <IconStar size={size} className={i <= value ? "text-warn-500" : "text-line"} />
        </button>
      ))}
    </div>
  );
}

// ---- Back link -------------------------------------------------------------

export function BackLink({ href, label = "Back" }: { href?: string; label?: string }) {
  const router = useRouter();
  const content = (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
      <IconArrowLeft size={18} /> {label}
    </span>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return (
    <button onClick={() => router.back()} className="mb-1">
      {content}
    </button>
  );
}

// ---- Page header -----------------------------------------------------------

export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---- Segmented tabs (client-side filter switch) ----------------------------

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="scroll-slim -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition",
            value === opt.value
              ? "bg-brand-600 text-white shadow-card"
              : "bg-surface text-ink-soft border border-line hover:bg-brand-50 hover:text-brand-700",
          )}
        >
          {opt.label}
          {opt.count != null && (
            <span className={cn("ml-1.5", value === opt.value ? "text-white/70" : "text-muted")}>
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
