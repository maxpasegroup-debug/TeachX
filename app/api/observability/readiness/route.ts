import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getRequestId } from "@/lib/observability/request-context";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;

  const requestId = await getRequestId();
  const serverDsn = Boolean(process.env.SENTRY_DSN);
  const clientDsn = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
  const sourceMaps = Boolean(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN);

  return NextResponse.json({
    ok: serverDsn && clientDsn && sourceMaps,
    provider: "sentry",
    serverCapture: serverDsn,
    browserCapture: clientDsn,
    sourceMaps,
    privacy: {
      defaultPii: false,
      sessionReplay: false,
      inputBreadcrumbs: false
    },
    requestId,
    release: process.env.SENTRY_RELEASE || process.env.RAILWAY_GIT_COMMIT_SHA || process.env.npm_package_version || "unknown"
  });
}
