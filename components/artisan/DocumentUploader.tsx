"use client";

import { useRef, useState } from "react";
import { artisansApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { uploadFile } from "@/lib/upload";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Field, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { IconCheck } from "@/components/ui/icons";
import { humanize } from "@/lib/format";
import type { DocumentType } from "@/lib/types";

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "NIN", label: "National ID (NIN)" },
  { value: "DRIVERS_LICENCE", label: "Driver's licence" },
  { value: "VOTERS_CARD", label: "Voter's card" },
  { value: "INTERNATIONAL_PASSPORT", label: "International passport" },
  { value: "CAC_CERTIFICATE", label: "CAC certificate (business)" },
  { value: "UTILITY_BILL", label: "Utility bill" },
  { value: "PROOF_OF_ADDRESS", label: "Proof of address" },
  { value: "TRADE_CERTIFICATE", label: "Trade certificate" },
  { value: "OTHER", label: "Other" },
];

export function DocumentUploader() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<DocumentType>("NIN");
  const [uploading, setUploading] = useState(false);

  const { data: docs, reload } = useAsync(() => artisansApi.documents().catch(() => []), []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { path } = await uploadFile("verification-documents", file);
      await artisansApi.addDocument({
        documentType: docType,
        storagePath: path,
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      toast.success("Document uploaded.");
      reload();
    } catch (err) {
      toast.error(messageFor(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: string) {
    try {
      await artisansApi.removeDocument(id);
      reload();
    } catch (err) {
      toast.error(messageFor(err));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <Field label="Document type">
          <Select value={docType} onChange={(e) => setDocType(e.target.value as DocumentType)}>
            {DOC_TYPES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </Select>
        </Field>
        <Button variant="secondary" onClick={() => fileRef.current?.click()} loading={uploading} className="mb-0">
          Upload file
        </Button>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={onFile} />
      </div>

      {docs && docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm">
              <IconCheck size={16} className="text-success-600" />
              <span className="min-w-0 flex-1 truncate text-ink">
                {humanize(d.document_type)}
                {d.original_filename && <span className="text-muted"> · {d.original_filename}</span>}
              </span>
              <button onClick={() => remove(d.id)} className="text-xs text-muted hover:text-danger-600">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {uploading && (
        <p className="flex items-center gap-2 text-xs text-muted">
          <Spinner size={14} /> Uploading securely…
        </p>
      )}
      {(!docs || docs.length === 0) && !uploading && (
        <p className="text-xs text-muted">No documents uploaded yet.</p>
      )}
    </div>
  );
}
