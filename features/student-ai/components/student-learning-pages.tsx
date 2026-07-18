import Link from "next/link";
import { Bookmark, CalendarDays, CheckCircle2, Clock, Download, FileQuestion, Flame, RotateCcw, Shuffle, Star, Target, Trophy } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { studentPracticeTypes } from "@/services/student-ai-learning-service";

export function PracticeExperience() {
  return (
    <div className="space-y-8">
      <Hero title="Practice Quiz" description="Generate MCQ, fill in blanks, true/false, descriptive, one word, and match questions." />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {studentPracticeTypes.map((type) => <Card className="p-5 shadow-soft" key={type}><FileQuestion className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">{type}</p></Card>)}
      </div>
      <Card className="p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-2xl font-semibold">Quiz Experience</h2><p className="mt-1 text-muted-foreground">Timer, progress, score, review, retry, and explanation.</p></div>
          <div className="rounded-2xl bg-sky-50 px-5 py-3 font-semibold text-sky-800"><Clock className="mr-2 inline h-4 w-4" /> 10:00</div>
        </div>
        <Progress className="mt-6" value={35} />
        <div className="mt-6 rounded-2xl border border-border bg-background p-5">
          <p className="font-semibold">Question 1 of 10</p>
          <p className="mt-3 text-muted-foreground">A beautiful quiz interface is ready for generated practice questions.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {["Review", "Retry", "Explanation", "Score"].map((item) => <button className="rounded-xl border border-border px-4 py-2 text-sm font-medium" type="button" key={item}>{item}</button>)}
        </div>
      </Card>
    </div>
  );
}

export function FlashcardsPage() {
  return (
    <div className="space-y-8">
      <Hero title="Flashcards" description="Create, study, shuffle, favorite, review, and track progress." />
      <Card className="mx-auto max-w-2xl p-8 text-center shadow-soft">
        <p className="text-sm font-medium text-sky-700">Card 1 / 12</p>
        <h2 className="mt-6 text-3xl font-semibold">What is photosynthesis?</h2>
        <p className="mt-4 text-muted-foreground">Flip-card study experience ready for AI-generated decks.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="rounded-xl border border-border px-4 py-2"><Shuffle className="mr-2 inline h-4 w-4" />Shuffle</button>
          <button className="rounded-xl border border-border px-4 py-2"><Star className="mr-2 inline h-4 w-4" />Favorite</button>
          <button className="rounded-xl border border-border px-4 py-2"><RotateCcw className="mr-2 inline h-4 w-4" />Review</button>
        </div>
      </Card>
    </div>
  );
}

export function StudyPlannerPage() {
  return (
    <div className="space-y-8">
      <Hero title="Study Planner" description="Daily goals, weekly plan, exam countdown, study hours, and streak." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Daily Goal" value="45 min" icon={Target} />
        <Metric label="Weekly Plan" value="5 days" icon={CalendarDays} />
        <Metric label="Exam Countdown" value="21 days" icon={Clock} />
        <Metric label="Streak" value="7 days" icon={Flame} />
      </div>
    </div>
  );
}

export function ProgressAnalyticsPage({ mastered = 0, weak = 0, streak = 0 }: { mastered?: number; weak?: number; streak?: number }) {
  return (
    <div className="space-y-8">
      <Hero title="Progress Analytics" description="Topics mastered, weak areas, recent scores, learning time, streak, and achievements." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Topics Mastered" value={mastered.toString()} icon={Trophy} />
        <Metric label="Weak Areas" value={weak.toString()} icon={Target} />
        <Metric label="Recent Scores" value="Ready" icon={CheckCircle2} />
        <Metric label="Streak" value={`${streak} days`} icon={Flame} />
      </div>
    </div>
  );
}

export function SavedItemsPage({ title, type, items }: { title: string; type: "bookmarks" | "downloads"; items: string[] }) {
  const Icon = type === "bookmarks" ? Bookmark : Download;
  return items.length ? (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => <Card className="p-5 shadow-soft" key={item}><Icon className="h-5 w-5 text-sky-700" /><h2 className="mt-4 text-xl font-semibold">{item}</h2></Card>)}
    </div>
  ) : (
    <EmptyState icon={<Icon className="h-5 w-5" />} title={`No ${title.toLowerCase()} yet`} description="Save AI answers, notes, flashcards, practice, and generated content for quick access." />
  );
}

function Hero({ title, description }: { title: string; description: string }) {
  return <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8"><h1 className="text-4xl font-semibold tracking-tight">{title}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p></section>;
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Target }) {
  return <Card className="p-5 shadow-soft"><Icon className="h-5 w-5 text-sky-700" /><p className="mt-4 text-2xl font-semibold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></Card>;
}
