"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, BookOpen, Bot, FileText, GraduationCap, LibraryBig, MessageCircle, Search, Settings, Sparkles, Store, UserRound } from "lucide-react";

import { Card } from "@/components/ui/card";

const quickLinks = [
  { label: "Teacher Home", href: "/teacher", group: "Pages", keywords: "teacher dashboard home", icon: Sparkles },
  { label: "AI Studio", href: "/teacher/ai-studio", group: "Pages", keywords: "ai studio teacher generate", icon: Sparkles },
  { label: "AI Chat", href: "/teacher/ai-studio/chat", group: "Tools", keywords: "chat assistant conversation", icon: Bot },
  { label: "AI History", href: "/teacher/ai-studio/history", group: "Resources", keywords: "history generations recent", icon: FileText },
  { label: "Prompt Library", href: "/teacher/ai-studio/prompts", group: "Resources", keywords: "prompt template favorites", icon: Bookmark },
  { label: "Teacher Marketplace", href: "/teacher/marketplace", group: "Pages", keywords: "marketplace profile bookings students requests", icon: Store },
  { label: "Teacher Wallet", href: "/teacher/wallet", group: "Commerce", keywords: "wallet earnings revenue sales ai credits", icon: Store },
  { label: "Communication Hub", href: "/communication", group: "Community", keywords: "inbox announcements messages booking requests discussions notifications", icon: MessageCircle },
  { label: "Marketplace Home", href: "/marketplace", group: "Pages", keywords: "find teachers subjects online nearby", icon: Store },
  { label: "Learning Marketplace", href: "/resources", group: "Pages", keywords: "resources worksheets notes lesson plans question papers marketplace", icon: LibraryBig },
  { label: "Create Lesson", href: "/teacher/resources", group: "Tools", keywords: "lesson resource create", icon: FileText },
  { label: "Create Worksheet", href: "/teacher/resources", group: "Tools", keywords: "worksheet homework resource", icon: FileText },
  { label: "Question Paper", href: "/teacher/resources", group: "Tools", keywords: "question paper exam", icon: FileText },
  { label: "My Resources", href: "/teacher/resources", group: "Resources", keywords: "files resources library", icon: LibraryBig },
  { label: "Student Home", href: "/student", group: "Pages", keywords: "student dashboard home", icon: GraduationCap },
  { label: "Continue Learning", href: "/student/learn", group: "Pages", keywords: "learning lessons continue", icon: BookOpen },
  { label: "Ask AI", href: "/student/ask-ai", group: "Tools", keywords: "ai doubt question ask", icon: Bot },
  { label: "Homework Help", href: "/student/homework", group: "Tools", keywords: "homework photo pdf notes help", icon: FileText },
  { label: "Practice", href: "/student/practice", group: "Tools", keywords: "practice quiz questions", icon: GraduationCap },
  { label: "Flashcards", href: "/student/flashcards", group: "Tools", keywords: "flash cards review shuffle", icon: BookOpen },
  { label: "Study Planner", href: "/student/planner", group: "Pages", keywords: "daily weekly exam countdown goals", icon: GraduationCap },
  { label: "Progress", href: "/student/progress", group: "Pages", keywords: "analytics streak weak areas mastered", icon: GraduationCap },
  { label: "Bookmarks", href: "/student/bookmarks", group: "Resources", keywords: "saved ai answers notes flashcards", icon: Bookmark },
  { label: "Downloads", href: "/student/downloads", group: "Resources", keywords: "notes generated content practice sheets", icon: FileText },
  { label: "Find Teacher", href: "/marketplace", group: "Pages", keywords: "teacher marketplace find", icon: Store },
  { label: "Saved Teachers", href: "/student/teachers", group: "Pages", keywords: "saved teachers requests bookings", icon: Store },
  { label: "Saved Resources", href: "/student/resources", group: "Resources", keywords: "saved resources downloads wishlist marketplace", icon: LibraryBig },
  { label: "Student Purchases", href: "/student/purchases", group: "Commerce", keywords: "orders purchases wallet subscriptions invoices ai credits", icon: FileText },
  { label: "Admin Commerce", href: "/admin/subscriptions", group: "Commerce", keywords: "subscriptions orders wallets transactions coupons revenue ai usage", icon: Store },
  { label: "Orders", href: "/admin/orders", group: "Commerce", keywords: "commerce orders resource purchase subscription credit pack", icon: FileText },
  { label: "Community Admin", href: "/admin/announcements", group: "Community", keywords: "announcements communities moderation reports notification templates analytics", icon: MessageCircle },
  { label: "Growth OS", href: "/admin", group: "Admin", keywords: "executive dashboard growth platform analytics system health", icon: Store },
  { label: "Platform Analytics", href: "/admin/platform-analytics", group: "Admin", keywords: "users active users teachers students institutions dau mau retention", icon: GraduationCap },
  { label: "AI Analytics", href: "/admin/ai-analytics", group: "Admin", keywords: "ai generations credits prompt categories usage cost", icon: Bot },
  { label: "Support Center", href: "/admin/support", group: "Admin", keywords: "support tickets feedback bugs feature requests contact", icon: FileText },
  { label: "Audit Log", href: "/admin/audit-log", group: "Admin", keywords: "audit admin actions security commerce user actions", icon: FileText },
  { label: "Profile", href: "/profile", group: "Settings", keywords: "profile account completion", icon: UserRound },
  { label: "Settings", href: "/teacher/settings", group: "Settings", keywords: "account notifications appearance language privacy security", icon: Settings }
];

export function GlobalCommandBar() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return quickLinks;
    return quickLinks.filter((item) => `${item.label} ${item.group} ${item.keywords}`.toLowerCase().includes(term));
  }, [query]);

  return (
    <Card className="p-4 shadow-soft">
      <label className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          aria-label="Search pages, resources, tools, and settings"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pages, resources, tools, settings"
          value={query}
        />
      </label>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {results.slice(0, 6).map((item) => {
          const Icon = item.icon;

          return (
            <Link className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 text-sm font-medium transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-primary" href={item.href} key={item.label}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate">{item.label}</span>
                <span className="block text-xs text-muted-foreground">{item.group}</span>
              </span>
            </Link>
          );
        })}
      </div>
      {!results.length ? <p className="px-2 py-5 text-center text-sm text-muted-foreground">No matching pages, resources, tools, or settings.</p> : null}
    </Card>
  );
}
