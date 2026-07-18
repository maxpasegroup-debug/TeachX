import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getDashboardWidgets, upsertDashboardWidget } from "@/services/dashboard-service";
import { resolveWorkspace } from "@/services/workspace-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const workspace = resolveWorkspace(access.session.user.roles);
  return NextResponse.json({ widgets: await getDashboardWidgets(access.session.user.id, workspace, []) });
}

export async function POST(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const body = await request.json();
  const widget = await upsertDashboardWidget({
    userId: access.session.user.id,
    workspace: body.workspace ?? resolveWorkspace(access.session.user.roles),
    type: body.type ?? "CARD",
    title: body.title,
    order: body.order,
    config: body.config
  });
  return NextResponse.json({ widget }, { status: 201 });
}
