import { getDirectorAiIntelligence } from "@/services/director-ai-service";

export async function getDirectorReportingIntelligence({ institutionId }: { institutionId?: string | null }) {
  const ai = await getDirectorAiIntelligence({ institutionId });
  const generatedAt = new Date().toISOString();
  return {
    ...ai,
    generatedAt,
    reports: [
      { id: "daily", title: "Daily executive brief", cadence: "Daily", status: "Ready", source: "Current executive intelligence", description: "Priorities, risks, and evidence currently in scope." },
      { id: "weekly", title: "Weekly leadership report", cadence: "Weekly", status: "Ready", source: "Executive intelligence", description: "Cross-domain signals, scorecards, and recommended actions." },
      { id: "monthly", title: "Monthly board pack", cadence: "Monthly", status: "Readiness required", source: "Board template", description: "Requires an approved board narrative template and sign-off workflow." },
      { id: "quarterly", title: "Quarterly performance report", cadence: "Quarterly", status: "Readiness required", source: "Historical period model", description: "Requires approved period snapshots and governance controls." },
      { id: "annual", title: "Annual institution report", cadence: "Annual", status: "Readiness required", source: "Annual reporting source", description: "No governed annual report source is connected." }
    ],
    connected: [
      ["Admissions", "/director/admissions", "Admissions Growth"], ["Academics", "/director/intelligence", "Academic Intelligence"], ["Teachers & HR", "/director/hr", "Workforce"], ["Finance", "/director/finance", "Finance"], ["Operations & compliance", "/director/operations", "Operations"], ["Communication", "/director/communication", "Communication"], ["AI intelligence", "/director/ai", "AI Strategy"],
    ].map(([domain, href, workspace]) => ({ domain, href, workspace })),
    readiness: [
      { title: "Student reporting", detail: "Use Academic Intelligence for governed student performance and risk evidence; no separate reporting model is created." },
      { title: "Marketplace reporting", detail: "No authorized marketplace reporting source is connected to this executive scope." },
      { title: "Community reporting", detail: "Use Communication for governed announcements and discussion evidence; no duplicate analytics are created." },
      { title: "Institution growth", detail: "Cross-institution or region comparisons require explicit multi-institution authorization and a governed comparison source." },
    ],
    board: { status: "Readiness required", detail: "Board members, resolutions, decisions, and meeting minutes do not have a governed source in the shared platform. Existing executive evidence can be exported as a board-preparation pack." },
    history: { status: "Readiness required", detail: "Historical KPI snapshots, archived reports, and trend timelines require an approved reporting snapshot source." }
  };
}
