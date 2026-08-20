import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Bell, BookOpen, Bookmark, CalendarDays, CheckCircle2, Download, FileText, FolderOpen, GraduationCap, History, LifeBuoy, Lightbulb, NotebookPen, Pin, Sparkles, Target, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { ActivationChecklist } from "@/features/teachx/components/activation-checklist";
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
  savedDrafts: ListItem[];
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
  const isComplete = completion.percentage >= 100;

  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{isComplete ? "Profile complete" : "Complete Your Profile"}</p>
          <h2 className="mt-2 text-3xl font-semibold">{completion.percentage}%</h2>
        </div>
        <Badge>{completion.missingFields.length ? `${completion.missingFields.length} missing` : "Complete"}</Badge>
      </div>
      <Progress className="mt-5" value={completion.percentage} />
      <div className="mt-5 space-y-2">
        {completion.suggestions.length ? completion.suggestions.slice(0, 2).map((suggestion) => <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900" key={suggestion}>{suggestion}</p>) : <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900">Your profile is ready to make a strong first impression.</p>}
      </div>
      <Link className="mt-5 inline-flex text-sm font-semibold text-sky-700 hover:underline" href={href}>
        {isComplete ? "View profile" : "Go to Profile"}
      </Link>
    </Card>
  );
}

export function TeacherOperatingDashboard({ name, completion, recentItems, favorites, savedDrafts, notifications, plan, aiCreditsRemaining, stats, daily, canAccessInstitution }: DashboardProps & {
  plan: string;
  aiCreditsRemaining: number;
  stats: { resourcesCreated: number; studentsHelped: number; aiCredits: number; downloads: number };
  daily: { todaysClasses: ListItem[]; schedule: ListItem[]; pendingTasks: ListItem[]; recentAI: ListItem[]; recentResources: ListItem[]; activity: ListItem[] };
  canAccessInstitution: boolean;
}) {
  const simpleActions = [
    { title: "Create Lesson", description: "Use AI to prepare a classroom-ready lesson plan.", href: "/teacher/ai-studio/create/lesson-generator", icon: Sparkles },
    { title: "Create Worksheet", description: "Make a printable practice sheet with answers.", href: "/teacher/ai-studio/create/worksheet-generator", icon: FileText },
    { title: "Create Quiz", description: "Generate quick questions for revision or assessment.", href: "/teacher/ai-studio/create/quiz-generator", icon: CheckCircle2 },
    { title: "My Classes", description: "Open attendance, homework, students, and materials.", href: "/teacher/workspace/classrooms", icon: UsersRound },
    { title: "My Downloads", description: "Find resources you saved, bought, or downloaded.", href: "/teacher/workspace/resources", icon: Download },
    { title: "Get Help", description: "Ask the launch team for support or report a problem.", href: "/teacher/support", icon: LifeBuoy }
  ];

  const templateActions = [
    { title: "40 minute lesson", href: "/teacher/ai-studio/create/lesson-generator", meta: "Objective, activities, homework" },
    { title: "10 question worksheet", href: "/teacher/ai-studio/create/worksheet-generator", meta: "Mixed questions with answer key" },
    { title: "Parent message", href: "/teacher/ai-studio/create/parent-communication", meta: "Respectful WhatsApp or email draft" },
    { title: "Homework set", href: "/teacher/ai-studio/create/homework-generator", meta: "Clear tasks and submission notes" }
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5 shadow-soft sm:p-8">
        <Badge>Teacher Simple Mode</Badge>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Good morning, {firstName(name)}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Start with one useful teaching task. Create, save, and share material without opening the advanced tools first.</p>
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

      <ActivationChecklist name={name} profileCompletionPercentage={completion.percentage} role="teacher" />

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Start Here</h2>
            <p className="mt-1 text-sm text-muted-foreground">The six actions most teachers need on day one.</p>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold hover:bg-muted" href="/teacher/ai-studio">
            All AI tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {simpleActions.map((action) => <QuickActionCard {...action} key={action.title} />)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Ready Templates</h2>
              <p className="mt-1 text-sm text-muted-foreground">Fast paths for common classroom work.</p>
            </div>
            <Sparkles className="h-5 w-5 text-sky-700" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {templateActions.map((item) => (
              <Link className="rounded-xl border border-border bg-background p-4 hover:border-sky-200 hover:bg-sky-50" href={item.href} key={item.title}>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.meta}</p>
              </Link>
            ))}
          </div>
        </Card>
        <ProfileCompletionCard completion={completion} href="/profile" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Resources Created" value={stats.resourcesCreated.toString()} detail="Lessons, notes, files, and reusable assets" icon={<FolderOpen className="h-5 w-5" />} />
        <StatCard label="Teaching Reach" value={stats.studentsHelped.toString()} detail="Classroom and booking relationships supported" icon={<UsersRound className="h-5 w-5" />} />
        <StatCard label="AI Credits" value={stats.aiCredits.toString()} detail="Available for AI Workspace creation" icon={<Sparkles className="h-5 w-5" />} />
        <StatCard label="Downloads" value={stats.downloads.toString()} detail="Resource download activity" icon={<Download className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6 lg:grid-cols-3">
          <ListPanel title="Recent Files" icon={FileText} items={recentItems} emptyTitle="No recent files yet" />
          <ListPanel title="Saved Drafts" icon={Pin} items={savedDrafts} emptyTitle="No saved drafts yet" />
          <ListPanel title="Recently Opened" icon={History} items={recentItems} emptyTitle="No recently opened items" />
        </div>
        <GlobalCommandBar />
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Advanced Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            ["AI Studio", "/teacher/ai-studio"],
            ["Workspace", "/teacher/workspace/classrooms"],
            ["Marketplace", "/teacher/business/marketplace"],
            ["Community", "/teacher/community/home"],
            ["Institution", canAccessInstitution ? "/institution/dashboard" : "/teacher/workspace/classrooms"],
            ["Business Dashboard", "/teacher/business/earnings"],
            ["Recent Files", "/teacher/workspace/resources"],
            ["Calendar", "/teacher/workspace/planner"],
            ["Planner", "/teacher/workspace/planner"],
            ["Notifications", "/teacher/workspace/notifications"],
            ["Get Help", "/teacher/support"]
          ].map(([label, href]) => <Link className="rounded-2xl border border-border bg-surface p-4 text-sm font-semibold shadow-sm hover:bg-muted" href={href} key={label}>{label}</Link>)}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ListPanel title="Today's Schedule" icon={CalendarDays} items={daily.schedule} emptyTitle="No schedule today" />
        <ListPanel title="Today's Classes" icon={UsersRound} items={daily.todaysClasses} emptyTitle="No classes today" />
        <ListPanel title="Pending Tasks" icon={Pin} items={daily.pendingTasks} emptyTitle="You're all caught up" />
        <ListPanel title="Recent AI Activities" icon={Sparkles} items={daily.recentAI} emptyTitle="No recent AI activity" />
        <ListPanel title="Recent Resources" icon={FolderOpen} items={daily.recentResources} emptyTitle="No recent resources" />
        <ListPanel title="Notifications" icon={Bell} items={notifications} emptyTitle="No notifications" />
        <ListPanel title="Continue Working" icon={ArrowRight} items={recentItems} emptyTitle="Nothing in progress" />
        <ListPanel title="Recently Opened" icon={History} items={recentItems} emptyTitle="No recently opened items" />
        <ListPanel title="Recent Activity" icon={Lightbulb} items={daily.activity} emptyTitle="No recent workspace activity" />
      </section>
    </div>
  );
}

// Future ClassTutor Frontend: retained for the student platform split.
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
