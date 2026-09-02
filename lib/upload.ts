"use client";

import { storageApi } from "@/lib/api";
import type { StorageBucket } from "@/lib/types";

/**
 * Two-step upload matching the backend contract:
 *   1. POST /storage/upload-ticket → signed { uploadUrl, path, token }
 *   2. PUT the raw bytes to uploadUrl (Supabase Storage signed upload URL)
 * Returns the storage `path` to attach to the owning record (portfolio,
 * verification document, job media, etc.).
 *
 * Note: the PUT goes directly to Supabase, not through our /bff proxy, so it
 * depends on Supabase Storage's CORS allowing the app origin.
 */
export async function uploadFile(
  bucket: StorageBucket,
  file: File,
): Promise<{ path: string; publicUrl: string | null }> {
  const ticket = await storageApi.uploadTicket({
    bucket,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  });

  if (ticket.maxBytes && file.size > ticket.maxBytes) {
    throw new Error(`File is too large. Max ${(ticket.maxBytes / 1024 / 1024).toFixed(1)}MB.`);
  }
  if (
    ticket.allowedMimeTypes?.length &&
    file.type &&
    !ticket.allowedMimeTypes.includes(file.type)
  ) {
    throw new Error("That file type isn't allowed for this upload.");
  }

  const res = await fetch(ticket.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      ...(ticket.token ? { Authorization: `Bearer ${ticket.token}` } : {}),
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error("Upload failed. Please check your connection and try again.");
  }
  return { path: ticket.path, publicUrl: ticket.publicUrl };
}
