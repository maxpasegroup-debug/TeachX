import "server-only";

import { createHash } from "node:crypto";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getPublicBaseUrl } from "@/lib/env";
import { captureOperationalError } from "@/lib/observability/logger";
import { getPaymentConfig, minorAmount } from "@/lib/payments/config";
import { createRazorpayOrder, createRazorpayRefund, stripe } from "@/lib/payments/providers";
import { sendCommerceEmail } from "@/services/transactional-email-service";

export async function getPaymentOverview(institutionId?: string | null) {
  if (!institutionId) return { methods: [], payments: [] };
  const [methods, payments] = await Promise.all([
    prisma.paymentMethod.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.payment.findMany({ where: { institutionId }, include: { student: true, studentFee: { include: { feeHead: true } }, method: true, receipt: true }, orderBy: { paidAt: "desc" } })
  ]);
  return { methods, payments };
}

export async function receivePayment(input: { institutionId: string; studentId: string; amount: string; studentFeeId?: string; methodId?: string; reference?: string }) {
  return prisma.payment.create({ data: input });
}

type Provider = "stripe" | "razorpay";
type PaymentSignal = {
  provider: Provider;
  providerEventId: string;
  type: string;
  kind: "paid" | "failed" | "refunded" | "ignored";
  payloadHash: string;
  orderId?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  providerRefundId?: string;
  amountMinor?: bigint;
  currency?: string;
};

type OrderForPayment = Prisma.CommerceOrderGetPayload<{
  include: { buyer: true; items: { include: { plan: true } }; invoices: true };
}>;

function jsonObject(value: Prisma.JsonValue | null) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, Prisma.JsonValue> : {};
}

function periodEnd(order: OrderForPayment, now: Date) {
  const interval = order.items.find((item) => item.plan)?.plan?.interval;
  const end = new Date(now);
  if (interval === "YEARLY") end.setUTCFullYear(end.getUTCFullYear() + 1);
  else if (interval === "ONE_TIME") end.setUTCFullYear(end.getUTCFullYear() + 100);
  else end.setUTCMonth(end.getUTCMonth() + 1);
  return end;
}

export async function createPaymentCheckout(input: { orderId: string; userId: string }) {
  const config = getPaymentConfig();
  if (!config.live) throw new Error("Live payments are not ready.");
  const order = await prisma.commerceOrder.findFirst({
    where: { id: input.orderId, buyerId: input.userId },
    include: { buyer: true, items: { include: { plan: true } }, invoices: true }
  });
  if (!order || order.status !== "PENDING_PAYMENT" || Number(order.total) <= 0) throw new Error("Order is not payable.");

  const amount = minorAmount(order.total);
  if (order.currency.toUpperCase() === "INR") {
    if (!config.razorpay) throw new Error("INR checkout is not configured.");
    let providerOrderId = order.gateway === "razorpay" ? order.gatewayOrderId : null;
    if (!providerOrderId) {
      const providerOrder = await createRazorpayOrder({ amount, currency: "INR", orderId: order.id });
      providerOrderId = typeof providerOrder.id === "string" ? providerOrder.id : null;
      if (!providerOrderId) throw new Error("Razorpay did not return an order identifier.");
      await prisma.commerceOrder.update({ where: { id: order.id }, data: { gateway: "razorpay", gatewayOrderId: providerOrderId } });
    }
    return {
      provider: "razorpay" as const,
      providerOrderId,
      keyId: process.env.RAZORPAY_KEY_ID!,
      amount: Number(amount),
      currency: "INR",
      name: process.env.PAYMENT_MERCHANT_LEGAL_NAME || "TeachX",
      description: order.items.map((item) => item.title).join(", ").slice(0, 255),
      prefill: { name: order.buyer.name, email: order.buyer.email }
    };
  }

  if (!config.stripe) throw new Error("International checkout is not configured.");
  if (order.gateway === "stripe" && order.gatewayOrderId) {
    const existing = await stripe().checkout.sessions.retrieve(order.gatewayOrderId);
    if (existing.url && existing.status === "open") return { provider: "stripe" as const, redirectUrl: existing.url };
  }

  const baseUrl = getPublicBaseUrl().replace(/\/+$/, "");
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.id,
    customer_email: order.buyer.email,
    billing_address_collection: "required",
    success_url: `${baseUrl}/checkout/${order.id}?payment=processing`,
    cancel_url: `${baseUrl}/checkout/${order.id}?payment=cancelled`,
    metadata: { teachx_order_id: order.id },
    payment_intent_data: { metadata: { teachx_order_id: order.id } },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: order.currency.toLowerCase(),
        unit_amount: Number(amount),
        product_data: { name: order.items.map((item) => item.title).join(", ").slice(0, 255), metadata: { teachx_order_id: order.id } }
      }
    }]
  }, { idempotencyKey: `teachx-checkout-${order.id}` });
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  await prisma.commerceOrder.update({ where: { id: order.id }, data: { gateway: "stripe", gatewayOrderId: session.id } });
  return { provider: "stripe" as const, redirectUrl: session.url };
}

