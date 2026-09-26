"use client";

import { artisansApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { useAuth } from "@/lib/auth/context";

/**
 * Resolves an artisan's verification status, preferring the live application
 * record but falling back to the auth principal. Used to gate the feed.
 */
export function useArtisanStatus() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(async () => {
    try {
      return await artisansApi.applicationStatus();
    } catch {
      return null;
    }
  }, []);

  const status =
    data?.status ?? user?.artisanVerificationStatus ?? "PENDING";

  return {
    status: String(status).toUpperCase(),
    isApproved: String(status).toUpperCase() === "APPROVED",
    application: data,
    loading,
    error,
    reload,
  };
}
