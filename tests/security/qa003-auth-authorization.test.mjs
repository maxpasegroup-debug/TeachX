import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

// STATIC regression suite. Runtime authorization tests remain blocked until the isolated QA DB is available.
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const block = (source, start, end) => {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, `${start} must exist`);
  const to = end ? source.indexOf(end, from + start.length) : -1;
  return source.slice(from, to === -1 ? undefined : to);
};

const auth = read("auth.ts");
const currentUser = read("lib/auth/current-user.ts");
const apiAuth = read("lib/api-auth.ts");
const proxy = read("proxy.ts");
const routes = read("lib/constants/route-permissions.ts");
const navigation = read("lib/constants/navigation.ts");
const workspace = read("services/workspace-service.ts");
const adminLayout = read("app/(app)/admin/layout.tsx");
const teacherLayout = read("app/(app)/teacher/layout.tsx");
const studentLayout = read("app/(app)/student/layout.tsx");
const aiApi = read("app/api/ai/route.ts");
const aiAuthorization = read("lib/ai-authorization.ts");
const aiService = read("services/ai-service.ts");
const search = read("services/search-service.ts");
const communication = read("services/communication-service.ts");
const support = read("features/admin-growth/actions.ts");
const commerce = read("features/commerce/actions.ts");
const payment = read("services/payment-service.ts");
const creditCatalog = read("lib/payments/ai-credit-catalog.ts");
const settings = read("features/settings/actions.ts");
const community = read("features/community/actions.ts");
const automation = read("app/api/automation/route.ts");
const activity = read("app/api/activity/route.ts");
const platformAdmin = read("features/platform-admin/actions.ts");
const adminGrowth = read("services/admin-growth-service.ts");
const adminCommerce = read("services/commerce-service.ts");
const notifications = read("services/notification-aggregation-service.ts");

function adminBoundaryRejects(role) {
  assert.match(adminLayout, /roles\.includes\("ADMIN"\)/);
  assert.doesNotMatch(adminLayout, new RegExp(`roles\\.includes\\("${role}"\\)`));
}

test("QA-003 STATIC: GUEST cannot enter the admin workspace", () => adminBoundaryRejects("GUEST"));
test("QA-003 STATIC: VIDEO_EDITOR cannot enter the admin workspace", () => adminBoundaryRejects("VIDEO_EDITOR"));
test("QA-003 STATIC: BUSINESS_DEVELOPMENT_EXECUTIVE cannot enter admin", () => adminBoundaryRejects("BUSINESS_DEVELOPMENT_EXECUTIVE"));

test("QA-003 STATIC: unknown and role-less identities have denied workspaces", () => {
  assert.match(navigation, /return "denied"/);
  assert.match(workspace, /return "DENIED"/);
  assert.doesNotMatch(navigation, /return "admin";\s*\n\}/);
  assert.doesNotMatch(workspace, /return "ADMIN";\s*\n\}/);
});

test("QA-003 STATIC: direct admin URLs require current explicit admin authorization", () => {
  assert.match(adminLayout, /getCurrentUser\(\)/);
  assert.match(adminLayout, /!user\?\.roles\.includes\("ADMIN"\)/);
  assert.match(adminLayout, /redirect\("\/access-denied"\)/);
});

test("QA-003 STATIC: teacher and student layouts use authoritative current roles", () => {
  assert.match(teacherLayout, /getCurrentUser\(\)/);
  assert.match(studentLayout, /getCurrentUser\(\)/);
  assert.doesNotMatch(teacherLayout + studentLayout, /await auth\(\)/);
});

test("QA-003 STATIC: protected routes fail closed without a policy entry", () => {
  const unauthenticated = block(proxy, "if (!isApi && !isAuthenticated && !isPublicRoute)", "if (!isApi && isAuthenticated");
  assert.doesNotMatch(unauthenticated, /if \(!requiredPermission\) return/);
  assert.match(unauthenticated, /redirect\(loginUrl\)/);
  assert.doesNotMatch(routes, /"\/(?:admin|teacher|student)":\s*"dashboard\.view"/);
});

test("QA-003 STATIC: missing institution fails closed in admin and commerce loaders", () => {
  const growthEntry = block(adminGrowth, "export async function getAdminGrowthOS", "export async function getPlatformAdminGrowthOS");
  const commerceEntry = block(adminCommerce, "export async function getAdminCommerceDashboard");
  assert.match(growthEntry, /if \(!institutionId\) throw/);
  assert.match(commerceEntry, /if \(!institutionId\) throw/);
  assert.doesNotMatch(commerceEntry, /institutionId:\s*institutionId \?\? undefined/);
});

