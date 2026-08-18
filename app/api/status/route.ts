import { NextResponse } from "next/server";

import { getPublicSystemStatus } from "@/services/public-status-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getPublicSystemStatus();
  return NextResponse.json(status, {
    status: status.overall === "outage" ? 503 : 200,
    headers: { "Cache-Control": "no-store" }
  });
}

