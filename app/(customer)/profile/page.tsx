"use client";

import { useState } from "react";
import { usersApi, customersApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { useAuth } from "@/lib/auth/context";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Avatar, Field, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/bits";
import { Stars } from "@/components/ui/bits";
import { fullName } from "@/lib/format";
import { IconMapPin, IconPlus } from "@/components/ui/icons";

export default function CustomerProfile() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const { data: profile } = useAsync(() => customersApi.me(), []);
  const { data: locations, reload: reloadLocations } = useAsync(() => customersApi.locations(), []);

  const [editing, setEditing] = useState(false);
  const [addingLocation, setAddingLocation] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profile" subtitle="Your account and saved locations." />

      {/* Identity */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatarUrl} firstName={user?.firstName} lastName={user?.lastName} size={64} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-ink">{fullName(user?.firstName, user?.lastName)}</h2>
            <p className="truncate text-sm text-muted">{user?.email}</p>
            {user?.phone && <p className="text-sm text-muted">{user.phone}</p>}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        </div>
        {profile && (
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
            <Stat label="Jobs posted" value={String(profile.jobs_posted_count)} />
            <Stat label="Completed" value={String(profile.jobs_completed_count)} />
            <Stat
              label="Your rating"
              value={profile.rating_count > 0 ? profile.rating_average.toFixed(1) : "—"}
              extra={profile.rating_count > 0 ? <Stars value={profile.rating_average} size={12} /> : null}
            />
          </div>
        )}
      </Card>

      {/* Saved locations */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Saved locations</h2>
          <Button variant="subtle" size="sm" onClick={() => setAddingLocation(true)}>
            <IconPlus size={16} /> Add
          </Button>
        </div>
        {locations && locations.length > 0 ? (
          <div className="space-y-2">
            {locations.map((loc) => (
              <Card key={loc.id} className="flex items-center gap-3 p-3.5">
                <IconMapPin size={20} className="text-brand-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{loc.label}</p>
                  <p className="truncate text-xs text-muted">
                    {[loc.neighbourhood, loc.city, loc.state].filter(Boolean).join(", ") || "Saved location"}
                  </p>
                </div>
                {loc.is_default && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">Default</span>
                )}
                <Button variant="ghost" size="sm" className="text-muted" onClick={() => setDeleteId(loc.id)}>
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-sm text-muted">
            No saved locations yet. Add one to speed up posting jobs.
          </Card>
        )}
      </div>

      {editing && user && (
        <EditProfileModal
          initial={{ firstName: user.firstName ?? "", lastName: user.lastName ?? "", phone: user.phone ?? "" }}
          onClose={() => setEditing(false)}
          onSaved={async () => {
            await refreshUser();
            setEditing(false);
            toast.success("Profile updated.");
          }}
        />
      )}

      {addingLocation && (
        <AddLocationModal
          onClose={() => setAddingLocation(false)}
          onSaved={() => {
            setAddingLocation(false);
            reloadLocations();
            toast.success("Location saved.");
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Remove this location?"
        confirmLabel="Remove"
        danger
        onConfirm={async () => {
          try {
            await customersApi.removeLocation(deleteId!);
            reloadLocations();
            toast.success("Location removed.");
          } catch (err) {
            toast.error(messageFor(err));
          }
        }}
      />
    </div>
  );
}

function Stat({ label, value, extra }: { label: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
      {extra && <div className="mt-0.5 flex justify-center">{extra}</div>}
    </div>
  );
}

function EditProfileModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: { firstName: string; lastName: string; phone: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    setBusy(true);
    try {
      await usersApi.update({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim() || undefined });
      onSaved();
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit profile"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={busy}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name"><Input value={form.firstName} onChange={set("firstName")} /></Field>
          <Field label="Last name"><Input value={form.lastName} onChange={set("lastName")} /></Field>
        </div>
        <Field label="Phone"><Input type="tel" value={form.phone} onChange={set("phone")} placeholder="0803 000 0000" /></Field>
      </div>
    </Modal>
  );
}

function AddLocationModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ label: "", neighbourhood: "", city: "", state: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!form.label.trim() || !form.city.trim()) return;
    setBusy(true);
    try {
      await customersApi.createLocation({
        label: form.label.trim(),
        neighbourhood: form.neighbourhood.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim() || undefined,
        country: "Nigeria",
        source: "MANUAL",
      });
      onSaved();
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Add a location"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={busy} disabled={!form.label.trim() || !form.city.trim()}>Save location</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Label" required hint="e.g. Home, Shop, Mum's place"><Input value={form.label} onChange={set("label")} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Neighbourhood"><Input value={form.neighbourhood} onChange={set("neighbourhood")} /></Field>
          <Field label="City" required><Input value={form.city} onChange={set("city")} /></Field>
        </div>
        <Field label="State"><Input value={form.state} onChange={set("state")} /></Field>
      </div>
    </Modal>
  );
}

