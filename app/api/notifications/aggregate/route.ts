import { ActivityType } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { createModuleNotification, getNotificationCenter } from "@/services/notification-aggregation-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  return NextResponse.json(await getNotificationCenter(access.session.user.id, access.session.user.institutionId));
}

export async function POST(request: Request) {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  const body: unknown = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid notification payload." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 240) : "";
  const userId = typeof input.userId === "string" ? input.userId : undefined;
  if (!title) return NextResponse.json({ error: "A notification title is required." }, { status: 400 });
  if (userId) {
    const recipient = await prisma.user.findFirst({ where: { id: userId, institutionId: access.session.user.institutionId, status: "ACTIVE" }, select: { id: true } });
    if (!recipient) return NextResponse.json({ error: "Recipient is not available in this institution." }, { status: 403 });
  }
  const type = typeof input.type === "string" && Object.values(ActivityType).includes(input.type as ActivityType) ? input.type as ActivityType : ActivityType.SYSTEM;
  const notification = await createModuleNotification({
    institutionId: access.session.user.institutionId,
    userId,
    type,
    title,
    body: typeof input.body === "string" ? input.body.slice(0, 4000) : undefined,
    link: typeof input.link === "string" ? input.link.slice(0, 2048) : undefined,
    metadata: input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata) ? input.metadata as Record<string, unknown> : undefined
  });
  return NextResponse.json({ notification }, { status: 201 });
}