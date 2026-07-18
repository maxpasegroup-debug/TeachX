import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getWorkspaceData } from "@/services/workspace-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json(await getWorkspaceData({ userId: session.user.id, name: session.user.name, institutionId: session.user.institutionId, roles: session.user.roles }));
}
