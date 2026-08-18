import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { paymentProviders } from "@/services/commerce-service";

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency }).format(value);
}

function providerState() {
  const razorpayReady = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  return { razorpayReady, stripeReady };
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>Checkout</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Review your order</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
          TeachX has created a secure commerce order. Paid access activates after a live Razorpay or Stripe payment event is connected and verified.
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
            {isPaid || isFree ? "This order does not need live checkout." : "Live checkout is locked until provider credentials, webhooks, and settlement checks are enabled."}
          </p>
          <div className="mt-5 space-y-3">
            {paymentProviders.map((provider) => {
              const ready = provider.key === "razorpay" ? state.razorpayReady : state.stripeReady;
              return (
                <div className="rounded-xl border border-border bg-background p-4" key={provider.key}>
                  <div className="flex items-center justify-between gap-3">
                    <strong>{provider.name}</strong>
                    <Badge>{ready ? "Keys detected" : "Keys missing"}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{provider.supports.join(", ")}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
            <Lock className="mr-2 inline h-4 w-4" />
            Payment buttons intentionally remain disabled until gateway SDK, webhook verification, refund handling, and tax invoices are enabled.
          </div>
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
