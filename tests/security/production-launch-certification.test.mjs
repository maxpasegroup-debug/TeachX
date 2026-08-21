import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

test("teacher callers cannot bypass AI credits by selecting a non-teacher scope", () => {
  const route = read("app/api/ai/route.ts");
  const service = read("services/ai-service.ts");
  assert.match(route, /teacher && scope !== "TEACHER"/);
  assert.match(route, /status: 403/);
  assert.match(service, /input\.scope !== "TEACHER"/);
  assert.match(service, /if \(teacher\) throw new Error\("AI_SCOPE_FORBIDDEN"\)/);
  assert.match(service, /getAICreditSummary\(\{ userId: input\.userId, institutionId: input\.institutionId, audience: "TEACHER" \}\)/);
});

test("AI entitlement failures are distinct from provider failures without exposing internals", () => {
  const route = read("app/api/ai/route.ts");
  assert.match(route, /status: 402/);
  assert.match(route, /Complete workspace setup before using AI Studio/);
  assert.match(route, /payload = await request\.json\(\)/);
  assert.match(route, /Invalid AI request/);
  assert.match(route, /AI service is temporarily unavailable/);
  assert.doesNotMatch(route, /error\.stack|String\(error\)/);
});

test("production builds do not depend on downloading a remote font", () => {
  const layout = read("app/layout.tsx");
  assert.doesNotMatch(layout, /next\/font\/google|fonts\.googleapis\.com/);
  assert.match(layout, /className="font-sans antialiased"/);
});

test("production readiness requires the public URL and TARA provider configuration", () => {
  const environment = read("lib/env.ts");
  assert.match(environment, /"NEXT_PUBLIC_APP_URL"/);
  assert.match(environment, /"OPENAI_API_KEY"/);
  assert.doesNotMatch(environment, /launchMode: missing\.length \? "configuration_incomplete" : process\.env\.OPENAI_API_KEY/);
});

test("teacher support remains directly reachable and locale claims stay honest", () => {
  const navigation = read("lib/constants/navigation.ts");
  const settings = read("features/platform-integration/components/teacher-unified-settings.tsx");
  assert.match(navigation, /href: "\/teacher\/support"/);
  assert.match(settings, /Full interface translations require human review/);
});

test("unknown routes reach not-found handling while recognized protected routes redirect", () => {
  const proxy = read("proxy.ts");
  assert.match(proxy, /const requiredPermission = getRoutePermission\(nextUrl\.pathname\)/);
  assert.match(proxy, /if \(!requiredPermission\) return nextResponse\(request, requestId\)/);
  assert.match(proxy, /loginUrl\.searchParams\.set\("callbackUrl", nextUrl\.pathname\)/);
});