test("QA-003 STATIC: missing tenant cannot widen workspace or broadcast notification reads", () => {
  assert.match(workspace, /workspace !== "PARENT" && !input\.institutionId/);
  assert.match(notifications, /\.\.\.\(institutionId \? \[\{ userId: null, institutionId \}\] : \[\]\)/);
  assert.doesNotMatch(notifications, /\{ userId: null, institutionId \}\]\s*\}/);
});

test("QA-003 STATIC: current-user boundary rejects inactive and revoked sessions", () => {
  assert.match(currentUser, /user\.status !== "ACTIVE"/);
  assert.match(currentUser, /user\.authSessionVersion !== sessionVersion/);
  assert.match(currentUser, /return null/);
});

test("QA-003 STATIC: removed institution membership invalidates authorization", () => {
  assert.match(currentUser, /session\.user\.institutionId \?\? null/);
  assert.match(currentUser, /!== user\.institutionId/);
});

test("QA-003 STATIC: legacy JWTs without a session version are rejected", () => {
  assert.match(currentUser, /Number\.isInteger\(sessionVersion\)/);
  assert.match(proxy, /authSessionVersion !== null/);
  assert.doesNotMatch(proxy, /authSessionVersion === null \|\|/);
});

test("QA-003 STATIC: Auth.js refreshes current roles and tenant for existing JWTs", () => {
  const jwt = block(auth, "async jwt({ token, user })", "session({ session, token })");
  assert.match(jwt, /prisma\.user\.findUnique/);
  assert.match(jwt, /current\.status !== "ACTIVE"/);
  assert.match(jwt, /current\.authSessionVersion !== sessionVersion/);
  assert.match(jwt, /token\.institutionId = current\.institutionId/);
  assert.match(jwt, /token\.roles = current\.roles\.map/);
});

test("QA-003 STATIC: API authorization uses the authoritative current-user boundary", () => {
  assert.match(apiAuth, /getCurrentUser\(\)/);
  assert.match(apiAuth, /userHasPermission\(user\.roles, permission\)/);
  assert.doesNotMatch(apiAuth, /userHasPermission\(session\.user\.roles/);
});

test("QA-003 STATIC: AI API validates requested scope against server roles", () => {
  assert.match(aiApi, /authorizeAIScope\(access\.session\.user\.roles, body\.scope\)/);
  assert.match(aiApi, /status: 403/);
});

test("QA-003 STATIC: teacher and student cannot invoke FINANCE or DIRECTOR AI", () => {
  assert.match(aiAuthorization, /userHasPermission\(roles, "director\.view"\)\) scopes\.add\("DIRECTOR"\)/);
  assert.match(aiAuthorization, /userHasPermission\(roles, "finance\.view"\)\) scopes\.add\("FINANCE"\)/);
  assert.match(aiAuthorization, /teacherRoles\.includes\(role\)\)\) scopes\.add\("TEACHER"\)/);
  assert.match(aiAuthorization, /roles\.includes\("STUDENT"\)\) scopes\.add\("STUDENT"\)/);
});

test("QA-003 STATIC: SYSTEM AI requires explicit ADMIN role", () => {
  assert.match(aiAuthorization, /roles\.includes\("ADMIN"\)\) scopes\.add\("SYSTEM"\)/);
});

test("QA-003 STATIC: AI service independently reloads actor and reauthorizes scope", () => {
  const run = block(aiService, "export async function runAI");
  assert.match(run, /prisma\.user\.findFirst/);
  assert.match(run, /institutionId:\s*input\.institutionId/);
  assert.match(run, /status:\s*"ACTIVE"/);
  assert.match(run, /authorizeAIScope\(roles, input\.scope\)/);
});

test("QA-003 STATIC: AI search applies permission gates to sensitive result classes", () => {
  const gates = [
    ["canSeeSupport", "supportTicket"], ["canSeeFinance", "commerceOrder"],
    ["canSeeAdministration", "auditLog"], ["canSeeFinance", "invoice"],
    ["canSeeFinance", "receipt"], ["canSeeAdmissions", "lead"]
  ];
  for (const [gate, model] of gates) assert.match(search, new RegExp(`${gate} \\? prisma\\.${model}\\.findMany`));
});