async function fulfil(tx: Prisma.TransactionClient, order: OrderForPayment, signal: PaymentSignal) {
  const now = new Date();
  const changed = await tx.commerceOrder.updateMany({
    where: { id: order.id, status: "PENDING_PAYMENT" },
    data: { status: "PAID", gatewayPaymentId: signal.providerPaymentId, paidAt: now }
  });
  if (!changed.count) return false;

  const subscriptionItem = order.items.find((item) => item.itemType === "SUBSCRIPTION" && item.planId && item.plan);
  if (subscriptionItem?.planId && subscriptionItem.plan) {
    await tx.userSubscription.updateMany({
      where: { userId: order.buyerId, institutionId: order.institutionId, status: { in: ["ACTIVE", "TRIALING"] }, plan: { audience: subscriptionItem.plan.audience } },
      data: { status: "EXPIRED" }
    });
    await tx.userSubscription.upsert({
      where: { id: `payment-subscription-${order.id}` },
      update: { status: "ACTIVE", currentPeriodStart: now, currentPeriodEnd: periodEnd(order, now), cancelAtPeriodEnd: true },
      create: {
        id: `payment-subscription-${order.id}`,
        institutionId: order.institutionId,
        userId: order.buyerId,
        planId: subscriptionItem.planId,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd(order, now),
        cancelAtPeriodEnd: true,
        metadata: { source: signal.provider, orderId: order.id, prepaidPeriod: true }
      }
    });
  }

  for (const item of order.items) {
    const metadata = jsonObject(item.metadata);
    if (item.itemType === "RESOURCE" && item.resourceId && typeof metadata.listingId === "string") {
      await tx.marketplaceEntitlement.upsert({
        where: { userId_contentItemId: { userId: order.buyerId, contentItemId: item.resourceId } },
        update: { status: "ACTIVE", revokedAt: null, orderId: order.id },
        create: {
          id: `payment-entitlement-${order.id}-${item.id}`,
          userId: order.buyerId,
          contentItemId: item.resourceId,
          listingId: metadata.listingId,
          orderId: order.id,
          status: "ACTIVE",
          license: typeof metadata.license === "string" ? metadata.license : "PERSONAL"
        }
      });
    }
    if (item.itemType === "AI_CREDITS") {
      await tx.walletTransaction.updateMany({ where: { orderId: order.id, userId: order.buyerId, type: "HOLD", pending: true }, data: { type: "CREDIT", pending: false, description: `${String(metadata.credits || "AI")} credits purchased` } });
    }
    if (item.sellerId && Number(item.total) > 0) {
      const wallet = await tx.wallet.upsert({
        where: { userId_currency: { userId: item.sellerId, currency: order.currency } },
        update: {},
        create: { userId: item.sellerId, institutionId: order.institutionId, currency: order.currency }
      });
      await tx.walletTransaction.create({
        data: {
          id: `payment-earning-${order.id}-${item.id}`,
          institutionId: order.institutionId,
          walletId: wallet.id,
          userId: item.sellerId,
          orderId: order.id,
          type: "EARNING",
          amount: item.total,
          description: `Sale: ${item.title}`,
          metadata: { provider: signal.provider, providerPaymentId: signal.providerPaymentId }
        }
      });
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: item.total }, lifetimeEarnings: { increment: item.total } } });
    }
  }

  const invoiceData = {
    status: "ISSUED" as const,
    billingName: order.buyer.name,
    billingEmail: order.buyer.email,
    businessDetails: {
      legalName: process.env.PAYMENT_MERCHANT_LEGAL_NAME,
      address: process.env.PAYMENT_MERCHANT_ADDRESS,
      taxId: process.env.PAYMENT_MERCHANT_TAX_ID || undefined,
      pricesIncludeTax: process.env.PAYMENT_PRICES_INCLUDE_TAX === "true"
    },
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    metadata: { provider: signal.provider, providerPaymentId: signal.providerPaymentId, immutablePaymentEvidence: true }
  };
  if (order.invoices[0]) await tx.commerceInvoice.update({ where: { id: order.invoices[0].id }, data: invoiceData });
  else await tx.commerceInvoice.create({ data: { id: `payment-invoice-${order.id}`, institutionId: order.institutionId, orderId: order.id, buyerId: order.buyerId, invoiceNumber: `TX-${order.id.slice(-24).toUpperCase()}`, ...invoiceData } });

  await tx.notification.create({ data: { userId: order.buyerId, institutionId: order.institutionId, title: "Payment confirmed", body: "Your order has been verified and fulfilled.", link: `/checkout/${order.id}` } });
  await tx.commerceOrder.update({ where: { id: order.id }, data: { status: "FULFILLED" } });
  return true;
}

