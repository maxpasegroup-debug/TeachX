import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("production request protection fails closed", () => {
  const source = read("lib/security.ts");
  assert.match(source, /NODE_ENV === "production" \? unavailableResponse\(\)/);
  assert.match(source, /redis\.eval\(RATE_LIMIT_SCRIPT/);
  assert.match(source, /createHash\("sha256"\)/);
});

test("first-run setup requires a one-time secret and a database lock", () => {
  assert.match(read("app/api/setup/route.ts"), /secureSecretMatch\(body\?\.setupSecret, process\.env\.SETUP_SECRET\)/);
  assert.match(read("services/setup-service.ts"), /pg_advisory_xact_lock/);
});

test("proxy rejects unauthenticated private APIs and oversized bodies", () => {
  const source = read("proxy.ts");
  assert.match(source, /if \(isApi && !isAuthenticated\)/);
  assert.ok(source.indexOf("if (publicApi)") < source.indexOf("token = await getToken"));
  assert.match(source, /status: 413/);
  assert.match(source, /catch/);
});

test("production CSP does not enable unsafe-eval", () => {
  const source = read("next.config.ts");
  assert.match(source, /NODE_ENV === "production" \? "" : " 'unsafe-eval'"/);
});
