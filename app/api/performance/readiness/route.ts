import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { getRequestId } from "@/lib/observability/request-context";
import { getPerformanceConfig } from "@/lib/performance/config";
import { withTimeout } from "@/lib/performance/timeout";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  const config = getPerformanceConfig();
  const startedAt = performance.now();
  let database = "connected";
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, config.budgets.databaseTimeoutMs, "Database readiness");
  } catch {
    database = "unavailable";
  }
  const databaseLatencyMs = Math.round((performance.now() - startedAt) * 10) / 10;
  return NextResponse.json({
    ok: config.live && database === "connected",
    controls: config.controls,
    budgets: config.budgets,
    evidence: config.evidence,
    database: { status: database, latencyMs: databaseLatencyMs, withinBudget: databaseLatencyMs <= config.budgets.databaseTimeoutMs },
    requestId: await getRequestId()
  }, { status: database === "connected" ? 200 : 503, headers: database === "connected" ? undefined : { "Retry-After": "5" } });
}
