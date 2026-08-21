import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("public Home is a compact five-section teacher launch experience", () => {
  const page = read("components/landing/audience-landing.tsx");
  assert.doesNotMatch(page, /^"use client"/m);
  assert.match(page, /TeachX for teachers/);
  assert.match(page, /Teach better\. Work smarter\. Live better\./);
  for (const marker of ["id=\"worlds\"", "id=\"tara\"", "Teacher life", "Your next chapter starts here"]) assert.ok(page.includes(marker));
  assert.match(page, /teacher-life-os-home\.webp/);
  assert.match(page, /<Image[\s\S]*priority[\s\S]*sizes=/);
});

test("four worlds communicate the locked product vision without fabricated evidence", () => {
  const page = read("components/landing/audience-landing.tsx");
  for (const copy of ["Give your time back", "Give your knowledge more value", "Invest in yourself", "Life beyond the classroom"]) assert.ok(page.includes(copy));
  for (const forbidden of ["teachers joined", "five-star", "5-star", "customer logo", "downloads", "earned by teachers", "travel deal"]) assert.doesNotMatch(page, new RegExp(forbidden, "i"));
  assert.match(page, /Coming soon/);
});

test("TARA is presented as one real TeachX intelligence layer, not a fake demo", () => {
  const page = read("components/landing/audience-landing.tsx");
  assert.match(page, /The intelligence inside TeachX/);
  assert.match(page, /Examples of supported requests/);
  assert.match(page, /existing TeachX workflows, permissions and AI credits/);
  assert.doesNotMatch(page, /typing|executing|completed in|generated successfully/i);
});

test("all public conversion actions reuse existing teacher authentication", () => {
  const landing = read("components/landing/audience-landing.tsx");
  const chrome = read("components/landing/teachx-public-chrome.tsx");
  const pricing = read("app/pricing/page.tsx");
  assert.match(landing, /primaryHref: "\/signup\/teacher"/);
  assert.match(chrome, /href="\/signup\/teacher"/);
  assert.match(chrome, /href="\/login"/);
  assert.match(pricing, /href="\/signup\/teacher"/);
  assert.ok(fs.existsSync(path.join(root, "app", "signup", "teacher", "page.tsx")));
  assert.ok(fs.existsSync(path.join(root, "app", "(auth)", "login", "page.tsx")));
});

test("public navigation is concise, accessible and mobile-safe", () => {
  const chrome = read("components/landing/teachx-public-chrome.tsx");
  for (const label of ["Explore", "TARA", "Pricing", "Sign In", "Start Free"]) assert.ok(chrome.includes(label));
  assert.match(chrome, /<details className="group relative">/);
  assert.match(chrome, /aria-label="Mobile public navigation"/);
  assert.match(chrome, /focus:ring-2/);
  assert.match(chrome, /min-h-11/);
});

test("pricing uses the approved launch preview and does not impersonate checkout", () => {
  const pricing = read("app/pricing/page.tsx");
  for (const value of ["7-day free trial", "TeachX Basic", "₹199", "TeachX Pro", "₹499", "applicable taxes"]) assert.ok(pricing.includes(value));
  assert.match(pricing, /does not create a subscription or charge a card/);
  assert.match(pricing, /existing TeachX subscription and billing workflow/);
  assert.doesNotMatch(pricing, /annual savings|limited time|most popular|guaranteed/i);
});

test("public metadata is honest and host-aware without modifying LearnX", () => {
  const home = read("app/page.tsx");
  assert.match(home, /if \(isLearnXHost\(host\)\) return \{\}/);
  assert.match(home, /TeachX Guru \| The Teacher Life OS/);
  assert.match(home, /openGraph/);
  assert.match(home, /twitter/);
  assert.match(home, /canonical: "\/"/);
  const landing = read("components/landing/audience-landing.tsx");
  assert.match(landing, /application\/ld\+json/);
  assert.match(landing, /SoftwareApplication/);
});

test("required public routes remain present", () => {
  const routes = { pricing: ["pricing"], login: ["(auth)", "login"], signup: ["signup", "teacher"], terms: ["terms"], privacy: ["privacy"], support: ["contact"] };
  for (const [route, segments] of Object.entries(routes)) assert.ok(fs.existsSync(path.join(root, "app", ...segments, "page.tsx")), `${route} route is missing`);
});
