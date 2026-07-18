import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getOperationsReports } from "@/services/operations-report-service";

export async function GET() {
  const access = await requireApiSession("reports.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json({ reports: await getOperationsReports(session.user.institutionId) });
}
