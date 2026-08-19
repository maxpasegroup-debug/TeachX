import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getRuntimeCheck } from "@/lib/env";
import { logEvent } from "@/lib/observability/logger";
import { getRequestId } from "@/lib/observability/request-context";
import { getPerformanceConfig } from "@/lib/performance/config";
import { withTimeout } from "@/lib/performance/timeout";

export const dynamic = "force-dynamic";

export async function GET() {
  const runtime = getRuntimeCheck();
  const performanceConfig = getPerformanceConfig();

  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, performanceConfig.budgets.databaseTimeoutMs, "Database readiness");
    return NextResponse.json({
      ok: runtime.ok,
      status: runtime.ok ? "ready" : "configuration_incomplete",
      database: "connected",
      launchMode: runtime.launchMode,
      timestamp: new Date().toISOString()
    }, { status: runtime.ok ? 200 : 503, headers: runtime.ok ? undefined : { "Retry-After": "5" } });
  } catch {
    const requestId = await getRequestId();
    logEvent("warn", "readiness.database_unavailable", { requestId });
    return NextResponse.json({
      ok: false,
      status: "database_unavailable",
      database: "unavailable",
      launchMode: "configuration_incomplete",
      timestamp: new Date().toISOString(),
      requestId
    }, { status: 503, headers: { "Retry-After": "5" } });
  }
}
