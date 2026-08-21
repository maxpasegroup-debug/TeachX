import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("TARA remains one model-agnostic AI identity over the canonical engine", () => {
  const tara = read("services/tara-service.ts");
  const ai = read("services/ai-service.ts");
  const schema = read("prisma/schema.prisma");
  assert.match(tara, /feature: "tara-unified-companion"/);
  assert.match(tara, /runAI\(/);
  assert.match(ai, /runOpenAICompletion\(\{ system: template\.systemPrompt, prompt: finalPrompt, model: template\.model/);
  assert.doesNotMatch(schema, /model TaraConversation|model TaraMemory|model TaraCredit|model TaraEngine/);
});

test("teacher context is active-tenant authorized and bounded", () => {
  const tara = read("services/tara-service.ts");
  assert.match(tara, /id: input\.userId, institutionId: input\.institutionId, status: "ACTIVE"/);
  assert.match(tara, /createdById: input\.userId/);
  assert.match(tara, /OR: \[\{ createdById: input\.userId \}, \{ createdById: null \}\]/);
  assert.match(tara, /sellerId: input\.userId, order: \{ institutionId: input\.institutionId/);
  assert.match(tara, /take: 12/);
  assert.match(tara, /take: 8/);
  assert.doesNotMatch(tara, /institutionId:\s*undefined/);
});

test("TARA enforces the canonical institution-scoped subscription credit source before generation", () => {
  const ai = read("services/ai-service.ts");
  const commerce = read("services/commerce-service.ts");
  const execution = ai.slice(ai.indexOf("export async function runAI"));
  assert.ok(execution.indexOf("getAICreditSummary") < execution.indexOf("runOpenAICompletion"));
  assert.match(ai, /if \(credits\.balance <= 0\)/);
  assert.match(commerce, /aIUsage\.aggregate\(\{ where: \{ userId: input\.userId, institutionId: input\.institutionId/);
  assert.match(commerce, /walletTransaction\.findMany\(\{ where: \{ userId: input\.userId, institutionId: input\.institutionId/);
  assert.doesNotMatch(ai, /1000 credits|balance:\s*1000/i);
});

test("conversation continuation validates ownership and appends natural requests to one record", () => {
  const tara = read("services/tara-service.ts");
  const ai = read("services/ai-service.ts");
  assert.match(tara, /id: input\.conversationId, userId: input\.userId, institutionId, scope/);
  assert.match(tara, /TARA_CONVERSATION_FORBIDDEN/);
  assert.match(tara, /conversationContinuity: continuity/);
  assert.match(tara, /settings\.memory === "off" \? \[\] : conversationMessages/);
  assert.match(ai, /aIConversation\.update\(\{ where: \{ id: current\.id \}/);
  assert.match(ai, /messagePrompt \?\? input\.prompt/);
  assert.match(ai, /prisma\.\$transaction\([\s\S]*tx\.aIUsage\.create/);
  assert.match(ai, /Prisma\.TransactionIsolationLevel\.Serializable/);
});

test("structured TARA results route into canonical TeachX workflows without executing mutations", () => {
  const tara = read("services/tara-service.ts");
  for (const route of ["/teacher/ai-studio/create/lesson-generator", "/teacher/ai-studio/create/worksheet-generator", "/teacher/ai-studio/create/quiz-generator", "/teacher/ai-studio/create/presentation-generator", "/teacher/workspace/planner", "/teacher/business/profile", "/teacher/business/publishing", "/teacher/business/one-to-one", "/teacher/business/happy-notes", "/teacher/life/learn-more", "/teacher/life/enjoy-more"]) assert.ok(tara.includes(route));
  assert.match(tara, /structured: \{ kind: intent\.kind, title: intent\.title, actions: intent\.actions \}/);
  assert.doesNotMatch(tara, /prisma\.(contentItem|plannerEvent|teacherProfile)\.(create|update|delete|upsert)/);
});

test("generation and authorization failures are teacher-safe and recoverable", () => {
  const actions = read("features/tara/actions.ts");
  assert.match(actions, /AI_ENTITLEMENT/);
  assert.match(actions, /PERMISSION_DENIED/);
  assert.match(actions, /AI_UNAVAILABLE/);
  assert.match(actions, /recoveryHref: "\/teacher\/business\/subscription"/);
  assert.match(actions, /Your work was not changed/);
  assert.doesNotMatch(actions, /return \{ error: error instanceof Error \? error\.message/);
});

test("TARA experience is accessible, mobile-safe, and visible from teacher navigation", () => {
  const ui = read("features/tara/components/tara-workspace.tsx");
  const navigation = read("lib/constants/navigation.ts");
  const command = read("features/workspace/components/global-command-bar.tsx");
  assert.match(ui, /aria-label="Conversation with TARA"/);
  assert.match(ui, /aria-live="polite"/);
  assert.match(ui, /role="alert"/);
  assert.match(ui, /motion-reduce:animate-none/);
  assert.match(ui, /overflow-x-auto/);
  assert.match(ui, /focus:ring/);
  assert.match(navigation, /label: "TARA", href: "\/tara"/);
  assert.match(command, /label: "TARA", href: "\/tara"/);
});

test("learning and Enjoy More instructions prohibit fabricated catalogs and offers", () => {
  const tara = read("services/tara-service.ts");
  assert.match(tara, /without inventing courses/);
  assert.match(tara, /Never invent student details, earnings, market prices, learning content, travel offers, partners, or events/);
  assert.match(tara, /View Coming Soon/);
});
