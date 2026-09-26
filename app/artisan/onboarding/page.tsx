"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { artisansApi, catalogueApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Field, Input, Textarea } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/ui/bits";
import { WorkspaceHeader, SectionCard, Stepper, StickyActionBar, RailLayout } from "@/components/ui/patterns";
import { DocumentUploader } from "@/components/artisan/DocumentUploader";
import { cn } from "@/lib/cn";
import { IconCheck, IconUser, IconWrench, IconMapPin, IconShield } from "@/components/ui/icons";

const STEPS = ["About you", "Services", "Areas", "Verification"] as const;
const STEP_META = [
  { icon: IconUser, title: "Tell us about yourself & your trade", desc: "Clients hire certified, reliable craftspeople. Establish your professional identity and build instant credibility." },
  { icon: IconWrench, title: "What services do you offer?", desc: "Choose the trade skills and job categories you handle. This decides which jobs you're matched with." },
  { icon: IconMapPin, title: "Where do you want to work?", desc: "Define your base operational zones across Lagos. You'll get job alerts for requests in these areas." },
  { icon: IconShield, title: "Verify your identity & trade credentials", desc: "Upload a valid ID so clients know they can trust you. Documents are private and only seen by our team." },
];
const TIPS = [
  "Match your legal name exactly to your NIN / BVN records.",
  "List specific trade specialities — general profiles take longer to review.",
  "Set an accurate base area so you aren't matched with faraway jobs.",
];

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

  const meta = STEP_META[step];
  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div>
      <BackLink href="/artisan" label="Dashboard" />

      <div className="mb-6 mt-3 rounded-card border border-line bg-surface p-4 shadow-card">
        <Stepper steps={[...STEPS]} current={step} />
      </div>

      <WorkspaceHeader
        eyebrow="Artisan Verification Onboarding"
        title={`Step ${step + 1} of ${STEPS.length}: ${meta.title}`}
        description={meta.desc}
      />

      <RailLayout
        rail={
          <>
            <SectionCard title="Onboarding progress" description={`Step ${step + 1} of ${STEPS.length} · about ${STEPS.length - step} min left`}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">{pct}%</span>
                <span className="text-muted">complete</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
              </div>
              {step < STEPS.length - 1 && (
                <p className="mt-3 text-xs text-muted">
                  <span className="font-medium text-brand-700">Next up: </span>
                  {STEP_META[step + 1].title}
                </p>
              )}
            </SectionCard>
            <SectionCard icon={<IconShield size={18} />} title="Fast approval tips">
              <ul className="space-y-2">
                {TIPS.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-ink-soft">
                    <IconCheck size={16} className="mt-0.5 shrink-0 text-brand-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </>
        }
      >
        {step === 0 && (
          <SectionCard icon={<IconUser size={18} />} title="Legal & business profile" bodyClassName="space-y-4">
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
          </SectionCard>
        )}

        {step === 1 && (
          <SectionCard icon={<IconWrench size={18} />} title="Core capabilities" description="Choose the specific trade skills you're equipped to handle." bodyClassName="space-y-4">
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
          </SectionCard>
        )}

        {step === 2 && (
          <SectionCard icon={<IconMapPin size={18} />} title="Coverage & logistics" description="Define your base operational zones across Lagos." bodyClassName="space-y-4">
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
          </SectionCard>
        )}

        {step === 3 && (
          <SectionCard icon={<IconShield size={18} />} title="Identity & trade credentials" description="Documents are private and only seen by our verification team." bodyClassName="space-y-4">
            <DocumentUploader />
            <div className="rounded-control border border-line bg-canvas p-3 text-xs text-muted">
              When you submit, your profile goes to our team for review. You&apos;ll be notified once you&apos;re approved and can start applying to jobs.
            </div>
          </SectionCard>
        )}
      </RailLayout>

      <StickyActionBar
        note={saving ? "Saving…" : `Step ${step + 1} of ${STEPS.length}`}
      >
        <Button variant="ghost" onClick={() => (step === 0 ? router.push("/artisan") : setStep((s) => s - 1))} disabled={saving}>
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next} disabled={!canContinue} loading={saving}>Continue</Button>
        ) : (
          <Button onClick={submitForVerification} loading={saving}>Submit for verification</Button>
        )}
      </StickyActionBar>
    </div>
  );
}
