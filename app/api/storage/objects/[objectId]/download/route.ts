import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getRequestId } from "@/lib/observability/request-context";
import { rateLimit } from "@/lib/security";
import { authorizePrivateDownload } from "@/services/private-storage-service";

export async function GET(_: Request, context: { params: Promise<{ objectId: string }> }) {
  const access = await requireApiSession();
  if ("response" in access) return access.response;
  const limited = await rateLimit(`storage:download:${access.session.user.id}`, 60, 60_000);
  if (limited) return limited;
  const { objectId } = await context.params;
  try {
    const url = await authorizePrivateDownload({ objectId, userId: access.session.user.id, institutionId: access.session.user.institutionId, roles: access.session.user.roles, requestId: await getRequestId() });
    return NextResponse.redirect(url, { status: 307, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "DOWNLOAD_FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (code === "DOWNLOAD_NOT_FOUND") return NextResponse.json({ error: "File not found." }, { status: 404 });
    return NextResponse.json({ error: "Download is temporarily unavailable." }, { status: 503 });
  }
}
