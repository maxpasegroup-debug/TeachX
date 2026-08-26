import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getRecentActivities, recordActivity } from "@/services/activity-service";
import { z } from "zod";

const activitySchema = z.object({
  type: z.enum(["SYSTEM", "ANNOUNCEMENT", "CONTENT", "ASSIGNMENT", "ADMISSION"]),
  title: z.string().trim().min(1).max(240),
  body: z.string().trim().max(4000).optional(),
  entity: z.string().trim().max(120).optional(),
  entityId: z.string().trim().max(120).optional(),
  link: z.string().trim().max(2048).optional()
}).strict();

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json({ activities: await getRecentActivities(session.user.institutionId) });
}

export async function POST(request: Request) {
  const access = await requireApiSession("operations.view");
  if ("response" in access) return access.response;
  const { session } = access;
  const parsed = activitySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid activity." }, { status: 400 });
  const body = parsed.data;
  const activity = await recordActivity({
    institutionId: session.user.institutionId,
    actorId: session.user.id,
    type: body.type ?? "SYSTEM",
    title: body.title,
    body: body.body,
    entity: body.entity,
    entityId: body.entityId,
    link: body.link,
    metadata: { source: "authorized-activity-api" }
  });
  return NextResponse.json({ activity }, { status: 201 });
}
