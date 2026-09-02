/** Small, dependency-free formatting helpers used across the app. */

import type { JobStatus, Urgency, ApplicationStatus, VerificationStatus } from "./types";

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Format a NGN amount. Backend money is decimal in the job's currency. */
export function naira(value: number | null | undefined): string {
  if (value == null) return "—";
  try {
    return NGN.format(value);
  } catch {
    return `₦${value.toLocaleString()}`;
  }
}

/** A budget range → "₦5,000 – ₦12,000", "From ₦5,000", "Negotiable", etc. */
export function budgetLabel(
  min: number | null | undefined,
  max: number | null | undefined,
  type?: string | null,
): string {
  if (min == null && max == null) {
    return type === "NEGOTIABLE" || !type ? "Negotiable" : "Budget on request";
  }
  if (min != null && max != null && min !== max) return `${naira(min)} – ${naira(max)}`;
  const single = min ?? max;
  return naira(single);
}

export function fullName(
  first?: string | null,
  last?: string | null,
  fallback = "Deevi user",
): string {
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name || fallback;
}

export function initials(first?: string | null, last?: string | null): string {
  const a = (first ?? "").trim()[0] ?? "";
  const b = (last ?? "").trim()[0] ?? "";
  return (a + b).toUpperCase() || "•";
}

/** Relative time like "just now", "5m ago", "3h ago", "2d ago", or a date. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 45) return "just now";
  if (secs < 90) return "1m ago";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function dateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function dateOnly(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/** Human label for enum-ish tokens: "RECEIVING_APPLICATIONS" → "Receiving applications". */
export function humanize(token?: string | null): string {
  if (!token) return "";
  return token
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function areaLabel(
  neighbourhood?: string | null,
  city?: string | null,
  state?: string | null,
): string {
  const parts = [neighbourhood, city, state].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location on request";
}

// ---- Status presentation ---------------------------------------------------

export interface Tone {
  label: string;
  // Tailwind classes; we lean on gray/blue and reserve orange for urgency.
  className: string;
}

export function jobStatusTone(status: JobStatus | string): Tone {
  const map: Record<string, Tone> = {
    DRAFT: { label: "Draft", className: "bg-canvas text-muted border border-line" },
    PUBLISHED: { label: "Published", className: "bg-brand-50 text-brand-700 border border-brand-100" },
    RECEIVING_APPLICATIONS: { label: "Receiving applications", className: "bg-brand-50 text-brand-700 border border-brand-100" },
    ARTISAN_SELECTED: { label: "Artisan selected", className: "bg-brand-600 text-white" },
    ACCEPTED: { label: "Accepted", className: "bg-brand-600 text-white" },
    IN_PROGRESS: { label: "In progress", className: "bg-brand-600 text-white" },
    COMPLETED: { label: "Completed", className: "bg-success-50 text-success-600 border border-success-600/20" },
    CANCELLED: { label: "Cancelled", className: "bg-canvas text-muted border border-line" },
    DISPUTED: { label: "Disputed", className: "bg-warn-50 text-warn-600 border border-warn-500/30" },
    EXPIRED: { label: "Expired", className: "bg-canvas text-muted border border-line" },
  };
  return map[status] ?? { label: humanize(status), className: "bg-canvas text-muted border border-line" };
}

export function applicationStatusTone(status: ApplicationStatus | string): Tone {
  const map: Record<string, Tone> = {
    SUBMITTED: { label: "Submitted", className: "bg-brand-50 text-brand-700 border border-brand-100" },
    SHORTLISTED: { label: "Shortlisted", className: "bg-brand-600 text-white" },
    ACCEPTED: { label: "Selected", className: "bg-success-50 text-success-600 border border-success-600/20" },
    REJECTED: { label: "Not selected", className: "bg-canvas text-muted border border-line" },
    WITHDRAWN: { label: "Withdrawn", className: "bg-canvas text-muted border border-line" },
    EXPIRED: { label: "Expired", className: "bg-canvas text-muted border border-line" },
  };
  return map[status] ?? { label: humanize(status), className: "bg-canvas text-muted border border-line" };
}

export function verificationTone(status: VerificationStatus | string): Tone {
  const map: Record<string, Tone> = {
    PENDING: { label: "Pending", className: "bg-canvas text-muted border border-line" },
    UNDER_REVIEW: { label: "Under review", className: "bg-brand-50 text-brand-700 border border-brand-100" },
    APPROVED: { label: "Verified", className: "bg-success-50 text-success-600 border border-success-600/20" },
    REJECTED: { label: "Rejected", className: "bg-danger-50 text-danger-600 border border-danger-600/20" },
    SUSPENDED: { label: "Suspended", className: "bg-warn-50 text-warn-600 border border-warn-500/30" },
  };
  return map[status] ?? { label: humanize(status), className: "bg-canvas text-muted border border-line" };
}

export function urgencyTone(urgency: Urgency | string): Tone | null {
  // Only HIGH/EMERGENCY earn a visible (orange) accent; the rest stay neutral.
  if (urgency === "EMERGENCY")
    return { label: "Emergency", className: "bg-warn-500 text-white" };
  if (urgency === "HIGH")
    return { label: "Urgent", className: "bg-warn-50 text-warn-600 border border-warn-500/30" };
  return null;
}
