"use client";

import { useState } from "react";
import { reportsApi } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea } from "@/components/ui/primitives";
import type { ReportCategory } from "@/lib/types";

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "NO_SHOW", label: "Artisan / customer didn't show up" },
  { value: "POOR_WORKMANSHIP", label: "Poor workmanship" },
  { value: "INCOMPLETE_SERVICE", label: "Work was left incomplete" },
  { value: "INAPPROPRIATE_BEHAVIOUR", label: "Inappropriate behaviour" },
  { value: "MISLEADING_LISTING", label: "Misleading job listing" },
  { value: "MISLEADING_PROFILE", label: "Misleading profile" },
  { value: "PRICING_ISSUE", label: "Pricing issue" },
  { value: "PAYMENT_ISSUE", label: "Payment issue" },
  { value: "SAFETY_CONCERN", label: "Safety concern" },
  { value: "SPAM", label: "Spam" },
  { value: "FRAUD", label: "Fraud" },
  { value: "OTHER", label: "Something else" },
];

export function ReportModal({
  open,
  onClose,
  context,
}: {
  open: boolean;
  onClose: () => void;
  context: { jobId?: string; jobPostId?: string; reportedUserId?: string; messageId?: string };
}) {
  const toast = useToast();
  const [category, setCategory] = useState<ReportCategory>("OTHER");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (description.trim().length < 5) return;
    setBusy(true);
    try {
      const report = await reportsApi.create({ category, description: description.trim(), ...context });
      toast.success(`Report submitted. Reference ${report.reference}.`);
      setDescription("");
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
      title="Report a problem"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={submit} loading={busy} disabled={description.trim().length < 5}>
            Submit report
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="What went wrong?" htmlFor="report-cat" required>
          <Select id="report-cat" value={category} onChange={(e) => setCategory(e.target.value as ReportCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Describe what happened" htmlFor="report-desc" required>
          <Textarea
            id="report-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Give us the details so our team can look into it."
            className="min-h-[120px]"
          />
        </Field>
        <p className="text-xs text-muted">
          Safety and fraud reports are escalated to our team as urgent.
        </p>
      </div>
    </Modal>
  );
}
