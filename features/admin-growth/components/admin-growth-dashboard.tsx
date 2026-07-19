import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, BarChart3, Bot, CreditCard, Download, Flag, LifeBuoy, Megaphone, Search, Settings, Shield, Sparkles, Store, UsersRound, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSupportTicketAction, recordPlatformMetricAction, saveFeatureFlagAction, saveSystemSettingAction, updateSupportTicketAction } from "@/features/admin-growth/actions";
import { LaunchIntelligenceDashboard } from "@/features/launch-intelligence/components/launch-intelligence-dashboard";
import type { getAdminGrowthOS } from "@/services/admin-growth-service";

type GrowthData = Awaited<ReturnType<typeof getAdminGrowthOS>>;

function money(value: number) {
  return `INR ${Number(value).toLocaleString("en-IN")}`;
}

function date(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export function AdminGrowthDashboard({ data, section = "home" }: { data: GrowthData; section?: string }) {
  return (
    <div className="space-y-8">
      <Hero title="TeachX Growth OS" description="Executive control center for users, growth, AI, marketplace, commerce, community, content, support, audit, reports, and platform settings." />
      {section === "home" ? <AdminHome data={data} /> : null}
      {section === "platform-analytics" ? <PlatformAnalytics data={data} /> : null}
      {section === "ai-analytics" ? <AIAnalytics data={data} /> : null}
      {section === "marketplace-analytics" ? <MarketplaceAnalytics data={data} /> : null}
      {section === "commerce-analytics" ? <CommerceAnalytics data={data} /> : null}
      {section === "community-analytics" ? <CommunityAnalytics data={data} /> : null}
      {section === "content-management" ? <ContentManagement data={data} /> : null}
      {section === "user-management" ? <UserManagement data={data} /> : null}
      {section === "moderation" ? <Moderation data={data} /> : null}
      {section === "support" ? <SupportCenter data={data} /> : null}
      {section === "system-settings" ? <SystemSettings data={data} /> : null}
      {section === "audit-log" ? <AuditLogPanel data={data} /> : null}
      {section === "automation" ? <AutomationPanel data={data} /> : null}
      {section === "reports" ? <ReportsPanel data={data} /> : null}
    </div>
  );
}

function AdminHome({ data }: { data: GrowthData }) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Users" value={data.overview.users.toString()} detail={`${data.overview.activeUsers} active`} />
        <Metric label="Teachers" value={data.overview.teachers.toString()} detail="Creator supply" />
        <Metric label="Students" value={data.overview.students.toString()} detail="Learner demand" />
        <Metric label="Revenue" value={money(data.overview.revenue)} detail="Placeholder until live checkout" />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Today's Activity" icon={<Activity className="h-5 w-5" />} items={data.operations.activities.slice(0, 8).map((item) => `${item.title} - ${item.actor?.name ?? "System"} - ${date(item.createdAt)}`)} />
        <Panel title="System Health" icon={<Shield className="h-5 w-5" />} items={data.operations.systemHealth.map((item) => `${item.label}: ${item.value}`)} />
      </section>
      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="Growth Metrics" icon={<BarChart3 className="h-5 w-5" />} items={data.users.growthTrends.map((item) => `${item.label}: ${item.value}`)} />
        <Panel title="AI Usage" icon={<Bot className="h-5 w-5" />} items={[`${data.ai.generations} generations`, `${data.ai.creditsUsed} credits used`, `${money(data.ai.estimatedCost)} estimated cost`, data.ai.averageResponseTimePlaceholder]} />
        <Panel title="Pending Reviews" icon={<Flag className="h-5 w-5" />} items={data.operations.pendingReviews.map((item) => `${item.type}: ${item.title}`)} />
      </section>
      <LaunchIntelligenceDashboard data={data} />
      <QuickActions />
      <Panel title="Recent Events" icon={<Sparkles className="h-5 w-5" />} items={[...data.operations.activityEvents.map((item) => item.title), ...data.operations.auditLogs.map((item) => item.message ?? `${item.action} ${item.entity}`)].slice(0, 12)} />
    </>
  );
}

function PlatformAnalytics({ data }: { data: GrowthData }) {
  return <SectionGrid metrics={[["Active Users", data.users.activeUsers.length], ["Teachers", data.users.teachers.length], ["Students", data.users.students.length], ["Institutions", data.overview.institutions], ["DAU", data.users.dailyActiveUsers], ["MAU", data.users.monthlyActiveUsers]]} panels={[["Growth Trends", data.users.growthTrends.map((item) => `${item.label}: ${item.value}`)], ["Retention", [data.users.retentionPlaceholder]]]} />;
}

