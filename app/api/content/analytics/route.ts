import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getContentAnalytics, recordContentView } from "@/services/content-analytics-service";

export async function GET() {
  const access = await requireApiSession("content.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json(await getContentAnalytics(session.user.institutionId));
}

export async function POST(request: Request) {
  const access = await requireApiSession("content.view");
  if ("response" in access) return access.response;
  const { session } = access;
  const body = await request.json();
  await recordContentView(body.itemId, session.user.id);
  return NextResponse.json({ ok: true });
}
