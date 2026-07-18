import Link from "next/link";
import { BookOpen, Bookmark, Brain, CalendarDays, Clock, Download, FileQuestion, Languages, Lightbulb, Map, MessageCircle, NotebookPen, Search, Sparkles, Target, Trophy, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { GlobalCommandBar } from "@/features/workspace/components/global-command-bar";
import type { getStudentAIHome } from "@/services/student-ai-learning-service";

type StudentAIHomeProps = {
  name?: string | null;
  data: Awaited<ReturnType<typeof getStudentAIHome>>;
};

const quickActions = [
  { title: "Ask AI", description: "Ask a doubt and learn step by step.", href: "/student/ask-ai", icon: Sparkles },
  { title: "Homework Help", description: "Upload question/photo/PDF placeholders.", href: "/student/homework", icon: NotebookPen },
  { title: "Explain Topic", description: "Make any concept easier.", href: "/student/ask-ai?mode=Explain", icon: Lightbulb },
  { title: "Practice Quiz", description: "MCQ, true/false, descriptive, match.", href: "/student/practice", icon: FileQuestion },
  { title: "Flashcards", description: "Create, study, shuffle, favorite.", href: "/student/flashcards", icon: Brain },
  { title: "Revision", description: "Summaries, notes, exam mode.", href: "/student/revision", icon: BookOpen },
  { title: "Mind Map", description: "Turn topics into visual structure.", href: "/student/ask-ai?mode=Mind%20Map", icon: Map },
  { title: "Summarize Chapter", description: "Make chapters crisp and memorable.", href: "/student/ask-ai?mode=Summarize", icon: NotebookPen },
  { title: "Prepare for Exam", description: "Countdown, goals, weak areas.", href: "/student/planner", icon: Target },
  { title: "Find Teacher", description: "Teacher discovery architecture.", href: "/student/teachers", icon: UsersRound }
];

export function StudentAIHome({ name, data }: StudentAIHomeProps) {
  const firstName = name?.split(" ")[0] ?? "Student";
  const continueClassroom = data.home.continueLearning;
  const focus = data.home.pendingAssignments[0]?.title ?? data.home.todaysClasses[0]?.entry.subject?.name ?? "Revise one important topic";

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>Student AI Learning Companion</Badge>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Welcome, {firstName}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Your calm learning coach for doubts, practice, revision, notes, and exam readiness.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="rounded-2xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-soft hover:bg-foreground" href={continueClassroom ? `/learning/${continueClassroom.id}` : "/student/learn"}>
                Continue Learning
              </Link>
              <Link className="rounded-2xl border border-border bg-surface px-6 py-3 font-medium hover:bg-muted" href="/student/ask-ai">
                Ask AI Tutor
              </Link>
            </div>
          </div>
          <Card className="p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Today's Focus</p>
            <h2 className="mt-2 text-xl font-semibold">{focus}</h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Daily Goal</p><p className="font-semibold">45 min</p></div>
              <div><p className="text-sm text-muted-foreground">Study Streak</p><p className="font-semibold">{data.progress.studyStreak} days</p></div>
            </div>
            <Progress className="mt-5" value={Math.min(100, data.progress.progressAverage)} />
          </Card>
        </div>
      </section>

      <GlobalCommandBar />

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link className="rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-primary" href={action.href} key={action.title}>
                <Icon className="h-5 w-5 text-sky-700" />
                <h3 className="mt-4 text-lg font-semibold">{action.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Topics Mastered" value={data.progress.masteredTopics.toString()} detail="Topics above 80% progress" icon={<Trophy className="h-5 w-5" />} />
        <StatCard label="Weak Areas" value={data.progress.weakAreas.toString()} detail="Topics to revisit" icon={<Target className="h-5 w-5" />} />
        <StatCard label="Learning Time" value={`${Math.round(data.progress.learningTime / 60)}m`} detail="Recorded learning time" icon={<Clock className="h-5 w-5" />} />
        <StatCard label="AI Sessions" value={data.aiUsage.generationCount.toString()} detail={`${data.aiUsage.todayTokens} tokens today`} icon={<Sparkles className="h-5 w-5" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Learning Progress" icon={BookOpen} items={data.home.progress.map((item) => `${item.completion}% complete • streak ${item.studyStreak}`)} empty="No learning progress yet." />
          <Panel title="Recent Scores" icon={FileQuestion} items={data.progress.recentScores.map((score) => `${score}% score`)} empty="No quiz scores yet." />
          <Panel title="Achievements" icon={Trophy} items={data.progress.achievements.map(String)} empty="Achievements will appear here." />
        </div>
        <Card className="p-5 shadow-soft">
          <h2 className="text-xl font-semibold">Multilingual Learning</h2>
          <div className="mt-5 grid gap-3">
            {["English", "Malayalam", "Hindi", "Tamil", "Arabic placeholder"].map((language) => (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm" key={language}>
                <Languages className="h-4 w-4 text-sky-700" />
                {language}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Panel title="Bookmarks" icon={Bookmark} items={data.bookmarks.map((item) => item.label ?? item.targetType)} empty="No bookmarks yet." />
        <Panel title="Downloads" icon={Download} items={data.downloads.map((item) => item.item.title)} empty="No downloads yet." />
        <Panel title="Recent AI History" icon={MessageCircle} items={data.conversations.map((item) => item.title)} empty="No AI history yet." />
      </section>

      <section>
        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-sky-700" />
            <h2 className="text-xl font-semibold">Search Topics, Questions, Resources, Teachers</h2>
          </div>
          <input className="mt-5 h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary" placeholder="Search your learning world" aria-label="Search topics, questions, resources, teachers" />
        </Card>
      </section>
    </div>
  );
}

function Panel({ title, icon: Icon, items, empty }: { title: string; icon: typeof BookOpen; items: string[]; empty: string }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Icon className="h-5 w-5 text-sky-700" />
      </div>
      <div className="mt-5 space-y-3">
        {items.length ? items.slice(0, 5).map((item) => <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground" key={item}>{item}</p>) : <EmptyState icon={<Icon className="h-5 w-5" />} title={empty} description="Start learning with TeachX and this space will fill automatically." />}
      </div>
    </Card>
  );
}
