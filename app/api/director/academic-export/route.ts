import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { getDirectorAcademicIntelligence } from "@/services/director-academic-intelligence-service";

const reports = new Set(["academic", "teachers", "students", "risks", "departments", "assessments", "classes", "courses", "actions", "institution", "executive-summary"]);
const formats = new Set(["csv", "json"]);
const safeCell = (value: unknown) => {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};

export async function GET(request: NextRequest) {
  const access = await requireApiSession("director.view");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution scope required" }, { status: 403 });

  const report = request.nextUrl.searchParams.get("report") ?? "academic";
  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  const query = (request.nextUrl.searchParams.get("query") ?? "").toLowerCase().slice(0, 100);
  const sort = request.nextUrl.searchParams.get("sort") ?? "score";
  const requestedThreshold = Number(request.nextUrl.searchParams.get("threshold") ?? 50);
  if (!Number.isFinite(requestedThreshold)) return NextResponse.json({ error: "Invalid threshold" }, { status: 400 });
  const threshold = Math.min(70, Math.max(35, requestedThreshold));
  if (!reports.has(report) || !formats.has(format) || !["score", "risk", "name"].includes(sort)) {
    return NextResponse.json({ error: "Invalid export request" }, { status: 400 });
  }

  const data = await getDirectorAcademicIntelligence({ institutionId });
  const catalog: Record<string, Record<string, unknown>[]> = {
    academic: [{ institution: data.institution, ...data.summary, ...data.evidence }],
    institution: [{ institution: data.institution, ...data.summary, ...data.evidence }],
    "executive-summary": [{ institution: data.institution, activeActions: data.actions.length, ...data.summary, ...data.assessments, ...data.evidence }],
    teachers: data.teachers,
    students: data.students,
    risks: data.students.filter(student =>
      (student.score !== null && student.score < threshold) ||
      (student.attendance !== null && student.attendance < 75) ||
      (student.completion !== null && student.completion < 50),
    ),
    departments: data.departments,
    assessments: [{ institution: data.institution, ...data.assessments, ...data.evidence }],
    classes: data.classes,
    courses: data.courses,
    actions: data.actions.filter(action => action.domain !== "GRADE" || Number(action.evidence.match(/[0-9.]+/)?.[0] ?? 101) < threshold),
  };
  const rows = catalog[report]
    .filter(row => !query || JSON.stringify(row).toLowerCase().includes(query))
    .sort((a, b) => sort === "name" ? String(a.name ?? "").localeCompare(String(b.name ?? "")) : Number(b[sort] ?? -1) - Number(a[sort] ?? -1));
  const payload = { report, filters: { query, sort, threshold }, methodology: `Tenant-bounded measured records; grade threshold ${threshold}%, attendance 75%, completion 50%; missing evidence remains unknown.`, generatedAt: new Date().toISOString(), rows };
  const headers = Object.keys(rows[0] ?? { status: "no-data" });
  const body = format === "json" ? JSON.stringify(payload) : [headers.map(safeCell).join(","), ...rows.map(row => headers.map(key => safeCell(row[key])).join(","))].join("\r\n");
  return new NextResponse(body, { headers: { "Content-Type": format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="directorx-${report}.${format}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
