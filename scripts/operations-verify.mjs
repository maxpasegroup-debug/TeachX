import process from "node:process";

const rawBaseUrl = process.env.SMOKE_BASE_URL || process.env.MONITOR_BASE_URL;
const evidenceMaxAgeDays = Number(process.env.OPERATIONS_EVIDENCE_MAX_AGE_DAYS || 30);
const requiredTrue = ["OPERATIONS_ONCALL_READY", "OPERATIONS_ALERT_ROUTING_READY", "OPERATIONS_ROLLBACK_READY", "OPERATIONS_STATUS_PAGE_READY"];
const requiredValues = ["OPERATIONS_PRIMARY_ONCALL", "OPERATIONS_SECONDARY_ONCALL", "OPERATIONS_INCIDENT_CHANNEL", "OPERATIONS_ALERT_DESTINATION"];
const evidenceKeys = ["OPERATIONS_ALERT_TESTED_AT", "OPERATIONS_ROLLBACK_TESTED_AT", "OPERATIONS_INCIDENT_DRILL_TESTED_AT", "OPERATIONS_STATUS_TESTED_AT"];
const checks = [];
const check = (name, pass, detail) => checks.push({ name, pass, detail });

if (!rawBaseUrl) {
  console.error("Operations verification requires SMOKE_BASE_URL=https://your-production-domain.");
  process.exit(1);
}
const baseUrl = rawBaseUrl.replace(/\/+$/, "");
check("target:https", new URL(baseUrl).protocol === "https:", "production target uses HTTPS");
for (const key of requiredTrue) check(`control:${key}`, process.env[key] === "true", `${key} is attested`);
for (const key of requiredValues) check(`owner:${key}`, Boolean(process.env[key]?.trim()), `${key} is assigned`);
const incidentDrillId = process.env.OPERATIONS_INCIDENT_DRILL_ID?.trim();
check("drill:id", Boolean(incidentDrillId), "OPERATIONS_INCIDENT_DRILL_ID identifies durable drill evidence");
for (const key of evidenceKeys) {
  const age = process.env[key] ? (Date.now() - new Date(process.env[key]).getTime()) / 86_400_000 : Number.POSITIVE_INFINITY;
  check(`evidence:${key}`, Number.isFinite(age) && age >= 0 && age <= evidenceMaxAgeDays, `${key} age ${Number.isFinite(age) ? age.toFixed(1) : "missing"} days`);
}

try {
  const response = await fetch(`${baseUrl}/api/status`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  const body = await response.json();
  check("status:http", response.ok, `HTTP ${response.status}`);
  check("status:contract", Array.isArray(body.components) && Array.isArray(body.incidents) && Object.hasOwn(body, "maintenance"), "public status includes components, incidents, and maintenance");
  check("status:operations", body.components?.some((item) => item.name === "Incident response"), "incident response appears in public component health");
  const drill = body.incidents?.find((item) => item.id === incidentDrillId);
  check("drill:resolved-record", drill?.status === "RESOLVED" && drill?.updates?.length >= 4, "configured drill has a resolved public lifecycle with at least four updates");
  check("status:availability", body.overall !== "outage", `public status is ${body.overall ?? "unknown"}`);
} catch (error) {
  check("status:request", false, error instanceof Error ? error.message : "request failed");
}

const failed = checks.filter((item) => !item.pass);
console.log(`TeachX production operations verification: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
if (failed.length) process.exit(1);
console.log("Live production operations evidence passed.");
