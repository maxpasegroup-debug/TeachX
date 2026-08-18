import { NextResponse } from "next/server";

import packageJson from "@/package.json";
import releaseManifest from "@/release/manifest.json";

export async function GET() {
  return NextResponse.json({
    name: packageJson.name,
    version: packageJson.version,
    releaseChannel: releaseManifest.channel,
    releaseStatus: releaseManifest.status,
    environment: process.env.NODE_ENV ?? "development",
    commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? null,
    builtAt: process.env.BUILD_TIME ?? null
  });
}
