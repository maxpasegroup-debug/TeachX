import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getRequestId } from "@/lib/observability/request-context";
import { getBackupReadiness } from "@/services/backup-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  if (!access.session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const requestId = await getRequestId();
  return NextResponse.json({ ...(await getBackupReadiness(access.session.user.institutionId, requestId)), requestId });
}
