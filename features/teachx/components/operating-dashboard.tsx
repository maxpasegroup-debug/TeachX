import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Bell, BookOpen, Bookmark, Download, FileQuestion, FileText, FolderOpen, GraduationCap, History, Lightbulb, NotebookPen, PenLine, Pin, Sparkles, Target, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { GlobalCommandBar } from "@/features/workspace/components/global-command-bar";
import type { ProfileCompletion } from "@/services/teachx-operating-service";

type ListItem = {
  title: string;
  meta?: string | null;
  href?: string | null;
};

type DashboardProps = {
  name?: string | null;
  completion: ProfileCompletion;
  recentItems: ListItem[];
  favorites: ListItem[];
  savedSearches: ListItem[];
  notifications: ListItem[];
};

function firstName(name?: string | null) {
  return name?.split(" ").filter(Boolean)[0] ?? "there";
}

function QuickActionCard({ title, description, href, icon: Icon }: { title: string; description: string; href: string; icon: LucideIcon }) {
  return (
    <Link className="group rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-primary" href={href}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-5 text-lg font-semibold">{title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
        Open
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function ListPanel({ title, icon: Icon, items, emptyTitle }: { title: string; icon: LucideIcon; items: ListItem[]; emptyTitle: string }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {items.length ? (
          items.slice(0, 4).map((item) => {
            const content = (
              <>
                <p className="truncate text-sm font-semibold">{item.title}</p>
                {item.meta ? <p className="mt-1 truncate text-xs text-muted-foreground">{item.meta}</p> : null}
              </>
            );

            return item.href ? (
              <Link className="block rounded-xl border border-border bg-background px-4 py-3 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" href={item.href} key={`${title}-${item.title}`}>
                {content}
              </Link>
            ) : (
              <div className="rounded-xl border border-border bg-background px-4 py-3" key={`${title}-${item.title}`}>
                {content}
              </div>
            );
          })
        ) : (
          <EmptyState icon={<Icon className="h-5 w-5" />} title={emptyTitle} description="Your workspace will fill this area as you use TeachX every day." />
        )}
      </div>
    </Card>
  );
}

function ProfileCompletionCard({ completion, href }: { completion: ProfileCompletion; href: string }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Profile completion</p>
          <h2 className="mt-2 text-3xl font-semibold">{completion.percentage}%</h2>
        </div>
        <Badge>{completion.missingFields.length ? `${completion.missingFields.length} missing` : "Complete"}</Badge>
      </div>
      <Progress className="mt-5" value={completion.percentage} />
      <div className="mt-5 space-y-2">
        {completion.suggestions.length ? completion.suggestions.map((suggestion) => <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900" key={suggestion}>{suggestion}</p>) : <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900">Your profile is ready to make a strong first impression.</p>}
      </div>
      <Link className="mt-5 inline-flex text-sm font-semibold text-sky-700 hover:underline" href={href}>
        Complete profile
      </Link>
    </Card>
  );
}

export function TeacherOperatingDashboard({ name, completion, recentItems, favorites, savedSearches, notifications, plan, aiCreditsRemaining, stats }: DashboardProps & { plan: string; aiCreditsRemaining: number; stats: { resourcesCreated: number; studentsHelped: number; aiCredits: number; downloads: number } }) {
  const quickActions = [
    { title: "Create Lesson", description: "Start a lesson outline and gather teaching resources.", href: "/teacher/resources", icon: FileText },
    { title: "Create Worksheet", description: "Prepare exercises and printable practice sheets.", href: "/teacher/resources", icon: PenLine },
    { title: "Question Paper", description: "Organize questions for tests and assignments.", href: "/teacher/resources", icon: FileQuestion },
    { title: "Homework", description: "Plan homework tasks and student follow-up.", href: "/teacher/resources", icon: NotebookPen },
    { title: "My Resources", description: "Open your resource library and saved drafts.", href: "/teacher/resources", icon: FolderOpen }
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>Teacher OS</Badge>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Good Morning, {firstName(name)}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Build one useful learning moment today. Small lessons compound into a powerful teaching business.</p>
          </div>
          <Card className="grid gap-4 p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="mt-1 text-lg font-semibold">{plan}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Credits Remaining</p>
              <p className="mt-1 text-lg font-semibold">{aiCreditsRemaining}</p>
            </div>
          </Card>
        </div>
      </section>

      <GlobalCommandBar />

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => <QuickActionCard {...action} key={action.title} />)}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Resources Created" value={stats.resourcesCreated.toString()} detail="Lessons, notes, files, and reusable assets" icon={<FolderOpen className="h-5 w-5" />} />
        <StatCard label="Students Helped" value={stats.studentsHelped.toString()} detail="Learners connected through your classes" icon={<UsersRound className="h-5 w-5" />} />
        <StatCard label="AI Credits" value={stats.aiCredits.toString()} detail="Ready for Phase 3 AI Studio" icon={<Sparkles className="h-5 w-5" />} />
        <StatCard label="Downloads" value={stats.downloads.toString()} detail="Resource download activity" icon={<Download className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6 lg:grid-cols-3">
          <ListPanel title="Recent Files" icon={FileText} items={recentItems} emptyTitle="No recent files yet" />
          <ListPanel title="Saved Drafts" icon={Pin} items={savedSearches} emptyTitle="No saved drafts yet" />
          <ListPanel title="Recently Opened" icon={History} items={favorites} emptyTitle="No recent activity yet" />
        </div>
        <ProfileCompletionCard completion={completion} href="/profile" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ListPanel title="Platform Updates" icon={Bell} items={notifications} emptyTitle="No announcements yet" />
        <ListPanel title="Tips & Learning Resources" icon={Lightbulb} items={[{ title: "Keep resources reusable and short", meta: "Tip" }, { title: "Use one objective per worksheet", meta: "Teaching resource" }, { title: "Complete your profile before publishing offers", meta: "Growth" }]} emptyTitle="No tips yet" />
      </section>
    </div>
  );
}

