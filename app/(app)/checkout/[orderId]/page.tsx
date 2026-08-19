import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckoutPaymentActions } from "@/components/commerce/checkout-payment-actions";
import { prisma } from "@/lib/db";
import { getPaymentConfig } from "@/lib/payments/config";
import { paymentProviders } from "@/services/commerce-service";

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency }).format(value);
}

function providerState() {
  const config = getPaymentConfig();
  return { razorpayReady: config.razorpay, stripeReady: config.stripe, live: config.live };
}

export default async function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (!session?.user.id) redirect("/login");

  const { orderId } = await params;
  const canReviewInstitutionOrders = session.user.roles.some((role) => ["ADMIN", "DIRECTOR"].includes(role));
  const order = await prisma.commerceOrder.findFirst({
    where: {
      id: orderId,
      OR: [
        { buyerId: session.user.id },
        ...(canReviewInstitutionOrders ? [{ institutionId: session.user.institutionId }] : [])
      ]
    },
    include: { buyer: true, items: { include: { plan: true } }, invoices: true }
  });
  if (!order) notFound();

  const state = providerState();
  const isPaid = ["PAID", "FULFILLED"].includes(order.status);
  const isFree = Number(order.total) === 0;
  const providerReady = order.currency === "INR" ? state.razorpayReady : state.stripeReady;
  const payable = state.live && providerReady && order.status === "PENDING_PAYMENT" && !isFree;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>Checkout</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Review your order</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
          Pay through the provider selected for your billing currency. Access activates only after TeachX verifies the provider&apos;s signed payment event.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{order.items.map((item) => item.title).join(", ")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Order {order.id}</p>
            </div>
            <Badge>{order.status}</Badge>
          </div>
          <div className="mt-6 space-y-3">
            {order.items.map((item) => (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4" key={item.id}>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.itemType.replaceAll("_", " ")}{item.plan ? ` - ${item.plan.aiMonthlyCredits} AI credits/month` : ""}</p>
                </div>
                <p className="font-semibold">{money(Number(item.total), order.currency)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-border pt-5">
            <div className="flex justify-between text-sm"><span>Subtotal</span><strong>{money(Number(order.subtotal), order.currency)}</strong></div>
            <div className="mt-2 flex justify-between text-sm"><span>Discount</span><strong>{money(Number(order.discount), order.currency)}</strong></div>
            <div className="mt-2 flex justify-between text-sm"><span>Tax</span><strong>{money(Number(order.tax), order.currency)}</strong></div>
            <div className="mt-4 flex justify-between text-lg"><span>Total</span><strong>{money(Number(order.total), order.currency)}</strong></div>
          </div>
        </Card>

        <Card className="h-fit p-5 shadow-soft">
          <CreditCard className="h-5 w-5 text-sky-700" />
          <h2 className="mt-4 text-xl font-semibold">Payment status</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isPaid || isFree ? "This order does not need payment." : payable ? "Secure checkout is ready. Closing the browser after payment will not interrupt verification." : "Checkout remains locked until provider, tax, refund, and reconciliation controls are verified."}
          </p>
          <div className="mt-5 space-y-3">
            {paymentProviders.map((provider) => {
              const ready = provider.key === "razorpay" ? state.razorpayReady : state.stripeReady;
              return (
                <div className="rounded-xl border border-border bg-background p-4" key={provider.key}>
                  <div className="flex items-center justify-between gap-3">
                    <strong>{provider.name}</strong>
                    <Badge>{ready ? "Configured" : "Unavailable"}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{provider.supports.join(", ")}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
            <Lock className="mr-2 inline h-4 w-4" />
            Browser responses never grant access. Only signed Stripe or Razorpay events can fulfil this order.
          </div>
          {!isPaid && !isFree ? <CheckoutPaymentActions enabled={payable} orderId={order.id} /> : null}
          <Link className="mt-5 inline-flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-foreground" href="/teacher/business/subscription">
            Back to subscription
          </Link>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-sky-700" />
          <p className="text-sm leading-6 text-muted-foreground">
            Launch rule: pending payment orders grant no paid subscription, entitlement, payout, or invoice finalization until a trusted gateway event confirms payment.
          </p>
        </div>
      </Card>
    </div>
  );
}
