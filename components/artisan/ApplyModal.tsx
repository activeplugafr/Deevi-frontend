"use client";

import { useState } from "react";
import { applicationsApi } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/primitives";
import type { PriceType, DurationUnit } from "@/lib/types";

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
  const [busy, setBusy] = useState(false);

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
      });
      toast.success("Application sent. The customer will see it now.");
      onApplied();
      onClose();
    } catch (err) {
      // The backend rejects duplicates — surface that cleanly.
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
          <Button onClick={submit} loading={busy} disabled={message.trim().length < 5}>Send application</Button>
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
          <Textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5 years fixing similar plumbing issues" />
        </Field>
      </div>
    </Modal>
  );
}
