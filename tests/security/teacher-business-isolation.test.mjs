import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("business reads require an active tenant-bound teacher", () => {
  const service = read("services/teacher-business-service.ts");
  assert.match(service, /if \(!userId \|\| !institutionId\) return null/);
  assert.match(service, /id: userId, institutionId, status: "ACTIVE"/);
  assert.match(service, /role: \{ key: \{ in: teacherRoles \} \}/);
  assert.doesNotMatch(service, /institutionId:\s*institutionId \?\? undefined/);
});

test("resources, seller orders, wallets, subscriptions, and invoices stay tenant scoped", () => {
  const service = read("services/teacher-business-service.ts");
  assert.match(service, /where: \{ createdById: userId, institutionId \}/);
  assert.match(service, /where: \{ sellerId: userId, order: \{ institutionId \} \}/);
  assert.match(service, /where: \{ userId, institutionId \}/);
  assert.match(service, /where: \{ buyerId: userId, institutionId \}/);
  assert.match(service, /getActiveSubscription\(userId, institutionId, "TEACHER"\)/);
});

test("marketplace products use canonical listings and verified reviews", () => {
  const service = read("services/teacher-business-service.ts");
  const actions = read("features/teacher-business/actions.ts");
  assert.match(service, /marketplaceListing:/);
  assert.match(service, /reviews: \{ where: \{ status: "APPROVED" \}/);
  assert.match(actions, /prisma\.marketplaceListing\.upsert/);
  assert.match(actions, /where: \{ contentItemId: item\.id \}/);
  assert.match(actions, /status: "INACTIVE", purchaseEnabled: false/);
});

test("earnings come from wallet EARNING records rather than fabricated order totals", () => {
  const service = read("services/teacher-business-service.ts");
  assert.match(service, /walletTransaction\.findMany\(\{ where: \{ userId, institutionId, type: "EARNING"/);
  assert.match(service, /total: Number\(wallet\.lifetimeEarnings\)/);
  assert.match(service, /platformCommission: null/);
  assert.doesNotMatch(service, /estimatedEarnings/);
});

test("business mutations validate tenant ownership and protect sold resources", () => {
  const actions = read("features/teacher-business/actions.ts");
  assert.match(actions, /id: session\.user\.id, institutionId: session\.user\.institutionId, status: "ACTIVE"/);
  assert.match(actions, /where: \{ id, institutionId: teacher\.institutionId, createdById: teacher\.id \}/);
  assert.match(actions, /item\._count\.commerceOrderItems > 0 \|\| item\._count\.marketplaceEntitlements > 0/);
  assert.match(actions, /institutionId: teacher\.institutionId, plan: \{ audience: "TEACHER" \}/);
  assert.doesNotMatch(actions, /deleteWalletTransactionAction|deleteBusinessOrderAction/);
});

test("Earn More service and plan CRUD stay bound to the current teacher and tenant", () => {
  const service = read("services/teacher-business-service.ts");
  const actions = read("features/teacher-business/actions.ts");
  assert.match(service, /teacherEarningService\.findMany\(\{\s*where: \{ institutionId, teacherId: userId \}/);
  assert.match(actions, /where: \{ id, institutionId: teacher\.institutionId, teacherId: teacher\.id \}/);
  assert.match(actions, /service: \{ institutionId: teacher\.institutionId, teacherId: teacher\.id \}/);
  assert.match(actions, /institutionId: teacher\.institutionId, teacherId: teacher\.id/);
  assert.doesNotMatch(actions, /teacherEarningService\.update\(\{\s*where: \{ id:/);
  assert.match(actions, /const earningServiceTypes = new Set\(\["MENTOR", "TRAIN"\]\)/);
});

test("Earn More client requests remain scoped to the signed-in teacher and tenant", () => {
  const service = read("services/teacher-business-service.ts");
  assert.match(service, /teacherBookingRequest\.findMany\(\{\s*where: \{ teacherId: userId, teacherProfile: \{ user: \{ institutionId \} \} \}/);
  assert.match(service, /studentName: request\.studentName/);
  assert.doesNotMatch(service, /teacherBookingRequest\.findMany\(\{\s*where: \{\s*\}/);
});

test("structured availability is private and mutations are tenant-bound", () => {
  const service = read("services/teacher-business-service.ts");
  const actions = read("features/teacher-business/actions.ts");
  const schema = read("prisma/schema.prisma");
  assert.match(service, /teacherAvailability\.findFirst\(\{\s*where: \{ institutionId, teacherId: userId \}/);
  assert.match(actions, /institutionId_teacherId: \{ institutionId: teacher\.institutionId, teacherId: teacher\.id \}/);
  assert.match(actions, /availability: \{ institutionId: teacher\.institutionId, teacherId: teacher\.id \}/);
  assert.match(actions, /supportedAvailabilityTimeZones/);
  assert.match(actions, /supportedSessionDurations/);
  assert.match(schema, /model TeacherAvailability \{/);
  assert.match(schema, /model TeacherAvailabilityWeeklyRule \{/);
  assert.match(schema, /model TeacherAvailabilityUnavailableDate \{/);
  assert.doesNotMatch(service, /teacherAvailability\.findMany\(\{\s*where: \{\s*\}/);
});

test("Earn More payouts require provider-tokenized KYC approval and server-side funds", () => {
  const service = read("services/earn-more-fulfilment-service.ts");
  const schema = read("prisma/schema.prisma");
  assert.match(schema, /model TeacherPayoutAccount \{/);
  assert.match(schema, /recipientReference/);
  assert.doesNotMatch(schema.slice(schema.indexOf("model TeacherPayoutAccount"), schema.indexOf("model TeacherPayoutRequest")), /bankAccount|upiId|panNumber/);
  assert.match(service, /status: "VERIFIED", kycStatus: "VERIFIED"/);
  assert.match(service, /Number\(wallet\.balance\) < amount/);
  assert.match(service, /type: "HOLD", amount, pending: true/);
});

test("paid bookings use atomic reservations, payment fulfilment, and a commission ledger", () => {
  const schema = read("prisma/schema.prisma");
  const service = read("services/earn-more-fulfilment-service.ts");
  const payment = read("services/payment-service.ts");
  const migration = read("prisma/migrations/20260829100000_add_earn_more_fulfilment/migration.sql");
  assert.match(schema, /model TeacherServiceBooking \{/);
  assert.match(schema, /@@unique\(\[institutionId, learnerId, idempotencyKey\]\)/);
  assert.match(migration, /TeacherServiceBooking_no_paid_overlap/);
  assert.match(migration, /EXCLUDE USING gist/);
  assert.match(service, /isolationLevel: "Serializable"/);
  assert.match(service, /requireCommissionPolicy/);
  assert.match(service, /commissionBps/);
  assert.match(service, /pendingBalance: \{ increment: netAmount \}/);
  assert.match(payment, /fulfilTeacherServiceBookingItem/);
  assert.match(payment, /reverseEarnMoreFulfilment/);
  assert.doesNotMatch(service, /commissionBps\s*\|\|\s*\d+/);
});

test("mentor access, recorded review, live-program capacity, and disputes fail closed", () => {
  const service = read("services/earn-more-fulfilment-service.ts");
  assert.match(service, /mentorPremium === true/);
  assert.match(service, /Premium Mentor is active/);
  assert.match(service, /status: "PUBLISHED"/);
  assert.match(service, /reserved >= program\.capacity/);
  assert.match(service, /This live program is sold out/);
  assert.match(service, /Only the owner can submit a draft program for review/);
  assert.match(service, /status: "DISPUTED"/);
});

test("public marketplace profile queries do not load private booking requests", () => {
  const marketplace = read("services/marketplace-service.ts");
  const publicSection = marketplace.slice(0, marketplace.indexOf("export async function getTeacherMarketplaceDashboard"));
  assert.match(publicSection, /isMarketplaceListed: true/);
  assert.match(publicSection, /user: \{ status: "ACTIVE" \}/);
  assert.doesNotMatch(publicSection, /bookingRequests/);
});

test("business queries are bounded and analytics are date scoped", () => {
  const service = read("services/teacher-business-service.ts");
  assert.match(service, /createdAt: \{ gte: activitySince \}/);
  assert.match(service, /createdAt: \{ gte: trendSince \}/);
  for (const limit of [50, 100, 500]) assert.match(service, new RegExp(`take: ${limit}`));
});

test("P8 UI connects profile, resources, marketplace, orders, wallet, payout, AI, and community", () => {
  const component = read("features/teacher-business/components/teacher-business-page.tsx");
  for (const businessModule of ["home", "profile", "portfolio", "publishing", "marketplace", "orders", "earnings", "wallet", "payouts", "analytics", "subscription"]) assert.match(component, new RegExp(`slug: "${businessModule}"`));
  assert.match(component, /href="\/teacher\/resources"/);
  assert.match(component, /href="\/teacher\/ai-studio\/chat"/);
  assert.match(component, /href="\/teacher\/community\/resources"/);
  assert.match(component, /saveMarketplaceProductAction/);
  assert.match(component, /overflow-x-auto/);
});

test("Earn More schedule uses the existing restricted booking workflow", () => {
  const component = read("features/teacher-business/components/teacher-business-page.tsx");
  assert.match(component, /slug: "schedule"/);
  assert.match(component, /href="\/communication"/);
  assert.match(component, /Appointment slots, payments, and video links are not created/);
});

test("Earn More Clients reuses only teacher-scoped booking request data", () => {
  const service = read("services/teacher-business-service.ts");
  const component = read("features/teacher-business/components/teacher-business-page.tsx");
  assert.match(service, /teacherBookingRequest\.findMany\(\{\s*where: \{ teacherId: userId, teacherProfile: \{ user: \{ institutionId \} \} \}/);
  assert.match(component, /slug: "clients"/);
  assert.match(component, /function Clients\(/);
  assert.match(component, /href="\/communication"/);
  assert.doesNotMatch(component.slice(component.indexOf("function Clients"), component.indexOf("function Profile")), /studentEmail|session count|revenue/i);
});
