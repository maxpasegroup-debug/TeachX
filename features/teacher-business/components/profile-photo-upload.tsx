"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export function ProfilePhotoUpload({ onUploadStateChange }: { onUploadStateChange?: (uploading: boolean) => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function selectPhoto(nextFile: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
    if (nextFile) void upload(nextFile);
    else setMessage("");
  }

  async function upload(photo = file) {
    if (!photo) return setMessage("Choose a photo first.");
    if (!photo.type.startsWith("image/") || photo.size > 2 * 1024 * 1024) return setMessage("Choose a JPG, PNG, WebP, or GIF photo up to 2 MB.");
    setBusy(true); onUploadStateChange?.(true); setMessage("Checking and uploading photo...");
    try {
      const limits = await json("/api/storage/config");
      const singleFileLimit = Math.min(2 * 1024 * 1024, Number(limits.multipartThresholdBytes) - 1);
      if (photo.size > singleFileLimit) throw new Error(`Choose a profile photo smaller than ${Math.max(1, Math.floor(singleFileLimit / 1024))} KB for this storage configuration.`);
      const checksumSha256 = await sha256(photo);
      const { upload: reservation } = await json("/api/storage/uploads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purpose: "PROFILE_PHOTO", fileName: photo.name, mimeType: photo.type, sizeBytes: photo.size, checksumSha256, title: "Teacher profile photo", type: "IMAGE", status: "DRAFT" }) });
      if (reservation.strategy !== "single" || !reservation.url) throw new Error("This photo exceeds the current profile upload limit.");
      const stored = await fetch(reservation.url, { method: "PUT", headers: reservation.headers, body: photo });
      if (!stored.ok) throw new Error("The storage provider rejected the photo.");
      await json(`/api/storage/uploads/${encodeURIComponent(reservation.objectId)}/complete`, { method: "POST" });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null); setFile(null); setMessage("Photo uploaded and saved to your professional profile."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "The photo could not be uploaded."); }
    finally { setBusy(false); onUploadStateChange?.(false); }
  }

  return <div className="space-y-2"><Input accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={(event) => selectPhoto(event.target.files?.[0] ?? null)} type="file" />{previewUrl ? <img alt="Selected profile photo preview" className="h-20 w-20 rounded-md border object-cover" src={previewUrl} /> : null}<Button disabled={busy || !file} onClick={() => upload()} type="button" variant="secondary"><ImageUp className="mr-2 h-4 w-4" />{busy ? "Uploading" : "Retry upload"}</Button><p aria-live="polite" className="text-xs text-muted-foreground">{message || "Choose a photo to upload it automatically. Maximum 2 MB."}</p></div>;
}
