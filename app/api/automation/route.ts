import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { createAutomationRule, executeAutomation, getAutomationRules } from "@/services/automation-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  return NextResponse.json({ rules: await getAutomationRules(access.session.user.institutionId) });
}

export async function POST(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  if (!access.session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const body = await request.json();
  if (body.execute) {
    return NextResponse.json({ executions: await executeAutomation({ institutionId: access.session.user.institutionId, trigger: body.trigger, actorId: access.session.user.id, entity: body.entity, entityId: body.entityId }) });
  }
  const rule = await createAutomationRule({ institutionId: access.session.user.institutionId, name: body.name, trigger: body.trigger, actions: body.actions ?? [] });
  return NextResponse.json({ rule }, { status: 201 });
}
