import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { TransactionalEmailStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getEmailConfig } from "@/lib/email/config";
import { resend } from "@/lib/email/provider";
import { emailTemplates } from "@/lib/email/templates";
import { getPublicBaseUrl } from "@/lib/env";
import { captureOperationalError } from "@/lib/observability/logger";

function emailHash(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

function domain(email: string) {
  return email.trim().toLowerCase().split("@")[1] || "invalid";
}

function errorCode(error: unknown) {
  if (error && typeof error === "object" && "name" in error) return String(error.name).slice(0, 80);
  return "PROVIDER_REQUEST_FAILED";
}

export async function sendTransactionalEmail(input: {
  userId?: string;
  institutionId?: string | null;
  to: string;
  kind: string;
  idempotencyKey: string;
  subject: string;
  html: string;
  text: string;
  metadata?: Record<string, string>;
}) {
  const config = getEmailConfig();
  if (!config.live) throw new Error("Transactional email delivery is not ready.");
  const existing = await prisma.transactionalEmail.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing && ["ACCEPTED", "DELIVERED"].includes(existing.status)) return existing;
  const record = existing || await prisma.transactionalEmail.create({
    data: {
      institutionId: input.institutionId || undefined,
      userId: input.userId,
      kind: input.kind,
      idempotencyKey: input.idempotencyKey,
      recipientHash: emailHash(input.to),
      recipientDomain: domain(input.to),
      metadata: input.metadata
    }
  });
  await prisma.transactionalEmail.update({ where: { id: record.id }, data: { attemptCount: { increment: 1 }, lastErrorCode: null } });
  try {
    const response = await resend().emails.send({
      from: process.env.EMAIL_FROM!,
      replyTo: process.env.EMAIL_REPLY_TO!,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      headers: { "X-Entity-Ref-ID": record.id },
      tags: [{ name: "kind", value: input.kind.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 256) }]
    }, { idempotencyKey: input.idempotencyKey });
    if (response.error || !response.data?.id) throw new Error(response.error?.name || "EMAIL_NOT_ACCEPTED");
    return prisma.transactionalEmail.update({ where: { id: record.id }, data: { providerMessageId: response.data.id, status: "ACCEPTED", acceptedAt: new Date() } });
  } catch (error) {
    await prisma.transactionalEmail.update({ where: { id: record.id }, data: { status: "FAILED", failedAt: new Date(), lastErrorCode: errorCode(error) } });
    captureOperationalError(error, "email.send.failed", { kind: input.kind, emailId: record.id });
    throw error;
  }
}

export async function issueEmailVerification(user: { id: string; institutionId?: string | null; email: string; name: string }) {
  if (user.email && (await prisma.user.findUnique({ where: { id: user.id }, select: { emailVerifiedAt: true } }))?.emailVerifiedAt) return;
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const identifier = `email-verification:${user.email.toLowerCase()}`;
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({ data: { identifier, token: tokenHash, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
  ]);
  const url = `${getPublicBaseUrl().replace(/\/+$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
  await sendTransactionalEmail({ userId: user.id, institutionId: user.institutionId, to: user.email, kind: "EMAIL_VERIFICATION", idempotencyKey: `verify-email/${tokenHash}`, ...emailTemplates.verifyEmail(user.name, url) });
}

export async function consumeEmailVerification(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const record = await prisma.verificationToken.findUnique({ where: { token: tokenHash } });
  if (!record || record.expires < new Date() || !record.identifier.startsWith("email-verification:")) return null;
  const email = record.identifier.slice("email-verification:".length);
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, institutionId: true, email: true, name: true } });
  if (!user) return null;
  const verified = await prisma.$transaction(async (tx) => {
    const claimed = await tx.verificationToken.deleteMany({ where: { token: tokenHash, expires: { gt: new Date() } } });
    if (!claimed.count) return false;
    await tx.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
    return true;
  }, { isolationLevel: "Serializable" });
  if (!verified) return null;
  const welcome = emailTemplates.welcome(user.name);
  await sendTransactionalEmail({ userId: user.id, institutionId: user.institutionId, to: user.email, kind: "WELCOME", idempotencyKey: `welcome/${user.id}`, ...welcome }).catch(() => undefined);
  return user;
}

export async function sendPasswordResetEmail(user: { id: string; institutionId?: string | null; email: string; name: string }, token: string, tokenId: string) {
  const url = `${getPublicBaseUrl().replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  await sendTransactionalEmail({ userId: user.id, institutionId: user.institutionId, to: user.email, kind: "PASSWORD_RESET", idempotencyKey: `password-reset/${tokenId}`, ...emailTemplates.passwordReset(user.name, url) });
}

export async function sendCommerceEmail(input: { kind: "PAYMENT_CONFIRMED" | "REFUND_CONFIRMED"; orderId: string }) {
  const order = await prisma.commerceOrder.findUnique({ where: { id: input.orderId }, include: { buyer: true } });
  if (!order) return;
  const amount = new Intl.NumberFormat(order.currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency: order.currency }).format(Number(order.total));
  const url = `${getPublicBaseUrl().replace(/\/+$/, "")}/checkout/${order.id}`;
  const template = input.kind === "PAYMENT_CONFIRMED" ? emailTemplates.payment(order.buyer.name, order.id, amount, url) : emailTemplates.refund(order.buyer.name, order.id, amount, url);
  await sendTransactionalEmail({ userId: order.buyerId, institutionId: order.institutionId, to: order.buyer.email, kind: input.kind, idempotencyKey: `${input.kind.toLowerCase()}/${order.id}`, metadata: { orderId: order.id }, ...template });
}

export function statusForEmailEvent(type: string): TransactionalEmailStatus | null {
  return ({
    "email.sent": "ACCEPTED", "email.delivered": "DELIVERED", "email.delivery_delayed": "DELAYED",
    "email.bounced": "BOUNCED", "email.complained": "COMPLAINED", "email.suppressed": "SUPPRESSED", "email.failed": "FAILED"
  } as Record<string, TransactionalEmailStatus>)[type] || null;
}

export async function recordEmailEvent(input: { providerEventId: string; type: string; providerMessageId: string; payloadHash: string; providerCreatedAt?: Date }) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transactionalEmailEvent.findUnique({ where: { providerEventId: input.providerEventId } });
    if (existing) return { duplicate: true };
    const email = await tx.transactionalEmail.findUnique({ where: { providerMessageId: input.providerMessageId } });
    await tx.transactionalEmailEvent.create({ data: { ...input, emailId: email?.id } });
    if (!email) return { ignored: true };
    const status = statusForEmailEvent(input.type);
    if (!status) return { ignored: true };
    const rank: Record<TransactionalEmailStatus, number> = { QUEUED: 0, ACCEPTED: 1, DELAYED: 2, DELIVERED: 3, BOUNCED: 4, FAILED: 4, SUPPRESSED: 5, COMPLAINED: 5 };
    if (rank[status] < rank[email.status]) return { ignored: true };
    const terminal = ["BOUNCED", "COMPLAINED", "SUPPRESSED", "FAILED"].includes(status);
    await tx.transactionalEmail.update({
      where: { id: email.id },
      data: { status, deliveredAt: status === "DELIVERED" ? new Date() : undefined, failedAt: terminal ? new Date() : undefined, lastErrorCode: terminal ? input.type.toUpperCase().replaceAll(".", "_") : undefined }
    });
    return { updated: true };
  }, { isolationLevel: "Serializable" });
}
