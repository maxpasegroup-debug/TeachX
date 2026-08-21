import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("four Teacher Life OS pillars are authenticated entry points over canonical modules", () => {
  const service = read("services/teacher-life-service.ts");
  const page = read("features/teacher-life/components/teacher-life-page.tsx");
  for (const pillar of ["save-time", "earn-more", "learn-more", "enjoy-more"]) assert.ok(service.includes(`"${pillar}"`));
  for (const route of ["/teacher/workspace/classrooms", "/teacher/ai-studio", "/teacher/resources", "/teacher/workspace/planner", "/teacher/business/one-to-one", "/teacher/business/happy-notes"]) assert.ok(page.includes(route));
  assert.match(service, /institutionId,[\s\S]*status: "PUBLISHED"/);
  assert.doesNotMatch(service, /institutionId:\s*undefined/);
});

test("1:1 teaching reuses tenant-owned profiles, booking, and supported regional pricing", () => {
  const actions = read("features/teacher-business/actions.ts");
  const service = read("services/teacher-business-service.ts");
  const ui = read("features/teacher-business/components/teacher-business-page.tsx");
  assert.match(actions, /id: session\.user\.id, institutionId: session\.user\.institutionId, status: "ACTIVE"/);
  assert.match(actions, /user: \{ institutionId: teacher\.institutionId \}/);
  for (const currency of ["INR", "AED", "SAR", "QAR", "OMR"]) assert.ok(actions.includes(`"${currency}"`) && ui.includes(`"${currency}"`));
  assert.match(actions, /one-to-one-active/);
  assert.match(service, /hourlyRate:[\s\S]*weeklyRate:[\s\S]*monthlyRate:/);
  assert.match(ui, /canonical teacher booking-request workflow/);
});

test("profile photos use the existing verified private storage and authorization boundary", () => {
  const validation = read("lib/storage/validation.ts");
  const storage = read("services/private-storage-service.ts");
  const upload = read("features/teacher-business/components/profile-photo-upload.tsx");
  assert.match(validation, /PROFILE_PHOTO/);
  assert.match(storage, /purpose === "PROFILE_PHOTO"/);
  assert.match(storage, /isMarketplaceListed: true/);
  assert.match(storage, /ownerId === input\.userId/);
  assert.match(upload, /checksumSha256/);
  assert.match(upload, /\/api\/storage\/uploads/);
});

test("Happy Notes is an owned handoff boundary and future destinations contain no fabricated catalog", () => {
  const actions = read("features/teacher-business/actions.ts");
  const service = read("services/teacher-business-service.ts");
  const life = read("features/teacher-life/components/teacher-life-page.tsx");
  assert.match(actions, /happy-notes-submission:\$\{crypto\.randomUUID\(\)\}/);
  assert.match(actions, /boundary: "HAPPY_NOTES"/);
  assert.match(service, /where: \{ userId, key: \{ startsWith: "happy-notes-submission:" \}/);
  assert.match(life, /No teacher-learning content has been published/);
  assert.match(life, /More life beyond the classroom/);
  assert.doesNotMatch(life, /fake offer|fake partner|discount price/i);
});

test("TARA and AI history never broaden a missing teacher tenant", () => {
  const tara = read("services/tara-service.ts");
  const studio = read("services/ai-studio-service.ts");
  assert.doesNotMatch(tara, /institutionId:\s*input\.institutionId\s*\?\?\s*undefined/);
  assert.match(tara, /TEACHER_WORKSPACE_REQUIRED/);
  assert.match(tara, /contextualRole/);
  assert.match(tara, /runAI/);
  assert.match(studio, /if \(!userId \|\| !institutionId\) return \[\]/);
  assert.match(studio, /where: \{ userId, institutionId, scope: "TEACHER"/);
});

test("marketplace notifications enter the destination teacher tenant and fake metrics are removed", () => {
  const actions = read("features/marketplace/actions.ts");
  const ui = read("features/marketplace/components/marketplace-components.tsx");
  assert.match(actions, /institutionId: teacher\.user\.institutionId/);
  assert.doesNotMatch(actions, /documentsPlaceholder|portfolioPlaceholder/);
  assert.doesNotMatch(ui, /Top Rated|Acceptance Rate.*Placeholder|Nearby teacher discovery placeholder|>Fast</);
});

test("P11 introduces no duplicate core architecture", () => {
  const schema = read("prisma/schema.prisma");
  for (const forbidden of ["TeacherLifeOS", "OneToOneUser", "HappyNotesPost", "TeacherLearningLMS", "EnjoyMarketplace", "TaraEngineV2"]) assert.doesNotMatch(schema, new RegExp(`model ${forbidden} \\{`));
  assert.match(schema, /model TeacherProfile \{/);
  assert.match(schema, /model TeacherBookingRequest \{/);
  assert.match(schema, /model ContentItem \{/);
});
