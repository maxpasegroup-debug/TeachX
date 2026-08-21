import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("new teacher signup creates a tenant-bound personal workspace", () => {
  const actions = read("features/auth/actions.ts");
  const auth = read("auth.ts");
  assert.match(actions, /institution:\s*\{ create: \{ name:/);
  assert.match(auth, /user\.institutionId \? \{\} : \{ institution: \{ create:/);
});

test("teacher business data blocks missing tenants and scopes institution-owned records", () => {
  const service = read("services/teacher-business-service.ts");
  assert.match(service, /if \(!userId \|\| !institutionId\) return null/);
  assert.match(service, /createdById: userId, institutionId/);
  assert.match(service, /buyerId: userId, institutionId/);
  assert.match(service, /where: \{ createdById: userId, institutionId \}/);
  assert.match(service, /item: \{ institutionId \}/);
  assert.doesNotMatch(service, /institutionId:\s*institutionId \?\? undefined/);
});

test("AI Studio and AI execution require a tenant and never widen template access", () => {
  const studio = read("services/ai-studio-service.ts");
  const ai = read("services/ai-service.ts");
  const actions = read("features/ai-studio/actions.ts");
  assert.match(studio, /if \(!userId \|\| !institutionId\)/);
  assert.match(studio, /OR: \[\{ institutionId \}, \{ institutionId: null \}\]/);
  assert.doesNotMatch(studio, /institutionId \?\? undefined/);
  assert.match(ai, /if \(input\.scope === "TEACHER"\)/);
  assert.match(ai, /getAICreditSummary/);
  assert.match(actions, /institutionId: session\.user\.institutionId/);
});

test("AI credit display uses the subscription credit source rather than a hard-coded allowance", () => {
  const studio = read("services/ai-studio-service.ts");
  const dashboard = read("services/teachx-operating-service.ts");
  assert.match(studio, /getAICreditSummary/);
  assert.match(dashboard, /getAICreditSummary/);
  assert.doesNotMatch(studio, /current:\s*1000/);
});
