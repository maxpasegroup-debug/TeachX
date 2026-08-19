import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { getRequestId } from "@/lib/observability/request-context";
import { paymentReadiness } from "@/services/payment-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession("finance.manage");
  if ("response" in access) return access.response;
  const requestId = await getRequestId();
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  const config = paymentReadiness();
  const [failedEvents, pendingOrders, recentProcessed] = await Promise.all([
    prisma.commercePaymentEvent.count({ where: { institutionId, status: "FAILED", receivedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.commerceOrder.count({ where: { institutionId, status: "PENDING_PAYMENT", total: { gt: 0 } } }),
    prisma.commercePaymentEvent.count({ where: { institutionId, status: "PROCESSED", receivedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
  ]);
  return NextResponse.json({
    ok: config.live && failedEvents === 0,
    providers: { stripe: config.stripe, razorpay: config.razorpay },
    controls: { tax: config.taxReady, refunds: config.refundsReady, reconciliation: config.reconciliationReady },
    evidence: { failedEvents24h: failedEvents, processedEvents24h: recentProcessed, pendingOrders },
    requestId
  });
}
