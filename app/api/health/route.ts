import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "teachx",
    status: "healthy",
    version: process.env.npm_package_version ?? "1.0.0-rc.1",
    timestamp: new Date().toISOString()
  });
}
