"use client";

import Link from "next/link";
import { Card } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/Button";
import { VerificationBadge } from "@/components/ui/bits";
import { IconShield, IconClock, IconCheck } from "@/components/ui/icons";
import { dateTime } from "@/lib/format";
import type { ArtisanApplicationStatus } from "@/lib/types";

/**
 * Shown to artisans who are not yet APPROVED. Honestly reflects the backend
 * verification status — the feed and applications stay locked until approval,
 * which the backend also enforces.
 */
export function VerificationGate({
  status,
  application,
}: {
  status: string;
  application?: ArtisanApplicationStatus | null;
}) {
  const normalized = (status || "PENDING").toUpperCase();

  if (normalized === "UNDER_REVIEW") {
    return (
      <Shell
        icon={<IconClock size={28} />}
        title="Your application is under review"
        badge={normalized}
        body="Our team is reviewing your details and documents. This usually takes a little time — we'll notify you as soon as there's an update. You can keep your profile up to date while you wait."
      >
        {application?.submitted_at && (
          <p className="text-xs text-muted">Submitted {dateTime(application.submitted_at)}</p>
        )}
        <LinkButton href="/artisan/profile" variant="secondary" size="sm">
          Review my profile
        </LinkButton>
      </Shell>
    );
  }

  if (normalized === "REJECTED") {
    return (
      <Shell
        icon={<IconShield size={28} />}
        title="We couldn't approve your application yet"
        badge={normalized}
        body="Please review the feedback below, update your profile and documents, and resubmit."
      >
        {application?.rejection_reason && (
          <div className="w-full rounded-lg border border-danger-600/20 bg-danger-50 px-3 py-2.5 text-left text-sm text-danger-600">
            {application.rejection_reason}
          </div>
        )}
        <LinkButton href="/artisan/onboarding" size="sm">
          Update &amp; resubmit
        </LinkButton>
      </Shell>
    );
  }

  if (normalized === "SUSPENDED") {
    return (
      <Shell
        icon={<IconShield size={28} />}
        title="Your account is suspended"
        badge={normalized}
        body="Your access to the marketplace is currently paused. Please contact Deevi support if you think this is a mistake."
      />
    );
  }

  // PENDING / not yet submitted → onboarding.
  return (
    <Shell
      icon={<IconShield size={28} />}
      title="Get verified to start finding work"
      badge={normalized}
      body="Complete your profile and submit your details for verification. Once approved, you'll see jobs matched to your services and area, and you can start applying."
    >
      <ul className="w-full space-y-2 text-left text-sm text-ink-soft">
        {["Add your services and rates", "Set the areas you cover", "Submit your ID for verification"].map((s) => (
          <li key={s} className="flex items-center gap-2">
            <IconCheck size={16} className="text-brand-600" /> {s}
          </li>
        ))}
      </ul>
      <LinkButton href="/artisan/onboarding" size="lg">
        Start onboarding
      </LinkButton>
    </Shell>
  );
}

function Shell({
  icon,
  title,
  body,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg">
      <Card className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          {icon}
        </div>
        {badge && <VerificationBadge status={badge} />}
        <div>
          <h1 className="text-lg font-bold text-ink">{title}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
        </div>
        {children}
      </Card>
      <p className="mt-4 text-center text-xs text-muted">
        Questions?{" "}
        <Link href="/artisan/settings" className="font-medium text-brand-600">
          Account settings
        </Link>
      </p>
    </div>
  );
}
