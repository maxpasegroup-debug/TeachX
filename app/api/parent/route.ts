import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getParentPortal } from "@/services/parent-portal-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  return NextResponse.json(await getParentPortal(access.session.user.id, access.session.user.institutionId));
}
