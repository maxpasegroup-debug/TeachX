import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("teacher settings require an active tenant-bound teacher", () => {
  const service = read("services/teacher-settings-service.ts");
  assert.match(service, /if \(!userId \|\| !institutionId\) return null/);
  assert.match(service, /id: userId, institutionId, status: "ACTIVE"/);
  assert.match(service, /role: \{ key: \{ in: teacherRoles \} \}/);
  assert.match(service, /where: \{ userId, institutionId, status:/);
  assert.doesNotMatch(service, /institutionId:\s*institutionId \?\? undefined/);
});

test("mobile placeholder email is not exposed as account data", () => {
  const settings = read("services/teacher-settings-service.ts");
  const profile = read("app/(app)/profile/page.tsx");
  assert.match(settings, /endsWith\("@accounts\.teachx\.invalid"\) \? null/);
  assert.match(profile, /Email not added/);
});

test("teacher notification reads combine own records with current-tenant broadcasts only", () => {
  const service = read("services/teacher-notification-service.ts");
  assert.match(service, /OR: \[\{ userId, institutionId \}, \{ userId: null, institutionId \}\]/);
  assert.match(service, /id: input\.id, userId: input\.userId, institutionId: input\.institutionId/);
  assert.match(service, /id: input\.id, userId: null, institutionId: input\.institutionId/);
  assert.doesNotMatch(service, /institutionId:\s*undefined/);
});

test("broadcast notification read state remains private to each teacher", () => {
  const service = read("services/teacher-notification-service.ts");
  assert.match(service, /userId_key: \{ userId: input\.userId, key: `notification-state:\$\{input\.id\}` \}/);
  assert.match(service, /userId_key: \{ userId, key: `notification-state:\$\{item\.id\}` \}/);
});

test("support history and replies enforce requester and tenant ownership", () => {
  const service = read("services/teacher-support-service.ts");
  const actions = read("features/teacher-settings/actions.ts");
  assert.match(service, /where: \{ requesterId: userId, institutionId \}/);
  assert.match(service, /where: \{ internal: false \}/);
  assert.match(actions, /requesterId: session\.user\.id, institutionId: session\.user\.institutionId!/);
  assert.match(actions, /status: "ACTIVE"/);
  assert.match(actions, /status: \{ notIn: \["CLOSED", "ARCHIVED"\] \}/);
  assert.match(actions, /internal: false/);
});

test("P9 interfaces expose complete notification, help, account, privacy, security, and billing paths", () => {
  const notifications = read("features/teacher-settings/components/teacher-notification-center.tsx");
  const settings = read("features/platform-integration/components/teacher-unified-settings.tsx");
  const support = read("app/(app)/teacher/support/page.tsx");
  for (const category of ["UNREAD", "TEACHING", "STUDENTS", "AI", "RESOURCES", "COMMUNITY", "MARKETPLACE", "BUSINESS", "INSTITUTION", "SYSTEM"]) assert.match(notifications, new RegExp(`"${category}"`));
  for (const section of ["Account", "Preferences", "Privacy & Security", "Billing", "Support"]) assert.match(settings, new RegExp(`title="${section}"`));
  assert.match(settings, /overflow-x-auto/);
  assert.match(support, /TeacherHelpCenter/);
  assert.match(support, /TeacherSupportForm/);
  assert.match(support, /TeacherFeedbackForm/);
  assert.match(support, /replyToTeacherSupportAction/);
});

test("P9 reuses existing subscription, notification preference, support, and auth systems", () => {
  const schema = read("prisma/schema.prisma");
  const settings = read("services/teacher-settings-service.ts");
  assert.match(settings, /getAICreditSummary/);
  assert.match(settings, /prisma\.notificationPreference\.findMany/);
  assert.match(schema, /model SupportTicket \{/);
  assert.match(schema, /model UserSubscription \{/);
  assert.doesNotMatch(schema, /model TeacherSetting|model TeacherNotification|model TeacherSupportRequest/);
});
