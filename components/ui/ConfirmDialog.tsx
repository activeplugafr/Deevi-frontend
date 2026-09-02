"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Field, Textarea } from "./primitives";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  withReason,
  reasonLabel = "Reason",
  reasonRequired,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  withReason?: boolean;
  reasonLabel?: string;
  reasonRequired?: boolean;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (withReason && reasonRequired && !reason.trim()) return;
    setBusy(true);
    try {
      await onConfirm(reason.trim() || undefined);
      setReason("");
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={confirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <p className="text-sm text-ink-soft">{message}</p>}
      {withReason && (
        <div className="mt-3">
          <Field label={reasonLabel} htmlFor="confirm-reason" required={reasonRequired}>
            <Textarea id="confirm-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
      )}
    </Modal>
  );
}
