import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getRequestId } from "@/lib/observability/request-context";
import { completePrivateUpload } from "@/services/private-storage-service";

export async function POST(_: Request, context: { params: Promise<{ objectId: string }> }) {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  const { objectId } = await context.params;
  try {
    const item = await completePrivateUpload({ objectId, institutionId, ownerId: access.session.user.id, requestId: await getRequestId() });
    return NextResponse.json({ item });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "UPLOAD_NOT_FOUND") return NextResponse.json({ error: "Upload not found." }, { status: 404 });
    if (code === "UPLOAD_EXPIRED") return NextResponse.json({ error: "This upload reservation expired. Start the upload again." }, { status: 410 });
    if (code === "UPLOAD_INTEGRITY_FAILED") return NextResponse.json({ error: "The uploaded file failed its integrity check and was quarantined." }, { status: 422 });
    if (code === "UPLOAD_PARTS_INCOMPLETE") return NextResponse.json({ error: "Some file parts are still waiting to upload." }, { status: 409 });
    if (code === "UPLOAD_NOT_PENDING") return NextResponse.json({ error: "This upload cannot be completed." }, { status: 409 });
    return NextResponse.json({ error: "The upload could not be verified." }, { status: 503 });
  }
}
