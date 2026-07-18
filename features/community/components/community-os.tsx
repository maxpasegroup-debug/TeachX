import Link from "next/link";
import type { ReactNode } from "react";
import { Archive, Bell, BookOpen, CalendarCheck, Clock, Filter, Flag, Lock, Mail, MessageCircle, Pin, Search, Send, Shield, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  archiveNotificationFromInboxAction,
  createCommunityAction,
  createDiscussionAction,
  createMessageRequestAction,
  createNotificationTemplateAction,
  markAllNotificationsReadAction,
  publishCommunityAnnouncementAction,
  replyToDiscussionAction,
  sendDirectMessageAction,
  updateBookingWorkflowAction
} from "@/features/community/actions";
import type { getCommunityOS } from "@/services/community-service";

type CommunityOSData = Awaited<ReturnType<typeof getCommunityOS>>;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export function CommunicationCommunityOS({ data, section = "hub" }: { data: CommunityOSData; section?: string }) {
  return (
    <div className="space-y-8">
      <Hero eyebrow="Communication OS" title="A connected education community." description="Inbox, announcements, booking workflows, discussions, messages, notifications, communities, providers, and automation readiness in one lightweight collaboration layer." />
      {section === "hub" ? <HubOverview data={data} /> : null}
      {section === "announcements" || section === "hub" ? <AnnouncementComposer data={data} /> : null}
      {section === "inbox" || section === "hub" ? <GlobalInbox data={data} /> : null}
      {section === "activity" || section === "hub" ? <ActivityTimeline data={data} /> : null}
      {section === "requests" || section === "hub" ? <BookingWorkflow data={data} /> : null}
      {section === "messages" || section === "hub" ? <MessagingPanel data={data} /> : null}
      {section === "discussions" || section === "hub" ? <DiscussionsPanel data={data} /> : null}
      {section === "communities" || section === "hub" ? <CommunitiesPanel data={data} /> : null}
      {section === "notifications" || section === "hub" ? <NotificationCenterPanel data={data} /> : null}
      {section === "templates" ? <NotificationTemplatePanel data={data} /> : null}
      {section === "moderation" ? <ModerationPanel data={data} /> : null}
      {section === "analytics" ? <CommunicationAnalytics data={data} /> : null}
      <ProviderAutomationPanel data={data} />
    </div>
  );
}

function HubOverview({ data }: { data: CommunityOSData }) {
  const metrics = [
    ["Inbox", data.inbox.notifications.length + data.inbox.bookingRequests.length + data.inbox.orders.length],
    ["Announcements", data.communication.communications.filter((item) => item.kind === "ANNOUNCEMENT").length],
    ["Requests", data.requests.length],
    ["Discussions", data.discussions.length],
    ["Communities", data.communities.length],
    ["Unread", data.notifications.unreadCount]
  ];

  return <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">{metrics.map(([label, value]) => <Metric key={label} label={String(label)} value={String(value)} />)}</section>;
}

function AnnouncementComposer({ data }: { data: CommunityOSData }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3"><Bell className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Announcements</h2></div>
      <form action={publishCommunityAnnouncementAction} className="mt-5 grid gap-4 md:grid-cols-4">
        <Input className="md:col-span-2" name="title" placeholder="Announcement title" />
        <Select name="audience"><option>Everyone</option><option>My Students</option><option>Course</option><option>Class</option><option>Institution</option></Select>
        <Select name="priority"><option>NORMAL</option><option>HIGH</option><option>URGENT</option><option>LOW</option></Select>
        <Textarea className="md:col-span-4" name="body" placeholder="Announcement message" />
        <Input name="courseId" placeholder="Course ID placeholder" />
        <Input name="batchId" placeholder="Class/Batch ID placeholder" />
        <Input name="scheduledAt" type="datetime-local" />
        <Input name="attachmentUrl" placeholder="Attachment URL placeholder" />
        <label className="flex items-center gap-2 text-sm"><input name="pinned" type="checkbox" />Pinned</label>
        <div className="flex flex-wrap gap-3 md:col-span-3">
          <Button name="intent" type="submit" value="publish"><Send className="mr-2 h-4 w-4" />Publish</Button>
          <Button name="intent" type="submit" value="draft" variant="secondary">Save Draft</Button>
          <Button name="intent" type="submit" value="archive" variant="ghost"><Archive className="mr-2 h-4 w-4" />Archive</Button>
        </div>
      </form>
      <List title="Recent Announcements" icon={<Pin className="h-5 w-5" />} items={data.communication.communications.filter((item) => item.kind === "ANNOUNCEMENT").map((item) => `${item.title} - ${item.status} - ${item.priority}`)} />
    </Card>
  );
}

