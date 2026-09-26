"use client";

import { use, useState } from "react";
import { adminApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Avatar, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Loading, ErrorState } from "@/components/ui/states";
import { BackLink } from "@/components/ui/bits";
import { pick } from "@/components/admin/AdminList";
import { fullName, humanize, dateTime } from "@/lib/format";

export default function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminApi.user(id) as Promise<Record<string, unknown>>, [id]);
  const [suspend, setSuspend] = useState(false);
  const [reinstate, setReinstate] = useState(false);

  if (loading) return <Loading label="Loading user…" />;
  if (error || !data) return <div><BackLink href="/admin/users" label="Users" /><div className="mt-4"><ErrorState error={error} onRetry={reload} /></div></div>;

  const u = (pick<Record<string, unknown>>(data, "user") ?? data) as Record<string, unknown>;
  const roles = (pick<string[]>(u, "roles") ?? []) as string[];
  const status = pick<string>(u, "status") ?? "ACTIVE";
  const suspended = status === "SUSPENDED";

  return (
    <div>
      <BackLink href="/admin/users" label="Users" />
      <Card className="mt-3 p-5">
        <div className="flex items-start gap-4">
          <Avatar src={pick<string>(u, "avatar_url")} firstName={pick<string>(u, "first_name")} lastName={pick<string>(u, "last_name")} size={60} />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-ink">{fullName(pick<string>(u, "first_name"), pick<string>(u, "last_name"))}</h1>
            <p className="text-sm text-muted">{pick<string>(u, "email")}</p>
            {pick<string>(u, "phone") && <p className="text-sm text-muted">{pick<string>(u, "phone")}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roles.map((r) => <Badge key={r} className="border border-line bg-canvas text-ink-soft">{humanize(r)}</Badge>)}
              <Badge className={suspended ? "bg-warn-50 text-warn-600" : "bg-success-50 text-success-600"}>{humanize(status)}</Badge>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
          <Info label="Joined" value={dateTime(pick<string>(u, "created_at"))} />
          <Info label="Email verified" value={pick<boolean>(u, "email_verified") ? "Yes" : "No"} />
          <Info label="User ID" value={pick<string>(u, "id") ?? id} mono />
        </div>
      </Card>

      <div className="mt-4 flex gap-2">
        {suspended ? (
          <Button onClick={() => setReinstate(true)}>Reinstate user</Button>
        ) : (
          <Button variant="danger" onClick={() => setSuspend(true)}>Suspend user</Button>
        )}
      </div>

      <ConfirmDialog
        open={suspend}
        onClose={() => setSuspend(false)}
        title="Suspend this user?"
        message="They will lose access until reinstated."
        confirmLabel="Suspend"
        danger
        withReason
        reasonRequired
        reasonLabel="Reason"
        onConfirm={async (reason) => {
          try {
            await adminApi.suspendUser(id, reason);
            toast.success("User suspended.");
            reload();
          } catch (err) { toast.error(messageFor(err)); }
        }}
      />
      <ConfirmDialog
        open={reinstate}
        onClose={() => setReinstate(false)}
        title="Reinstate this user?"
        message="They will regain access to Deevi."
        confirmLabel="Reinstate"
        onConfirm={async () => {
          try {
            await adminApi.reinstateUser(id);
            toast.success("User reinstated.");
            reload();
          } catch (err) { toast.error(messageFor(err)); }
        }}
      />
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className={`truncate text-sm font-medium text-ink ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}
