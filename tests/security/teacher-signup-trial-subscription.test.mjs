import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("every public Start Free path reuses the canonical teacher signup", () => {
  const landing = read("components/landing/audience-landing.tsx");
  const chrome = read("components/landing/teachx-public-chrome.tsx");
  const pricing = read("app/pricing/page.tsx");
  assert.match(landing, /primaryHref: "\/signup\/teacher"/);
  assert.match(chrome, /href="\/signup\/teacher"/);
  assert.match(pricing, /href="\/signup\/teacher"/);
  assert.ok(fs.existsSync(path.join(root, "app", "signup", "teacher", "page.tsx")));
});

test("teacher signup stays minimal and creates one tenant-owned seven-day trial", () => {
  const form = read("features/auth/components/teacher-phone-signup-form.tsx");
  const phoneFields = read("features/auth/components/phone-number-fields.tsx");
  const action = read("features/auth/actions.ts");
  for (const field of ["name=\"name\"", "name=\"email\"", "name=\"pin\"", "name=\"confirmPin\""]) assert.ok(form.includes(field));
  assert.match(form, /<PhoneNumberFields/);
  assert.match(phoneFields, /name="phone"/);
  for (const forbidden of ["qualification", "experienceYears", "hourlyRate", "availability", "teachingMode"]) assert.doesNotMatch(form, new RegExp(forbidden));
  assert.match(action, /institution: \{ create:/);
  assert.match(action, /key === "teacher-basic"/);
  assert.match(action, /institutionId: user\.institutionId[\s\S]*status: "TRIALING"/);
  assert.match(action, /currentPeriodEnd: trialEndsAt/);
  assert.match(action, /trialDays: 7/);
  assert.match(action, /isolationLevel: "Serializable"/);
});

test("post-signup welcome offers the four worlds and the same TARA", () => {
  const entry = read("features/auth/components/ecosystem-entry-transition.tsx");
  for (const destination of ["/teacher/life/save-time", "/teacher/life/earn-more", "/teacher/life/learn-more", "/teacher/life/enjoy-more", "/tara"]) assert.ok(entry.includes(destination));
  assert.match(entry, /What would you like to do first/);
  assert.match(entry, /showTeacherWelcome/);
  assert.match(entry, /if \(showTeacherWelcome\) return/);
});

test("canonical subscription service recognizes and intentionally expires trials", () => {
  const service = read("services/commerce-service.ts");
  assert.match(service, /status: \{ in: \["ACTIVE", "TRIALING"\] \}/);
  assert.match(service, /subscription\.currentPeriodEnd > now/);
  assert.match(service, /data: \{ status: "EXPIRED"/);
  assert.match(service, /plan\.key === \(audience === "STUDENT" \? "student-free" : "teacher-free"\)/);
  assert.match(service, /subscription: subscription \?/);
});

test("approved Basic and Pro launch plans are real plan records without unlimited AI", () => {
  const service = read("services/commerce-service.ts");
  assert.match(service, /key: "teacher-basic", name: "TeachX Basic"[\s\S]*price: 199[\s\S]*aiMonthlyCredits: 500/);
  assert.match(service, /key: "teacher-pro", name: "TeachX Pro"[\s\S]*price: 499[\s\S]*aiMonthlyCredits: 5000/);
  assert.match(service, /teacher-rural-starter", "teacher-plus"[\s\S]*isActive: false/);
  assert.doesNotMatch(service, /unlimited/i);
});

test("subscription changes enforce teacher identity and tenant-owned plans", () => {
  const action = read("features/commerce/actions.ts");
  assert.match(action, /session\.user\.roles\.some/);
  assert.match(action, /audience: "TEACHER"/);
  assert.match(action, /OR: \[\{ institutionId: session\.user\.institutionId \}, \{ institutionId: null \}\]/);
  assert.match(action, /buyerId: session\.user\.id[\s\S]*institutionId: session\.user\.institutionId[\s\S]*status: "PENDING_PAYMENT"/);
  assert.match(action, /status: \{ in: \["ACTIVE", "TRIALING"\] \}/);
});

test("paid access remains webhook-controlled across success failure and cancellation", () => {
  const payment = read("services/payment-service.ts");
  const browser = read("components/commerce/checkout-payment-actions.tsx");
  const checkout = read("app/(app)/checkout/[orderId]/page.tsx");
  assert.match(payment, /provider_providerEventId/);
  assert.match(payment, /amountMatches/);
  assert.match(payment, /currencyMatches/);
  assert.match(payment, /status: \{ in: \["ACTIVE", "TRIALING"\] \}/);
  assert.doesNotMatch(browser, /status: "ACTIVE"|FULFILLED|PAID/);
  assert.match(browser, /Payment was cancelled\. No payment was taken/);
  assert.match(checkout, /paymentQuery === "processing"/);
  assert.match(checkout, /paymentQuery === "cancelled"/);
  assert.match(checkout, /event\.status === "FAILED"/);
});

test("subscription UI reports real trial usage billing and annual availability", () => {
  const page = read("features/teacher-business/components/teacher-business-page.tsx");
  assert.match(page, /data\.trial\?\.active/);
  assert.match(page, /AI usage/);
  assert.match(page, /Annual billing is not configured yet/);
  assert.match(page, /verified subscription payment/);
  assert.match(page, /subscription\.prepaid \? "Access through" : "Renews"/);
  assert.match(page, /&& !subscription\.prepaid/);
  assert.doesNotMatch(page, /unlimited AI|annual savings|limited time/i);
});

test("trial and paid AI use the same canonical credit summary", () => {
  const commerce = read("services/commerce-service.ts");
  const tara = read("services/tara-service.ts");
  const home = read("services/teachx-operating-service.ts");
  assert.match(commerce, /const subscription = await getActiveSubscription/);
  assert.match(tara, /getAICreditSummary/);
  assert.match(home, /credits\.subscription\?\.status === "TRIALING"/);
});

test("P15 introduces no duplicate auth subscription payment or entitlement models", () => {
  const schema = read("prisma/schema.prisma");
  assert.equal((schema.match(/model UserSubscription \{/g) ?? []).length, 1);
  assert.equal((schema.match(/model SubscriptionPlan \{/g) ?? []).length, 1);
  assert.equal((schema.match(/model CommerceOrder \{/g) ?? []).length, 1);
  assert.equal((schema.match(/model CommercePaymentEvent \{/g) ?? []).length, 1);
});
