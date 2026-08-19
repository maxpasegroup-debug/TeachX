import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getRequestId } from "@/lib/observability/request-context";
import { rateLimit } from "@/lib/security";
import { uploadReservationSchema } from "@/lib/storage/validation";
import { reservePrivateUpload } from "@/services/private-storage-service";

export async function POST(request: Request) {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  const limited = await rateLimit(`storage:reserve:${access.session.user.id}`, 20, 60_000);
  if (limited) return limited;
  const parsed = uploadReservationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid upload request." }, { status: 400 });
  try {
    const upload = await reservePrivateUpload({ ...parsed.data, institutionId, ownerId: access.session.user.id, requestId: await getRequestId() });
    return NextResponse.json({ upload }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "FILE_TOO_LARGE") return NextResponse.json({ error: "The file exceeds the configured upload limit." }, { status: 413 });
    if (code === "STORAGE_QUOTA_EXCEEDED") return NextResponse.json({ error: "Your storage quota is full." }, { status: 409 });
    if (code === "CONTENT_SCOPE_INVALID") return NextResponse.json({ error: "The selected course information is invalid." }, { status: 400 });
    return NextResponse.json({ error: "Private storage is unavailable." }, { status: 503 });
  }
}
