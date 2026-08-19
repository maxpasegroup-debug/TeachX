import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { getGlobalizationConfig } from "@/lib/globalization/config";
import { supportedLocales, supportedTimeZones } from "@/lib/i18n/config";
import { getRequestId } from "@/lib/observability/request-context";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  const preferences = await prisma.userPreference.findMany({
    where: { key: "teacher.settings", user: institutionId ? { institutionId } : undefined },
    select: { value: true }
  });
  const valid = preferences.filter(({ value }) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const setting = value as Record<string, unknown>;
    return supportedLocales.some((item) => item.code === setting.locale) && supportedTimeZones.includes(setting.timeZone as never);
  }).length;
  const config = getGlobalizationConfig();
  return NextResponse.json({
    ok: config.live,
    controls: config.controls,
    evidence: { ...config.evidence, supportedLocales: supportedLocales.length, supportedTimeZones: supportedTimeZones.length, persistedTeacherPreferences: valid },
    requestId: await getRequestId()
  });
}