function GlobalInbox({ data }: { data: CommunityOSData }) {
  const announcementItems = data.inbox.announcements as Array<{ communication: { title: string; status: string } }>;
  const inboxItems = [
    ...data.inbox.notifications.map((item) => ({ title: item.title, meta: item.body ?? "System alert", href: item.link ?? "/communication" })),
    ...data.inbox.bookingRequests.map((item) => ({ title: `Booking: ${item.subject}`, meta: `${item.status} - ${item.studentName}`, href: "/communication" })),
    ...data.inbox.orders.map((item) => ({ title: `Order: ${item.type.replaceAll("_", " ")}`, meta: `${item.status} - INR ${Number(item.total).toLocaleString("en-IN")}`, href: "/student/purchases" })),
    ...announcementItems.map((item) => ({ title: item.communication.title, meta: item.communication.status, href: "/communication" })),
    ...data.inbox.conversations.map((item) => ({ title: item.title, meta: item.messages[0]?.body ?? item.status, href: "/communication" }))
  ];

  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Global Inbox</h2></div>
        <form action={markAllNotificationsReadAction}><Button type="submit" variant="secondary">Mark All Read</Button></form>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <Input placeholder="Search inbox, requests, orders, messages" />
        <Button type="button" variant="secondary"><Filter className="mr-2 h-4 w-4" />Filters</Button>
      </div>
      <div className="mt-5 space-y-3">
        {inboxItems.length ? inboxItems.slice(0, 16).map((item) => <Link className="block rounded-xl border border-border bg-background p-4 transition hover:border-sky-200 hover:bg-sky-50" href={item.href} key={`${item.title}-${item.meta}`}><p className="font-medium">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.meta}</p></Link>) : <EmptyState icon={<Mail className="h-5 w-5" />} title="Inbox is clear" description="Booking requests, marketplace activity, orders, announcements, messages, and system alerts will appear here." />}
      </div>
    </Card>
  );
}

function ActivityTimeline({ data }: { data: CommunityOSData }) {
  return <List title="Activity Feed" icon={<Clock className="h-5 w-5" />} items={data.activities.map((item) => `${item.title} - ${item.actor ?? "TeachX"} - ${formatDate(item.createdAt)}`)} />;
}

function BookingWorkflow({ data }: { data: CommunityOSData }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3"><CalendarCheck className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Booking Requests</h2></div>
      <div className="mt-5 space-y-4">
        {data.requests.length ? data.requests.map((request) => (
          <div className="rounded-2xl border border-border bg-background p-4" key={request.id}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{request.subject}</p><p className="mt-1 text-sm text-muted-foreground">{request.studentName} - {request.status}</p></div><Badge>{request.status}</Badge></div>
            <form action={updateBookingWorkflowAction} className="mt-4 grid gap-3 md:grid-cols-5">
              <input name="requestId" type="hidden" value={request.id} />
              <Select name="status"><option>PENDING</option><option>ACCEPTED</option><option>REJECTED</option><option>COMPLETED</option><option>CANCELLED</option></Select>
              <Input name="teacherNotes" placeholder="Teacher notes" />
              <Input name="studentNotes" placeholder="Student notes" />
              <Input name="note" placeholder="Timeline note" />
              <Button type="submit">Update</Button>
            </form>
          </div>
        )) : <EmptyState icon={<CalendarCheck className="h-5 w-5" />} title="No booking requests" description="Marketplace booking requests and history will appear here." />}
      </div>
    </Card>
  );
}

