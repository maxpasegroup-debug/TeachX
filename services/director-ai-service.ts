import { prisma } from "@/lib/db";

const number = (value: unknown) => Number(value ?? 0);
const preferences = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export async function getDirectorAiIntelligence({ institutionId }: { institutionId?: string | null }) {
  const empty = { institution: "Institution", summary: { students: 0, staff: 0, revenue: 0, spend: 0, expected: 0, confidence: 0, confidenceBasis: "No eligible source records" }, scorecards: [], priorities: [], insights: [], risks: [], forecasts: [], automation: [], reports: [], settings: { format: "csv" as "csv" | "json", sensitivity: "Balanced", copilot: true } };
  if (!institutionId) return empty;
  const [institution, payments, fees, expenses, students, staff, tickets, events, communications, setting] = await Promise.all([
    prisma.institution.findUnique({ where: { id: institutionId }, select: { name: true } }),
    prisma.payment.findMany({ where: { institutionId, status: "COMPLETED" }, select: { amount: true, paidAt: true }, take: 500 }),
    prisma.studentFee.findMany({ where: { institutionId }, select: { amount: true, dueDate: true, status: true }, take: 500 }),
    prisma.expense.findMany({ where: { institutionId }, select: { amount: true, status: true }, take: 500 }),
    prisma.user.count({ where: { institutionId, status: "ACTIVE", roles: { some: { role: { key: "STUDENT" } } } } }),
    prisma.staffProfile.count({ where: { user: { institutionId } } }),
    prisma.supportTicket.findMany({ where: { institutionId }, select: { id: true, subject: true, status: true, priority: true, updatedAt: true, assignedTo: { select: { name: true } } }, take: 100 }),
    prisma.plannerEvent.findMany({ where: { institutionId }, select: { id: true, title: true, startsAt: true, type: true }, orderBy: { startsAt: "asc" }, take: 50 }),
    prisma.communication.findMany({ where: { institutionId }, select: { id: true, title: true, priority: true, status: true, createdAt: true }, take: 100 }),
    prisma.setting.findUnique({ where: { institutionId_key: { institutionId, key: "directorx.ai.preferences" } }, select: { value: true } })
  ]);
  const now = new Date();
  const revenue = payments.reduce((sum, payment) => sum + number(payment.amount), 0);
  const spend = expenses.reduce((sum, expense) => sum + number(expense.amount), 0);
  const expected = fees.reduce((sum, fee) => sum + number(fee.amount), 0);
  const overdue = fees.filter(fee => fee.status !== "PAID" && fee.dueDate && fee.dueDate < now);
  const open = tickets.filter(ticket => !["RESOLVED", "CLOSED"].includes(ticket.status));
  const urgent = tickets.filter(ticket => ["URGENT", "HIGH"].includes(ticket.priority));
  const health = expected ? Math.min(100, Math.round((revenue / expected) * 100)) : null;
  const risks = [
    ...urgent.map(ticket => ({ id: ticket.id, level: "CRITICAL", priority: "Today", title: "Escalated operational issue", evidence: ticket.subject, action: "Open the existing support workflow and confirm an accountable owner.", owner: ticket.assignedTo?.name ?? "Operations lead", deadline: "Today", source: "Support ticket" })),
    ...(overdue.length ? [{ id: "overdue-fees", level: "HIGH", priority: "This week", title: "Overdue fee exposure", evidence: `${overdue.length} fee records are past due.`, action: "Prioritise collections through the existing fees workflow.", owner: "Accounts lead", deadline: "This week", source: "Fee records" }] : []),
    ...(open.length >= 3 ? [{ id: "open-work", level: "WATCH", priority: "This week", title: "Operational backlog", evidence: `${open.length} support issues remain open.`, action: "Triage the existing operational queue.", owner: "Operations lead", deadline: "This week", source: "Support tickets" }] : [])
  ];
  const insights = [
    { domain: "Finance", title: "Collection position", detail: expected ? `${health}% of recorded fee expectations has been collected.` : "No fee expectation records are available for a collection ratio.", confidence: expected ? "High" : "Unavailable", drill: "/director/finance" },
    { domain: "Workforce", title: "Active workforce", detail: `${staff} active staff profiles are available in the authorized institution scope.`, confidence: "High", drill: "/director/hr" },
    { domain: "Operations", title: "Open operating signals", detail: `${open.length} unresolved support issues and ${events.filter(event => event.startsAt >= now).length} upcoming calendar commitments are visible.`, confidence: "High", drill: "/director/operations" },
    { domain: "Communication", title: "Executive communication", detail: `${communications.filter(item => ["URGENT", "HIGH"].includes(item.priority)).length} high-priority communications are available.`, confidence: "High", drill: "/director/communication" }
  ];
  const prefs = preferences(setting?.value);
  return { institution: institution?.name ?? "Institution", summary: { students, staff, revenue, spend, expected, confidence: expected || tickets.length || communications.length ? Math.min(95, 45 + (expected ? 20 : 0) + (tickets.length ? 15 : 0) + (communications.length ? 10 : 0)) : 0, confidenceBasis: "Coverage of fee, support-ticket, planner, and communication sources" }, scorecards: [{ label: "Institution", score: health, basis: "Collection health" }, { label: "Finance", score: health, basis: "Completed payments / recorded fees" }, { label: "Operations", score: tickets.length ? Math.max(0, 100 - open.length * 8 - urgent.length * 10) : null, basis: "Support queue" }, { label: "HR", score: staff ? null : null, basis: "No governed performance source" }, { label: "Academic", score: null, basis: "Use Academic Intelligence" }, { label: "Admissions", score: null, basis: "Use Admissions Growth" }], priorities: risks.slice(0, 4), insights, risks, forecasts: [{ label: "Revenue forecast", status: "Readiness required", detail: "Historical period and approved forecast-model outputs are not available in the finance source." }, { label: "Student forecast", status: "Readiness required", detail: `${students} active students are recorded, but no governed predictive model output is available.` }, { label: "Teacher demand", status: "Readiness required", detail: "Workload allocation exists separately; no approved demand forecast output is stored." }, { label: "Admission forecast", status: "Readiness required", detail: "No governed admissions forecast output is available; review the existing Admissions Growth workspace." }, { label: "Cash flow forecast", status: "Readiness required", detail: "Payments and expenses are available, but no approved cash-flow forecast model output is stored." }, { label: "Growth forecast", status: "Readiness required", detail: "No approved cross-domain growth forecast output is available for this institution." }], automation: [{ title: "Collections follow-up", detail: overdue.length ? "Prioritise existing overdue-fee workflow reminders." : "No overdue fee records require action.", owner: "Accounts lead" }, { title: "Support queue triage", detail: open.length ? "Review open support tickets using existing workflow assignments." : "No open operational queue requires triage.", owner: "Operations lead" }], reports: [{ period: "Weekly", status: "Export ready", detail: "Exports current tenant-scoped evidence and risk register." }, { period: "Monthly", status: "Readiness required", detail: "Board narrative requires an approved report template and governed sign-off." }, { period: "Quarterly", status: "Readiness required", detail: "No approved board reporting source is connected." }, { period: "Annual", status: "Readiness required", detail: "No annual governed board report source is connected." }], settings: { format: prefs.format === "json" ? "json" as const : "csv" as const, sensitivity: ["Conservative", "Balanced", "Early warning"].includes(String(prefs.sensitivity)) ? String(prefs.sensitivity) : "Balanced", copilot: prefs.copilot !== false } };
}
