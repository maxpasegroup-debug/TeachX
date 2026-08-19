"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type MutableRefObject, useEffect, useRef, useState } from "react";
import { CheckCircle2, Pause, RotateCw, Upload, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Option = { id: string; name: string };
type ClassroomOption = { id: string; title: string };
type UploadState = { busy: boolean; progress: number; message: string; done: boolean; paused: boolean };
type Reservation = { objectId: string; strategy: "single" | "multipart"; url?: string; headers?: Record<string, string>; partSize?: number; partCount?: number; completedParts?: number[] };

type Props = {
  courses: Option[];
  subjects: Option[];
  chapters: Option[];
  topics: Option[];
  classrooms: ClassroomOption[];
  batches: Option[];
  draftScope: string;
};

const DRAFT_KEY = "teachx.content-upload-draft.v1";
const SESSION_KEY = "teachx.resumable-upload.v1";
const emptyState: UploadState = { busy: false, progress: 0, message: "", done: false, paused: false };

class RequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function sha256(blob: Blob) {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function uploadRequest(url: string, body: Blob, headers: Record<string, string>, onProgress: (loaded: number) => void, active: MutableRefObject<XMLHttpRequest | null>) {
  return new Promise<string>((resolve, reject) => {
    const request = new XMLHttpRequest();
    active.current = request;
    request.open("PUT", url);
    for (const [key, value] of Object.entries(headers)) request.setRequestHeader(key, value);
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded);
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve(request.getResponseHeader("ETag") ?? "") : reject(new Error("The storage provider rejected this part."));
    request.onerror = () => reject(new Error("The connection was interrupted."));
    request.onabort = () => reject(new Error("UPLOAD_PAUSED"));
    request.onloadend = () => { if (active.current === request) active.current = null; };
    request.send(body);
  });
}

function waitUntilOnline() {
  if (navigator.onLine) return Promise.resolve();
  return new Promise<void>((resolve) => window.addEventListener("online", () => resolve(), { once: true }));
}

async function jsonRequest(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new RequestError(body.error || "The request could not be completed.", response.status);
  return body;
}

async function fileIntegrityPlan(file: File, multipartThresholdBytes: number, multipartPartBytes: number, onPart: (current: number, total: number) => void) {
  if (file.size < multipartThresholdBytes) return { checksumSha256: await sha256(file), partChecksums: [] as string[] };
  const partCount = Math.ceil(file.size / multipartPartBytes);
  const partChecksums: string[] = [];
  for (let index = 0; index < partCount; index += 1) {
    onPart(index + 1, partCount);
    partChecksums.push(await sha256(file.slice(index * multipartPartBytes, Math.min((index + 1) * multipartPartBytes, file.size))));
  }
  const manifest = JSON.stringify({ sizeBytes: file.size, partSize: multipartPartBytes, partChecksums });
  return { checksumSha256: await sha256(new Blob([manifest], { type: "application/json" })), partChecksums };
}

export function PrivateUploadForm(props: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const activeRequest = useRef<XMLHttpRequest | null>(null);
  const paused = useRef(false);
  const [online, setOnline] = useState(true);
  const [state, setState] = useState<UploadState>(emptyState);
  const draftKey = `${DRAFT_KEY}:${props.draftScope}`;
  const sessionKey = `${SESSION_KEY}:${props.draftScope}`;

  useEffect(() => {
    setOnline(navigator.onLine);
    const connected = () => setOnline(true);
    const disconnected = () => setOnline(false);
    window.addEventListener("online", connected);
    window.addEventListener("offline", disconnected);
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) ?? "{}") as Record<string, string>;
      if (formRef.current) for (const [name, value] of Object.entries(draft)) {
        const field = formRef.current.elements.namedItem(name);
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) field.value = value;
      }
    } catch { /* A damaged local draft should not block a fresh form. */ }
    return () => {
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", disconnected);
    };
  }, [draftKey]);

  function saveDraft() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const draft: Record<string, string> = {};
    for (const [key, value] of data.entries()) if (typeof value === "string") draft[key] = value;
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }

  async function retry<T>(operation: () => Promise<T>, label: string) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      if (paused.current) throw new Error("UPLOAD_PAUSED");
      if (!navigator.onLine) {
        setState((current) => ({ ...current, message: "Waiting for your connection to return..." }));
        await waitUntilOnline();
      }
      try { return await operation(); } catch (error) {
        if (error instanceof Error && error.message === "UPLOAD_PAUSED") throw error;
        lastError = error;
        if (attempt < 4) {
          setState((current) => ({ ...current, message: `${label} interrupted. Retrying ${attempt}/3...` }));
          await new Promise((resolve) => setTimeout(resolve, 750 * 2 ** (attempt - 1)));
        }
      }
    }
    throw lastError;
  }

  async function reservation(file: File, checksumSha256: string, payload: Record<string, unknown>) {
    const fingerprint = `${file.name}:${file.size}:${file.lastModified}:${checksumSha256}`;
    const saved = JSON.parse(localStorage.getItem(sessionKey) ?? "null") as { fingerprint?: string; objectId?: string } | null;
    if (saved?.fingerprint === fingerprint && saved.objectId) {
      try {
        const resumed = await jsonRequest(`/api/storage/uploads/${encodeURIComponent(saved.objectId)}`);
        if (resumed.upload.status === "PENDING" && resumed.upload.strategy === "multipart") return { fingerprint, upload: resumed.upload as Reservation };
        await fetch(`/api/storage/uploads/${encodeURIComponent(saved.objectId)}`, { method: "DELETE" }).catch(() => undefined);
      } catch (error) {
        if (error instanceof RequestError && [404, 410].includes(error.status)) localStorage.removeItem(sessionKey);
        else throw error;
      }
    }
    const result = await jsonRequest("/api/storage/uploads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    localStorage.setItem(sessionKey, JSON.stringify({ fingerprint, objectId: result.upload.objectId }));
    return { fingerprint, upload: result.upload as Reservation };
  }

  async function multipartUpload(file: File, upload: Reservation, partChecksums: string[]) {
    if (!upload.partSize || !upload.partCount) throw new Error("The resumable upload session is incomplete.");
    const completed = new Set(upload.completedParts ?? []);
    let completedBytes = Array.from(completed).reduce((total, partNumber) => total + Math.min(upload.partSize!, file.size - (partNumber - 1) * upload.partSize!), 0);
    for (let partNumber = 1; partNumber <= upload.partCount; partNumber += 1) {
      if (completed.has(partNumber)) continue;
      const start = (partNumber - 1) * upload.partSize;
      const part = file.slice(start, Math.min(start + upload.partSize, file.size));
      setState((current) => ({ ...current, message: `Checking part ${partNumber} of ${upload.partCount}...` }));
      const partChecksum = partChecksums[partNumber - 1];
      if (!partChecksum) throw new Error("The local integrity plan no longer matches this upload.");
      const signed = await retry(() => jsonRequest(`/api/storage/uploads/${encodeURIComponent(upload.objectId)}/parts/sign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partNumber, sizeBytes: part.size, checksumSha256: partChecksum }) }), `Part ${partNumber}`);
      const etag = await retry(
        () => uploadRequest(signed.signed.url, part, signed.signed.headers, (loaded) => setState((current) => ({ ...current, progress: Math.min(99, Math.round(((completedBytes + loaded) / file.size) * 100)), message: `Uploading part ${partNumber} of ${upload.partCount}...` })), activeRequest),
        `Part ${partNumber}`
      );
      await retry(() => jsonRequest(`/api/storage/uploads/${encodeURIComponent(upload.objectId)}/parts/record`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partNumber, etag, checksumSha256: partChecksum }) }), `Saving part ${partNumber}`);
      completedBytes += part.size;
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const file = data.get("file");
    if (!(file instanceof File) || !file.size) return setState({ ...emptyState, message: "Choose the same file again to start or resume." });
    paused.current = false;
    setState({ busy: true, progress: 0, message: "Checking file integrity...", done: false, paused: false });
    try {
      const limits = await retry(() => jsonRequest("/api/storage/config"), "Storage configuration");
      if (file.size > limits.maxFileBytes) throw new Error("The file exceeds the configured upload limit.");
      const integrity = await fileIntegrityPlan(file, limits.multipartThresholdBytes, limits.multipartPartBytes, (current, total) => {
        if (paused.current) throw new Error("UPLOAD_PAUSED");
        setState((value) => ({ ...value, message: `Checking file part ${current} of ${total}...`, progress: Math.round((current / total) * 10) }));
      });
      const checksumSha256 = integrity.checksumSha256;
      const payload = {
        fileName: file.name, mimeType: file.type || "application/octet-stream", sizeBytes: file.size, checksumSha256,
        courseId: String(data.get("courseId") || ""), subjectId: String(data.get("subjectId") || "") || undefined,
        chapterId: String(data.get("chapterId") || "") || undefined, topicId: String(data.get("topicId") || "") || undefined,
        classroomId: String(data.get("classroomId") || "") || undefined, batchId: String(data.get("batchId") || "") || undefined,
        title: String(data.get("title") || ""), description: String(data.get("description") || "") || undefined,
        type: String(data.get("type") || "DOCUMENT"), status: String(data.get("status") || "DRAFT")
      };
      const { upload } = await retry(() => reservation(file, checksumSha256, payload), "Upload reservation");
      if (upload.strategy === "multipart") await multipartUpload(file, upload, integrity.partChecksums);
      else {
        if (!upload.url || !upload.headers) throw new Error("The upload reservation is incomplete.");
        await retry(() => uploadRequest(upload.url!, file, upload.headers!, (loaded) => setState((current) => ({ ...current, progress: Math.round((loaded / file.size) * 100), message: "Uploading securely..." })), activeRequest), "File upload");
      }
      setState({ busy: true, progress: 100, message: "Verifying stored bytes...", done: false, paused: false });
      await retry(() => jsonRequest(`/api/storage/uploads/${encodeURIComponent(upload.objectId)}/complete`, { method: "POST" }), "Final verification");
      localStorage.removeItem(sessionKey);
      localStorage.removeItem(draftKey);
      formRef.current?.reset();
      setState({ busy: false, progress: 100, message: "File verified and saved.", done: true, paused: false });
      router.refresh();
    } catch (error) {
      const wasPaused = error instanceof Error && error.message === "UPLOAD_PAUSED";
      setState((current) => ({ ...current, busy: false, message: wasPaused ? "Upload paused. Select Resume when ready." : error instanceof Error ? error.message : "Upload failed.", done: false, paused: wasPaused }));
    }
  }

  function pauseUpload() {
    paused.current = true;
    activeRequest.current?.abort();
  }

  return (
    <form className="mt-6 grid gap-4" onInput={saveDraft} onSubmit={submit} ref={formRef}>
      <div aria-live="polite" className={`flex items-center gap-2 text-xs font-medium ${online ? "text-emerald-700" : "text-amber-700"}`}>{online ? <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> : <WifiOff aria-hidden="true" className="h-4 w-4" />}{online ? "Connected" : "Offline - your lesson details remain on this device"}</div>
      <Input disabled={state.busy} name="title" placeholder="Lesson title" required />
      <Textarea disabled={state.busy} name="description" placeholder="Short description or notes" />
      <div className="grid gap-4 md:grid-cols-3">
        <Select disabled={state.busy} name="courseId" required><option value="">Course</option>{props.courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
        <Select disabled={state.busy} name="subjectId"><option value="">Subject</option>{props.subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
        <Select disabled={state.busy} name="chapterId"><option value="">Chapter</option>{props.chapters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Select disabled={state.busy} name="topicId"><option value="">Topic</option>{props.topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
        <Select disabled={state.busy} name="classroomId"><option value="">Classroom</option>{props.classrooms.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select>
        <Select disabled={state.busy} name="batchId"><option value="">Batch</option>{props.batches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Select disabled={state.busy} name="type" defaultValue="DOCUMENT"><option value="VIDEO">Video</option><option value="PDF">PDF</option><option value="PPT">Presentation</option><option value="IMAGE">Image</option><option value="AUDIO">Audio</option><option value="ZIP">ZIP archive</option><option value="DOCUMENT">Document</option><option value="NOTES">Notes</option><option value="WORKSHEET">Worksheet</option><option value="QUESTION_PAPER">Question paper</option><option value="ANSWER_KEY">Answer key</option><option value="REFERENCE">Reference</option></Select>
        <Select disabled={state.busy} name="status" defaultValue="DRAFT"><option value="DRAFT">Save draft</option><option value="SUBMITTED">Submit for review</option><option value="PUBLISHED">Publish</option></Select>
      </div>
      <Input accept=".pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.webp,.gif,.mp3,.m4a,.wav,.ogg,.mp4,.webm,.mov" disabled={state.busy} name="file" required type="file" />
      {state.busy || state.paused ? <div aria-live="polite"><div className="h-2 overflow-hidden rounded bg-muted"><div className="h-full bg-primary transition-[width]" style={{ width: `${state.progress}%` }} /></div><p className="mt-2 text-sm text-muted-foreground">{state.message} {state.progress ? `${state.progress}%` : ""}</p></div> : null}
      <div className="flex flex-wrap gap-2">
        <Button disabled={state.busy || !online} type="submit">{state.paused ? <RotateCw aria-hidden="true" className="mr-2 h-4 w-4" /> : <Upload aria-hidden="true" className="mr-2 h-4 w-4" />}{state.busy ? "Working" : state.paused ? "Resume upload" : "Upload file"}</Button>
        {state.busy ? <Button onClick={pauseUpload} type="button" variant="secondary"><Pause aria-hidden="true" className="mr-2 h-4 w-4" />Pause</Button> : null}
      </div>
      {!state.busy && !state.paused && state.message ? <p aria-live="polite" className={`flex items-center gap-2 text-sm ${state.done ? "text-emerald-700" : "text-destructive"}`}>{state.done ? <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> : null}{state.message}</p> : null}
    </form>
  );
}
