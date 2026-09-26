"use client";

import { useState } from "react";
import { reviewsApi } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/primitives";
import { StarInput } from "@/components/ui/bits";

export function ReviewModal({
  open,
  onClose,
  jobId,
  artisanName,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  jobId: string;
  artisanName: string;
  onSubmitted: () => void;
}) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (rating < 1) return;
    setBusy(true);
    try {
      await reviewsApi.create({ jobId, rating, comment: comment.trim() || undefined });
      toast.success("Thanks — your review helps other customers.");
      onSubmitted();
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
      title={`Review ${artisanName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={busy} disabled={rating < 1}>Submit review</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">How was the work?</p>
          <StarInput value={rating} onChange={setRating} />
        </div>
        <Field label="Comment" htmlFor="review-comment" hint="Optional — what stood out?">
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell other customers about your experience"
          />
        </Field>
      </div>
    </Modal>
  );
}
