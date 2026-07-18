import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getDirectorDashboard } from "@/services/director-dashboard-service";

export async function GET() {
  const access = await requireApiSession("director.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json(await getDirectorDashboard(session.user.institutionId));
}
