"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function sha256(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function json(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The photo could not be uploaded.");
  return body;
}

export function ProfilePhotoUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload() {
    if (!file) return setMessage("Choose a photo first.");
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) return setMessage("Choose a JPG, PNG, WebP, or GIF photo up to 2 MB.");
    setBusy(true); setMessage("Checking and uploading photo...");
    try {
      const limits = await json("/api/storage/config");
      const singleFileLimit = Math.min(2 * 1024 * 1024, Number(limits.multipartThresholdBytes) - 1);
      if (file.size > singleFileLimit) throw new Error(`Choose a profile photo smaller than ${Math.max(1, Math.floor(singleFileLimit / 1024))} KB for this storage configuration.`);
      const checksumSha256 = await sha256(file);
      const { upload: reservation } = await json("/api/storage/uploads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purpose: "PROFILE_PHOTO", fileName: file.name, mimeType: file.type, sizeBytes: file.size, checksumSha256, title: "Teacher profile photo", type: "IMAGE", status: "DRAFT" }) });
      if (reservation.strategy !== "single" || !reservation.url) throw new Error("This photo exceeds the current profile upload limit.");
      const stored = await fetch(reservation.url, { method: "PUT", headers: reservation.headers, body: file });
      if (!stored.ok) throw new Error("The storage provider rejected the photo.");
      await json(`/api/storage/uploads/${encodeURIComponent(reservation.objectId)}/complete`, { method: "POST" });
      setFile(null); setMessage("Photo uploaded and verified."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "The photo could not be uploaded."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-2"><Input accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" /><Button disabled={busy || !file} onClick={upload} type="button" variant="secondary"><ImageUp className="mr-2 h-4 w-4" />{busy ? "Uploading" : "Upload Photo"}</Button><p aria-live="polite" className="text-xs text-muted-foreground">{message || "Private checksum-verified storage; maximum 2 MB."}</p></div>;
}