export function StudentOperatingDashboard({ name, completion, recentItems, favorites, notifications, stats }: DashboardProps & { stats: { progressCount: number; bookmarks: number; downloads: number; savedNotes: number } }) {
  const quickActions = [
    { title: "Ask AI", description: "Ask a doubt or simplify a concept.", href: "/student/ask-ai", icon: Sparkles },
    { title: "Practice", description: "Build confidence with focused practice.", href: "/student/practice", icon: Target },
    { title: "Find Teacher", description: "Discover teachers and learning support.", href: "/student/teachers", icon: UsersRound },
    { title: "Saved Notes", description: "Return to your study notes.", href: "/student/learn", icon: NotebookPen },
    { title: "Downloads", description: "Open downloaded learning material.", href: "/student/learn", icon: Download }
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>Student OS</Badge>
        <div className="mt-6">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Welcome, {firstName(name)}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Continue learning from where you left off, save what matters, and keep your next practice session close.</p>
          <Link className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-soft hover:bg-foreground focus:outline-none focus:ring-2 focus:ring-primary" href="/student/learn">
            Continue Learning
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <GlobalCommandBar />

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => <QuickActionCard {...action} key={action.title} />)}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Learning Progress" value={stats.progressCount.toString()} detail="Active progress cards" icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="Bookmarks" value={stats.bookmarks.toString()} detail="Saved learning moments" icon={<Bookmark className="h-5 w-5" />} />
        <StatCard label="Saved Notes" value={stats.savedNotes.toString()} detail="Notes captured while learning" icon={<NotebookPen className="h-5 w-5" />} />
        <StatCard label="Downloads" value={stats.downloads.toString()} detail="Offline-ready learning files" icon={<Download className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6 lg:grid-cols-3">
          <ListPanel title="Progress Cards" icon={GraduationCap} items={[{ title: "Foundations", meta: `${stats.progressCount} active learning records` }, { title: "Practice readiness", meta: "AI practice comes in Phase 3" }, { title: "Weekly learning rhythm", meta: "Keep one topic moving daily" }]} emptyTitle="No progress cards yet" />
          <ListPanel title="Recommended Learning" icon={Lightbulb} items={[{ title: "Revise your latest topic", meta: "Recommendation" }, { title: "Practice one weak area", meta: "Recommendation" }, { title: "Bookmark useful explanations", meta: "Study habit" }]} emptyTitle="No recommendations yet" />
          <ListPanel title="Recent Activity" icon={History} items={recentItems} emptyTitle="No learning history yet" />
        </div>
        <ProfileCompletionCard completion={completion} href="/profile" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <ListPanel title="Bookmarks" icon={Bookmark} items={favorites} emptyTitle="No bookmarks yet" />
        <ListPanel title="Downloads" icon={Download} items={[{ title: `${stats.downloads} files downloaded`, meta: "Learning resources" }]} emptyTitle="No downloads yet" />
        <ListPanel title="History" icon={Bell} items={notifications} emptyTitle="No history yet" />
      </section>
    </div>
  );
}
