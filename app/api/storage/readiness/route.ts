import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getRequestId } from "@/lib/observability/request-context";
import { storageReadiness } from "@/services/private-storage-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  return NextResponse.json({ ...(await storageReadiness(institutionId)), requestId: await getRequestId() });
}
