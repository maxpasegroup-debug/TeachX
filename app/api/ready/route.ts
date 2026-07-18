import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getRuntimeCheck } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const runtime = getRuntimeCheck();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: runtime.ok,
      status: runtime.ok ? "ready" : "configuration_incomplete",
      database: "connected",
      missing: runtime.missing,
      timestamp: new Date().toISOString()
    }, { status: runtime.ok ? 200 : 503 });
  } catch {
    return NextResponse.json({
      ok: false,
      status: "database_unavailable",
      database: "unavailable",
      missing: runtime.missing,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
