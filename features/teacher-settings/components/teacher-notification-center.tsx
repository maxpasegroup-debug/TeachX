"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, CheckCheck, ExternalLink, Mail, MailOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { markAllTeacherNotificationsReadAction, setTeacherNotificationStateAction } from "@/features/teacher-settings/actions";
import type { getTeacherNotificationCenter } from "@/services/teacher-notification-service";

type Data = NonNullable<Awaited<ReturnType<typeof getTeacherNotificationCenter>>>;
const filters = ["ALL", "UNREAD", "TEACHING", "STUDENTS", "AI", "RESOURCES", "COMMUNITY", "MARKETPLACE", "BUSINESS", "INSTITUTION", "SYSTEM"];

export function TeacherNotificationCenter({ data }: { data: Data }) {
  const [filter, setFilter] = useState("ALL");
  const items = useMemo(() => data.notifications.filter((item) => filter === "ALL" || (filter === "UNREAD" ? item.status === "UNREAD" : item.category === filter)), [data.notifications, filter]);
  const unread = data.notifications.filter((item) => item.status === "UNREAD").length;
  return <div className="space-y-6">
    <section className="border bg-sky-50 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><Badge>Teacher inbox</Badge><h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Notification Center</h1><p className="mt-2 text-sm text-muted-foreground">{unread ? `${unread} notification${unread === 1 ? "" : "s"} need your attention.` : "You are all caught up."}</p></div>
      {unread ? <form action={markAllTeacherNotificationsReadAction}><Button type="submit" variant="secondary"><CheckCheck className="mr-2 h-4 w-4"/>Mark all read</Button></form> : null}</div>
    </section>
    <nav aria-label="Notification filters" className="flex gap-2 overflow-x-auto pb-2">{filters.map((item) => <button className={`min-h-11 shrink-0 rounded-md border px-4 text-sm font-medium ${filter === item ? "bg-primary text-primary-foreground" : "bg-surface"}`} key={item} onClick={() => setFilter(item)} type="button">{item === "ALL" ? "All" : item === "UNREAD" ? "Unread" : title(item)}</button>)}</nav>
    {items.length ? <div className="space-y-3">{items.map((item) => <Card className={`p-4 ${item.status === "UNREAD" ? "border-sky-300 bg-sky-50/40" : ""}`} key={item.id}><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700"><Bell className="h-5 w-5"/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><div className="flex flex-wrap gap-2"><Badge>{title(item.category)}</Badge>{item.status === "UNREAD" ? <Badge>Unread</Badge> : null}</div><h2 className="mt-2 font-semibold">{item.title}</h2></div><time className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</time></div>{item.body ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p> : null}<div className="mt-4 flex flex-wrap gap-2"><form action={setTeacherNotificationStateAction}><input name="id" type="hidden" value={item.id}/><input name="status" type="hidden" value={item.status === "UNREAD" ? "READ" : "UNREAD"}/><Button className="h-10 px-3 text-sm" type="submit" variant="secondary">{item.status === "UNREAD" ? <MailOpen className="mr-2 h-4 w-4"/> : <Mail className="mr-2 h-4 w-4"/>}{item.status === "UNREAD" ? "Mark read" : "Mark unread"}</Button></form>{item.link ? <Link className="inline-flex min-h-10 items-center rounded-md border bg-surface px-3 text-sm font-medium" href={item.link}><ExternalLink className="mr-2 h-4 w-4"/>Open related item</Link> : null}</div></div></div></Card>)}</div> : <EmptyState icon={<Bell className="h-5 w-5"/>} title={filter === "ALL" ? "No notifications yet" : "No matching notifications"} description={filter === "ALL" ? "Teaching, AI, resource, community, business, institution, and system updates will appear here." : "Choose another filter to view your notification history."}/>} 
  </div>;
}

function title(value: string) { return value.charAt(0) + value.slice(1).toLowerCase(); }
