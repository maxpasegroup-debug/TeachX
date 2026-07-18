import { NextResponse } from "next/server";

import packageJson from "@/package.json";

export async function GET() {
  return NextResponse.json({
    name: packageJson.name,
    version: packageJson.version,
    environment: process.env.NODE_ENV ?? "development",
    commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null
  });
}