function AIAnalytics({ data }: { data: GrowthData }) {
  return <SectionGrid metrics={[["Generations", data.ai.generations], ["Credits Used", data.ai.creditsUsed], ["Estimated Cost", money(data.ai.estimatedCost)], ["Teacher Usage", data.ai.teacherUsage], ["Student Usage", data.ai.studentUsage], ["Prompt Templates", data.content.promptTemplates.length]]} panels={[["Popular AI Tools", data.ai.byFeature.map((item) => `${item.feature} - ${item.generations} generations - ${item.credits} credits`)], ["Top Prompt Categories", data.ai.topPromptCategories]]} />;
}

function MarketplaceAnalytics({ data }: { data: GrowthData }) {
  return <SectionGrid metrics={[["Teachers", data.marketplace.teachers.length], ["Resources", data.marketplace.resources.length], ["Downloads", data.marketplace.downloads.length], ["Bookings", data.marketplace.bookings.length], ["Top Subjects", data.marketplace.topSubjects.length], ["Categories", data.marketplace.topCategories.length]]} panels={[["Top Subjects", data.marketplace.topSubjects.map((item) => `${item.name} - ${item.value}`)], ["Top Categories", data.marketplace.topCategories.map((item) => `${item.name} - ${item.value}`)], ["Conversion", [data.marketplace.conversionPlaceholder]]]} />;
}

function CommerceAnalytics({ data }: { data: GrowthData }) {
  return <SectionGrid metrics={[["Subscriptions", data.commerce.subscriptions.length], ["Orders", data.commerce.orders.length], ["Wallets", data.commerce.wallets.length], ["Credits Sold", data.commerce.creditsSold], ["Revenue", money(data.commerce.revenuePlaceholder)], ["Coupon Usage", data.commerce.couponUsage]]} panels={[["Recent Orders", data.commerce.orders.map((item) => `${item.buyer.name} - ${item.type} - ${item.status}`)], ["Coupons", data.commerce.coupons.map((item) => `${item.code} - ${item.usedCount} used`)], ["Referrals", [data.commerce.referralStatistics]]]} />;
}

function CommunityAnalytics({ data }: { data: GrowthData }) {
  return <SectionGrid metrics={[["Announcements", data.community.announcements.length], ["Communities", data.community.communities.length], ["Messages", data.community.messages.length], ["Discussions", data.community.discussions.length], ["Bookings", data.community.bookings.length], ["Activity Events", data.community.activityEvents.length]]} panels={[["Announcements", data.community.announcements.map((item) => `${item.title} - ${item.status}`)], ["Communities", data.community.communities.map((item) => `${item.name} - ${item._count.members} members`)], ["Activity Events", data.community.activityEvents.map((item) => `${item.eventKey} - ${item.status}`)]]} />;
}

function ContentManagement({ data }: { data: GrowthData }) {
  return <SectionGrid metrics={[["Resources", data.content.resources.length], ["Announcements", data.content.announcements.length], ["Prompt Templates", data.content.promptTemplates.length], ["Categories", data.content.categories.length], ["Featured", data.content.featuredContent.length], ["Highlights", data.content.homepageHighlights.length]]} panels={[["Resources", data.content.resources.map((item) => `${item.title} - ${item.status}`)], ["Prompt Templates", data.content.promptTemplates.map((item) => `${item.name} - ${item.scope}`)], ["Homepage Highlights", data.content.homepageHighlights.map((item) => `${item.label}: ${Number(item.value)}`)]]} />;
}

function UserManagement({ data }: { data: GrowthData }) {
  return <SectionGrid metrics={[["Teachers", data.users.teachers.length], ["Students", data.users.students.length], ["Active", data.users.activeUsers.length], ["Roles", data.users.all.reduce((total, user) => total + user.roles.length, 0)], ["Suspensions", data.users.all.filter((user) => user.status !== "ACTIVE").length], ["Institutions", data.overview.institutions]]} panels={[["Teachers", data.users.teachers.map((item) => `${item.user.name} - ${item.isMarketplaceListed ? "Listed" : "Profile hidden"}`)], ["Students", data.users.students.map((item) => `${item.user.name} - ${item.learningGoal ?? "No goal"}`)], ["Account Notes", ["Verification, suspensions, and account notes architecture is ready."]]]} />;
}

