"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jobsApi } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { uploadFile } from "@/lib/upload";
import { useToast } from "@/components/ui/Toast";
import { Card, Field, Input, Textarea, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { BackLink, UrgencyBadge } from "@/components/ui/bits";
import { WorkspaceHeader, SectionCard, Stepper, RailLayout } from "@/components/ui/patterns";
import { ServicePicker, type PickedService } from "@/components/jobs/ServicePicker";
import { LocationStep } from "@/components/jobs/LocationStep";
import { cn } from "@/lib/cn";
import { areaLabel, budgetLabel, humanize } from "@/lib/format";
import { IconShield, IconWrench, IconPlus, IconClock, IconCheck } from "@/components/ui/icons";
import type { CreateJobInput, ServiceLocationInput, Urgency, BudgetType } from "@/lib/types";

/** Local shape for a job-media file uploaded during posting (camelCase for the create DTO). */
interface UploadedMedia {
  storagePath: string;
  mediaType: "IMAGE" | "VIDEO";
  mimeType?: string;
  url?: string | null;
}

const URGENCY_OPTIONS: { value: Urgency; label: string; tag: string; desc: string; icon: typeof IconClock }[] = [
  { value: "EMERGENCY", label: "Emergency", tag: "Within 2 hours", desc: "Artisans alerted immediately.", icon: IconWrench },
  { value: "HIGH", label: "Urgent", tag: "Today", desc: "Needs resolution by end of day.", icon: IconClock },
  { value: "NORMAL", label: "Normal", tag: "Flexible (2–3 days)", desc: "Compare competitive bids.", icon: IconCheck },
];

const STEPS = ["Category", "Job Details", "Location", "Budget & Timing", "Review"] as const;
const STEP_TITLES = [
  "What service do you need?",
  "Describe the job",
  "Where do you need the service?",
  "Set your budget & schedule",
  "Review & post",
];
const STEP_DESCS = [
  "Pick the closest match — you'll describe the specifics next.",
  "Verified artisans nearby see exactly what you write. Say it in your own words.",
  "Your exact gate and flat number stay strictly private and shielded until you select an artisan.",
  "Give a realistic budget range. Artisans review your details and submit competitive quotes.",
  "Check everything, then publish to relevant artisans across Lagos.",
];

function NewJobWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [service, setService] = useState<PickedService | null>(() => {
    const id = params.get("serviceId");
    const name = params.get("serviceName");
    return id && name ? { serviceId: id, serviceName: name } : null;
  });
  const [title, setTitle] = useState(params.get("title") ?? "");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("NORMAL");
  const [location, setLocation] = useState<ServiceLocationInput>({ country: "Nigeria", source: "MANUAL" });
  const [budgetType, setBudgetType] = useState<BudgetType>("NEGOTIABLE");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [preferredStartAt, setPreferredStartAt] = useState("");
  const [preferredTimeNotes, setPreferredTimeNotes] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [submitting, setSubmitting] = useState<false | "draft" | "publish">(false);
  const [error, setError] = useState<string | null>(null);

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return !!service;
      case 1:
        return title.trim().length >= 4 && description.trim().length >= 10;
      case 2:
        return !!(location.savedLocationId || (location.city && location.city.trim()));
      default:
        return true;
    }
  }, [step, service, title, description, location]);

  function buildPayload(publish: boolean): CreateJobInput {
    return {
      title: title.trim(),
      description: description.trim(),
      serviceId: service!.serviceId,
      location,
      urgency,
      budgetType,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      preferredStartAt: preferredStartAt ? new Date(preferredStartAt).toISOString() : undefined,
      preferredTimeNotes: preferredTimeNotes.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
      media: media.length
        ? media.map((m, i) => ({
            storagePath: m.storagePath,
            mediaType: m.mediaType,
            mimeType: m.mimeType,
            sortOrder: i,
          }))
        : undefined,
      publish,
    };
  }

  async function submit(publish: boolean) {
    setError(null);
    setSubmitting(publish ? "publish" : "draft");
    try {
      const job = await jobsApi.create(buildPayload(publish));
      toast.success(publish ? "Your job is live — artisans can now apply." : "Draft saved.");
      router.replace(`/jobs/${job.id}`);
    } catch (err) {
      setError(messageFor(err));
      setSubmitting(false);
    }
  }

  return (
    <div>
      <BackLink href="/home" label="Cancel" />

      <div className="mb-6 mt-3 rounded-card border border-line bg-surface p-4 shadow-card">
        <Stepper steps={[...STEPS]} current={step} />
      </div>

      <WorkspaceHeader
        eyebrow={`Service Request Wizard · Step ${step + 1} of ${STEPS.length}`}
        title={STEP_TITLES[step]}
        description={STEP_DESCS[step]}
      />

      <RailLayout rail={<RequestPreview service={service} title={title} urgency={urgency} location={location} budgetMin={budgetMin} budgetMax={budgetMax} budgetType={budgetType} />}>
        <Card className="p-5">
          {error && (
            <div className="mb-4 rounded-control border border-danger-600/20 bg-danger-50 px-3 py-2.5 text-sm text-danger-600" role="alert">
              {error}
            </div>
          )}

          {step >= 1 && step <= 3 && service && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-control border border-line bg-brand-50/40 p-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-control bg-brand-100 text-brand-600">
                  <IconWrench size={18} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Requested skillset</p>
                  <p className="text-sm font-semibold text-ink">{service.serviceName}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(0)}>Change service</Button>
            </div>
          )}

          {step === 0 && <ServicePicker value={service} onChange={setService} />}

        {step === 1 && (
          <section className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="title" className="text-sm font-medium text-ink">Job title <span className="text-danger-600">*</span></label>
                <span className="text-xs text-muted tnum">{title.length} / 80</span>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                placeholder="e.g. Fix leaking pipe under kitchen sink"
                maxLength={80}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted">A precise title helps certified artisans assess their tools before quoting.</p>
            </div>
            <Field label="Detailed problem description" htmlFor="desc" required hint="Clear details yield faster, more accurate bids.">
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="The pipe under my kitchen sink has been dripping for two days. There's a small puddle in the cabinet…"
                className="min-h-[140px]"
              />
            </Field>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">How quickly do you need this completed? <span className="text-danger-600">*</span></p>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {URGENCY_OPTIONS.map((opt) => {
                  const on = urgency === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setUrgency(opt.value)}
                      className={cn(
                        "rounded-control border p-3 text-left transition",
                        on ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" : "border-line hover:border-brand-200",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Icon size={18} className={on ? "text-brand-600" : "text-muted"} />
                        {on && <IconCheck size={16} className="text-brand-600" />}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-ink">{opt.label}</p>
                      <p className="text-xs font-medium text-brand-700">{opt.tag}</p>
                      <p className="mt-1 text-xs text-muted">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <MediaUploader media={media} onChange={setMedia} />
          </section>
        )}

        {step === 2 && <LocationStep value={location} onChange={setLocation} />}

        {step === 3 && (
          <section className="space-y-4">
            <Field label="Budget type" htmlFor="btype">
              <Select id="btype" value={budgetType} onChange={(e) => setBudgetType(e.target.value as BudgetType)}>
                <option value="NEGOTIABLE">Negotiable</option>
                <option value="FIXED">Fixed price</option>
                <option value="HOURLY">Per hour</option>
                <option value="DAILY">Per day</option>
              </Select>
            </Field>
            {budgetType !== "NEGOTIABLE" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="From (₦)" htmlFor="bmin">
                  <Input id="bmin" type="number" inputMode="numeric" min={0} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="5000" />
                </Field>
                <Field label="To (₦)" htmlFor="bmax">
                  <Input id="bmax" type="number" inputMode="numeric" min={0} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="12000" />
                </Field>
              </div>
            )}
            <Field label="Preferred start" htmlFor="start">
              <Input id="start" type="datetime-local" value={preferredStartAt} onChange={(e) => setPreferredStartAt(e.target.value)} />
            </Field>
            <Field label="Timing notes" htmlFor="tnotes">
              <Input id="tnotes" value={preferredTimeNotes} onChange={(e) => setPreferredTimeNotes(e.target.value)} placeholder="e.g. Weekday mornings work best" />
            </Field>
            <Field label="Anything else?" htmlFor="anotes">
              <Textarea id="anotes" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="Optional extra context for artisans" />
            </Field>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-4">
            <div className="space-y-3 rounded-control border border-line bg-canvas p-4">
              <Row label="Service" value={service?.serviceName} />
              <Row label="Title" value={title} />
              <Row label="Details" value={description} multiline />
              <Row label="Urgency" value={humanize(urgency)} />
              <Row label="Location" value={areaLabel(location.neighbourhood, location.city, location.state)} />
              <Row label="Budget" value={budgetLabel(budgetMin ? Number(budgetMin) : null, budgetMax ? Number(budgetMax) : null, budgetType)} />
              {preferredTimeNotes && <Row label="Timing" value={preferredTimeNotes} />}
              {media.length > 0 && <Row label="Photos" value={`${media.length} attached`} />}
            </div>

            <div className="rounded-control border border-line bg-brand-50/40 p-4">
              <p className="text-sm font-semibold text-ink">What happens next</p>
              <ol className="mt-2 space-y-2">
                {[
                  "Your job is broadcast to relevant, approved artisans nearby.",
                  "Artisans apply with a price and timeline — you'll be notified.",
                  "Compare applicants, message them, and select who you trust.",
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-xs text-muted">
              Your street address stays private until you select an artisan. Payment is arranged
              directly with them — Deevi doesn&apos;t handle the money.
            </p>
          </section>
        )}

        {/* Nav buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? router.push("/home") : setStep((s) => s - 1))}
            disabled={!!submitting}
          >
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Continue
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => submit(false)} loading={submitting === "draft"} disabled={!!submitting}>
                Save draft
              </Button>
              <Button onClick={() => submit(true)} loading={submitting === "publish"} disabled={!!submitting}>
                Publish job
              </Button>
            </div>
          )}
        </div>
        </Card>
      </RailLayout>
    </div>
  );
}

function RequestPreview({
  service,
  title,
  urgency,
  location,
  budgetMin,
  budgetMax,
  budgetType,
}: {
  service: PickedService | null;
  title: string;
  urgency: Urgency;
  location: ServiceLocationInput;
  budgetMin: string;
  budgetMax: string;
  budgetType: BudgetType;
}) {
  const area = areaLabel(location.neighbourhood, location.city, location.state);
  return (
    <>
      <SectionCard title="Request preview" aside={<span className="text-xs font-medium text-brand-700">Draft</span>}>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600">
              <IconWrench size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Service</p>
              <p className="truncate text-sm font-semibold text-ink">{service?.serviceName ?? "Not selected yet"}</p>
            </div>
          </div>
          {title && (
            <div className="border-t border-line pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Job title</p>
              <p className="text-sm text-ink">{title}</p>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-line pt-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Urgency</p>
              <div className="mt-0.5"><UrgencyBadge urgency={urgency} />{urgency === "NORMAL" || urgency === "LOW" ? <span className="text-sm text-ink">{humanize(urgency)}</span> : null}</div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Budget</p>
              <p className="text-sm font-semibold text-ink tnum">
                {budgetLabel(budgetMin ? Number(budgetMin) : null, budgetMax ? Number(budgetMax) : null, budgetType)}
              </p>
            </div>
          </div>
          <div className="border-t border-line pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Location preview</p>
            <p className="text-sm text-ink">{area}</p>
            <p className="mt-0.5 text-xs text-muted">Exact address stays private until selection.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={<IconShield size={18} />} title="Your address is shielded">
        <p className="text-sm text-ink-soft">
          Artisans in the public feed only see your neighbourhood and an approximate distance. Your
          street, flat number and phone are revealed only to the artisan you select.
        </p>
      </SectionCard>
    </>
  );
}

function MediaUploader({ media, onChange }: { media: UploadedMedia[]; onChange: (m: UploadedMedia[]) => void }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded: UploadedMedia[] = [];
      for (const file of files.slice(0, 5)) {
        const { path, publicUrl } = await uploadFile("job-media", file);
        uploaded.push({
          storagePath: path,
          url: publicUrl,
          mediaType: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
          mimeType: file.type,
        });
      }
      onChange([...media, ...uploaded]);
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">Diagnostic photos <span className="font-normal text-muted">(optional · up to 5)</span></p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-control border-2 border-dashed border-line bg-canvas py-6 text-center transition hover:border-brand-300"
      >
        {busy ? <Spinner size={20} className="text-brand-500" /> : <IconPlus size={20} className="text-brand-600" />}
        <span className="text-sm font-medium text-ink">{busy ? "Uploading…" : "Add photos or a short video"}</span>
        <span className="text-xs text-muted">Clear images prevent unnecessary call-out re-negotiations.</span>
      </button>
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={onFiles} />
      {media.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {media.map((m, i) => (
            <li key={m.storagePath ?? i} className="flex items-center gap-2 rounded-control border border-line bg-surface px-2.5 py-1.5 text-xs">
              <IconCheck size={14} className="text-success-600" />
              <span className="max-w-[120px] truncate text-ink">{m.mediaType === "VIDEO" ? "Video" : "Photo"} {i + 1}</span>
              <button
                type="button"
                onClick={() => onChange(media.filter((_, j) => j !== i))}
                className="text-muted hover:text-danger-600"
                aria-label="Remove"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value?: string | null; multiline?: boolean }) {
  return (
    <div className={cn("gap-1", multiline ? "block" : "flex justify-between")}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      <span className={cn("text-sm text-ink", multiline ? "mt-1 block whitespace-pre-wrap" : "text-right")}>
        {value || "—"}
      </span>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense fallback={null}>
      <NewJobWizard />
    </Suspense>
  );
}
