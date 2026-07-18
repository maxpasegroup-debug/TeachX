import { Archive, Bell, Check, Inbox } from "lucide-react";
import type { Notification } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { archiveNotificationAction, markNotificationReadAction } from "@/features/teachx/actions";

function groupNotifications(notifications: Notification[]) {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = yesterday.toDateString();

  return [
    { label: "Today", items: notifications.filter((item) => item.createdAt.toDateString() === today) },
    { label: "Yesterday", items: notifications.filter((item) => item.createdAt.toDateString() === yesterdayKey) },
    { label: "Earlier", items: notifications.filter((item) => ![today, yesterdayKey].includes(item.createdAt.toDateString())) }
  ].filter((group) => group.items.length > 0);
}

export function NotificationMenu({ notifications }: { notifications: Notification[] }) {
  const unreadCount = notifications.filter((item) => item.status === "UNREAD").length;
  const groups = groupNotifications(notifications);

  return (
    <div className="group relative">
      <Button aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} className="relative h-11 w-11 px-0" type="button" variant="secondary">
        <Bell className="h-5 w-5" />
        {unreadCount ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-xs font-semibold text-white">{unreadCount}</span> : null}
      </Button>
      <section className="invisible absolute right-0 top-14 z-20 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-3 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100" aria-label="Notification center">
        <div className="flex items-start justify-between gap-4 px-2 py-2">
          <div>
            <p className="font-semibold">Notifications</p>
            <p className="text-sm text-muted-foreground">{unreadCount ? `${unreadCount} unread` : "All caught up"}</p>
          </div>
          <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">TeachX</div>
        </div>

        {groups.length ? (
          <div className="mt-2 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">{group.label}</p>
                <div className="space-y-2">
                  {group.items.map((notification) => (
                    <article className="rounded-2xl border border-border bg-background p-3" key={notification.id}>
                      <div className="flex items-start gap-3">
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                          <Inbox className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold">{notification.title}</p>
                            {notification.status === "UNREAD" ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-600" /> : null}
                          </div>
                          {notification.body ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{notification.body}</p> : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {notification.status === "UNREAD" ? (
                              <form action={markNotificationReadAction}>
                                <input name="notificationId" type="hidden" value={notification.id} />
                                <button className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" type="submit">
                                  <Check className="h-3.5 w-3.5" />
                                  Read
                                </button>
                              </form>
                            ) : null}
                            <form action={archiveNotificationAction}>
                              <input name="notificationId" type="hidden" value={notification.id} />
                              <button className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" type="submit">
                                <Archive className="h-3.5 w-3.5" />
                                Archive
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4">
            <EmptyState icon={<Bell className="h-5 w-5" />} title="No notifications" description="Platform updates, tips, and learning activity will appear here." />
          </div>
        )}
      </section>
    </div>
  );
}
