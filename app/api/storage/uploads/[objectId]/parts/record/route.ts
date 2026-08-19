import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiSession } from "@/lib/api-auth";
import { getRequestId } from "@/lib/observability/request-context";
import { recordPrivateUploadPart } from "@/services/private-storage-service";

const schema = z.object({ partNumber: z.number().int().min(1).max(10_000), etag: z.string().min(8).max(220), checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i) });

export async function POST(request: Request, context: { params: Promise<{ objectId: string }> }) {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload part evidence." }, { status: 400 });
  try {
    const upload = await recordPrivateUploadPart({ ...(await context.params), ...parsed.data, institutionId, ownerId: access.session.user.id, requestId: await getRequestId() });
    return NextResponse.json({ upload });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "UPLOAD_EXPIRED") return NextResponse.json({ error: "Upload expired." }, { status: 410 });
    if (code === "UPLOAD_PART_INVALID") return NextResponse.json({ error: "The completed part does not match its reservation." }, { status: 409 });
    return NextResponse.json({ error: "The upload part could not be recorded." }, { status: 503 });
  }
}
