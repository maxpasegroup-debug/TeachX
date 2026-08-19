import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getRequestId } from "@/lib/observability/request-context";
import { abortPrivateUpload, getPrivateUploadStatus } from "@/services/private-storage-service";

export async function GET(_: Request, context: { params: Promise<{ objectId: string }> }) {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  const { objectId } = await context.params;
  try {
    return NextResponse.json({ upload: await getPrivateUploadStatus({ objectId, institutionId, ownerId: access.session.user.id }) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "UPLOAD_EXPIRED") return NextResponse.json({ error: "Upload expired." }, { status: 410 });
    if (code === "UPLOAD_NOT_FOUND") return NextResponse.json({ error: "Upload not found." }, { status: 404 });
    return NextResponse.json({ error: "Upload status is temporarily unavailable." }, { status: 503 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ objectId: string }> }) {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  const { objectId } = await context.params;
  try {
    await abortPrivateUpload({ objectId, institutionId, ownerId: access.session.user.id, requestId: await getRequestId() });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: code === "UPLOAD_NOT_FOUND" ? "Upload not found." : "Upload cannot be cancelled." }, { status: code === "UPLOAD_NOT_FOUND" ? 404 : 409 });
  }
}
