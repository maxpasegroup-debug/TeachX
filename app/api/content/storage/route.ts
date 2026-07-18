import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getStorageDashboard } from "@/services/storage-service";

export async function GET() {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json(await getStorageDashboard(session.user.institutionId));
}
