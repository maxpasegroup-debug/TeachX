"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function financeAdmin() {
  const user = await requireCurrentUser("finance.manage");
  if (!user.institutionId) throw new Error("An institution is required.");
  return { id: user.id, institutionId: user.institutionId };
}

export async function saveEarnMoreCommissionPolicyAction(formData: FormData) {
  const admin = await financeAdmin();
  const source = value(formData, "source");
  const commissionBps = Number(value(formData, "commissionBps"));
  const settlementDays = Number(value(formData, "settlementDays"));
  if (!["MENTOR", "TRAIN", "PUBLISH"].includes(source) || !Number.isInteger(commissionBps) || commissionBps < 0 || commissionBps > 10_000 || !Number.isInteger(settlementDays) || settlementDays < 0 || settlementDays > 365) {
    throw new Error("Enter a valid source, commission, and settlement period.");
  }
  const policy = await prisma.earnMoreCommissionPolicy.upsert({
    where: { institutionId_source: { institutionId: admin.institutionId, source } },
    update: { commissionBps, settlementDays, isActive: formData.get("isActive") === "on" },
    create: { institutionId: admin.institutionId, source, commissionBps, settlementDays, isActive: formData.get("isActive") === "on" }
  });
  await writeAuditLog({ institutionId: admin.institutionId, actorId: admin.id, action: "UPDATE", entity: "EarnMoreCommissionPolicy", entityId: policy.id, message: `Updated ${source} commission policy` });
  revalidatePath("/admin");
  return policy;
}

export async function reviewTeacherPayoutAccountAction(formData: FormData) {
  const admin = await financeAdmin();
  const accountId = value(formData, "accountId");
  const approved = value(formData, "decision") === "APPROVE";
  const account = await prisma.teacherPayoutAccount.findFirst({ where: { id: accountId, institutionId: admin.institutionId, status: "PENDING_REVIEW" } });
  if (!account) throw new Error("A pending payout account was not found.");
  const updated = await prisma.teacherPayoutAccount.update({ where: { id: account.id }, data: approved ? { status: "VERIFIED", kycStatus: "VERIFIED", verifiedAt: new Date() } : { status: "REJECTED", kycStatus: "REJECTED" } });
  await writeAuditLog({ institutionId: admin.institutionId, actorId: admin.id, action: "UPDATE", entity: "TeacherPayoutAccount", entityId: account.id, message: approved ? "Verified teacher payout account" : "Rejected teacher payout account" });
  revalidatePath("/teacher/business/payouts");
  return updated;
}

export async function resolveTeacherPayoutRequestAction(formData: FormData) {
  const admin = await financeAdmin();
  const requestId = value(formData, "requestId");
  const decision = value(formData, "decision");
  const providerPayoutReference = value(formData, "providerPayoutReference");
  const request = await prisma.teacherPayoutRequest.findFirst({ where: { id: requestId, institutionId: admin.institutionId, status: { in: ["REQUESTED", "UNDER_REVIEW", "PROCESSING"] } } });
  if (!request || !["PAID", "REJECTED", "FAILED"].includes(decision)) throw new Error("A pending payout and valid decision are required.");
  await prisma.$transaction(async (tx) => {
    const claimed = await tx.teacherPayoutRequest.updateMany({ where: { id: request.id, status: { in: ["REQUESTED", "UNDER_REVIEW", "PROCESSING"] } }, data: { status: decision as "PAID" | "REJECTED" | "FAILED", providerPayoutReference: decision === "PAID" ? providerPayoutReference || null : null, failureReason: decision === "PAID" ? null : value(formData, "reason") || "Payout not completed" } });
    if (!claimed.count) throw new Error("This payout request was already resolved.");
    const hold = await tx.walletTransaction.findFirst({ where: { userId: request.teacherId, type: "HOLD", metadata: { path: ["payoutRequestId"], equals: request.id } } });
    if (!hold) throw new Error("Payout funds are not held correctly.");
    if (decision === "PAID") {
      await tx.walletTransaction.update({ where: { id: hold.id }, data: { type: "DEBIT", pending: false, description: "Teacher payout paid" } });
    } else {
      await tx.walletTransaction.update({ where: { id: hold.id }, data: { type: "RELEASE", pending: false, description: "Teacher payout released" } });
      await tx.wallet.update({ where: { id: hold.walletId }, data: { balance: { increment: request.amount } } });
    }
  }, { isolationLevel: "Serializable" });
  await writeAuditLog({ institutionId: admin.institutionId, actorId: admin.id, action: "UPDATE", entity: "TeacherPayoutRequest", entityId: request.id, message: `Payout ${decision.toLowerCase()}` });
  revalidatePath("/teacher/business/payouts");
}

export async function approveRecordedProgramAction(formData: FormData) {
  const admin = await requireCurrentUser("content.manage");
  if (!admin.institutionId) throw new Error("An institution is required.");
  const itemId = value(formData, "contentItemId");
  const approved = value(formData, "decision") === "APPROVE";
  const item = await prisma.contentItem.findFirst({ where: { id: itemId, institutionId: admin.institutionId, status: "SUBMITTED", reviews: { some: { stage: "EARN_MORE_RECORDED_PROGRAM", decision: "PENDING" } } } });
  if (!item) throw new Error("A submitted recorded program was not found.");
  await prisma.$transaction([
    prisma.contentReview.updateMany({ where: { itemId: item.id, stage: "EARN_MORE_RECORDED_PROGRAM", decision: "PENDING" }, data: { decision: approved ? "APPROVED" : "REJECTED", reviewerId: admin.id } }),
    prisma.contentItem.update({ where: { id: item.id }, data: approved ? { status: "PUBLISHED", publishedAt: new Date() } : { status: "NEEDS_CHANGES" } })
  ]);
  await writeAuditLog({ institutionId: admin.institutionId, actorId: admin.id, action: "UPDATE", entity: "ContentItem", entityId: item.id, message: approved ? "Approved Earn More recorded program" : "Returned Earn More recorded program" });
  revalidatePath("/teacher/business/publishing");
}
