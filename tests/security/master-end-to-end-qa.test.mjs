import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

test("teacher workspace reads require an active teacher and explicit current tenant", () => {
  const service = read("services/teacher-workspace-service.ts");
  assert.match(service, /const activeTeacher = await prisma\.user\.count/);
  assert.match(service, /aIConversation\.findMany\(\{ where: \{ userId: input\.userId, institutionId: input\.institutionId/);
  assert.match(service, /downloadHistory\.findMany\(\{ where: \{ userId: input\.userId, item: \{ institutionId: input\.institutionId \}/);
  assert.match(service, /order: \{ buyerId: input\.userId, institutionId: input\.institutionId/);
});

test("teacher AI execution validates role and never exposes provider failures", () => {
  const service = read("services/ai-service.ts");
  const actions = read("features/ai-studio/actions.ts");
  const route = read("app/api/ai/route.ts");
  assert.match(service, /if \(teacher !== 1\) throw new Error\("AI_TEACHER_FORBIDDEN"\)/);
  assert.match(actions, /function teacherAIError/);
  assert.match(actions, /TeachX AI is temporarily unavailable\. Please try again\./);
  assert.match(route, /AI_TEACHER_FORBIDDEN/);
});

test("notification APIs and actions enforce teacher and tenant ownership", () => {
  const api = read("app/api/notifications/route.ts");
  const readApi = read("app/api/notifications/[id]/read/route.ts");
  const service = read("services/teacher-notification-service.ts");
  const actions = read("features/teacher-workspace/actions.ts");
  assert.match(api, /userId: session\.user\.id, institutionId: session\.user\.institutionId/);
  assert.match(readApi, /updateMany/);
  assert.match(readApi, /Notification not found/);
  assert.match(service, /userId: input\.userId, institutionId: input\.institutionId/);
  assert.match(actions, /OR: \[\{ userId: session\.user\.id, institutionId \}, \{ userId: null, institutionId \}\]/);
});

test("teacher content creation rejects cross-course subjects and unsafe external URLs", () => {
  const actions = read("features/teacher-workspace/actions.ts");
  assert.match(actions, /function safeExternalUrl/);
  assert.match(actions, /url\.protocol === "https:" \? url\.toString\(\) : null/);
  assert.match(actions, /subject\.findFirst\(\{ where: \{ id: subjectId, courseId, course: \{ institutionId:/);
});

test("draft profile preview and active public profile photos have truthful routes", () => {
  const business = read("features/teacher-business/components/teacher-business-page.tsx");
  const preview = read("app/(app)/teacher/business/profile-preview/page.tsx");
  const photoRoute = read("app/api/storage/public-profile/[objectId]/route.ts");
  const storage = read("services/private-storage-service.ts");
  const marketplace = read("features/marketplace/components/marketplace-components.tsx");
  const policy = read("security/api-route-policy.json");
  assert.match(business, /href="\/teacher\/business\/profile-preview"/);
  assert.match(preview, /TeacherProfilePreview/);
  assert.match(photoRoute, /authorizePublicProfilePhoto/);
  assert.match(storage, /isMarketplaceListed: true/);
  assert.match(marketplace, /\/api\/storage\/public-profile/);
  assert.match(policy, /"\/api\/storage\/public-profile"/);
});

test("preference writes reject malformed or unsupported state", () => {
  const route = read("app/api/preferences/route.ts");
  assert.match(route, /request\.json\(\)\.catch\(\(\) => null\)/);
  assert.match(route, /z\.nativeEnum\(ActivityType\)/);
  assert.match(route, /z\.nativeEnum\(WorkspaceKind\)/);
  assert.match(route, /Invalid preference request/);
});

test("new personal workspaces can persist AI lessons and resources immediately", () => {
  const signup = read("features/auth/actions.ts");
  assert.match(signup, /await tx\.course\.create/);
  assert.match(signup, /name: "My Teaching Library"/);
  assert.match(signup, /subjects: \{ create: \{ name: "General"/);
});

test("resource purchases use canonical server pricing and no dead share placeholder", () => {
  const actions = read("features/commerce/actions.ts");
  const resource = read("features/learning-marketplace/components/learning-marketplace-components.tsx");
  assert.match(actions, /marketplaceListing\.findFirst/);
  assert.match(actions, /canonicalPrice: String\(listing\.price\)/);
  assert.doesNotMatch(actions, /numberValue\(formData, "amount"\) \|\| 199/);
  assert.doesNotMatch(resource, /Share Placeholder|name="amount"/);
});

test("learning resources validate tenant relations and deliver real files", () => {
  const actions = read("features/learning-marketplace/actions.ts");
  const detail = read("features/learning-marketplace/components/learning-marketplace-components.tsx");
  assert.match(actions, /course: \{ institutionId \}/);
  assert.match(actions, /safeResourceUrl/);
  assert.match(actions, /redirect\(destination\)/);
  assert.match(detail, /Delivery unavailable/);
});

test("public teacher marketplace rejects nonexistent favorites, self-booking, and invalid dates", () => {
  const actions = read("features/marketplace/actions.ts");
  assert.match(actions, /const teacher = await getMarketplaceTeacher\(teacherProfileId\);/);
  assert.match(actions, /if \(!teacher\) return/);
  assert.match(actions, /teacher\.userId === requester\.id/);
  assert.match(actions, /Number\.isNaN\(preferredDate\.getTime\(\)\)/);
});

test("PWA first install never interrupts a teacher with an unsolicited reload", () => {
  const prompt = read("components/pwa-install-prompt.tsx");
  assert.match(prompt, /updateRequested = useRef\(false\)/);
  assert.match(prompt, /refreshing \|\| !updateRequested\.current/);
  assert.match(prompt, /updateRequested\.current = true/);
});
