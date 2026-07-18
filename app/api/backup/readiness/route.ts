import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getBackupReadiness } from "@/services/backup-service";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  if (!access.session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  return NextResponse.json(await getBackupReadiness(access.session.user.institutionId));
}