async function reverse(tx: Prisma.TransactionClient, order: OrderForPayment, signal: PaymentSignal) {
  const changed = await tx.commerceOrder.updateMany({ where: { id: order.id, status: { in: ["PAID", "FULFILLED", "REFUND_PENDING"] } }, data: { status: "REFUNDED", refundedAt: new Date() } });
  if (!changed.count) return false;
  await tx.userSubscription.updateMany({ where: { id: `payment-subscription-${order.id}` }, data: { status: "EXPIRED", currentPeriodEnd: new Date() } });
  await tx.marketplaceEntitlement.updateMany({ where: { orderId: order.id }, data: { status: "REVOKED", revokedAt: new Date() } });

  const credits = await tx.walletTransaction.findMany({ where: { orderId: order.id, userId: order.buyerId, type: "CREDIT" } });
  for (const credit of credits) {
    await tx.walletTransaction.upsert({
      where: { id: `payment-refund-credit-${credit.id}` },
      update: {},
      create: { id: `payment-refund-credit-${credit.id}`, institutionId: order.institutionId, walletId: credit.walletId, userId: credit.userId, orderId: order.id, type: "REFUND", amount: credit.amount, description: "AI credit purchase refunded", metadata: { providerRefundId: signal.providerRefundId, creditType: "AI" } }
    });
  }

  const earnings = await tx.walletTransaction.findMany({ where: { orderId: order.id, type: "EARNING" } });
  for (const earning of earnings) {
    await tx.walletTransaction.create({ data: { id: `payment-refund-earning-${earning.id}`, institutionId: order.institutionId, walletId: earning.walletId, userId: earning.userId, orderId: order.id, type: "REFUND", amount: earning.amount, description: "Sale refunded", metadata: { providerRefundId: signal.providerRefundId } } });
    await tx.wallet.update({ where: { id: earning.walletId }, data: { balance: { decrement: earning.amount }, lifetimeEarnings: { decrement: earning.amount } } });
  }

  const invoice = order.invoices[0];
  if (invoice) await tx.commerceInvoice.update({ where: { id: invoice.id }, data: { status: "CANCELLED" } });
  await tx.commerceCreditNote.create({
    data: {
      id: `payment-credit-note-${order.id}`,
      institutionId: order.institutionId,
      orderId: order.id,
      invoiceId: invoice?.id,
      creditNoteNumber: `TX-CN-${order.id.slice(-20).toUpperCase()}`,
      provider: signal.provider,
      providerRefundId: signal.providerRefundId!,
      amount: order.total,
      currency: order.currency,
      reason: "Full provider refund",
      metadata: { providerPaymentId: signal.providerPaymentId }
    }
  });
  await tx.notification.create({ data: { userId: order.buyerId, institutionId: order.institutionId, title: "Refund confirmed", body: "Your full refund was confirmed and paid access was reversed.", link: `/checkout/${order.id}` } });
  return true;
}

