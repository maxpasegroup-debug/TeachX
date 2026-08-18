import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getLaunchReadiness } from "@/services/launch-readiness-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  return NextResponse.json(await getLaunchReadiness(access.session.user.institutionId));
}