function Moderation({ data }: { data: GrowthData }) {
  const flagged = [
    ...data.marketplace.resources.filter((item) => item.status === "SUBMITTED" || item.status === "REJECTED").map((item) => `Resource: ${item.title} - ${item.status}`),
    ...data.community.discussions.filter((item) => item.status === "LOCKED" || item.status === "ARCHIVED").map((item) => `Discussion: ${item.title} - ${item.status}`),
    ...data.support.tickets.filter((item) => item.priority === "URGENT").map((item) => `Support: ${item.subject} - ${item.status}`)
  ];
  return <Panel title="Moderation Queue" icon={<Flag className="h-5 w-5" />} items={flagged.length ? flagged : ["No reported content, messages, or resources waiting for review. Actions ready: approve, reject, suspend, archive."]} />;
}

function SupportCenter({ data }: { data: GrowthData }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-5 shadow-soft">
        <h2 className="text-xl font-semibold">Create Support Item</h2>
        <form action={createSupportTicketAction} className="mt-5 grid gap-4">
          <Input name="subject" placeholder="Subject" />
          <Select name="type"><option>SUPPORT</option><option>FEEDBACK</option><option>BUG</option><option>FEATURE_REQUEST</option><option>CONTACT</option></Select>
          <Select name="priority"><option>NORMAL</option><option>LOW</option><option>HIGH</option><option>URGENT</option></Select>
          <Textarea name="body" placeholder="Details" />
          <Button type="submit"><LifeBuoy className="mr-2 h-4 w-4" />Create Ticket</Button>
        </form>
      </Card>
      <Card className="p-5 shadow-soft">
        <h2 className="text-xl font-semibold">Support Queue</h2>
        <div className="mt-5 space-y-3">{data.support.tickets.length ? data.support.tickets.map((ticket) => <SupportTicketRow key={ticket.id} ticket={ticket} />) : <EmptyState icon={<LifeBuoy className="h-5 w-5" />} title="No support tickets" description="Feedback, bug reports, feature requests, contact messages, and support tickets will appear here." />}</div>
      </Card>
    </section>
  );
}

function SupportTicketRow({ ticket }: { ticket: GrowthData["support"]["tickets"][number] }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{ticket.subject}</p><p className="text-sm text-muted-foreground">{ticket.type} - {ticket.status} - {ticket.priority}</p></div><Badge>{ticket.replies.length} replies</Badge></div>
      <form action={updateSupportTicketAction} className="mt-4 grid gap-3 md:grid-cols-4">
        <input name="ticketId" type="hidden" value={ticket.id} />
        <Select name="status"><option>OPEN</option><option>IN_REVIEW</option><option>RESOLVED</option><option>CLOSED</option><option>ARCHIVED</option></Select>
        <Select name="priority"><option>NORMAL</option><option>LOW</option><option>HIGH</option><option>URGENT</option></Select>
        <Input name="reply" placeholder="Reply or internal note" />
        <Button type="submit">Update</Button>
      </form>
    </div>
  );
}

function SystemSettings({ data }: { data: GrowthData }) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <Card className="p-5 shadow-soft">
        <h2 className="text-xl font-semibold">Feature Flags</h2>
        <form action={saveFeatureFlagAction} className="mt-5 grid gap-4">
          <Input name="key" placeholder="feature.key" />
          <Input name="name" placeholder="Feature name" />
          <Input name="scope" placeholder="Scope" defaultValue="platform" />
          <Textarea name="description" placeholder="Description" />
          <label className="flex items-center gap-2 text-sm"><input name="enabled" type="checkbox" />Enabled</label>
          <Button type="submit">Save Feature Flag</Button>
        </form>
        <List title="Flags" icon={<Settings className="h-5 w-5" />} items={data.operations.featureFlags.map((item) => `${item.name} - ${item.enabled ? "Enabled" : "Disabled"}`)} />
      </Card>
      <Card className="p-5 shadow-soft">
        <h2 className="text-xl font-semibold">System Settings</h2>
        <form action={saveSystemSettingAction} className="mt-5 grid gap-4">
          <Input name="key" placeholder="setting.key" />
          <Input name="category" placeholder="Category" defaultValue="platform" />
          <Textarea name="value" placeholder="Value" />
          <Button type="submit">Save Setting</Button>
        </form>
        <List title="Settings" icon={<Settings className="h-5 w-5" />} items={data.operations.settings.map((item) => item.key)} />
      </Card>
    </section>
  );
}

