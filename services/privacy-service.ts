import { z } from "zod";

import { prisma } from "@/lib/db";
import { getPrivacyConfig, PRIVACY_POLICY_VERSION } from "@/lib/privacy/config";

const requestTypes = ["ACCESS", "EXPORT", "CORRECTION", "DELETION", "RESTRICTION", "OBJECTION"] as const;
const requestStatuses = ["SUBMITTED", "IDENTITY_VERIFICATION", "IN_REVIEW", "APPROVED", "FULFILLED", "REJECTED", "CANCELLED"] as const;

export const consentSchema = z.object({
  anonymousId: z.string().uuid().optional(),
  functional: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
  globalPrivacyControl: z.boolean().default(false),
  jurisdiction: z.string().trim().max(10).optional()
});

export const privacyRequestSchema = z.object({
  type: z.enum(requestTypes),
  details: z.string().trim().max(2_000).optional()
});

export const privacyRequestUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(requestStatuses),
  note: z.string().trim().min(5).max(2_000),
  assignedToId: z.string().trim().max(100).optional(),
  resolution: z.string().trim().max(2_000).optional(),
  legalHold: z.boolean().optional()
}).superRefine((value, context) => {
  if (["FULFILLED", "REJECTED"].includes(value.status) && !value.resolution) context.addIssue({ code: "custom", path: ["resolution"], message: "A resolution basis is required." });
});

export const retentionPolicySchema = z.object({
  id: z.string().cuid().or(z.string().startsWith("privacy_")),
  retentionDays: z.number().int().min(1).max(3_650),
  legalBasis: z.string().trim().min(5).max(300),
  disposition: z.string().trim().min(5).max(300),
  enabled: z.boolean()
});

const transitions: Record<(typeof requestStatuses)[number], (typeof requestStatuses)[number][]> = {
  SUBMITTED: ["IDENTITY_VERIFICATION", "IN_REVIEW", "CANCELLED"],
  IDENTITY_VERIFICATION: ["IN_REVIEW", "REJECTED", "CANCELLED"],
  IN_REVIEW: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["FULFILLED", "REJECTED"],
  FULFILLED: [], REJECTED: [], CANCELLED: []
};

export async function recordPrivacyConsent(input: unknown, userId?: string) {
  const data = consentSchema.parse(input);
  if (!userId && !data.anonymousId) throw new Error("CONSENT_SUBJECT_REQUIRED");
  const choices = [
    ["ESSENTIAL", true], ["FUNCTIONAL", data.functional], ["ANALYTICS", data.globalPrivacyControl ? false : data.analytics], ["MARKETING", data.globalPrivacyControl ? false : data.marketing]
  ] as const;
  return prisma.privacyConsent.createMany({ data: choices.map(([category, granted]) => ({
    userId, anonymousId: userId ? undefined : data.anonymousId, category, granted, policyVersion: PRIVACY_POLICY_VERSION,
    source: "privacy_preferences", jurisdiction: data.jurisdiction, globalPrivacyControl: data.globalPrivacyControl
  })) });
}

export async function getUserPrivacyCenter(userId: string) {
  const [consents, requests] = await Promise.all([
    prisma.privacyConsent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.privacyRequest.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { events: { orderBy: { createdAt: "desc" } } } })
  ]);
  const latestConsents = [...new Map(consents.map((consent) => [consent.category, consent])).values()];
  return { config: getPrivacyConfig(), consents: latestConsents, requests };
}

export async function createPrivacyRequest(user: { id: string; institutionId?: string | null }, input: unknown) {
  const data = privacyRequestSchema.parse(input);
  const open = await prisma.privacyRequest.findFirst({ where: { userId: user.id, type: data.type, status: { notIn: ["FULFILLED", "REJECTED", "CANCELLED"] } }, select: { id: true } });
  if (open) throw new Error("DUPLICATE_PRIVACY_REQUEST");
  const config = getPrivacyConfig();
  const dueAt = new Date(Date.now() + config.requestSlaDays * 86_400_000);
  return prisma.$transaction(async (tx) => {
    const request = await tx.privacyRequest.create({ data: {
      userId: user.id, institutionId: user.institutionId, type: data.type, details: data.details, dueAt,
      events: { create: { status: "SUBMITTED", note: "Request submitted by the account holder.", actorId: user.id } }
    }, include: { events: true } });
    await tx.auditLog.create({ data: { institutionId: user.institutionId, actorId: user.id, action: "CREATE", entity: "PrivacyRequest", entityId: request.id, message: `${data.type} privacy request submitted` } });
    return request;
  });
}

