import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("AI lesson and resource saves use one tenant-scoped idempotent integration", () => {
  const integration = read("services/teacher-integration-service.ts");
  const aiActions = read("features/ai-studio/actions.ts");
  const resourceActions = read("features/learning-marketplace/actions.ts");
  assert.match(integration, /id: input\.conversationId,[\s\S]*userId: input\.userId,[\s\S]*institutionId: input\.institutionId,[\s\S]*scope: "TEACHER"/);
  assert.match(integration, /const id = `ai-\$\{conversation\.id\}-\$\{input\.saveKind\}`/);
  assert.match(integration, /where: \{ id, institutionId: input\.institutionId, createdById: input\.userId \}/);
  assert.match(aiActions, /saveAIContentToTeacherLibrary/);
  assert.match(resourceActions, /saveAIContentToTeacherLibrary/);
  const resourceSave = resourceActions.slice(resourceActions.indexOf("export async function saveAIConversationAsResourceAction"));
  assert.doesNotMatch(resourceSave, /prisma\.contentItem\.create/);
});

test("teacher search is a dedicated authorization adapter instead of admin universal search", () => {
  const actions = read("features/teacher-workspace/actions.ts");
  const integration = read("services/teacher-integration-service.ts");
  assert.match(actions, /searchTeacherOS\(session\.user\.id, session\.user\.institutionId!, query\)/);
  assert.doesNotMatch(actions, /universalSearch/);
  assert.match(integration, /studentBatches: \{ some: \{ batch: \{ OR:/);
  assert.match(integration, /participants: \{ some: \{ userId \} \}/);
  assert.match(integration, /sellerId: userId/);
  assert.match(integration, /createdById: userId/);
  assert.match(integration, /status: "PUBLISHED", visibility: \{ in: \["PUBLIC", "TEACHERS"\] \}/);
  assert.doesNotMatch(integration, /supportTicket|auditLog|featureFlag/);
});

test("teacher content mutations carry user and tenant ownership predicates", () => {
  const actions = read("features/teacher-workspace/actions.ts");
  for (const action of ["updateTeacherContentAction", "archiveTeacherContentAction", "restoreTeacherContentAction", "duplicateTeacherContentAction", "deleteTeacherContentAction"]) {
    const start = actions.indexOf(`export async function ${action}`);
    const end = actions.indexOf("export async function", start + 30);
    const source = actions.slice(start, end === -1 ? undefined : end);
    assert.match(source, /createdById: session\.user\.id/);
    assert.match(source, /institutionId/);
  }
});

test("resource publishing validates active membership and selected course tenant", () => {
  const actions = read("features/learning-marketplace/actions.ts");
  assert.match(actions, /id: session\.user\.id, institutionId: session\.user\.institutionId, status: "ACTIVE"/);
  assert.match(actions, /id: courseId, institutionId/);
  assert.doesNotMatch(actions, /if \(courseId\) return courseId/);
});

test("cross-module destinations lead to exact teacher workflows", () => {
  const integration = read("services/teacher-integration-service.ts");
  const aiWorkflow = read("features/ai-studio/components/generation-workflow.tsx");
  const communityRoute = read("app/(app)/teacher/community/[module]/page.tsx");
  const community = read("features/teacher-community/components/teacher-community-page.tsx");
  for (const destination of ["/teacher/workspace/lessons", "/teacher/resources", "/teacher/community/messages?conversation=", "/teacher/business/orders", "/teacher/settings", "/teacher/support?view=help"]) {
    assert.ok(integration.includes(destination));
  }
  assert.match(aiWorkflow, /Open Lesson Library/);
  assert.match(aiWorkflow, /Open Resource Studio/);
  assert.match(communityRoute, /conversation\?:string/);
  assert.match(community, /initialConversationId/);
  assert.match(community, /id=\{item\.id\}/);
});

test("new teachers have useful exits from empty teaching, content, and AI states", () => {
  const workspace = read("features/teacher-workspace/components/teacher-workspace-page.tsx");
  assert.match(workspace, /Your teaching work can begin now while a class assignment is being prepared/);
  assert.match(workspace, /href="\/teacher\/ai-studio\/create\/lesson-generator"/);
  assert.match(workspace, /href="\/teacher\/workspace\/planner"/);
  assert.match(workspace, /Open Resource Studio/);
  assert.match(workspace, /Open AI Studio/);
  assert.match(workspace, /Use in class/);
  assert.match(workspace, /Schedule/);
});

test("P10 preserves canonical module models and established dynamic routes", () => {
  const schema = read("prisma/schema.prisma");
  for (const model of ["ContentItem", "PlannerEvent", "DirectConversation", "Notification", "MarketplaceListing", "CommerceOrder", "Wallet", "UserSubscription", "SupportTicket"]) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
  }
  assert.doesNotMatch(schema, /model TeacherOS|model TeacherCalendar|model TeacherMessage|model TeacherOrder|model TeacherWallet/);
  for (const route of [
    "app/(app)/teacher/workspace/[module]/page.tsx",
    "app/(app)/teacher/community/[module]/page.tsx",
    "app/(app)/teacher/business/[module]/page.tsx",
    "app/(app)/teacher/loading.tsx",
    "app/(app)/teacher/error.tsx"
  ]) assert.ok(fs.existsSync(path.join(root, route)), `${route} must exist`);
});
