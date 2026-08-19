import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { getPrivacyAdministration } from "@/services/privacy-service";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  if (!access.session.user.roles.includes("ADMIN")) return NextResponse.json({ error: "Platform administrator access required" }, { status: 403 });
  const data = await getPrivacyAdministration();
  return NextResponse.json({ ok: data.config.live && data.metrics.overdue === 0, config: data.config, metrics: data.metrics });
}