export async function recordPaymentSignal(signal: PaymentSignal) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.commercePaymentEvent.upsert({
        where: { provider_providerEventId: { provider: signal.provider, providerEventId: signal.providerEventId } },
        update: {},
        create: {
          provider: signal.provider,
          providerEventId: signal.providerEventId,
          type: signal.type,
          providerPaymentId: signal.providerPaymentId,
          providerRefundId: signal.providerRefundId,
          amountMinor: signal.amountMinor,
          currency: signal.currency?.toUpperCase(),
          payloadHash: signal.payloadHash,
          metadata: { providerOrderId: signal.providerOrderId }
        }
      });
      if (event.status !== "RECEIVED") return { duplicate: true };

      const hasOrderLocator = signal.kind === "refunded"
        ? Boolean(signal.providerPaymentId)
        : Boolean(signal.orderId || signal.providerOrderId);
      if (!hasOrderLocator) {
        await tx.commercePaymentEvent.update({ where: { id: event.id }, data: { status: "FAILED", failureCode: "ORDER_LOCATOR_MISSING" } });
        return { failed: "ORDER_LOCATOR_MISSING" };
      }

      const order = await tx.commerceOrder.findFirst({
        where: signal.kind === "refunded"
          ? { gatewayPaymentId: signal.providerPaymentId }
          : { OR: [{ id: signal.orderId }, { gatewayOrderId: signal.providerOrderId }] },
        include: { buyer: true, items: { include: { plan: true } }, invoices: true }
      });
      if (!order) {
        await tx.commercePaymentEvent.update({ where: { id: event.id }, data: { status: "FAILED", failureCode: "ORDER_NOT_FOUND" } });
        return { failed: "ORDER_NOT_FOUND" };
      }

      const amountMatches = signal.amountMinor === undefined || signal.amountMinor === minorAmount(order.total);
      const currencyMatches = !signal.currency || signal.currency.toUpperCase() === order.currency.toUpperCase();
      const providerMatches = order.gateway === signal.provider;
      const identifiersPresent = signal.kind === "paid" ? Boolean(signal.providerPaymentId) : signal.kind === "refunded" ? Boolean(signal.providerPaymentId && signal.providerRefundId) : true;
      if (!amountMatches || !currencyMatches || !providerMatches || !identifiersPresent) {
        const failureCode = !providerMatches ? "PROVIDER_MISMATCH" : !identifiersPresent ? "PROVIDER_IDENTIFIER_MISSING" : "AMOUNT_OR_CURRENCY_MISMATCH";
        await tx.commercePaymentEvent.update({ where: { id: event.id }, data: { status: "FAILED", institutionId: order.institutionId, orderId: order.id, failureCode } });
        return { failed: failureCode };
      }

      let changed = false;
      if (signal.kind === "paid") changed = await fulfil(tx, order, signal);
      else if (signal.kind === "refunded") changed = await reverse(tx, order, signal);
      else if (signal.kind === "failed" && signal.providerRefundId) {
        const restored = await tx.commerceOrder.updateMany({ where: { id: order.id, status: "REFUND_PENDING" }, data: { status: "FULFILLED" } });
        changed = restored.count > 0;
      }
      await tx.commercePaymentEvent.update({
        where: { id: event.id },
        data: { status: signal.kind === "failed" ? "FAILED" : signal.kind === "ignored" ? "IGNORED" : "PROCESSED", institutionId: order.institutionId, orderId: order.id, processedAt: new Date(), failureCode: signal.kind === "failed" ? "PROVIDER_PAYMENT_FAILED" : undefined }
      });
      return { duplicate: !changed, orderId: order.id, emailKind: changed && signal.kind === "paid" ? "PAYMENT_CONFIRMED" as const : changed && signal.kind === "refunded" ? "REFUND_CONFIRMED" as const : undefined };
    }, { isolationLevel: "Serializable" });
    if ("failed" in result) throw new Error(`Payment event rejected: ${result.failed}.`);
    if ("emailKind" in result && result.emailKind && "orderId" in result && result.orderId) {
      await sendCommerceEmail({ kind: result.emailKind, orderId: result.orderId }).catch(() => undefined);
    }
    return result;
  } catch (error) {
    captureOperationalError(error, "payment.event.failed", { provider: signal.provider, eventType: signal.type, providerEventId: signal.providerEventId });
    throw error;
  }
}

export function payloadHash(rawBody: string) {
  return createHash("sha256").update(rawBody).digest("hex");
}

export async function requestFullRefund(input: { orderId: string; institutionId: string }) {
  const config = getPaymentConfig();
  if (!config.live || !config.refundsReady) throw new Error("Refund operations are not ready.");
  const order = await prisma.commerceOrder.findFirst({ where: { id: input.orderId, institutionId: input.institutionId, status: "FULFILLED" } });
  if (!order?.gatewayPaymentId || !order.gateway) throw new Error("A refundable provider payment was not found.");
  const claimed = await prisma.commerceOrder.updateMany({ where: { id: order.id, status: "FULFILLED" }, data: { status: "REFUND_PENDING" } });
  if (!claimed.count) throw new Error("A refund is already pending or complete.");
  const amount = minorAmount(order.total);
  try {
    if (order.gateway === "stripe") {
      const refund = await stripe().refunds.create({ payment_intent: order.gatewayPaymentId, reason: "requested_by_customer", metadata: { teachx_order_id: order.id } }, { idempotencyKey: `teachx-refund-${order.id}` });
      return { provider: "stripe", refundId: refund.id, state: refund.status };
    }
    if (order.gateway === "razorpay") {
      const refund = await createRazorpayRefund(order.gatewayPaymentId, amount, order.id);
      return { provider: "razorpay", refundId: String(refund.id || "submitted"), state: String(refund.status || "submitted") };
    }
    throw new Error("Unsupported payment provider.");
  } catch (error) {
    await prisma.commerceOrder.updateMany({ where: { id: order.id, status: "REFUND_PENDING" }, data: { status: "FULFILLED" } });
    throw error;
  }
}

export function paymentReadiness() {
  return getPaymentConfig();
}
