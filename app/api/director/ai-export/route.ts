import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { getDirectorAiIntelligence } from "@/services/director-ai-service";

const cell = (value: unknown) => {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};

export async function GET(request: NextRequest) {
  const access = await requireApiSession("director.view");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution scope required" }, { status: 403 });
  const report = request.nextUrl.searchParams.get("report") ?? "brief";
  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  if (! ["brief", "risks", "insights", "scorecards", "forecasts", "automation", "reports"].includes(report) || !["csv", "json"].includes(format)) return NextResponse.json({ error: "Invalid export request" }, { status: 400 });
  const data = await getDirectorAiIntelligence({ institutionId });
  const source: Record<string, Record<string, unknown>[]> = { brief: [{ institution: data.institution, priorities: data.priorities.length, risks: data.risks.length }], risks: data.risks, insights: data.insights, scorecards: data.scorecards, forecasts: data.forecasts, automation: data.automation, reports: data.reports };
  const rows = source[report] ?? [];
  const keys = rows.length ? [...new Set(rows.flatMap(row => Object.keys(row)))] : ["status"];
  const payload = { report, generatedAt: new Date().toISOString(), methodology: "Tenant-scoped aggregate of existing finance, staff, support, planner and communication records. Readiness items are not predictions.", rows };
  const body = format === "json" ? JSON.stringify(payload) : [keys.map(cell).join(","), ...rows.map(row => keys.map(key => cell(row[key])).join(","))].join("\r\n");
  return new NextResponse(body, { headers: { "Content-Type": format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="directorx-ai-${report}.${format}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}