export async function cancelPrivacyRequest(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.privacyRequest.findFirst({ where: { id, userId } });
    if (!request) throw new Error("PRIVACY_REQUEST_NOT_FOUND");
    if (!transitions[request.status].includes("CANCELLED")) throw new Error("INVALID_PRIVACY_TRANSITION");
    const now = new Date();
    const result = await tx.privacyRequest.update({ where: { id }, data: { status: "CANCELLED", cancelledAt: now, events: { create: { status: "CANCELLED", note: "Cancelled by the account holder.", actorId: userId } } } });
    await tx.auditLog.create({ data: { institutionId: request.institutionId, actorId: userId, action: "UPDATE", entity: "PrivacyRequest", entityId: id, message: "Privacy request cancelled by account holder" } });
    return result;
  });
}

export async function getPrivacyAdministration() {
  const now = new Date();
  const [requests, retention] = await Promise.all([
    prisma.privacyRequest.findMany({ orderBy: [{ status: "asc" }, { dueAt: "asc" }], take: 200, include: { user: { select: { name: true, email: true } }, events: { orderBy: { createdAt: "desc" } } } }),
    prisma.dataRetentionPolicy.findMany({ orderBy: { dataset: "asc" } })
  ]);
  const open = requests.filter((request) => !["FULFILLED", "REJECTED", "CANCELLED"].includes(request.status));
  return { config: getPrivacyConfig(), requests, retention, metrics: { open: open.length, overdue: open.filter((request) => request.dueAt < now).length, legalHolds: open.filter((request) => request.legalHold).length } };
}

export async function updatePrivacyRequest(input: unknown, actorId: string) {
  const data = privacyRequestUpdateSchema.parse(input);
  return prisma.$transaction(async (tx) => {
    const current = await tx.privacyRequest.findUnique({ where: { id: data.id } });
    if (!current) throw new Error("PRIVACY_REQUEST_NOT_FOUND");
    if (data.status !== current.status && !transitions[current.status].includes(data.status)) throw new Error("INVALID_PRIVACY_TRANSITION");
    if (data.status === "FULFILLED" && current.type === "DELETION" && (data.legalHold ?? current.legalHold)) throw new Error("LEGAL_HOLD_BLOCKS_FULFILMENT");
    const now = new Date();
    const request = await tx.privacyRequest.update({ where: { id: data.id }, data: {
      status: data.status, assignedToId: data.assignedToId, resolution: data.resolution, legalHold: data.legalHold,
      verifiedAt: data.status === "IN_REVIEW" && !current.verifiedAt ? now : undefined,
      fulfilledAt: data.status === "FULFILLED" ? now : undefined,
      cancelledAt: data.status === "CANCELLED" ? now : undefined,
      events: { create: { status: data.status, note: data.note, actorId } }
    }, include: { events: { orderBy: { createdAt: "desc" } } } });
    await tx.auditLog.create({ data: { actorId, action: "UPDATE", entity: "PrivacyRequest", entityId: data.id, message: `Privacy request moved from ${current.status} to ${data.status}` } });
    return request;
  });
}

export async function updateRetentionPolicy(input: unknown, actorId: string) {
  const data = retentionPolicySchema.parse(input);
  return prisma.$transaction(async (tx) => {
    const policy = await tx.dataRetentionPolicy.update({ where: { id: data.id }, data: { retentionDays: data.retentionDays, legalBasis: data.legalBasis, disposition: data.disposition, enabled: data.enabled, updatedById: actorId, lastReviewedAt: new Date() } });
    await tx.auditLog.create({ data: { actorId, action: "UPDATE", entity: "DataRetentionPolicy", entityId: policy.id, message: `Retention policy reviewed: ${policy.dataset}` } });
    return policy;
  });
}

export async function buildPortableAccountSnapshot(userId: string) {
  const [user, preferences, consents, requests, content, orders] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, email: true, name: true, userType: true, status: true, emailVerifiedAt: true, lastLoginAt: true, createdAt: true, updatedAt: true, profile: true, teacherProfile: true } }),
    prisma.userPreference.findMany({ where: { userId }, select: { key: true, value: true, createdAt: true, updatedAt: true } }),
    prisma.privacyConsent.findMany({ where: { userId }, select: { category: true, granted: true, policyVersion: true, source: true, createdAt: true } }),
    prisma.privacyRequest.findMany({ where: { userId }, select: { id: true, type: true, status: true, dueAt: true, createdAt: true, fulfilledAt: true } }),
    prisma.contentItem.findMany({ where: { createdById: userId }, select: { id: true, title: true, type: true, status: true, createdAt: true, updatedAt: true }, take: 5_000 }),
    prisma.commerceOrder.findMany({ where: { buyerId: userId }, select: { id: true, type: true, status: true, currency: true, total: true, createdAt: true }, take: 5_000 })
  ]);
  return { format: "TeachX portable account snapshot", generatedAt: new Date().toISOString(), policyVersion: PRIVACY_POLICY_VERSION, scopeNotice: "For a complete statutory export including large files or institution-controlled records, submit an Export request in the Privacy Center.", account: user, preferences, consentHistory: consents, privacyRequests: requests, createdContent: content, commerceOrders: orders.map((order) => ({ ...order, total: String(order.total) })) };
}
