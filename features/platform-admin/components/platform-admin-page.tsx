"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Building2,
  Download,
  Gauge,
  LayoutDashboard,
  PackageCheck,
  Search,
  Settings,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  assignRoleAction,
  createRoleAction,
  moderateDiscussionAction,
  moderateResourceAction,
  savePlanAction,
  savePlatformSettingAction,
  updateRolePermissionsAction,
  updateUserStatusAction,
  verifyUsersAction,
} from "@/features/platform-admin/actions";
import type {
  getPlatformAdminData,
  PlatformAdminModule,
} from "@/services/platform-admin-service";

type Data = Awaited<ReturnType<typeof getPlatformAdminData>>;
const modules: {
  slug: PlatformAdminModule;
  label: string;
  icon: typeof Gauge;
}[] = [
  { slug: "dashboard", label: "Control Center", icon: LayoutDashboard },
  { slug: "users", label: "Users", icon: UsersRound },
  { slug: "roles", label: "Roles & Access", icon: ShieldCheck },
  { slug: "marketplace", label: "Marketplace", icon: PackageCheck },
  { slug: "moderation", label: "Moderation", icon: ShieldCheck },
  { slug: "subscriptions", label: "Subscriptions", icon: WalletCards },
  { slug: "ai-monitoring", label: "AI Monitoring", icon: Bot },
  { slug: "analytics", label: "Analytics", icon: Activity },
  { slug: "settings", label: "System Settings", icon: Settings },
  { slug: "audit-logs", label: "Audit & Logs", icon: Search },
];
const desc: Record<PlatformAdminModule, string> = {
  dashboard:
    "Live platform health, growth, revenue, AI, marketplace, alerts, and operational actions.",
  users:
    "Search, verify, suspend, reactivate, and review teachers, institutions, and students.",
  roles:
    "Manage platform roles, permission matrices, assignments, custom roles, and access reviews.",
  marketplace:
    "Review pending, approved, flagged, featured, reported, and removed marketplace resources.",
  moderation:
    "Moderate professional community discussions, replies, messages, reports, abuse cases, and history.",
  subscriptions:
    "Review plans, trials, active and expired accounts, plan changes, and billing.",
  "ai-monitoring":
    "Monitor AI requests, tokens, models, costs, errors, features, and usage trends.",
  analytics:
    "Measure user, teacher, institution, marketplace, community, engagement, and platform growth.",
  settings:
    "Manage platform configuration for branding, email, notifications, AI, marketplace, and community.",
  "audit-logs":
    "Inspect admin actions, activity, logins, security, resource, and marketplace events.",
};
const teachers = [
  "ACADEMIC_HEAD",
  "ACADEMIC_FACULTY",
  "PART_TIME_TUTOR",
  "PHYSICAL_TRAINER",
];
const when = (x: Date | string | null | undefined) =>
  x ? new Date(x).toLocaleString() : "Never";
const money = (x: number | string, c = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: c }).format(
    Number(x),
  );
