import { NextResponse } from "next/server";
import { ActivityType, Prisma, WorkspaceKind } from "@prisma/client";
import { z } from "zod";

import { requireApiSession } from "@/lib/api-auth";
import { getUserPreferences, setNotificationPreference, setWorkspacePreference } from "@/services/preference-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  return NextResponse.json(await getUserPreferences(access.session.user.id));
}

export async function POST(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const body: unknown = await request.json().catch(() => null);
  const notification = z.object({ kind: z.literal("notification"), type: z.nativeEnum(ActivityType), enabled: z.boolean() }).strict().safeParse(body);
  if (notification.success) {
    return NextResponse.json({ preference: await setNotificationPreference(access.session.user.id, notification.data.type, notification.data.enabled) });
  }
  const workspace = z.object({ kind: z.literal("workspace"), workspace: z.nativeEnum(WorkspaceKind), layout: z.record(z.string(), z.unknown()).optional() }).strict().safeParse(body);
  if (!workspace.success) return NextResponse.json({ error: "Invalid preference request." }, { status: 400 });
  return NextResponse.json({ preference: await setWorkspacePreference(access.session.user.id, workspace.data.workspace, workspace.data.layout as Prisma.InputJsonValue | undefined) });
}
