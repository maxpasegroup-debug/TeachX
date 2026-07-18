import Link from "next/link";
import type { ReactNode } from "react";
import { BadgePercent, BarChart3, Bot, CreditCard, Download, FileText, Gift, Lock, PackageCheck, ReceiptText, Sparkles, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { changeSubscriptionAction, createAICreditPackOrderAction, createCommerceInvoicePlaceholderAction, createCouponAction } from "@/features/commerce/actions";
import type { getAdminCommerceDashboard, getStudentCommerceDashboard, getTeacherCommerceDashboard } from "@/services/commerce-service";

type TeacherCommerce = Awaited<ReturnType<typeof getTeacherCommerceDashboard>>;
type StudentCommerce = Awaited<ReturnType<typeof getStudentCommerceDashboard>>;
type AdminCommerce = Awaited<ReturnType<typeof getAdminCommerceDashboard>>;

function money(value: number | string) {
  return `INR ${Number(value).toLocaleString("en-IN")}`;
}

function date(value?: Date | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value) : "Not set";
}

export function AICreditPanel({ credits }: { credits: TeacherCommerce["credits"] | StudentCommerce["credits"] }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3"><Bot className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">AI Credits</h2></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Current Balance" value={credits.balance.toString()} />
        <Metric label="Monthly Allocation" value={credits.monthlyAllocation.toString()} />
        <Metric label="Credits Used" value={credits.used.toString()} />
        <Metric label="Reset Date" value={date(credits.resetDate)} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {credits.byFeature.length ? credits.byFeature.map((item) => <div className="rounded-xl border border-border bg-background p-4" key={item.feature}><p className="font-medium">{item.feature}</p><p className="mt-1 text-sm text-muted-foreground">{item.credits} credits, {item.generations} generations</p></div>) : <EmptyState icon={<Sparkles className="h-5 w-5" />} title="No credit usage yet" description="AI usage will appear here by feature." />}
      </div>
    </Card>
  );
}

