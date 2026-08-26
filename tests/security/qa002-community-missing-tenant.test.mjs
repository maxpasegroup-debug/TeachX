import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const service = read("services/community-service.ts");
const actions = read("features/community/actions.ts");
const page = read("app/(app)/communication/page.tsx");

function block(source, name, nextName) {
  const start = source.indexOf(`export async function ${name}`);
  const end = nextName ? source.indexOf(`export async function ${nextName}`, start + 1) : -1;
  assert.notEqual(start, -1, `${name} must exist`);
  return source.slice(start, end === -1 ? undefined : end);
}

test("QA-002: missing institution fails closed", () => {
  assert.ok(service.includes("if (!session?.user.id || !session.user.institutionId) return null"));
  assert.ok(service.includes("if (!actor)"));
  assert.doesNotMatch(service, /institutionId:\s*[^,}\n]+\?\? undefined/);
});

test("QA-002: Tenant A reads are explicitly tenant scoped", () => {
  const source = block(service, "getCommunityOS", "createDirectConversation");
  for (const model of ["genericDiscussion", "community", "notificationTemplate", "user"]) {
    assert.ok(source.includes(`prisma.${model}.findMany`), `${model} read must remain present`);
  }
  assert.ok(source.includes("const { id: userId, institutionId } = actor"));
  assert.doesNotMatch(source, /input\.(institutionId|userId)/);
});

test("QA-002: Tenant B cannot be selected by caller-supplied tenant identity", () => {
  assert.match(service, /export async function getCommunityOS\(notificationQuery\?: string\)/);
  assert.match(page, /getCommunityOS\(notificationQuery\)/);
  assert.doesNotMatch(page, /institutionId|userId/);
});

test("QA-002: cross-tenant discussion replies are rejected", () => {
  const source = block(service, "createDiscussionReply", "createCommunity");
  assert.ok(source.includes("institutionId: actor.institutionId"));
  assert.ok(source.includes('status: { not: "ARCHIVED" }'));
  assert.ok(source.includes("members: { some: { userId: actor.id } }"));
  assert.match(actions, /createDiscussionReply\(\{ discussionId, body \}\)/);
});

test("QA-002: cross-tenant community IDs cannot be attached to discussions", () => {
  const source = block(service, "createDiscussion", "createDiscussionReply");
  assert.ok(source.includes("id: input.communityId, institutionId: actor.institutionId"));
  assert.ok(source.includes("members: { some: { userId: actor.id } }"));
  assert.ok(source.indexOf("prisma.community.findFirst") < source.indexOf("prisma.genericDiscussion.create"));
});

test("QA-002: cross-tenant conversation participants are rejected before creation", () => {
  const source = block(service, "createDirectConversation", "ensureCanAccessConversation");
  assert.ok(source.includes("institutionId: actor.institutionId"));
  assert.ok(source.includes('status: "ACTIVE"'));
  assert.ok(source.includes("participants.length !== requestedIds.length"));
  assert.ok(source.indexOf("prisma.user.findMany") < source.indexOf("prisma.directConversation.create"));
});

test("QA-002: institution-less users cannot access or mutate tenant templates", () => {
  const source = block(service, "createNotificationTemplate");
  assert.ok(source.includes("const actor = await requireCommunityActor()"));
  assert.ok(source.includes("institutionId: actor.institutionId"));
  assert.ok(source.includes('userHasPermission(actor.roles, "settings.manage")'));
  assert.doesNotMatch(source, /input\.institutionId/);
});

test("QA-002: tenant-owned creation always uses the authenticated tenant and actor", () => {
  for (const [name, next] of [["createDirectConversation", "ensureCanAccessConversation"], ["createDiscussion", "createDiscussionReply"], ["createCommunity", "createNotificationTemplate"]]) {
    const source = block(service, name, next);
    assert.ok(source.includes("await requireCommunityActor()"), `${name} must require an authenticated tenant actor`);
    assert.ok(source.includes("institutionId: actor.institutionId"), `${name} must persist authenticated tenant ownership`);
    assert.doesNotMatch(source, /input\.(institutionId|createdById|authorId)/);
  }
});

test("QA-002: private and invite-only communities require ownership or membership", () => {
  const source = block(service, "getCommunityOS", "createDirectConversation");
  assert.ok(source.includes('{ visibility: "PUBLIC" }, { createdById: userId }, { members: { some: { userId } } }'));
});

test("QA-002: private discussions require community ownership or membership", () => {
  const source = block(service, "getCommunityOS", "createDirectConversation");
  assert.ok(source.includes('{ communityId: null }, { community: { visibility: "PUBLIC" } }, { community: { createdById: userId } }, { community: { members: { some: { userId } } } }'));
});

test("QA-002: caller-supplied institution IDs cannot override session authorization", () => {
  assert.doesNotMatch(service, /getCommunityOS\(input:/);
  assert.doesNotMatch(service, /getGlobalInbox\([^)]*(institutionId|userId)/);
  assert.doesNotMatch(service, /input\.institutionId/);
});

test("QA-002: caller-supplied user IDs cannot override the authenticated actor", () => {
  assert.doesNotMatch(service, /input\.(userId|createdById|authorId)/);
  assert.ok(service.includes("createdById: actor.id"));
  assert.ok(service.includes("authorId: actor.id"));
  assert.ok(service.includes("senderId: actor.id"));
});

test("QA-002: scope IDs are validated through tenant-owned server relationships", () => {
  assert.ok(service.includes("async function authorizedScopeId"));
  for (const check of ["course: { institutionId: actor.institutionId }", "institutionId: actor.institutionId", "requesterId: actor.id", "assignedToId: actor.id"]) {
    assert.ok(service.includes(check), `missing scope authorization: ${check}`);
  }
});
