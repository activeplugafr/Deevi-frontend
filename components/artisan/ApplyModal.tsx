"use client";

import { useState } from "react";
import { applicationsApi, storageApi } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/primitives";
import Image from "next/image";
import type { PriceType, DurationUnit, StorageBucket } from "@/lib/types";

export function ApplyModal({
  open,
  onClose,
  jobPostId,
  onApplied,
}: {
  open: boolean;
  onClose: () => void;
  jobPostId: string;
  onApplied: () => void;
}) {
  const toast = useToast();
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<PriceType>("FIXED");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("HOUR");
  const [experience, setExperience] = useState("");
  const [transportFare, setTransportFare] = useState("");
  const [transportFarePaidBy, setTransportFarePaidBy] = useState<"CUSTOMER" | "ARTISAN" | "INCLUDED">("CUSTOMER");
  const [experienceImages, setExperienceImages] = useState<{ path: string; publicUrl: string | null }[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadExperienceImages(files: FileList) {
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: { path: string; publicUrl: string | null }[] = [];
      for (const file of Array.from(files).slice(0, 4)) {
        const ticket = await storageApi.uploadTicket({
          bucket: "job-media" as StorageBucket,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        });
        const res = await fetch(ticket.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream", ...(ticket.token ? { Authorization: `Bearer ${ticket.token}` } : {}) },
          body: file,
        });
        if (!res.ok) throw new Error("Image upload failed.");
        uploaded.push({ path: ticket.path, publicUrl: ticket.publicUrl });
      }
      setExperienceImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (message.trim().length < 5) {
      toast.error("Add a short message to the customer.");
      return;
    }
    setBusy(true);
    try {
      await applicationsApi.apply({
        jobPostId,
        message: message.trim(),
        proposedPrice: price ? Number(price) : undefined,
        priceType,
        estimatedDurationValue: durationValue ? Number(durationValue) : undefined,
        estimatedDurationUnit: durationValue ? durationUnit : undefined,
        relevantExperience: experience.trim() || undefined,
        transportFare: transportFare ? Number(transportFare) : undefined,
        transportFarePaidBy,
        relevantExperienceImages: experienceImages.length ? experienceImages.map((i) => i.path) : undefined,
      });
      toast.success("Application sent. The customer will see it now.");
      onApplied();
      onClose();
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply for this job"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={busy} disabled={message.trim().length < 5}>
            Send application
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Message to the customer" required hint="Why you're a good fit and how you'd approach it.">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi, I've handled similar jobs and can come by tomorrow morning…"
            className="min-h-[110px]"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Your price (₦)" hint="Leave blank if negotiable.">
            <Input type="number" inputMode="numeric" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="8000" />
          </Field>
          <Field label="Price type">
            <Select value={priceType} onChange={(e) => setPriceType(e.target.value as PriceType)}>
              <option value="FIXED">Fixed</option>
              <option value="HOURLY">Per hour</option>
              <option value="DAILY">Per day</option>
              <option value="NEGOTIABLE">Negotiable</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Transport fare to site (₦)" hint="Optional amount to cover your travel.">
            <Input type="number" inputMode="numeric" min={0} value={transportFare} onChange={(e) => setTransportFare(e.target.value)} placeholder="2000" />
          </Field>
          <Field label="Fare charged to" hint="Who covers transport?">
            <Select value={transportFarePaidBy} onChange={(e) => setTransportFarePaidBy(e.target.value as "CUSTOMER" | "ARTISAN" | "INCLUDED")}>
              <option value="CUSTOMER">Customer pays</option>
              <option value="ARTISAN">I cover it</option>
              <option value="INCLUDED">Included in my price</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estimated duration">
            <Input type="number" inputMode="numeric" min={0} value={durationValue} onChange={(e) => setDurationValue(e.target.value)} placeholder="2" />
          </Field>
          <Field label="Unit">
            <Select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}>
              <option value="MINUTE">Minutes</option>
              <option value="HOUR">Hours</option>
              <option value="DAY">Days</option>
              <option value="WEEK">Weeks</option>
            </Select>
          </Field>
        </div>

        <Field label="Relevant experience" hint="Optional">
          <Textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5 years fixing similar plumbing issues" maxLength={1000} />
          <p className="mt-1 text-xs text-right text-muted">{experience.length} / 1000 characters</p>
        </Field>

        <Field label="Experience photos" hint="Up to 4 photos of similar work you've done.">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => uploadExperienceImages(e.target.files!)}
              disabled={uploading || experienceImages.length >= 4}
              className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 disabled:file:cursor-not-allowed disabled:file:opacity-50"
            />
            {experienceImages.length > 0 && (
              <span className="text-xs text-muted">{experienceImages.length}/4 photos</span>
            )}
          </div>
          {experienceImages.length > 0 && (
            <div className="mt-2 flex gap-2">
              {experienceImages.map((img, i) => (
                <div key={i} className="relative">
                  <Image
                    src={img.publicUrl ?? img.path}
                    alt={`Experience ${i + 1}`}
                    width={64}
                    height={64}
                    className="rounded-control object-cover border border-line"
                  />
                  <button
                    type="button"
                    onClick={() => setExperienceImages(experienceImages.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger-600 text-white"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>
      </div>
    </Modal>
  );
}
