import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { getOperationsConfig } from "@/lib/operations/config";
import { getOperationsCommandData } from "@/services/operations-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  const data = await getOperationsCommandData();
  const active = data.incidents.filter((incident) => incident.status !== "RESOLVED");
  const recentDrill = data.incidents.find((incident) => incident.isDrill && incident.status === "RESOLVED");
  const config = getOperationsConfig();
  return NextResponse.json({ ok: config.live && !active.some((incident) => incident.severity === "SEV1"), config, activeIncidents: active.length, recentDrillAt: recentDrill?.resolvedAt ?? null });
}