export function WalletPanel({ wallet }: { wallet: TeacherCommerce["wallet"] | StudentCommerce["wallet"] }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3"><WalletCards className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Unified Wallet</h2></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Current Balance" value={money(wallet.currentBalance)} />
        <Metric label="Pending Balance" value={money(wallet.pendingBalance)} />
        <Metric label="Lifetime Earnings" value={money(wallet.lifetimeEarnings)} />
        <Metric label="Lifetime Spending" value={money(wallet.lifetimeSpending)} />
      </div>
      <div className="mt-5 space-y-3">
        {wallet.transactions.length ? wallet.transactions.map((item) => <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4" key={item.id}><div><p className="font-medium">{item.description}</p><p className="text-sm text-muted-foreground">{item.type} - {date(item.createdAt)}</p></div><p className="font-semibold">{money(Number(item.amount))}</p></div>) : <EmptyState icon={<WalletCards className="h-5 w-5" />} title="No wallet transactions" description="Earnings, spending, credit packs, refunds, and adjustments will appear here." />}
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-background p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}

export function TeacherCommerceDashboard({ data }: { data: TeacherCommerce }) {
  return (
    <div className="space-y-8">
      <Hero eyebrow="Teacher Wallet" title="Earnings, credits, and commerce readiness." description="Track estimated earnings, pending revenue, AI credits, wallet history, and top resources. Payouts and live gateway settlement remain locked for later phases." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Estimated Earnings" value={money(data.stats.estimatedEarnings)} />
        <Metric label="Downloads" value={data.stats.downloads.toString()} />
        <Metric label="Sales" value={data.stats.sales.toString()} />
        <Metric label="Pending Revenue" value={money(data.stats.pendingRevenue)} />
      </div>
      <WalletPanel wallet={data.wallet} />
      <AICreditPanel credits={data.credits} />
      <div className="grid gap-6 xl:grid-cols-2">
        <SimplePanel title="Top Resources" icon={<Download className="h-5 w-5" />} items={data.topResources.map((item) => `${item.title} - ${item.downloads.length} downloads`)} />
        <SimplePanel title="Top Categories" icon={<BarChart3 className="h-5 w-5" />} items={data.topCategories.map((item) => `${item.name} - ${item.value}`)} />
      </div>
      <Card className="p-5 shadow-soft"><h2 className="text-xl font-semibold">Revenue Graph</h2><p className="mt-3 text-muted-foreground">Placeholder for revenue trends, category performance, and settlement aging.</p></Card>
    </div>
  );
}

export function StudentCommerceDashboard({ data }: { data: StudentCommerce }) {
  return (
    <div className="space-y-8">
      <Hero eyebrow="Student Purchases" title="Purchases, subscriptions, AI credits, and owned resources." description="A single commerce home for learning resources, credit packs, invoices, downloads, and future subscriptions." />
      <WalletPanel wallet={data.wallet} />
      <AICreditPanel credits={data.credits} />
      <CreditPackForm />
      <div className="grid gap-6 xl:grid-cols-2">
        <SimplePanel title="Owned Resources" icon={<PackageCheck className="h-5 w-5" />} items={data.ownedResources.map((item) => item.resource?.title ?? item.title)} />
        <SimplePanel title="Subscriptions" icon={<CreditCard className="h-5 w-5" />} items={data.subscriptions.map((item) => `${item.plan.name} - ${item.status} - resets ${date(item.currentPeriodEnd)}`)} />
        <OrderHistory orders={data.orders} />
        <SimplePanel title="Invoices" icon={<ReceiptText className="h-5 w-5" />} items={data.invoices.map((item) => `${item.invoiceNumber} - ${item.status} - ${money(Number(item.total))}`)} />
      </div>
    </div>
  );
}

function CreditPackForm() {
  return (
    <Card className="p-5 shadow-soft">
      <h2 className="text-xl font-semibold">AI Credit Packs</h2>
      <form action={createAICreditPackOrderAction} className="mt-5 grid gap-4 md:grid-cols-3">
        <Select name="credits"><option value="500">500 credits</option><option value="1500">1,500 credits</option><option value="5000">5,000 credits</option></Select>
        <Select name="amount"><option value="99">INR 99</option><option value="249">INR 249</option><option value="699">INR 699</option></Select>
        <Button type="submit"><Sparkles className="mr-2 h-4 w-4" />Create Order</Button>
      </form>
    </Card>
  );
}

function OrderHistory({ orders }: { orders: StudentCommerce["orders"] }) {
  return (
    <Card className="p-5 shadow-soft">
      <h2 className="text-xl font-semibold">Order History</h2>
      <div className="mt-5 space-y-3">
        {orders.length ? orders.map((order) => (
          <div className="rounded-xl border border-border bg-background p-4" key={order.id}>
            <div className="flex items-start justify-between gap-4"><div><p className="font-medium">{order.type.replaceAll("_", " ")}</p><p className="text-sm text-muted-foreground">{order.status} - {date(order.createdAt)}</p></div><p className="font-semibold">{money(Number(order.total))}</p></div>
            <form action={createCommerceInvoicePlaceholderAction} className="mt-3 flex flex-wrap gap-2">
              <input name="orderId" type="hidden" value={order.id} />
              <button className="rounded-xl border border-border px-3 py-2 text-sm" type="submit">Invoice Placeholder</button>
            </form>
          </div>
        )) : <EmptyState icon={<FileText className="h-5 w-5" />} title="No orders yet" description="Resource purchases, subscriptions, credit packs, and reservations will appear here." />}
      </div>
    </Card>
  );
}

export function AdminCommerceDashboard({ data, section = "overview" }: { data: AdminCommerce; section?: string }) {
  return (
    <div className="space-y-8">
      <Hero eyebrow="Admin Commerce" title="Commerce OS control room." description="Subscriptions, orders, transactions, wallets, AI usage, coupons, billing placeholders, and provider readiness in one calm operating layer." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Metric label="Revenue" value={money(data.stats.revenue)} />
        <Metric label="Pending" value={money(data.stats.pending)} />
        <Metric label="Orders" value={data.stats.orders.toString()} />
        <Metric label="Subscriptions" value={data.stats.activeSubscriptions.toString()} />
        <Metric label="Wallets" value={data.stats.wallets.toString()} />
        <Metric label="AI Credits Used" value={data.stats.aiCreditsUsed.toString()} />
      </div>
      {section === "subscriptions" || section === "overview" ? <PlanCatalog data={data} /> : null}
      {section === "orders" || section === "overview" ? <AdminOrders data={data} /> : null}
      {section === "transactions" || section === "overview" ? <AdminTransactions data={data} /> : null}
      {section === "wallets" ? <SimplePanel title="Wallet Overview" icon={<WalletCards className="h-5 w-5" />} items={data.wallets.map((item) => `${item.user.name} - ${money(Number(item.balance))} balance - ${money(Number(item.pendingBalance))} pending`)} /> : null}
      {section === "ai-usage" ? <SimplePanel title="AI Usage Summary" icon={<Bot className="h-5 w-5" />} items={data.aiUsage.map((item) => `${item.feature} - ${Math.ceil((item._sum.totalTokens ?? 0) / 100)} credits - ${item._count} generations`)} /> : null}
      {section === "revenue" ? <Card className="p-5 shadow-soft"><h2 className="text-xl font-semibold">Revenue Dashboard</h2><p className="mt-3 text-muted-foreground">Placeholder for revenue graph, gateway split, GST summaries, settlement aging, and cohort revenue.</p></Card> : null}
      {section === "coupons" || section === "overview" ? <CouponPanel data={data} /> : null}
      <ProviderPanel data={data} />
    </div>
  );
}

function PlanCatalog({ data }: { data: AdminCommerce }) {
  return (
    <Card className="p-5 shadow-soft">
      <h2 className="text-xl font-semibold">Subscription Plans</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.plans.map((plan) => (
          <div className="rounded-2xl border border-border bg-background p-5" key={plan.id}>
            <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold">{plan.name}</h3><Badge>{plan.audience}</Badge></div>
            <p className="mt-3 text-2xl font-semibold">{money(Number(plan.price))}</p>
            <p className="mt-2 text-sm text-muted-foreground">{plan.aiMonthlyCredits} AI credits - {plan.resourceLimit} resources - {plan.storageLimitMb} MB storage</p>
            <form action={changeSubscriptionAction} className="mt-4">
              <input name="planId" type="hidden" value={plan.id} />
              <Button className="w-full" type="submit" variant="secondary">Select Plan</Button>
            </form>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AdminOrders({ data }: { data: AdminCommerce }) {
  return <SimplePanel title="Orders" icon={<PackageCheck className="h-5 w-5" />} items={data.orders.map((order) => `${order.buyer.name} - ${order.type.replaceAll("_", " ")} - ${order.status} - ${money(Number(order.total))}`)} />;
}

function AdminTransactions({ data }: { data: AdminCommerce }) {
  return <SimplePanel title="Transactions" icon={<WalletCards className="h-5 w-5" />} items={data.transactions.map((item) => `${item.user.name} - ${item.type} - ${money(Number(item.amount))} - ${item.pending ? "Pending" : "Posted"}`)} />;
}

function CouponPanel({ data }: { data: AdminCommerce }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3"><Gift className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Promotions</h2></div>
      <form action={createCouponAction} className="mt-5 grid gap-4 md:grid-cols-5">
        <Input name="code" placeholder="Coupon code" />
        <Input name="campaign" placeholder="Campaign" />
        <Select name="discountType"><option>PERCENTAGE</option><option>FIXED</option></Select>
        <Input name="discountValue" placeholder="Discount" />
        <Button type="submit"><BadgePercent className="mr-2 h-4 w-4" />Save Coupon</Button>
        <Textarea className="md:col-span-5" name="description" placeholder="Description" />
      </form>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.coupons.length ? data.coupons.map((coupon) => <div className="rounded-xl border border-border bg-background p-4" key={coupon.id}><p className="font-semibold">{coupon.code}</p><p className="text-sm text-muted-foreground">{coupon.campaign ?? "Campaign"} - {coupon.discountType} - {coupon.usedCount} used</p></div>) : <EmptyState icon={<Gift className="h-5 w-5" />} title="No coupons yet" description="Coupon, referral, campaign, discount, and voucher architecture is ready." />}
      </div>
    </Card>
  );
}

function ProviderPanel({ data }: { data: AdminCommerce }) {
  return (
    <Card className="p-5 shadow-soft">
      <h2 className="text-xl font-semibold">Payment Gateway Providers</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {data.providers.map((provider) => <div className="rounded-2xl border border-dashed border-border bg-background p-5" key={provider.key}><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{provider.name}</h3><Badge><Lock className="mr-1 h-3 w-3" />{provider.status}</Badge></div><p className="mt-3 text-sm text-muted-foreground">{provider.supports.join(", ")}</p></div>)}
      </div>
    </Card>
  );
}

function SimplePanel({ title, icon, items }: { title: string; icon: ReactNode; items: string[] }) {
  return <Card className="p-5 shadow-soft"><div className="flex items-center gap-3 text-sky-700">{icon}<h2 className="text-xl font-semibold text-foreground">{title}</h2></div><div className="mt-5 space-y-3">{items.length ? items.map((item) => <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm" key={item}>{item}</p>) : <EmptyState icon={<FileText className="h-5 w-5" />} title={`No ${title.toLowerCase()} yet`} description="Commerce activity will appear here." />}</div></Card>;
}

function Hero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8"><Badge>{eyebrow}</Badge><h1 className="mt-6 text-4xl font-semibold tracking-tight">{title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p></section>;
}
