"use client";

import { useState } from "react";
import Link from "next/link";
import { artisansApi, catalogueApi, storageApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Avatar, VerifiedTick, Badge, Field, Input, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Loading, ErrorState } from "@/components/ui/states";
import { PageHeader, Stars, VerificationBadge } from "@/components/ui/bits";
import { cn } from "@/lib/cn";
import { fullName, humanize, naira } from "@/lib/format";
import { IconCheck, IconMapPin } from "@/components/ui/icons";
import Image from "next/image";
import { Spinner } from "@/components/ui/Spinner";
import type { PublicArtisan, AvailabilityStatus, StorageBucket } from "@/lib/types";

export default function ArtisanProfilePage() {
  const toast = useToast();
  const { data: me, loading, error, reload, setData } = useAsync(() => artisansApi.me(), []);
  const [editInfo, setEditInfo] = useState(false);
  const [editServices, setEditServices] = useState(false);
  const [editAreas, setEditAreas] = useState(false);


  if (loading) return <Loading label="Loading your profile…" />;
  if (error || !me) return <ErrorState error={error} onRetry={reload} />;

  const name = me.business_name || fullName(me.first_name, me.last_name, "Your profile");
  const status = (me.verification_status ?? "PENDING") as string;
  const verified = status === "APPROVED";

  async function setAvailability(value: AvailabilityStatus) {
    try {
      await artisansApi.update({ availabilityStatus: value });
      setData((prev) => (prev ? { ...prev, availability_status: value } : prev));
      toast.success("Availability updated.");
    } catch (err) {
      toast.error(messageFor(err));
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="My profile"
        action={
          me.id ? (
            <Link href={`/artisan/preview/${me.id}`} className="text-sm font-semibold text-brand-600">
              Preview
            </Link>
          ) : undefined
        }
      />

      {/* Verification status */}
      <Card className={cn("mb-4 flex items-center gap-3 p-4", !verified && "border-brand-200 bg-brand-50/40")}>
        <VerificationBadge status={status} />
        <p className="flex-1 text-sm text-ink-soft">
          {verified
            ? "Your account is verified — you can apply to jobs."
            : status === "UNDER_REVIEW"
              ? "Your application is under review."
              : "Complete verification to start applying to jobs."}
        </p>
        {!verified && status !== "UNDER_REVIEW" && (
          <Link href="/artisan/onboarding" className="text-sm font-semibold text-brand-600">
            Continue
          </Link>
        )}
      </Card>

      {/* Identity */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar src={me.avatar_url} firstName={me.first_name} lastName={me.last_name} size={64} />
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-1 truncate text-lg font-bold text-ink">
              {name} {verified && <VerifiedTick />}
            </h2>
            {me.headline && <p className="text-sm text-ink-soft">{me.headline}</p>}
            <div className="mt-1 flex items-center gap-2 text-sm text-muted">
              {(me.rating_count ?? 0) > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Stars value={me.rating_average ?? 0} size={13} /> {(me.rating_average ?? 0).toFixed(1)} ({me.rating_count})
                </span>
              ) : (
                <span>No reviews yet</span>
              )}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setEditInfo(true)}>Edit</Button>
        </div>
        {me.bio && <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{me.bio}</p>}

        {/* Availability */}
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-sm font-medium text-ink">Availability</p>
          <div className="flex gap-2">
            {(["AVAILABLE", "BUSY", "UNAVAILABLE"] as AvailabilityStatus[]).map((v) => (
              <button
                key={v}
                onClick={() => setAvailability(v)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition",
                  me.availability_status === v ? "bg-ink text-white" : "border border-line bg-surface text-ink-soft hover:bg-canvas",
                )}
              >
                {humanize(v)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Services */}
      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Services</h2>
          <Button variant="ghost" size="sm" onClick={() => setEditServices(true)}>Edit</Button>
        </div>
        {me.services && me.services.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {me.services.map((s, i) => (
              <Badge key={s.id ?? i} className="border border-line bg-canvas text-ink-soft">
                {s.services?.name ?? "Service"}
                {s.price_min != null && <span className="ml-1 text-muted">· from {naira(s.price_min)}</span>}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">No services added yet.</p>
        )}
      </Card>

      {/* Areas */}
      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Service areas</h2>
          <Button variant="ghost" size="sm" onClick={() => setEditAreas(true)}>Edit</Button>
        </div>
        {me.service_areas && me.service_areas.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-ink-soft">
            {me.service_areas.map((area, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1">
                <IconMapPin size={13} className="text-muted" />
                {[area.neighbourhood, area.city].filter(Boolean).join(", ") || area.city}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">No service areas set.</p>
        )}
      </Card>

      {editInfo && (
        <EditInfoModal artisan={me} onClose={() => setEditInfo(false)} onSaved={() => { setEditInfo(false); reload(); }} />
      )}
      {editServices && (
        <ServicesModal current={(me.services ?? []).map((s) => s.service_id)} onClose={() => setEditServices(false)} onSaved={() => { setEditServices(false); reload(); }} />
      )}
      {editAreas && (
        <AreasModal current={me.service_areas ?? []} onClose={() => setEditAreas(false)} onSaved={() => { setEditAreas(false); reload(); }} />
      )}
    </div>
  );
}

function EditInfoModal({ artisan, onClose, onSaved }: { artisan: PublicArtisan; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    headline: artisan.headline ?? "",
    businessName: artisan.business_name ?? "",
    bio: artisan.bio ?? "",
    yearsOfExperience: artisan.years_of_experience != null ? String(artisan.years_of_experience) : "",
    baseCity: artisan.base_city ?? "",
    baseState: artisan.base_state ?? "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(artisan.avatar_url ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(): Promise<string | null> {
    if (!avatarFile) return null;
    setUploadingAvatar(true);
    try {
      const ticket = await storageApi.uploadTicket({
        bucket: "avatars" as StorageBucket,
        filename: avatarFile.name,
        mimeType: avatarFile.type,
        sizeBytes: avatarFile.size,
      });
      const res = await fetch(ticket.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": avatarFile.type, ...(ticket.token ? { Authorization: `Bearer ${ticket.token}` } : {}) },
        body: avatarFile,
      });
      if (!res.ok) throw new Error("Avatar upload failed.");
      return ticket.publicUrl ?? ticket.path;
    } catch (err) {
      toast.error(messageFor(err));
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function save() {
    setBusy(true);
    try {
      const avatarUrl = await uploadAvatar();
      await artisansApi.update({
        headline: form.headline.trim(),
        businessName: form.businessName.trim() || undefined,
        bio: form.bio.trim() || undefined,
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
        baseCity: form.baseCity.trim() || undefined,
        baseState: form.baseState.trim() || undefined,
        avatarUrl: avatarUrl ?? undefined,
      });
      toast.success("Profile updated.");
      onSaved();
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(false);
      setUploadingAvatar(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Edit profile" size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} loading={busy}>Save</Button></>}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={avatarPreview ?? artisan.avatar_url ?? ""}
              alt={artisan.business_name || fullName(artisan.first_name, artisan.last_name, "Profile")}
              width={80}
              height={80}
              className="rounded-full object-cover bg-canvas border border-line"
              style={{ width: 80, height: 80 }}
            />
            <label className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm cursor-pointer hover:bg-brand-700 transition">
              <input
                type="file"
                accept="image/*"
                onChange={onAvatarSelect}
                className="sr-only"
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6l6 6" /></svg>
            </label>
            {uploadingAvatar && <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white text-[10px]"><Spinner size={14} className="text-brand-50" /></span>}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">Profile picture</p>
            <p className="text-xs text-muted">JPG or PNG, max 2MB.</p>
          </div>
        </div>
        <Field label="Headline"><Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></Field>
        <Field label="Business name"><Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></Field>
        <Field label="About"><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={1000} /><p className="mt-1 text-xs text-right text-muted">{form.bio.length} / 1000 characters</p></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Years exp."><Input type="number" min={0} value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })} /></Field>
          <Field label="Base city"><Input value={form.baseCity} onChange={(e) => setForm({ ...form, baseCity: e.target.value })} /></Field>
          <Field label="State"><Input value={form.baseState} onChange={(e) => setForm({ ...form, baseState: e.target.value })} /></Field>
        </div>
      </div>
    </Modal>
  );
}

function ServicesModal({ current, onClose, onSaved }: { current: string[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const { data: tree } = useAsync(() => catalogueApi.tree(), []);
  const [ids, setIds] = useState<string[]>(current);
  const [busy, setBusy] = useState(false);
  const toggle = (id: string) => setIds((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));

  async function save() {
    setBusy(true);
    try {
      await artisansApi.setServices(ids.map((serviceId) => ({ serviceId })));
      toast.success("Services updated.");
      onSaved();
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Edit services" size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} loading={busy} disabled={ids.length === 0}>Save</Button></>}>
      <div className="space-y-4">
        {(tree ?? []).map((cat) => (
          <div key={cat.id}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{cat.name}</p>
            <div className="grid grid-cols-2 gap-2">
              {cat.services.map((s) => {
                const on = ids.includes(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggle(s.id)}
                    className={cn("flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition", on ? "border-brand-600 bg-brand-50 font-medium text-brand-800" : "border-line hover:border-brand-200")}>
                    <span className={cn("flex h-4 w-4 items-center justify-center rounded border", on ? "border-brand-600 bg-brand-600 text-white" : "border-line")}>{on && <IconCheck size={12} />}</span>
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function AreasModal({ current, onClose, onSaved }: { current: { city: string; neighbourhood?: string | null }[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [areas, setAreas] = useState(current.length ? current.map((a) => ({ city: a.city, neighbourhood: a.neighbourhood ?? "" })) : [{ city: "", neighbourhood: "" }]);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await artisansApi.setServiceAreas(areas.filter((a) => a.city.trim()).map((a) => ({ city: a.city.trim(), neighbourhood: a.neighbourhood.trim() || undefined })));
      toast.success("Service areas updated.");
      onSaved();
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Edit service areas"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} loading={busy}>Save</Button></>}>
      <div className="space-y-3">
        {areas.map((a, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field label={i === 0 ? "City" : ""}><Input value={a.city} onChange={(e) => setAreas((arr) => arr.map((x, j) => (j === i ? { ...x, city: e.target.value } : x)))} placeholder="Lagos Island" /></Field>
            <Field label={i === 0 ? "Neighbourhood" : ""}><Input value={a.neighbourhood} onChange={(e) => setAreas((arr) => arr.map((x, j) => (j === i ? { ...x, neighbourhood: e.target.value } : x)))} placeholder="Obalende" /></Field>
            {areas.length > 1 && <Button variant="ghost" size="sm" className="mb-1 text-muted" onClick={() => setAreas((arr) => arr.filter((_, j) => j !== i))}>✕</Button>}
          </div>
        ))}
        <Button variant="subtle" size="sm" onClick={() => setAreas((arr) => [...arr, { city: "", neighbourhood: "" }])}>Add area</Button>
      </div>
    </Modal>
  );
}
