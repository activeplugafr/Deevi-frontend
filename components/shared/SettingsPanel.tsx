"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/context";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Field, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/bits";

export function SettingsPanel() {
  const { logout } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [deactivate, setDeactivate] = useState(false);

  async function changePassword() {
    if (pw.next.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (pw.next !== pw.confirm) {
      toast.error("New passwords don't match.");
      return;
    }
    setPwBusy(true);
    try {
      await authApi.changePassword(pw.current, pw.next);
      toast.success("Password updated.");
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account." />

      {/* Change password */}
      <Card className="p-5">
        <h2 className="text-base font-semibold text-ink">Change password</h2>
        <div className="mt-4 space-y-4">
          <Field label="Current password">
            <Input type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} autoComplete="current-password" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" hint="At least 8 characters.">
              <Input type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} autoComplete="new-password" />
            </Field>
            <Field label="Confirm new password">
              <Input type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button onClick={changePassword} loading={pwBusy} disabled={!pw.current || !pw.next}>
              Update password
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="mt-6 border-danger-600/20 p-5">
        <h2 className="text-base font-semibold text-ink">Deactivate account</h2>
        <p className="mt-1 text-sm text-muted">
          Your account will be deactivated and you&apos;ll be signed out. Contact support if you
          want it restored.
        </p>
        <div className="mt-4">
          <Button variant="danger" onClick={() => setDeactivate(true)}>Deactivate my account</Button>
        </div>
      </Card>

      <ConfirmDialog
        open={deactivate}
        onClose={() => setDeactivate(false)}
        title="Deactivate your account?"
        message="You'll be signed out immediately. This can only be undone by contacting support."
        confirmLabel="Deactivate"
        danger
        withReason
        reasonLabel="Reason (optional)"
        onConfirm={async (reason) => {
          try {
            await usersApi.deactivate(reason);
            await logout();
            router.replace("/login");
          } catch (err) {
            toast.error(messageFor(err));
          }
        }}
      />
    </div>
  );
}
