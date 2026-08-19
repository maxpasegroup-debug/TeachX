import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("incident transitions are forward-only and resolved incidents stay closed", () => {
  const service = read("services/operations-service.ts");
  assert.match(service, /INVESTIGATING: \["IDENTIFIED", "MONITORING", "RESOLVED"\]/);
  assert.match(service, /RESOLVED: \[\]/);
  assert.match(service, /INVALID_INCIDENT_TRANSITION/);
});

test("public incidents cannot publish internal notes accidentally", () => {
  const service = read("services/operations-service.ts");
  assert.match(service, /PUBLIC_UPDATE_REQUIRED/);
  assert.match(service, /select: \{ status: true, publicMessage: true, createdAt: true \}/);
  assert.doesNotMatch(service, /select: \{ status: true, internalNote: true/);
});

test("emergency write freeze preserves health, auth, and payment or email webhooks", () => {
  const proxy = read("proxy.ts");
  for (const path of ["/api/auth", "/api/email/webhooks", "/api/payments/webhooks", "/api/health", "/api/ready"]) assert.match(proxy, new RegExp(path.replaceAll("/", "\\/")));
  assert.match(proxy, /code: "WRITE_FREEZE"/);
});

test("operations APIs require governed settings permission", () => {
  for (const path of ["app/api/operations/readiness/route.ts", "app/api/operations/incidents/route.ts", "app/api/operations/maintenance/route.ts"]) {
    assert.match(read(path), /requireApiSession\("settings\.manage"\)/);
  }
});

test("operations evidence and SLO configuration are bounded", () => {
  const config = read("lib/operations/config.ts");
  assert.match(config, /OPERATIONS_EVIDENCE_MAX_AGE_DAYS, 30, 1, 90/);
  assert.match(config, /OPERATIONS_SEV1_ACK_MINUTES, 5, 1, 60/);
  assert.match(config, /OPERATIONS_AVAILABILITY_TARGET, 99\.9, 90, 100/);
  assert.match(config, /OPERATIONS_INCIDENT_DRILL_ID/);
});
