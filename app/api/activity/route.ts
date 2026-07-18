import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getRecentActivities, recordActivity } from "@/services/activity-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json({ activities: await getRecentActivities(session.user.institutionId) });
}

export async function POST(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const { session } = access;
  const body = await request.json();
  const activity = await recordActivity({
    institutionId: session.user.institutionId,
    actorId: session.user.id,
    type: body.type ?? "SYSTEM",
    title: body.title,
    body: body.body,
    entity: body.entity,
    entityId: body.entityId,
    link: body.link,
    metadata: body.metadata
  });
  return NextResponse.json({ activity }, { status: 201 });
}
