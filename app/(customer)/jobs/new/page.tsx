"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jobsApi } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Field, Input, Textarea, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/ui/bits";
import { ServicePicker, type PickedService } from "@/components/jobs/ServicePicker";
import { LocationStep } from "@/components/jobs/LocationStep";
import { cn } from "@/lib/cn";
import { areaLabel, budgetLabel, humanize } from "@/lib/format";
import { IconCheck } from "@/components/ui/icons";
import type { CreateJobInput, ServiceLocationInput, Urgency, BudgetType } from "@/lib/types";

const STEPS = ["Service", "Describe", "Location", "Details", "Review"] as const;

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
    <div className="mx-auto max-w-2xl">
      <BackLink href="/home" label="Cancel" />

      {/* Stepper */}
      <div className="mb-6 mt-3 flex items-center gap-1.5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  i < step ? "bg-brand-600 text-white" : i === step ? "bg-brand-600 text-white ring-4 ring-brand-100" : "bg-canvas text-muted",
                )}
              >
                {i < step ? <IconCheck size={15} /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span className={cn("h-0.5 flex-1", i < step ? "bg-brand-600" : "bg-line")} />
              )}
            </div>
            <span className={cn("hidden text-[11px] font-medium sm:block", i === step ? "text-ink" : "text-muted")}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <Card className="p-5">
        {error && (
          <div className="mb-4 rounded-lg border border-danger-600/20 bg-danger-50 px-3 py-2.5 text-sm text-danger-600" role="alert">
            {error}
          </div>
        )}

        {step === 0 && (
          <section>
            <h2 className="text-lg font-semibold text-ink">What service do you need?</h2>
            <p className="mb-4 mt-1 text-sm text-muted">Pick the closest match — you&apos;ll describe the specifics next.</p>
            <ServicePicker value={service} onChange={setService} />
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Describe the job</h2>
              <p className="mt-1 text-sm text-muted">
                Artisans see exactly what you write — say it in your own words.
              </p>
            </div>
            <Field label="Title" htmlFor="title" required hint="A short summary artisans see first.">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fix leaking pipe under kitchen sink"
                maxLength={120}
              />
            </Field>
            <Field label="Details" htmlFor="desc" required hint="What's the problem, and anything that helps an artisan quote accurately.">
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="The pipe under my kitchen sink has been dripping for two days. There's a small puddle in the cabinet…"
                className="min-h-[140px]"
              />
            </Field>
            <Field label="How urgent is it?" htmlFor="urgency">
              <Select id="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)}>
                <option value="LOW">Not urgent — whenever works</option>
                <option value="NORMAL">Normal — in the next few days</option>
                <option value="HIGH">Urgent — as soon as possible</option>
                <option value="EMERGENCY">Emergency — today</option>
              </Select>
            </Field>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="text-lg font-semibold text-ink">Where is the job?</h2>
            <p className="mb-4 mt-1 text-sm text-muted">
              This can be different from your home address — enter where the work actually happens.
            </p>
            <LocationStep value={location} onChange={setLocation} />
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Budget & timing</h2>
              <p className="mt-1 text-sm text-muted">All optional — leave blank if you&apos;d rather artisans propose.</p>
            </div>
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
            <h2 className="text-lg font-semibold text-ink">Review your job</h2>
            <div className="space-y-3 rounded-lg border border-line bg-canvas p-4">
              <Row label="Service" value={service?.serviceName} />
              <Row label="Title" value={title} />
              <Row label="Details" value={description} multiline />
              <Row label="Urgency" value={humanize(urgency)} />
              <Row label="Location" value={areaLabel(location.neighbourhood, location.city, location.state)} />
              <Row label="Budget" value={budgetLabel(budgetMin ? Number(budgetMin) : null, budgetMax ? Number(budgetMax) : null, budgetType)} />
              {preferredTimeNotes && <Row label="Timing" value={preferredTimeNotes} />}
            </div>
            <p className="text-xs text-muted">
              Publishing makes your job visible to relevant, approved artisans nearby. Your street
              address stays private until you select someone.
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