function exportData(name: string, data: unknown) {
  const u = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = u;
  a.download = `teachx-${name}.json`;
  a.click();
  URL.revokeObjectURL(u);
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}
function Action({
  children,
  danger,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      className={`rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-muted ${danger ? "text-red-600" : ""}`}
      type="submit"
    >
      {children}
    </button>
  );
}
function Dashboard({ d }: { d: Data }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active Users" value={d.overview.activeUsers} />
        <Metric label="Teachers" value={d.overview.teachers} />
        <Metric label="Institutions" value={d.overview.institutions} />
        <Metric label="Students" value={d.overview.students} />
        <Metric
          label="Marketplace Resources"
          value={d.marketplace.resources.length}
        />
        <Metric label="AI Credits Used" value={d.overview.aiCreditsUsed} />
        <Metric label="Revenue" value={money(d.overview.revenue)} />
        <Metric label="Activity Today" value={d.overview.todayActivity} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {modules.slice(1, 9).map((x) => (
              <Link
                className="rounded-xl border p-4 text-sm font-medium hover:bg-muted"
                href={`/admin/control/${x.slug}`}
                key={x.slug}
              >
                {x.label}
              </Link>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Alerts</h2>
          <div className="mt-4 space-y-2">
            {d.alerts.length ? (
              d.alerts.slice(0, 8).map((x, i) => (
                <Link
                  className="block rounded-xl bg-background p-3 text-sm"
                  href={x.href}
                  key={`${x.title}-${i}`}
                >
                  <strong>{x.title}</strong>
                  <span className="ml-2 text-muted-foreground">{x.type}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No operational alerts.
              </p>
            )}
          </div>
        </Card>
      </div>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Recent platform activity</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[...d.operations.activities, ...d.operations.activityEvents]
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
            .slice(0, 10)
            .map((x) => (
              <p
                className="rounded-xl border p-3 text-sm"
                key={`${"eventKey" in x ? "event" : "activity"}-${x.id}`}
              >
                <strong>{x.title}</strong>
                <span className="block text-muted-foreground">
                  {when(x.createdAt)}
                </span>
              </p>
            ))}
        </div>
      </Card>
    </div>
  );
}
function Users({ d }: { d: Data }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const rows = d.users.all
    .filter((x) =>
      `${x.name} ${x.email}`.toLowerCase().includes(q.toLowerCase()),
    )
    .filter((x) => status === "ALL" || x.status === status)
    .filter(
      (x) =>
        type === "ALL" ||
        (type === "TEACHER" &&
          x.roles.some((r) => teachers.includes(r.role.key))) ||
        (type === "STUDENT" && x.roles.some((r) => r.role.key === "STUDENT")),
    );
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
        <Input
          onChange={(e) => setQ(e.target.value)}
          placeholder="Fast search by name or email…"
        />
        <Select onChange={(e) => setType(e.target.value)}>
          <option>ALL</option>
          <option>TEACHER</option>
          <option>STUDENT</option>
        </Select>
        <Select onChange={(e) => setStatus(e.target.value)}>
          <option>ALL</option>
          <option>ACTIVE</option>
          <option>SUSPENDED</option>
          <option>INACTIVE</option>
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Teachers" value={d.users.teachers.length} />
        <Metric label="Institutions" value={d.institutions.length} />
        <Metric label="Students" value={d.users.students.length} />
      </div>
      {rows.length ? (
        <div className="space-y-3">
          {rows.map((x) => (
            <Card className="p-4" key={x.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge>{x.status}</Badge>
                  <h2 className="mt-2 font-semibold">{x.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {x.email} ·{" "}
                    {x.roles.map((r) => r.role.name).join(", ") || "No role"} ·{" "}
                    {x.emailVerifiedAt ? "Verified" : "Unverified"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last login: {when(x.lastLoginAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!x.emailVerifiedAt ? (
                    <form action={verifyUsersAction}>
                      <input name="ids" type="hidden" value={x.id} />
                      <Action>Verify</Action>
                    </form>
                  ) : null}
                  <form action={updateUserStatusAction}>
                    <input name="ids" type="hidden" value={x.id} />
                    <input
                      name="status"
                      type="hidden"
                      value={x.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"}
                    />
                    <Action danger={x.status !== "SUSPENDED"}>
                      {x.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                    </Action>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<UsersRound />}
          title="No users found"
          description="Adjust the search or status filters."
        />
      )}
      <Card className="p-5">
        <h2 className="font-semibold">Institution directory</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {d.institutions.map((x) => (
            <div className="rounded-xl border p-3" key={x.id}>
              <strong>{x.name}</strong>
              <span className="block text-sm text-muted-foreground">
                {x._count.users} users · {x._count.courses} courses ·{" "}
                {x.email || "No contact email"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
function Roles({ d }: { d: Data }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Create custom role</h2>
          <form action={createRoleAction} className="mt-4 grid gap-3">
            <Input name="name" placeholder="Role name" required />
            <Input name="key" placeholder="ROLE_KEY" required />
            <Textarea name="description" placeholder="Access purpose" />
            <Button className="w-fit" type="submit">
              Create role
            </Button>
          </form>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Assign role</h2>
          <form action={assignRoleAction} className="mt-4 grid gap-3">
            <Select name="userId" required>
              <option value="">User</option>
              {d.users.all.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} · {x.email}
                </option>
              ))}
            </Select>
            <Select name="roleId" required>
              <option value="">Role</option>
              {d.roles.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </Select>
            <Button className="w-fit" type="submit">
              Assign role
            </Button>
          </form>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {d.roles.map((r) => (
          <Card className="p-5" key={r.id}>
            <div className="flex justify-between">
              <div>
                <Badge>{r.key}</Badge>
                <h2 className="mt-2 text-lg font-semibold">{r.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {r._count.users} assigned · {r.permissions.length} permissions
                </p>
              </div>
            </div>
            <form action={updateRolePermissionsAction} className="mt-4">
              <input name="roleId" type="hidden" value={r.id} />
              <div className="grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2">
                {d.permissions.map((p) => (
                  <label className="flex items-center gap-2 text-xs" key={p.id}>
                    <input
                      defaultChecked={r.permissions.some(
                        (x) => x.permissionId === p.id,
                      )}
                      name="permissionIds"
                      type="checkbox"
                      value={p.id}
                    />
                    {p.key}
                  </label>
                ))}
              </div>
              <Button className="mt-4" type="submit">
                Save permission matrix
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
function Marketplace({ d }: { d: Data }) {
  const [q, setQ] = useState("");
  const [s, setS] = useState("ALL");
  const rows = d.marketplace.resources
    .filter((x) => x.title.toLowerCase().includes(q.toLowerCase()))
    .filter((x) => s === "ALL" || x.status === s);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_240px]">
        <Input
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search marketplace resources…"
        />
        <Select onChange={(e) => setS(e.target.value)}>
          <option>ALL</option>
          <option>SUBMITTED</option>
          <option>ACADEMIC_APPROVAL</option>
          <option>PUBLISHED</option>
          <option>REJECTED</option>
          <option>ARCHIVED</option>
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric
          label="Pending"
          value={
            d.marketplace.resources.filter((x) =>
              ["SUBMITTED", "ACADEMIC_APPROVAL"].includes(x.status),
            ).length
          }
        />
        <Metric
          label="Approved"
          value={
            d.marketplace.resources.filter((x) => x.status === "PUBLISHED")
              .length
          }
        />
        <Metric label="Downloads" value={d.marketplace.downloads.length} />
        <Metric label="Orders" value={d.commerce.orders.length} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((x) => (
          <Card className="p-5" key={x.id}>
            <Badge>{x.status}</Badge>
            <h2 className="mt-2 font-semibold">{x.title}</h2>
            <p className="text-sm text-muted-foreground">
              {x.type} · {x.createdBy?.name || "Unknown publisher"} ·{" "}
              {x.downloads.length} downloads
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ["PUBLISHED", "Approve"],
                ["REJECTED", "Reject"],
                ["ARCHIVED", "Remove listing"],
              ].map(([status, label]) => (
                <form action={moderateResourceAction} key={status}>
                  <input name="ids" type="hidden" value={x.id} />
                  <input name="status" type="hidden" value={status} />
                  <Action danger={status !== "PUBLISHED"}>{label}</Action>
                </form>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
function Moderation({ d }: { d: Data }) {
  const [q, setQ] = useState("");
  const rows = d.community.discussions.filter((x) =>
    `${x.title} ${x.body ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Discussions" value={d.community.discussions.length} />
        <Metric
          label="Replies"
          value={d.community.discussions.reduce(
            (n, x) => n + x.replies.length,
            0,
          )}
        />
        <Metric label="Messages Reviewed" value={d.community.messages.length} />
        <Metric
          label="Report Queue"
          value={
            d.support.tickets.filter((x) => x.source?.toLowerCase().includes("report")).length
          }
        />
      </div>
      <Input
        className="max-w-xl"
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search professional community content…"
      />
      {rows.map((x) => (
        <Card className="p-5" key={x.id}>
          <Badge>{x.status}</Badge>
          <h2 className="mt-2 font-semibold">{x.title}</h2>
          <p className="mt-2 text-sm">{x.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {x.author?.name || "Deleted user"} · {x.replies.length} comments ·{" "}
            {when(x.updatedAt)}
          </p>
          <div className="mt-4 flex gap-2">
            {[
              ["OPEN", "Restore"],
              ["LOCKED", "Lock"],
              ["REMOVED", "Remove"],
            ].map(([status, label]) => (
              <form action={moderateDiscussionAction} key={status}>
                <input name="ids" type="hidden" value={x.id} />
                <input name="status" type="hidden" value={status} />
                <Action danger={status === "REMOVED"}>{label}</Action>
              </form>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
function Subscriptions({ d }: { d: Data }) {
  const now = Date.now();
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric
          label="Active Plans"
          value={d.plans.filter((x) => x.isActive).length}
        />
        <Metric
          label="Active Accounts"
          value={
            d.commerce.subscriptions.filter((x) => x.status === "ACTIVE").length
          }
        />
        <Metric
          label="Trial Accounts"
          value={
            d.commerce.subscriptions.filter((x) => x.status === "TRIALING").length
          }
        />
        <Metric
          label="Expired Plans"
          value={
            d.commerce.subscriptions.filter(
              (x) => x.currentPeriodEnd && +new Date(x.currentPeriodEnd) < now,
            ).length
          }
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {d.plans.map((x) => (
          <Card className="p-5" key={x.id}>
            <Badge>{x.isActive ? "ACTIVE" : "INACTIVE"}</Badge>
            <h2 className="mt-2 text-xl font-semibold">{x.name}</h2>
            <p className="text-sm text-muted-foreground">
              {money(String(x.price), x.currency)} / {x.interval} ·{" "}
              {x._count.subscriptions} subscribers
            </p>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">
                Edit plan
              </summary>
              <form
                action={savePlanAction}
                className="mt-3 grid gap-3 sm:grid-cols-2"
              >
                <input name="id" type="hidden" value={x.id} />
                <Input defaultValue={x.name} name="name" />
                <Input
                  defaultValue={String(x.price)}
                  name="price"
                  type="number"
                />
                <Input
                  defaultValue={x.aiMonthlyCredits}
                  name="credits"
                  type="number"
                />
                <Input
                  defaultValue={x.resourceLimit}
                  name="resourceLimit"
                  type="number"
                />
                <label className="flex items-center gap-2">
                  <input
                    defaultChecked={x.isActive}
                    name="isActive"
                    type="checkbox"
                  />
                  Active
                </label>
                <Button type="submit">Save plan change</Button>
              </form>
            </details>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Billing overview</h2>
        <div className="mt-4 space-y-2">
          {d.commerce.orders.slice(0, 12).map((x) => (
            <p className="rounded-xl bg-muted p-3 text-sm" key={x.id}>
              <strong>{x.buyer.name}</strong> · {x.status}
              <span className="float-right font-semibold">
                {money(String(x.total), x.currency)}
              </span>
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
function AI({ d }: { d: Data }) {
  const total = d.ai.usage.reduce((n, x) => n + x.totalTokens, 0);
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="AI Requests" value={d.ai.generations} />
        <Metric label="Tokens" value={total.toLocaleString()} />
        <Metric
          label="Estimated Cost"
          value={money(d.ai.estimatedCost, "USD")}
        />
        <Metric label="Models" value={d.aiModels.length} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Model usage</h2>
          {d.aiModels.map((x) => (
            <div className="mt-3 rounded-xl border p-3 text-sm" key={x.model}>
              <strong>{x.model}</strong>
              <span className="block text-muted-foreground">
                {x.requests} requests · {x.tokens.toLocaleString()} tokens ·{" "}
                {money(x.cost, "USD")}
              </span>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Feature analytics</h2>
          {d.ai.byFeature.map((x) => (
            <div className="mt-3 rounded-xl border p-3 text-sm" key={x.feature}>
              <strong>{x.feature}</strong>
              <span className="block text-muted-foreground">
                {x.generations} generations · {x.credits} credits ·{" "}
                {money(x.cost, "USD")}
              </span>
            </div>
          ))}
        </Card>
      </div>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">
          Recent requests and error monitoring
        </h2>
        {d.ai.usage.slice(0, 15).map((x) => (
          <p className="mt-2 rounded-xl bg-muted p-3 text-sm" key={x.id}>
            {x.feature} · {x.model} · {x.totalTokens} tokens
            <span className="float-right text-muted-foreground">
              {when(x.createdAt)}
            </span>
          </p>
        ))}
        {!d.ai.usage.length ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No AI requests recorded.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
function AnalyticsView({ d }: { d: Data }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total Users" value={d.overview.users} />
        <Metric label="Teacher Growth" value={d.users.teachers.length} />
        <Metric label="Institution Growth" value={d.institutions.length} />
        <Metric
          label="Marketplace Growth"
          value={d.marketplace.resources.length}
        />
        <Metric
          label="Community Activity"
          value={d.community.activityEvents.length}
        />
        <Metric label="Monthly Active" value={d.users.monthlyActiveUsers} />
        <Metric label="Downloads" value={d.marketplace.downloads.length} />
        <Metric label="Platform Revenue" value={money(d.overview.revenue)} />
      </div>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Growth and engagement KPIs</h2>
        <div className="mt-5 flex h-52 items-end gap-5">
          {d.users.growthTrends.map((x) => {
            const max = Math.max(
              ...d.users.growthTrends.map((y) => y.value),
              1,
            );
            return (
              <div
                className="flex flex-1 flex-col items-center gap-2"
                key={x.label}
              >
                <strong>{x.value}</strong>
                <div
                  className="w-full max-w-40 rounded-t bg-sky-600"
                  style={{ height: `${Math.max(6, (x.value / max) * 140)}px` }}
                />
                <span className="text-sm text-muted-foreground">{x.label}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
function SystemSettings({ d }: { d: Data }) {
  const cats = [
    "general",
    "branding",
    "platform",
    "email",
    "notifications",
    "ai",
    "marketplace",
    "community",
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {cats.map((c) => (
        <Card className="p-5" key={c}>
          <h2 className="text-lg font-semibold capitalize">{c} settings</h2>
          <form action={savePlatformSettingAction} className="mt-4 space-y-3">
            <input name="category" type="hidden" value={c} />
            <Textarea
              defaultValue={String(
                (
                  d.operations.settings.find((x) => x.key === `platform.${c}`)
                    ?.value as { value?: string } | undefined
                )?.value ?? "",
              )}
              name="setting"
              placeholder={`Configure ${c} behavior using the existing platform configuration`}
            />
            <Button type="submit">Save {c}</Button>
          </form>
        </Card>
      ))}
    </div>
  );
}
function Logs({ d }: { d: Data }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("ALL");
  const logs = d.operations.auditLogs
    .filter((x) =>
      `${x.action} ${x.entity} ${x.message ?? ""} ${x.actor?.name ?? ""}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .filter((x) => kind === "ALL" || x.entity === kind);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <Input
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search activity, admin, security, resource, and marketplace logs…"
        />
        <Select onChange={(e) => setKind(e.target.value)}>
          <option>ALL</option>
          {[...new Set(d.operations.auditLogs.map((x) => x.entity))].map(
            (x) => (
              <option key={x}>{x}</option>
            ),
          )}
        </Select>
      </div>
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-muted">
            <tr>
              {["Time", "Actor", "Action", "Entity", "Message", "IP"].map(
                (x) => (
                  <th className="p-3" key={x}>
                    {x}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {logs.map((x) => (
              <tr className="border-t" key={x.id}>
                <td className="p-3">{when(x.createdAt)}</td>
                <td className="p-3">{x.actor?.name || "System"}</td>
                <td className="p-3">
                  <Badge>{x.action}</Badge>
                </td>
                <td className="p-3">{x.entity}</td>
                <td className="p-3">{x.message || "—"}</td>
                <td className="p-3">{x.ipAddress || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="p-5">
        <h2 className="font-semibold">Login history</h2>
        {d.loginHistory.slice(0, 10).map((x) => (
          <p className="mt-2 rounded-xl bg-muted p-3 text-sm" key={x.id}>
            {x.user} · {x.provider}
            <span className="float-right text-muted-foreground">
              {when(x.lastLoginAt)}
            </span>
          </p>
        ))}
      </Card>
    </div>
  );
}
export function PlatformAdminPage({
  module,
  data,
}: {
  module: PlatformAdminModule;
  data: Data;
}) {
  const label = modules.find((x) => x.slug === module)?.label;
  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin">Admin</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/control/dashboard">Control Center</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{label}</span>
      </nav>
      <section className="rounded-[2rem] border bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <Badge>Platform Administration</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              {label}
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
              {desc[module]}
            </p>
          </div>
          <Button
            onClick={() => exportData(module, data)}
            type="button"
            variant="secondary"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </section>
      <nav className="flex gap-2 overflow-x-auto pb-2">
        {modules.map((x) => {
          const Icon = x.icon;
          return (
            <Link
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${module === x.slug ? "bg-primary text-primary-foreground" : "border bg-surface"}`}
              href={`/admin/control/${x.slug}`}
              key={x.slug}
            >
              <Icon className="h-4 w-4" />
              {x.label}
            </Link>
          );
        })}
      </nav>
      {module === "dashboard" ? (
        <Dashboard d={data} />
      ) : module === "users" ? (
        <Users d={data} />
      ) : module === "roles" ? (
        <Roles d={data} />
      ) : module === "marketplace" ? (
        <Marketplace d={data} />
      ) : module === "moderation" ? (
        <Moderation d={data} />
      ) : module === "subscriptions" ? (
        <Subscriptions d={data} />
      ) : module === "ai-monitoring" ? (
        <AI d={data} />
      ) : module === "analytics" ? (
        <AnalyticsView d={data} />
      ) : module === "settings" ? (
        <SystemSettings d={data} />
      ) : (
        <Logs d={data} />
      )}
    </div>
  );
}