function MessagingPanel({ data }: { data: CommunityOSData }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Messaging</h2></div>
      <form action={createMessageRequestAction} className="mt-5 grid gap-4 md:grid-cols-4">
        <Input name="title" placeholder="Conversation title" />
        <Input name="participantIds" placeholder="Participant user IDs, comma separated" />
        <Select name="type"><option>TEACHER_STUDENT</option><option>TEACHER_TEACHER</option><option>SUPPORT</option><option disabled>STUDENT_STUDENT_DISABLED</option></Select>
        <Button type="submit">Create Request</Button>
        <Textarea className="md:col-span-4" name="body" placeholder="First message" />
      </form>
      <div className="mt-5 space-y-4">
        {data.inbox.conversations.length ? data.inbox.conversations.map((conversation) => (
          <div className="rounded-2xl border border-border bg-background p-4" key={conversation.id}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{conversation.title}</p><p className="mt-1 text-sm text-muted-foreground">{conversation.status} - {conversation.participants.map((item) => item.user.name).join(", ")}</p></div><Badge><Lock className="mr-1 h-3 w-3" />No realtime</Badge></div>
            <p className="mt-3 text-sm text-muted-foreground">{conversation.messages[0]?.body ?? "No messages yet. Attachments, typing, and read receipts are provider placeholders."}</p>
            <form action={sendDirectMessageAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <input name="conversationId" type="hidden" value={conversation.id} />
              <Input name="body" placeholder="Reply" />
              <Button type="submit">Send</Button>
            </form>
          </div>
        )) : <EmptyState icon={<MessageCircle className="h-5 w-5" />} title="No conversations" description="Teacher-student, teacher-teacher, and support conversations will appear here. Student-student messaging is disabled by policy placeholder." />}
      </div>
    </Card>
  );
}

function DiscussionsPanel({ data }: { data: CommunityOSData }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Discussions</h2></div>
      <form action={createDiscussionAction} className="mt-5 grid gap-4 md:grid-cols-4">
        <Input name="title" placeholder="Discussion title" />
        <Select name="scope"><option>INSTITUTION</option><option>SUBJECT</option><option>COURSE</option><option>RESOURCE</option><option>TEACHER</option><option>SUPPORT</option></Select>
        <Input name="scopeId" placeholder="Scope ID placeholder" />
        <Button type="submit">Create</Button>
        <Textarea className="md:col-span-4" name="body" placeholder="Discussion body" />
      </form>
      <div className="mt-5 space-y-4">
        {data.discussions.length ? data.discussions.map((discussion) => (
          <div className="rounded-2xl border border-border bg-background p-4" key={discussion.id}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{discussion.title}</p><p className="mt-1 text-sm text-muted-foreground">{discussion.scope} - {discussion.status} - {discussion.replies.length} replies</p></div>{discussion.isPinned ? <Badge><Pin className="mr-1 h-3 w-3" />Pinned</Badge> : null}</div>
            <form action={replyToDiscussionAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <input name="discussionId" type="hidden" value={discussion.id} />
              <Input name="body" placeholder="Reply" disabled={discussion.isLocked} />
              <Button type="submit" disabled={discussion.isLocked}>Reply</Button>
            </form>
          </div>
        )) : <EmptyState icon={<BookOpen className="h-5 w-5" />} title="No discussions" description="Subject, course, resource, teacher, institution, and support discussions will appear here." />}
      </div>
    </Card>
  );
}

function CommunitiesPanel({ data }: { data: CommunityOSData }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3"><UsersRound className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Communities</h2></div>
      <form action={createCommunityAction} className="mt-5 grid gap-4 md:grid-cols-4">
        <Input name="name" placeholder="Community name" />
        <Select name="type"><option>TEACHER_GROUP</option><option>STUDY_GROUP</option><option>INSTITUTION</option><option>INTEREST</option><option>SUPPORT</option></Select>
        <Select name="visibility"><option>INVITE_ONLY</option><option>PRIVATE</option><option>PUBLIC</option></Select>
        <Button type="submit">Create Community</Button>
        <Textarea className="md:col-span-4" name="description" placeholder="Description" />
      </form>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.communities.length ? data.communities.map((community) => <div className="rounded-2xl border border-border bg-background p-5" key={community.id}><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{community.name}</h3><Badge>{community.type}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{community.description ?? "Community architecture ready."}</p><p className="mt-4 text-sm text-muted-foreground">{community._count.members} members - {community._count.discussions} discussions</p></div>) : <EmptyState icon={<UsersRound className="h-5 w-5" />} title="No communities yet" description="Teacher groups, study groups, institution communities, and interest groups will appear here." />}
      </div>
    </Card>
  );
}

function NotificationCenterPanel({ data }: { data: CommunityOSData }) {
  const groups = data.notifications.grouped;
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><Bell className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Notification Center</h2></div><Badge>{data.notifications.unreadCount} unread</Badge></div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><Input placeholder="Search notifications" /><Button type="button" variant="secondary"><Search className="mr-2 h-4 w-4" />Search</Button></div>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <NotificationGroup title="Today" items={groups.today} />
        <NotificationGroup title="Yesterday" items={groups.yesterday} />
        <NotificationGroup title="Earlier" items={groups.earlier} />
      </div>
    </Card>
  );
}

