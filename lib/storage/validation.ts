import { z } from "zod";

export const contentTypes = ["VIDEO", "PDF", "PPT", "IMAGE", "AUDIO", "ZIP", "DOCUMENT", "NOTES", "WORKSHEET", "QUESTION_PAPER", "ANSWER_KEY", "REFERENCE"] as const;
export const workflowStatuses = ["DRAFT", "SUBMITTED", "PUBLISHED"] as const;

const allowedMimeTypes = new Set([
  "application/pdf", "application/zip", "application/x-zip-compressed", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/csv", "image/jpeg", "image/png", "image/webp", "image/gif",
  "audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "video/mp4", "video/webm", "video/quicktime"
]);

export const uploadReservationSchema = z.object({
  purpose: z.enum(["CONTENT", "PROFILE_PHOTO"]).default("CONTENT"),
  fileName: z.string().trim().min(1).max(180),
  mimeType: z.string().trim().toLowerCase().refine((value) => allowedMimeTypes.has(value), "Unsupported file type."),
  sizeBytes: z.number().int().positive(),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i),
  courseId: z.string().min(1).optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  classroomId: z.string().optional(),
  batchId: z.string().optional(),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(contentTypes),
  durationSeconds: z.number().int().min(0).max(86_400).optional(),
  status: z.enum(workflowStatuses).default("DRAFT")
}).superRefine((input, context) => {
  if (input.purpose === "CONTENT" && !input.courseId) context.addIssue({ code: "custom", path: ["courseId"], message: "Course is required." });
  if (input.purpose === "PROFILE_PHOTO" && (!input.mimeType.startsWith("image/") || input.sizeBytes > 2 * 1024 * 1024)) context.addIssue({ code: "custom", path: ["fileName"], message: "Profile photos must be JPG, PNG, WebP, or GIF files up to 2 MB." });
});

export type UploadReservationInput = z.infer<typeof uploadReservationSchema>;

export function safeFileName(value: string) {
  const normalized = value.normalize("NFKC").replace(/[^A-Za-z0-9._ -]/g, "_").replace(/\s+/g, " ").trim();
  const clean = normalized.replace(/^\.+/, "").slice(0, 120);
  return clean || "upload.bin";
}
