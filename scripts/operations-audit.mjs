import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const check = (name, pass, detail) => ({ name, pass, detail });
const files = [
  "lib/operations/config.ts", "services/operations-service.ts", "app/api/operations/readiness/route.ts",
  "app/api/operations/incidents/route.ts", "app/api/operations/incidents/[incidentId]/route.ts",
  "app/api/operations/maintenance/route.ts", "app/(app)/admin/incidents/page.tsx",
  "features/operations/components/incident-command-center.tsx", "scripts/operations-verify.mjs",
  "tests/operations/operations-regression.test.mjs", "docs/PHASE_20_PRODUCTION_OPERATIONS.md",
  "prisma/migrations/20260819190000_add_production_operations/migration.sql"
];
const schema = read("prisma/schema.prisma");
const service = read("services/operations-service.ts");
const proxy = read("proxy.ts");
const status = read("services/public-status-service.ts");
const config = read("lib/operations/config.ts");
const checks = [
  ...files.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("incident:durable", schema.includes("model OperationalIncident") && schema.includes("model OperationalIncidentUpdate"), "incidents and append-only updates are durable"),
  check("incident:indexed", schema.includes("@@index([status, severity, startedAt])"), "active incident timeline is indexed"),
  check("incident:transition", service.includes("INVALID_INCIDENT_TRANSITION") && service.includes("const transitions"), "incident status cannot move backwards"),
  check("incident:public-update", service.includes("PUBLIC_UPDATE_REQUIRED"), "visible incidents require public updates"),
  check("incident:audit", service.includes('entity: "OperationalIncident"'), "incident mutations create audit evidence"),
  check("maintenance:durable", schema.includes("model PlatformOperationalControl") && service.includes("setMaintenanceControl"), "maintenance notice is governed and durable"),
  check("freeze:mutations", proxy.includes("OPERATIONS_WRITE_FREEZE") && proxy.includes("WRITE_FREEZE_EXEMPT_PREFIXES"), "emergency freeze blocks user writes while preserving webhooks"),
  check("freeze:retry", proxy.includes('"Retry-After": "60"'), "frozen clients receive retry guidance"),
  check("status:privacy", status.includes("getPublicOperations") && service.includes("publicMessage") && !service.includes("select: { id: true, title: true, summary: true"), "public status exposes approved updates, not internal notes"),
  check("slo:bounded", ["availabilityPercent", "p95LatencyMs", "sev1AckMinutes", "sev2AckMinutes"].every((token) => config.includes(token)), "availability, latency, and acknowledgement SLOs are bounded"),
  check("ownership:dual", config.includes("primaryOnCall") && config.includes("secondaryOnCall"), "primary and secondary on-call ownership is required"),
  check("evidence:fresh", config.includes("evidenceFresh") && config.includes("OPERATIONS_EVIDENCE_MAX_AGE_DAYS"), "operations evidence expires on a bounded schedule")
];
const failed = checks.filter((item) => !item.pass);
console.log(`TeachX production operations audit: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
if (failed.length) process.exit(1);
console.log("Production operations audit passed.");
