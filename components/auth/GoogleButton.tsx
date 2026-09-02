"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { Button } from "@/components/ui/Button";

/**
 * Google sign-in. The button only appears when the backend reports Google as an
 * enabled provider (GET /auth/providers). Right now the backend has it disabled
 * (mocked), so this renders nothing rather than faking a broken button — the
 * OAuth wiring below is ready for the day it's turned on.
 */
export function GoogleButton({ role }: { role?: "CUSTOMER" | "ARTISAN" }) {
  const { data: providers } = useAsync(() => authApi.providers(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!providers?.google?.enabled) return null;

  async function start() {
    setError(null);
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { url } = await authApi.oauthUrl("google", role ?? "CUSTOMER", redirectTo);
      window.location.href = url;
    } catch (err) {
      setError(messageFor(err));
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="relative my-4 text-center">
        <span className="relative z-10 bg-canvas px-3 text-xs text-muted">or</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
      </div>
      <Button variant="secondary" fullWidth size="lg" loading={loading} onClick={start} type="button">
        Continue with Google
      </Button>
      {error && <p className="mt-2 text-center text-xs text-danger-600">{error}</p>}
    </div>
  );
}
