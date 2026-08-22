import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("public Home is a compact Teacher Life OS experience", () => {
  const page = read("components/landing/audience-landing.tsx");
  assert.doesNotMatch(page, /^"use client"/m);
  assert.match(page, /The Teacher Life OS/);
  assert.match(page, /More time for the life you teach for/);
  assert.match(page, /Your teaching, AI, growth and learning/);
  for (const marker of ["id=\"worlds\"", "id=\"tara\"", "Teacher life", "Make time for what comes next"]) assert.ok(page.includes(marker));
  assert.match(page, /teacher-life-os-home\.webp/);
  assert.match(page, /<Image[\s\S]*priority[\s\S]*sizes=/);
  assert.doesNotMatch(page, /tracking-tight/);
});

test("four canonical worlds communicate the locked vision without fabricated evidence", () => {
  const page = read("components/landing/audience-landing.tsx");
  const routes = { "Save Time": "/save-time", "Earn More": "/earn-more", "Learn More": "/learn-more", "Enjoy More": "/enjoy-more" };
  for (const [label, route] of Object.entries(routes)) {
    assert.ok(page.includes(label));
    assert.ok(page.includes(`href: \"${route}\"`));
    assert.ok(fs.existsSync(path.join(root, "app", route.slice(1), "page.tsx")));
  }
  for (const copy of ["Give your time back", "Give your knowledge more value", "Invest in yourself", "Life beyond the classroom"]) assert.ok(page.includes(copy));
  for (const forbidden of ["teachers joined", "five-star", "customer logo", "earned by teachers", "travel deal"]) assert.doesNotMatch(page, new RegExp(forbidden, "i"));
});

test("premium public navigation exposes every canonical destination and auth flow", () => {
  const chrome = read("components/landing/teachx-public-chrome.tsx");
  for (const label of ["Platform", "Save Time", "Earn More", "Learn More", "Enjoy More", "TARA", "Pricing", "Sign In", "Start Free"]) assert.ok(chrome.includes(label));
  for (const route of ["/save-time", "/earn-more", "/learn-more", "/enjoy-more", "/tara", "/pricing", "/login", "/signup/teacher"]) assert.ok(chrome.includes(route));
  assert.match(chrome, /aria-label="Mobile public navigation"/);
  assert.match(chrome, /max-h-\[calc\(100svh-6rem\)\]/);
  assert.match(chrome, /overflow-y-auto/);
});

test("TARA has a truthful public presentation and preserves the authorized workspace", () => {
  const publicPage = read("components/landing/tara-public-page.tsx");
  const route = read("app/tara/page.tsx");
  for (const copy of ["One AI. Many ways to help.", "One intelligence. Different roles. One teacher ecosystem.", "Co-Teacher", "Co-Creator", "Planner", "Business Partner", "Learning Companion"]) assert.ok(publicPage.includes(copy));
  assert.match(route, /process\.env\.AUTH_SECRET \? await auth\(\) : null/);
  assert.match(route, /dashboard\.view/);
  assert.match(route, /getTaraData/);
  assert.match(route, /<TaraPublicPage/);
  assert.match(route, /<TaraWorkspace/);
  assert.doesNotMatch(publicPage, /generated successfully|typing|executing|fake demo/i);
});

test("pillar pages advertise actual capabilities and honest future states", () => {
  const save = read("app/save-time/page.tsx");
  const earn = read("app/earn-more/page.tsx");
  const learn = read("app/learn-more/page.tsx");
  const enjoy = read("app/enjoy-more/page.tsx");
  for (const capability of ["Lessons and worksheets", "Question papers and assessments", "Parent communication", "Planner and calendar", "Search and TARA"]) assert.ok(save.includes(capability));
  for (const capability of ["Teach 1:1", "Teacher-defined pricing", "Resource publishing", "Earnings and wallet"]) assert.ok(earn.includes(capability));
  assert.match(learn, /Honest empty and coming-soon states/);
  assert.match(enjoy, /comingSoon: true/);
  assert.match(enjoy, /There are no offers, bookings, partners or prices here yet/);
});

test("pricing uses approved launch amounts and cannot impersonate checkout", () => {
  const pricing = read("app/pricing/page.tsx");
  for (const value of ["7-day free trial", "TeachX Basic", "price: \"199\"", "TeachX Pro", "price: \"499\"", "applicable taxes"]) assert.ok(pricing.includes(value));
  assert.match(pricing, /does not create a subscription or charge a card/);
  assert.match(pricing, /existing TeachX subscription and billing workflow/);
  assert.doesNotMatch(pricing, /annual savings|limited time|most popular|guaranteed/i);
});

test("SEO discovery includes every new public route", () => {
  const sitemap = read("app/sitemap.ts");
  const robots = read("app/robots.ts");
  const routes = read("lib/constants/route-permissions.ts");
  for (const route of ["/save-time", "/earn-more", "/learn-more", "/enjoy-more", "/tara"]) {
    assert.ok(sitemap.includes(route));
    assert.ok(robots.includes(route));
    assert.ok(routes.includes(route));
  }
});

test("public metadata remains host-aware and does not modify LearnX", () => {
  const home = read("app/page.tsx");
  assert.match(home, /if \(isLearnXHost\(host\)\) return \{\}/);
  assert.match(home, /TeachX Guru \| The Teacher Life OS/);
  assert.match(home, /openGraph/);
  assert.match(home, /twitter/);
  assert.match(home, /canonical: "\/"/);
  assert.match(read("components/landing/audience-landing.tsx"), /application\/ld\+json/);
});
