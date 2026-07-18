import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiSession } from "@/lib/api-auth";
import { createContentUpload } from "@/services/upload-service";

const uploadSchema = z.object({
  courseId: z.string().min(1),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  classroomId: z.string().optional(),
  batchId: z.string().optional(),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(["VIDEO", "PDF", "PPT", "IMAGE", "AUDIO", "ZIP", "EXTERNAL_LINK", "DOCUMENT", "NOTES", "WORKSHEET", "QUESTION_PAPER", "ANSWER_KEY", "REFERENCE"]).optional(),
  fileUrl: z.string().url().optional(),
  externalUrl: z.string().url().optional(),
  sizeBytes: z.coerce.number().int().min(0).max(500 * 1024 * 1024).optional(),
  durationSeconds: z.coerce.number().int().min(0).max(24 * 60 * 60).optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "PUBLISHED"]).optional()
});

export async function POST(request: Request) {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const parsed = uploadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
  const body = parsed.data;
  const item = await createContentUpload({
    institutionId: session.user.institutionId,
    createdById: session.user.id,
    courseId: body.courseId,
    subjectId: body.subjectId,
    chapterId: body.chapterId,
    topicId: body.topicId,
    classroomId: body.classroomId,
    batchId: body.batchId,
    title: body.title,
    description: body.description,
    type: body.type ?? "NOTES",
    fileUrl: body.fileUrl,
    externalUrl: body.externalUrl,
    sizeBytes: Number(body.sizeBytes ?? 0),
    durationSeconds: Number(body.durationSeconds ?? 0),
    status: body.status ?? "DRAFT"
  });
  return NextResponse.json({ item }, { status: 201 });
}
