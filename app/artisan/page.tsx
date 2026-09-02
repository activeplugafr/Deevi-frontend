"use client";

import { useArtisanStatus } from "@/lib/useArtisanStatus";
import { JobFeed } from "@/components/artisan/JobFeed";
import { VerificationGate } from "@/components/artisan/VerificationGate";
import { Loading } from "@/components/ui/states";

export default function ArtisanHome() {
  const { status, isApproved, application, loading } = useArtisanStatus();

  if (loading) return <Loading label="Loading your dashboard…" />;
  if (isApproved) return <JobFeed />;
  return <VerificationGate status={status} application={application} />;
}
