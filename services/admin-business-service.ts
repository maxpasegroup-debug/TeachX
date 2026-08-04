import { prisma } from "@/lib/db";

/** Read-only platform commerce aggregation. It deliberately reuses the existing
 * order, subscription, wallet, invoice, coupon and payment records. */
export async function getAdminBusinessData(userId?: string) {
  const since = new Date(Date.now() - 30 * 86400000);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [orders, subscriptions, plans, wallets, coupons, invoices, payments, preference] = await Promise.all([
    prisma.commerceOrder.findMany({ where: { createdAt: { gte: since } }, include: { institution: { select: { name: true } }, buyer: { select: { name: true } }, items: { include: { seller: { select: { name: true } } } }, coupon: { select: { code: true } } }, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.userSubscription.findMany({ include: { plan: true, institution: { select: { name: true } }, user: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 500 }),
    prisma.subscriptionPlan.findMany({ orderBy: { updatedAt: "desc" }, take: 200 }),
    prisma.wallet.findMany({ include: { institution: { select: { name: true } }, user: { select: { name: true } }, transactions: { orderBy: { createdAt: "desc" }, take: 20 } }, take: 500 }),
    prisma.coupon.findMany({ include: { institution: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 300 }),
    prisma.commerceInvoice.findMany({ include: { institution: { select: { name: true } }, buyer: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.payment.findMany({ where: { createdAt: { gte: since } }, include: { institution: { select: { name: true } }, method: true }, orderBy: { createdAt: "desc" }, take: 500 }),
    userId ? prisma.userPreference.findUnique({ where: { userId_key: { userId, key: "adminx.business.preferences" } } }) : null
  ]);
  const number = (value: unknown) => Number(value ?? 0);
  const paidOrders = orders.filter((x) => String(x.status) === "PAID" || String(x.status) === "COMPLETED");
  const sum = (rows: typeof orders) => rows.reduce((total, x) => total + number(x.total), 0);
  const total = sum(paidOrders); const todayRevenue = sum(paidOrders.filter(x => x.createdAt >= today));
  const byType = [...new Set(orders.map(x => String(x.type)))].map(type => { const rows = paidOrders.filter(x => String(x.type) === type); return { type, orders: rows.length, revenue: sum(rows) }; });
  const sellerRevenue = paidOrders.flatMap(order => order.items.map(item => ({ seller: item.seller?.name ?? "Platform / unassigned", amount: number(item.total), order: order.id, createdAt: order.createdAt }))).sort((a,b) => b.amount-a.amount);
  const activeSubscriptions = subscriptions.filter(x => String(x.status) === "ACTIVE");
  const expiring = subscriptions.filter(x => x.currentPeriodEnd && x.currentPeriodEnd >= today && x.currentPeriodEnd <= new Date(Date.now()+30*86400000));
  const pendingWallet = wallets.reduce((n,x)=>n+number(x.pendingBalance),0);
  return { orders, subscriptions, plans, wallets, coupons, invoices, payments, byType, sellerRevenue, preference: preference?.value ?? { compact: false, format: "csv" },
    summary: { todayRevenue, monthRevenue: total, annualized: total * 12, paidOrders: paidOrders.length, activeSubscriptions: activeSubscriptions.length, expiring: expiring.length, pendingWallet, invoiceOutstanding: invoices.filter(x => !["PAID", "CANCELLED"].includes(String(x.status))).reduce((n,x)=>n+number(x.total),0) },
    readiness: { mrr: "MRR/ARR, churn, profit, CAC, LTV, chargebacks, refunds, and forecasts require governed recurring-revenue, cost, and gateway-event sources. They are not inferred from order totals.", payout: "Wallet balances and transactions are existing evidence. Settlement queues, payout approvals, and payout execution remain in the existing wallet/commerce workflows.", tax: "Invoice records are shown as stored. Tax compliance, credit notes, GST reporting, and gateway reconciliation require their governed source workflows.", settings: "Business settings are presentation-only here. Tax, currency, gateway, commission and settlement rules remain owned by existing commerce configuration." }
  };
}
