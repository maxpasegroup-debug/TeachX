import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getContentStudioOverview } from "@/services/content-service";

export async function GET() {
  const access = await requireApiSession("content.view");
  if ("response" in access) return access.response;
  const { session } = access;
  const readOnly = session.user.roles.includes("STUDENT");
  return NextResponse.json(await getContentStudioOverview(session.user.institutionId, session.user.id, readOnly));
}
