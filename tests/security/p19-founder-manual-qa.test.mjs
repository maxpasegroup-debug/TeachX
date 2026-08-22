import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(join(process.cwd(), path), "utf8");

test("founder manual QA preserves the complete A through S teacher journey", () => {
  const guide = read("docs/P19_FOUNDER_MANUAL_QA.md");
  const sections = [
    "A. Public website", "B. Signup", "C. First login", "D. Teacher Home", "E. Save Time",
    "F. Teaching", "G. TARA", "H. Earn More", "I. Learn More", "J. Enjoy More",
    "K. Community", "L. Planner", "M. Resources", "N. Business", "O. Notifications",
    "P. Help & Support", "Q. Settings", "R. Subscription", "S. Logout / login again"
  ];
  for (const section of sections) assert.ok(guide.includes(`## ${section}`), `${section} is missing`);
});

test("founder dashboard, required viewports, and six persistence questions are present", () => {
  const guide = read("docs/P19_FOUNDER_MANUAL_QA.md");
  for (const item of ["Public website", "Signup", "First login", "Home", "Save Time", "Teaching", "TARA", "Earn More", "Learn More", "Enjoy More", "Planner", "Resources", "Community", "Business", "Notifications", "Help", "Settings", "Subscription", "Logout/login", "Real mobile test"]) {
    assert.ok(guide.includes(`- [ ] ${item}`), `${item} checklist item is missing`);
  }
  for (const width of ["360px", "390px", "414px", "768px"]) assert.ok(guide.includes(width));
  for (const question of ["Did it open?", "Did I understand what it is?", "Did the main button work?", "Did the result actually save?", "Could I find the result again", "Did TeachX clearly tell me"]) assert.ok(guide.includes(question));
});

test("manual QA verifies actual workflows rather than page presence or fabricated outcomes", () => {
  const guide = read("docs/P19_FOUNDER_MANUAL_QA.md");
  for (const phrase of [
    "Do not mark a tool as passed merely because its page opens",
    "TARA must not invent classes",
    "no fake offers",
    "no fake buyer, sale, review, earnings",
    "Never perform real-money tests"
  ]) assert.ok(guide.includes(phrase));
});

test("bug reporting is non-technical and uses the locked severity scale", () => {
  const guide = read("docs/P19_FOUNDER_MANUAL_QA.md");
  for (const field of ["SCREEN:", "WHAT I DID:", "WHAT I EXPECTED:", "WHAT ACTUALLY HAPPENED:", "SCREENSHOT:", "SEVERITY:"]) assert.ok(guide.includes(field));
  for (const severity of ["GREEN", "YELLOW", "ORANGE", "RED"]) assert.ok(guide.includes(`**${severity}**`));
});

test("readiness document separates automated, manual, and production states", () => {
  const readiness = read("docs/P19_FOUNDER_QA_READINESS.md");
  for (const heading of ["Code status", "Automated test status", "Manual test status", "Production status", "Known blockers", "Known yellow items", "Exact founder test sequence", "Readiness decision"]) assert.ok(readiness.includes(`## ${heading}`));
  assert.match(readiness, /NOT STARTED/);
  assert.match(readiness, /NOT PRODUCTION READY/);
  assert.match(readiness, /does \*\*not\*\* certify production readiness/);
});
