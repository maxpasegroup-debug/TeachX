import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("community reads require an active tenant-bound teacher", () => {
  const service = read("services/teacher-community-service.ts");
  assert.match(service, /id: userId, institutionId, status: "ACTIVE"/);
  assert.match(service, /role: \{ key: \{ in: teacherRoles \} \}/);
  assert.match(service, /if \(!member\) return null/);
  assert.doesNotMatch(service, /institutionId:\s*institutionId \?\? undefined/);
});

test("discussions and groups enforce tenant visibility and membership", () => {
  const service = read("services/teacher-community-service.ts");
  assert.match(service, /institutionId, status: \{ not: "ARCHIVED" \}/);
  assert.ok(service.includes('{ communityId: null }, { community: { visibility: "PUBLIC" } }, { community: { members: { some: { userId } } } }'));
  assert.ok(service.includes('{ visibility: "PUBLIC" }, { createdById: userId }, { members: { some: { userId } } }'));
  assert.doesNotMatch(service, /genericDiscussion\.findMany\(\{\s*where:\s*\{\s*institutionId\s*\}\s*,/);
});

test("messages are tenant and participant scoped with bounded history", () => {
  const service = read("services/teacher-community-service.ts");
  const actions = read("features/teacher-community/actions.ts");
  assert.match(service, /where: \{ institutionId, participants: \{ some: \{ userId \} \} \}/);
  assert.match(service, /messages: \{ include: \{ sender: true \}, orderBy: \{ createdAt: "desc" \}, take: 50/);
  assert.match(actions, /institutionId: actor\.institutionId, status: \{ not: "BLOCKED" \}, participants: \{ some: \{ userId: actor\.id/);
  assert.match(actions, /conversationId: conversation\.id, senderId: actor\.id/);
});

test("community mutations validate same-tenant teachers and owned records", () => {
  const actions = read("features/teacher-community/actions.ts");
  assert.ok(actions.includes('id: userId, institutionId: actor.institutionId, status: "ACTIVE"'));
  assert.ok(actions.includes('id: value(data, "id"), institutionId: actor.institutionId, createdById: actor.id'));
  assert.ok(actions.includes('communityId_userId: { communityId: group.id, userId: actor.id }'));
  assert.ok(actions.includes('members: { some: { userId: actor.id, role: { in: ["OWNER", "MODERATOR"] } } }'));
});

test("private resources cannot be attached or shared without authorization", () => {
  const actions = read("features/teacher-community/actions.ts");
  assert.match(actions, /async function validatedAttachments/);
  assert.match(actions, /\["http:", "https:"\]\.includes\(new URL\(item\)\.protocol\)/);
  assert.match(actions, /institutionId: actor\.institutionId,[\s\S]*\{ createdById: actor\.id \},[\s\S]*status: "PUBLISHED", visibility: \{ in: \["PUBLIC", "TEACHERS"\] \}/);
  assert.match(actions, /if \(accessible !== resources\.length\) return null/);
  assert.ok(actions.includes('id: value(data, "id"), institutionId: actor.institutionId, status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] }'));
  assert.match(actions, /if \(accessibleResources !== resourceIds\.length\) return/);
});

test("community pagination and activity history are bounded", () => {
  const service = read("services/teacher-community-service.ts");
  assert.match(service, /Math\.min\(30, Math\.max\(12, options\.pageSize \?\? 24\)\)/);
  assert.match(service, /const take = pageSize \+ 1/);
  assert.match(service, /createdAt: \{ gte: activitySince \}/);
  assert.match(service, /metadata: \{ path: \["communityType"\], string_contains: "" \}/);
  assert.match(service, /skip/);
});

test("global search cannot reveal private groups or discussions", () => {
  const search = read("services/search-service.ts");
  assert.match(search, /community: \{ visibility: "PUBLIC" \}/);
  assert.match(search, /members: \{ some: \{ userId \} \}/);
  assert.match(search, /OR: \[\{ visibility: "PUBLIC" \},[\s\S]*members: \{ some: \{ userId \} \}/);
});

test("P7 reuses existing messaging, notification, profile, resource, and collaboration models", () => {
  const schema = read("prisma/schema.prisma");
  for (const model of ["DirectConversation", "DirectMessage", "Notification", "TeacherProfile", "ContentItem", "UserPreference"]) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
  }
  assert.doesNotMatch(schema, /model TeacherSocialPost|model TeacherChat|model CommunityNotification|model CommunityResource|model TeacherCollaboration/);
});

test("community UI connects professional workflows and actionable empty states", () => {
  const component = read("features/teacher-community/components/teacher-community-page.tsx");
  for (const action of ["Start Discussion", "Share Resource", "Find Teachers", "Open Messages"]) assert.match(component, new RegExp(action));
  assert.match(component, /teacherCommunitySearchAction/);
  assert.match(component, /acceptConnectionAction/);
  assert.match(component, /acceptGroupAction/);
  assert.match(component, /teacher\/ai-studio\/chat/);
  assert.match(component, /overflow-x-auto/);
});
