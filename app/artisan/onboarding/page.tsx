"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { artisansApi, catalogueApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Field, Input, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/ui/bits";
import { DocumentUploader } from "@/components/artisan/DocumentUploader";
import { cn } from "@/lib/cn";
import { IconCheck } from "@/components/ui/icons";

const STEPS = ["About you", "Services", "Areas", "Verification"] as const;

export default function ArtisanOnboarding() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const { data: me } = useAsync(() => artisansApi.me().catch(() => null), []);
  const { data: tree } = useAsync(() => catalogueApi.tree(), []);

  const [about, setAbout] = useState({ headline: "", businessName: "", bio: "", yearsOfExperience: "", baseCity: "", baseState: "" });
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [areas, setAreas] = useState<{ city: string; neighbourhood: string }[]>([{ city: "", neighbourhood: "" }]);

  // Prefill from existing profile (e.g. resubmission after rejection).
  useEffect(() => {
    if (!me) return;
    // Prefill the form once the existing profile loads (e.g. resubmission).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAbout({
      headline: (me.headline as string) ?? "",
      businessName: (me.business_name as string) ?? "",
      bio: (me.bio as string) ?? "",
      yearsOfExperience: me.years_of_experience != null ? String(me.years_of_experience) : "",
      baseCity: (me.base_city as string) ?? "",
      baseState: (me.base_state as string) ?? "",
    });
    if (Array.isArray(me.services)) setServiceIds(me.services.map((s) => s.service_id).filter(Boolean));
  }, [me]);

  const canContinue = useMemo(() => {
    if (step === 0) return about.headline.trim().length >= 3 && about.baseCity.trim().length >= 2;
    if (step === 1) return serviceIds.length > 0;
    if (step === 2) return areas.some((a) => a.city.trim());
    return true;
  }, [step, about, serviceIds, areas]);

  async function saveStep(): Promise<boolean> {
    setSaving(true);
    try {
      if (step === 0) {
        await artisansApi.update({
          headline: about.headline.trim(),
          businessName: about.businessName.trim() || undefined,
          bio: about.bio.trim() || undefined,
          yearsOfExperience: about.yearsOfExperience ? Number(about.yearsOfExperience) : undefined,
          baseCity: about.baseCity.trim(),
          baseState: about.baseState.trim() || undefined,
        });
      } else if (step === 1) {
        await artisansApi.setServices(serviceIds.map((serviceId) => ({ serviceId })));
      } else if (step === 2) {
        await artisansApi.setServiceAreas(
          areas.filter((a) => a.city.trim()).map((a) => ({ city: a.city.trim(), neighbourhood: a.neighbourhood.trim() || undefined })),
        );
      }
      return true;
    } catch (err) {
      toast.error(messageFor(err));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    if (!(await saveStep())) return;
    setStep((s) => s + 1);
  }

  async function submitForVerification() {
    setSaving(true);
    try {
      await artisansApi.submitApplication();
      toast.success("Submitted for verification. We'll review it shortly.");
      router.replace("/artisan");
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setSaving(false);
    }
  }

  function toggleService(id: string) {
    setServiceIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/artisan" label="Dashboard" />

      {/* Stepper */}
      <div className="mb-6 mt-3 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", i < step ? "bg-brand-600 text-white" : i === step ? "bg-brand-600 text-white ring-4 ring-brand-100" : "bg-canvas text-muted")}>
              {i < step ? <IconCheck size={15} /> : i + 1}
            </span>
            {i < STEPS.length - 1 && <span className={cn("h-0.5 flex-1", i < step ? "bg-brand-600" : "bg-line")} />}
          </div>
        ))}
      </div>

      <Card className="p-5">
        {step === 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Tell customers about yourself</h2>
              <p className="mt-1 text-sm text-muted">This is what customers see when you apply to jobs.</p>
            </div>
            <Field label="Headline" required hint="A short line about what you do.">
              <Input value={about.headline} onChange={(e) => setAbout({ ...about, headline: e.target.value })} placeholder="e.g. Experienced plumber — Lagos Mainland" />
            </Field>
            <Field label="Business name" hint="Optional">
              <Input value={about.businessName} onChange={(e) => setAbout({ ...about, businessName: e.target.value })} />
            </Field>
            <Field label="About you" hint="Optional — your experience, specialities, what customers can expect.">
              <Textarea value={about.bio} onChange={(e) => setAbout({ ...about, bio: e.target.value })} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Years experience">
                <Input type="number" min={0} value={about.yearsOfExperience} onChange={(e) => setAbout({ ...about, yearsOfExperience: e.target.value })} />
              </Field>
              <Field label="Base city" required>
                <Input value={about.baseCity} onChange={(e) => setAbout({ ...about, baseCity: e.target.value })} placeholder="Lagos" />
              </Field>
              <Field label="State">
                <Input value={about.baseState} onChange={(e) => setAbout({ ...about, baseState: e.target.value })} placeholder="Lagos" />
              </Field>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">What services do you offer?</h2>
              <p className="mt-1 text-sm text-muted">Pick all that apply — this decides which jobs you see.</p>
            </div>
            <div className="max-h-[24rem] space-y-4 overflow-y-auto scroll-slim pr-1">
              {(tree ?? []).map((cat) => (
                <div key={cat.id}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{cat.name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.services.map((s) => {
                      const on = serviceIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleService(s.id)}
                          className={cn("flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition", on ? "border-brand-600 bg-brand-50 font-medium text-brand-800" : "border-line hover:border-brand-200")}
                        >
                          <span className={cn("flex h-4 w-4 items-center justify-center rounded border", on ? "border-brand-600 bg-brand-600 text-white" : "border-line")}>
                            {on && <IconCheck size={12} />}
                          </span>
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted">{serviceIds.length} selected</p>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Where can you work?</h2>
              <p className="mt-1 text-sm text-muted">Add the areas you cover. Jobs nearby will be prioritised.</p>
            </div>
            <div className="space-y-3">
              {areas.map((a, i) => (
                <div key={i} className="flex items-end gap-2">
                  <Field label={i === 0 ? "City" : ""} required={i === 0}>
                    <Input value={a.city} onChange={(e) => setAreas((arr) => arr.map((x, j) => (j === i ? { ...x, city: e.target.value } : x)))} placeholder="Lagos Island" />
                  </Field>
                  <Field label={i === 0 ? "Neighbourhood" : ""}>
                    <Input value={a.neighbourhood} onChange={(e) => setAreas((arr) => arr.map((x, j) => (j === i ? { ...x, neighbourhood: e.target.value } : x)))} placeholder="Obalende" />
                  </Field>
                  {areas.length > 1 && (
                    <Button variant="ghost" size="sm" className="mb-1 text-muted" onClick={() => setAreas((arr) => arr.filter((_, j) => j !== i))}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="subtle" size="sm" onClick={() => setAreas((arr) => [...arr, { city: "", neighbourhood: "" }])}>
              Add another area
            </Button>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Verify your identity</h2>
              <p className="mt-1 text-sm text-muted">
                Upload a valid ID so customers know they can trust you. Documents are private and only seen by our verification team.
              </p>
            </div>
            <DocumentUploader />
            <div className="rounded-lg border border-line bg-canvas p-3 text-xs text-muted">
              When you submit, your profile goes to our team for review. You&apos;ll be notified once you&apos;re approved and can start applying to jobs.
            </div>
          </section>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => (step === 0 ? router.push("/artisan") : setStep((s) => s - 1))} disabled={saving}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={!canContinue} loading={saving}>Continue</Button>
          ) : (
            <Button onClick={submitForVerification} loading={saving}>Submit for verification</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
