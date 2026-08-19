import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiSession } from "@/lib/api-auth";
import { getRequestId } from "@/lib/observability/request-context";
import { rateLimit } from "@/lib/security";
import { signPrivateUploadPart } from "@/services/private-storage-service";

const schema = z.object({ partNumber: z.number().int().min(1).max(10_000), sizeBytes: z.number().int().positive(), checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i) });

export async function POST(request: Request, context: { params: Promise<{ objectId: string }> }) {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  const limited = await rateLimit(`storage:part:${access.session.user.id}`, 120, 60_000);
  if (limited) return limited;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload part." }, { status: 400 });
  try {
    const signed = await signPrivateUploadPart({ ...(await context.params), ...parsed.data, institutionId, ownerId: access.session.user.id, requestId: await getRequestId() });
    return NextResponse.json({ signed });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "UPLOAD_EXPIRED") return NextResponse.json({ error: "Upload expired." }, { status: 410 });
    if (["UPLOAD_PART_INVALID", "UPLOAD_PART_CONFLICT"].includes(code)) return NextResponse.json({ error: "The upload part does not match this file." }, { status: 409 });
    return NextResponse.json({ error: "The upload part could not be signed." }, { status: 503 });
  }
}
