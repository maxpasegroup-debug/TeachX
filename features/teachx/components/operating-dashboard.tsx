import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Bell, BookOpen, Bookmark, BriefcaseBusiness, CalendarDays, CheckCircle2, Download, FileText, FolderOpen, GraduationCap, Headphones, Heart, History, Lightbulb, NotebookPen, Pin, Sparkles, Target, UsersRound } from "lucide-react";

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
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const quickCreate = [
    { title: "Lesson", href: "/teacher/ai-studio/create/lesson-generator", icon: BookOpen },
    { title: "Worksheet", href: "/teacher/ai-studio/create/worksheet-generator", icon: FileText },
    { title: "Quiz", href: "/teacher/ai-studio/create/quiz-generator", icon: CheckCircle2 },
    { title: "Question Paper", href: "/teacher/ai-studio/create/question-paper-builder", icon: NotebookPen }
  ];
  const actionItems = [...daily.pendingTasks, ...daily.todaysClasses, ...notifications].slice(0, 5);
  const unreadNotifications = notifications.slice(0, 4);

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5"><div><Badge>Teacher Home</Badge><p className="mt-4 text-sm font-medium text-sky-800">{today}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Good morning, {firstName(name)}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Your teaching day, priorities, and creation tools are ready in one place.</p></div><Card className="min-w-52 p-4 shadow-sm"><p className="text-xs text-muted-foreground">AI workspace</p><p className="mt-1 font-semibold">{plan}</p><p className="mt-3 text-2xl font-semibold">{aiCreditsRemaining}</p><p className="text-xs text-muted-foreground">credits available</p></Card></div>
      </section>
      <section><div className="mb-4"><h2 className="text-2xl font-semibold">Your Teacher Life OS</h2><p className="mt-1 text-sm text-muted-foreground">Choose the outcome you need. Your existing TeachX tools remain underneath.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
        { title: "Save Time", detail: "Teach, create, plan and organize", href: "/teacher/life/save-time", icon: Sparkles, tone: "text-sky-700 bg-sky-50" },
        { title: "Earn More", detail: "Profile, 1:1 teaching, publishing and earnings", href: "/teacher/life/earn-more", icon: BriefcaseBusiness, tone: "text-emerald-700 bg-emerald-50" },
        { title: "Learn More", detail: "AI skills and professional development", href: "/teacher/life/learn-more", icon: Headphones, tone: "text-amber-700 bg-amber-50" },
        { title: "Enjoy More", detail: "More life beyond the classroom", href: "/teacher/life/enjoy-more", icon: Heart, tone: "text-rose-700 bg-rose-50" }
      ].map(({ title, detail, href, icon: Icon, tone }) => <Link className="group min-w-0 rounded-md border bg-surface p-5 shadow-soft hover:border-sky-300" href={href} key={title}><span className={`grid h-10 w-10 place-items-center rounded-md ${tone}`}><Icon className="h-5 w-5" /></span><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-2 min-h-10 text-sm text-muted-foreground">{detail}</p><span className="mt-4 inline-flex items-center text-sm font-semibold text-sky-700">Open <ArrowRight className="ml-2 h-4 w-4" /></span></Link>)}</div></section>
      <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><ListPanel title="Today's actions" icon={CheckCircle2} items={actionItems} emptyTitle="You are all caught up" /><Card className="p-5 shadow-soft"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Quick create</h2><Link className="text-sm font-semibold text-sky-700 hover:underline" href="/teacher/ai-studio">AI Studio</Link></div><div className="mt-4 grid grid-cols-2 gap-3">{quickCreate.map(({title,href,icon:Icon})=><Link key={title} href={href} className="rounded-xl border bg-background p-3 text-sm font-semibold hover:border-sky-200 hover:bg-sky-50"><Icon className="mb-2 h-5 w-5 text-sky-700"/>{title}</Link>)}</div></Card></section>
      <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><Card className="p-5 shadow-soft"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">TARA</h2><p className="mt-1 text-sm text-muted-foreground">Your AI partner for planning, teaching, creation, business, and learning.</p></div><Sparkles className="h-5 w-5 text-sky-700"/></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{[["Ask TARA","/tara"],["Prepare today's lesson","/teacher/ai-studio/create/lesson-generator"],["Create a class activity","/teacher/ai-studio/create/classroom-activity-generator"],["Write a parent message","/teacher/ai-studio/create/parent-communication"]].map(([label,href])=><Link key={label} href={href} className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-sky-50">{label}<ArrowRight className="float-right h-4 w-4"/></Link>)}</div></Card>{completion.percentage < 100 ? <ProfileCompletionCard completion={completion} href="/teacher/business/profile" /> : <ListPanel title="Important notifications" icon={Bell} items={unreadNotifications} emptyTitle="No important notifications" />}</section>
      <section><div className="mb-4 flex items-center justify-between"><div><h2 className="text-2xl font-semibold">Teaching snapshot</h2><p className="mt-1 text-sm text-muted-foreground">What is active in your teaching workspace.</p></div><Link href="/teacher/workspace/classrooms" className="text-sm font-semibold text-sky-700 hover:underline">Open Teaching</Link></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Active classes" value={daily.schedule.length.toString()} detail="Scheduled teaching sessions" icon={<CalendarDays className="h-5 w-5"/>}/><StatCard label="Students" value={stats.studentsHelped.toString()} detail="Across your class relationships" icon={<UsersRound className="h-5 w-5"/>}/><StatCard label="Resources" value={stats.resourcesCreated.toString()} detail="Created in your workspace" icon={<FolderOpen className="h-5 w-5"/>}/><StatCard label="Pending work" value={daily.pendingTasks.length.toString()} detail="Attendance and review actions" icon={<Pin className="h-5 w-5"/>}/></div></section>
      <section className="grid gap-5 xl:grid-cols-3"><ListPanel title="Recent AI creations" icon={Sparkles} items={daily.recentAI} emptyTitle="No AI creations yet" /><ListPanel title="Recent resources" icon={FolderOpen} items={daily.recentResources} emptyTitle="No resources yet" /><ListPanel title="Recently opened" icon={History} items={recentItems} emptyTitle="No recently opened items" /></section>
      <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><div className="grid gap-5 sm:grid-cols-2"><ListPanel title="Saved drafts" icon={Pin} items={savedDrafts} emptyTitle="No saved drafts yet" /><ListPanel title="Saved resources" icon={Bookmark} items={favorites} emptyTitle="No saved resources yet" /></div><Card className="p-5 shadow-soft"><p className="text-sm text-muted-foreground">Teaching business</p><h2 className="mt-2 text-xl font-semibold">Keep your professional work growing.</h2><p className="mt-3 text-sm text-muted-foreground">{stats.downloads} resource downloads are recorded in this workspace.</p><Link href="/teacher/business/profile" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline">Open Business <ArrowRight className="h-4 w-4"/></Link></Card></section>
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]"><ListPanel title="Notification preview" icon={Bell} items={unreadNotifications} emptyTitle="No notifications" /><div className="space-y-4"><GlobalCommandBar /><Link className="block rounded-2xl border bg-surface p-4 text-sm font-semibold hover:bg-muted" href={canAccessInstitution ? "/institution/dashboard" : "/teacher/support"}>{canAccessInstitution ? "Open institution workspace" : "Need a hand? Open help"}</Link></div></section>
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