function NotificationGroup({ title, items }: { title: string; items: CommunityOSData["notifications"]["all"] }) {
  return <div><h3 className="font-semibold">{title}</h3><div className="mt-3 space-y-3">{items.length ? items.slice(0, 8).map((item) => <div className="rounded-xl border border-border bg-background p-4" key={item.id}><p className="font-medium">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.body ?? "Notification"}</p><form action={archiveNotificationFromInboxAction} className="mt-3"><input name="notificationId" type="hidden" value={item.id} /><button className="text-sm font-medium text-sky-700" type="submit">Archive</button></form></div>) : <p className="rounded-xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground">Nothing here.</p>}</div></div>;
}

export function AdminCommunityManagement({ data, section }: { data: CommunityOSData; section: string }) {
  return (
    <div className="space-y-8">
      <Hero eyebrow="Community Admin" title="Manage communication quality and safety." description="Announcements, communities, reports, moderation, templates, and communication analytics for TeachX." />
      {section === "announcements" ? <AnnouncementComposer data={data} /> : null}
      {section === "communities" ? <CommunitiesPanel data={data} /> : null}
      {section === "reports" ? <List title="Community Reports" icon={<Flag className="h-5 w-5" />} items={data.activities.filter((item) => item.type === "SYSTEM").map((item) => `${item.title} - ${formatDate(item.createdAt)}`)} /> : null}
      {section === "moderation" ? <ModerationPanel data={data} /> : null}
      {section === "notification-templates" ? <NotificationTemplatePanel data={data} /> : null}
      {section === "communication-analytics" ? <CommunicationAnalytics data={data} /> : null}
    </div>
  );
}

function NotificationTemplatePanel({ data }: { data: CommunityOSData }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Notification Templates</h2></div>
      <form action={createNotificationTemplateAction} className="mt-5 grid gap-4 md:grid-cols-4">
        <Input name="key" placeholder="template.key" />
        <Input name="name" placeholder="Template name" />
        <Input name="category" placeholder="Category" />
        <Select name="channel"><option>IN_APP</option><option>EMAIL</option><option>WHATSAPP</option><option>PUSH</option><option>SMS</option></Select>
        <Input className="md:col-span-2" name="subject" placeholder="Subject" />
        <Button type="submit">Save Template</Button>
        <Textarea className="md:col-span-4" name="body" placeholder="Template body with variables" />
      </form>
      <List title="Templates" icon={<Shield className="h-5 w-5" />} items={data.templates.map((item) => `${item.name} - ${item.channel} - ${item.category}`)} />
    </Card>
  );
}

function ModerationPanel({ data }: { data: CommunityOSData }) {
  const items = [...data.discussions.filter((item) => item.status === "LOCKED" || item.status === "ARCHIVED").map((item) => `${item.title} - ${item.status}`), ...data.communities.filter((item) => item.status !== "ACTIVE").map((item) => `${item.name} - ${item.status}`)];
  return <List title="Moderation Queue" icon={<Shield className="h-5 w-5" />} items={items} />;
}

function CommunicationAnalytics({ data }: { data: CommunityOSData }) {
  const sent = data.communication.communications.filter((item) => item.status === "SENT").length;
  return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Metric label="Sent" value={sent.toString()} /><Metric label="Logs" value={data.communication.logs.length.toString()} /><Metric label="Messages" value={data.inbox.conversations.length.toString()} /><Metric label="Discussions" value={data.discussions.length.toString()} /></section>;
}

function ProviderAutomationPanel({ data }: { data: CommunityOSData }) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <List title="Notification Providers" icon={<Send className="h-5 w-5" />} items={data.providers.map((item) => `${item.label} - ${item.status}`)} />
      <List title="Automation Events" icon={<Clock className="h-5 w-5" />} items={data.automationEvents.map((item) => `${item} - trigger ready`)} />
    </section>
  );
}

function List({ title, icon, items }: { title: string; icon: ReactNode; items: string[] }) {
  return <Card className="p-5 shadow-soft"><div className="flex items-center gap-3 text-sky-700">{icon}<h2 className="text-xl font-semibold text-foreground">{title}</h2></div><div className="mt-5 space-y-3">{items.length ? items.slice(0, 12).map((item) => <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm" key={item}>{item}</p>) : <EmptyState icon={<Bell className="h-5 w-5" />} title={`No ${title.toLowerCase()} yet`} description="Community activity will appear here." />}</div></Card>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card className="p-4 shadow-sm"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></Card>;
}

function Hero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8"><Badge>{eyebrow}</Badge><h1 className="mt-6 text-4xl font-semibold tracking-tight">{title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p></section>;
}
