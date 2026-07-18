import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { createModuleNotification, getNotificationCenter } from "@/services/notification-aggregation-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  return NextResponse.json(await getNotificationCenter(access.session.user.id, access.session.user.institutionId));
}

export async function POST(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const body = await request.json();
  const notification = await createModuleNotification({
    institutionId: access.session.user.institutionId,
    userId: body.userId,
    type: body.type ?? "SYSTEM",
    title: body.title,
    body: body.body,
    link: body.link,
    metadata: body.metadata
  });
  return NextResponse.json({ notification }, { status: 201 });
}
