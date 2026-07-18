import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { userHasPermission } from "@/lib/rbac";
import { createAnnouncement, getAnnouncements } from "@/services/announcement-engine-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  return NextResponse.json({ announcements: await getAnnouncements(access.session.user.institutionId) });
}

export async function POST(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  if (!userHasPermission(access.session.user.roles, "operations.view") && !userHasPermission(access.session.user.roles, "classrooms.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!access.session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const body = await request.json();
  const announcement = await createAnnouncement({
    institutionId: access.session.user.institutionId,
    createdById: access.session.user.id,
    kind: "ANNOUNCEMENT",
    title: body.title,
    body: body.body,
    priority: body.priority ?? "NORMAL",
    channels: body.channels ?? ["IN_APP"],
    roleKey: body.roleKey,
    courseId: body.courseId,
    batchId: body.batchId,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    attachmentUrl: body.attachmentUrl
  });
  return NextResponse.json({ announcement }, { status: 201 });
}