test("QA-003 STATIC: communication recipients and targets are tenant validated before creation", () => {
  const validation = communication.indexOf("prisma.user.findMany");
  const creation = communication.indexOf("prisma.communication.create");
  assert.ok(validation > -1 && validation < creation);
  assert.match(communication, /institutionId, status:\s*"ACTIVE"/);
  assert.match(communication, /authorizedUsers\.length !== requestedUserIds\.length/);
  assert.match(communication, /createdById:\s*actor\.id/);
});

test("QA-003 STATIC: cross-tenant support ticket reply is rejected before reply creation", () => {
  const action = block(support, "export async function updateSupportTicketAction", "export async function saveFeatureFlagAction");
  assert.match(action, /findFirst\(\{ where: \{ id: ticketId, institutionId: session\.user\.institutionId/);
  assert.ok(action.indexOf("if (!ticket) throw") < action.indexOf("prisma.supportReply.create"));
});

test("QA-003 STATIC: client cannot set AI credit price or quantity", () => {
  const action = block(commerce, "export async function createAICreditPackOrderAction", "export async function createBookingReservationOrderAction");
  assert.match(action, /getAICreditPackage\(value\(formData, "packageId"\)\)/);
  assert.doesNotMatch(action, /numberValue\(formData,\s*"(?:credits|amount)"\)/);
  assert.match(action, /amount:\s*creditPack\.amount/);
  assert.match(action, /amount:\s*creditPack\.credits/);
  assert.match(creditCatalog, /ai-credits-500-inr/);
});

test("QA-003 STATIC: payment fulfillment revalidates the authoritative AI package", () => {
  const fulfillment = block(payment, 'if (item.itemType === "AI_CREDITS")', "if (item.sellerId");
  assert.match(fulfillment, /getAICreditPackage\(metadata\.packageId\)/);
  assert.match(fulfillment, /item\.unitPrice/);
  assert.match(fulfillment, /item\.total/);
  assert.match(fulfillment, /amount:\s*creditPack\.credits/);
  assert.match(fulfillment, /credited\.count !== 1/);
});

test("QA-003 STATIC: institution settings require current settings-management permission", () => {
  const action = block(settings, "export async function saveInstitutionSettings");
  assert.match(action, /requireCurrentUser\("settings\.manage"\)/);
  assert.match(action, /user\.institutionId/);
});

test("QA-003 STATIC: announcement publishing requires current permission", () => {
  const action = block(community, "export async function publishCommunityAnnouncementAction", "export async function updateBookingWorkflowAction");
  assert.match(action, /requireCurrentUser\(\)/);
  assert.match(action, /userHasPermission\(actor\.roles/);
});

test("QA-003 STATIC: automation execution requires settings management", () => {
  const post = block(automation, "export async function POST");
  assert.match(post, /requireApiSession\("settings\.manage"\)/);
  assert.doesNotMatch(post, /requireApiSession\("dashboard\.view"\)/);
});

test("QA-003 STATIC: invoice creation is tenant scoped to owner or finance manager", () => {
  const action = block(commerce, "export async function createCommerceInvoicePlaceholderAction");
  assert.match(action, /requireCurrentUser\(\)/);
  assert.match(action, /userHasPermission\(user\.roles, "finance\.manage"\)/);
  assert.match(action, /institutionId:\s*user\.institutionId/);
  assert.match(action, /buyerId:\s*user\.id/);
});

test("QA-003 STATIC: booking transitions and role-owned notes are server validated", () => {
  const action = block(community, "export async function updateBookingWorkflowAction", "export async function createMessageRequestAction");
  assert.match(action, /const transitions:/);
  assert.match(action, /transitions\[request\.status\]\?\.includes\(status\)/);
  assert.match(action, /teacherNotes:\s*isTeacher \?/);
  assert.match(action, /studentNotes:\s*isTeacher \?/);
});

test("QA-003 STATIC: activity actor and institution are server derived", () => {
  const post = block(activity, "export async function POST");
  assert.match(post, /requireApiSession\("operations\.view"\)/);
  assert.match(post, /actorId:\s*session\.user\.id/);
  assert.match(post, /institutionId:\s*session\.user\.institutionId/);
  assert.doesNotMatch(post, /actorId:\s*body\./);
});

test("QA-003 STATIC: role, permission, status, and platform mutations require current ADMIN", () => {
  const helper = block(platformAdmin, "async function admin()", "function refresh");
  assert.match(helper, /requireCurrentUser\(\)/);
  assert.match(helper, /roles\.includes\("ADMIN"\)/);
  for (const action of ["updateUserStatusAction", "assignRoleAction", "updateRolePermissionsAction"]) {
    assert.match(block(platformAdmin, `export async function ${action}`), /await admin\(\)/);
  }
});
