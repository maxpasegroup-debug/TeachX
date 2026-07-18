import { NextResponse } from "next/server";

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
  const body = await request.json();
  if (body.kind === "notification") {
    return NextResponse.json({ preference: await setNotificationPreference(access.session.user.id, body.type, Boolean(body.enabled)) });
  }
  return NextResponse.json({ preference: await setWorkspacePreference(access.session.user.id, body.workspace, body.layout) });
}