function AuditLogPanel({ data }: { data: GrowthData }) {
  return <Panel title="Unified Audit Log" icon={<Shield className="h-5 w-5" />} items={data.operations.auditLogs.map((item) => `${item.action} ${item.entity} - ${item.actor?.name ?? "System"} - ${item.message ?? "No message"}`)} />;
}

function AutomationPanel({ data }: { data: GrowthData }) {
  return <SectionGrid metrics={[["Templates", data.community.communications.length], ["Triggers", data.operations.activityEvents.length], ["History", data.operations.activities.length], ["Notification Templates", data.content.promptTemplates.length]]} panels={[["Event Triggers", ["booking.accepted", "resource.published", "subscription.expires", "credits.low", "order.completed", "teacher.reply", "student.request"]], ["Automation History", data.operations.activityEvents.map((item) => `${item.eventKey} - ${item.status}`)], ["Workflow Templates", ["Notification workflow", "Moderation workflow", "Commerce workflow", "Support workflow"]]]} />;
}

function ReportsPanel({ data }: { data: GrowthData }) {
  return (
    <section className="space-y-6">
      <Card className="p-5 shadow-soft">
        <h2 className="text-xl font-semibold">Export-Ready Reports</h2>
        <p className="mt-2 text-muted-foreground">Users, revenue, marketplace, AI usage, learning, communication, and system activity reports are structured for future CSV/PDF export.</p>
        <form action={recordPlatformMetricAction} className="mt-5 grid gap-4 md:grid-cols-5">
          <Input name="key" placeholder="metric.key" />
          <Input name="label" placeholder="Label" />
          <Input name="value" placeholder="Value" />
          <Input name="dimension" placeholder="Dimension" />
          <Button type="submit">Record Metric</Button>
        </form>
      </Card>
      <SectionGrid metrics={[["User Reports", data.users.all.length], ["Revenue Reports", data.commerce.orders.length], ["Marketplace Reports", data.marketplace.resources.length], ["AI Reports", data.ai.usage.length], ["Learning Reports", data.marketplace.downloads.length], ["System Reports", data.operations.auditLogs.length]]} panels={[["Platform Metrics", data.operations.platformMetrics.map((item) => `${item.label}: ${Number(item.value)}`)]]} />
    </section>
  );
}

function SectionGrid({ metrics, panels }: { metrics: Array<[string, string | number]>; panels: Array<[string, string[]]> }) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{metrics.map(([label, value]) => <Metric key={label} label={label} value={String(value)} />)}</section>
      <section className="grid gap-6 xl:grid-cols-2">{panels.map(([title, items]) => <Panel key={title} title={title} icon={<BarChart3 className="h-5 w-5" />} items={items} />)}</section>
    </>
  );
}

function QuickActions() {
  const actions = [
    ["Manage Users", "/admin/user-management", UsersRound],
    ["Content", "/admin/content-management", Store],
    ["AI Analytics", "/admin/ai-analytics", Bot],
    ["Commerce", "/admin/commerce-analytics", CreditCard],
    ["Community", "/admin/community-analytics", Megaphone],
    ["Support", "/admin/support", LifeBuoy],
    ["Audit Log", "/admin/audit-log", Shield],
    ["Reports", "/admin/reports", Download]
  ];

  return <section className="grid gap-3 md:grid-cols-4">{actions.map(([label, href, Icon]) => <Link className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50" href={href as string} key={label as string}><Icon className="h-5 w-5 text-sky-700" /><span className="font-medium">{label as string}</span></Link>)}</section>;
}

function Panel({ title, icon, items }: { title: string; icon: ReactNode; items: string[] }) {
  return <Card className="p-5 shadow-soft"><div className="flex items-center gap-3 text-sky-700">{icon}<h2 className="text-xl font-semibold text-foreground">{title}</h2></div><div className="mt-5 space-y-3">{items.length ? items.slice(0, 12).map((item) => <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm" key={item}>{item}</p>) : <EmptyState icon={<Search className="h-5 w-5" />} title={`No ${title.toLowerCase()} yet`} description="Growth OS data will appear here." />}</div></Card>;
}

function List({ title, icon, items }: { title: string; icon: ReactNode; items: string[] }) {
  return <div className="mt-5"><Panel title={title} icon={icon} items={items} /></div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <Card className="p-5 shadow-soft"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p>{detail ? <p className="mt-2 text-sm text-muted-foreground">{detail}</p> : null}</Card>;
}

function Hero({ title, description }: { title: string; description: string }) {
  return <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8"><Badge>Platform Operations</Badge><h1 className="mt-6 text-4xl font-semibold tracking-tight">{title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p></section>;
}
