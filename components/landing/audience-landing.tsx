import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileQuestion,
  LayoutDashboard,
  LibraryBig,
  MessageCircle,
  PenLine,
  Presentation,
  ReceiptText,
  Sparkles,
  Star,
  Store,
  UserRoundCheck,
  WalletCards,
  WandSparkles
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { MotionPrimitive } from "@/components/brand/motion-primitives";

type AudienceLandingConfig = {
  audience: "teacher" | "student";
  primaryHref: string;
  primaryLabel: string;
  loginHref: string;
};

type IconCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
};

type ToolTile = {
  title: string;
  icon: LucideIcon;
  tone: string;
};

export const teacherLanding: AudienceLandingConfig = {
  audience: "teacher",
  primaryHref: "/signup/teacher",
  primaryLabel: "Get Started",
  loginHref: "/login"
};

// Future ClassTutor Frontend: retained for the student product split.
// TeachX Guru public pages should continue to render the teacher landing.
export const studentLanding: AudienceLandingConfig = {
  audience: "student",
  primaryHref: "/signup/student",
  primaryLabel: "Get Started",
  loginHref: "/login"
};

const whyCards: IconCard[] = [
  {
    title: "Create Faster",
    description: "Turn ideas into lessons, worksheets, and class material in minutes.",
    icon: BrainCircuit,
    tone: "from-blue-500 to-cyan-400"
  },
  {
    title: "Teach Better",
    description: "Keep resources, plans, students, and follow-ups in one calm workspace.",
    icon: BookOpen,
    tone: "from-violet-500 to-fuchsia-400"
  },
  {
    title: "Grow Income",
    description: "Build a professional profile, publish resources, and prepare to earn.",
    icon: CircleDollarSign,
    tone: "from-amber-400 to-orange-500"
  }
];

const toolTiles: ToolTile[] = [
  { title: "Lesson Generator", icon: WandSparkles, tone: "bg-blue-50 text-blue-700" },
  { title: "Worksheet Generator", icon: PenLine, tone: "bg-violet-50 text-violet-700" },
  { title: "Quiz Generator", icon: ClipboardCheck, tone: "bg-emerald-50 text-emerald-700" },
  { title: "Question Paper", icon: FileQuestion, tone: "bg-orange-50 text-orange-700" },
  { title: "Presentation", icon: Presentation, tone: "bg-fuchsia-50 text-fuchsia-700" },
  { title: "Student Feedback", icon: MessageCircle, tone: "bg-cyan-50 text-cyan-700" },
  { title: "Rubric Builder", icon: ReceiptText, tone: "bg-slate-100 text-slate-800" },
  { title: "Flashcards", icon: BookOpen, tone: "bg-yellow-50 text-yellow-700" },
  { title: "Progress Reports", icon: BarChart3, tone: "bg-indigo-50 text-indigo-700" },
  { title: "Certificates", icon: BadgeCheck, tone: "bg-rose-50 text-rose-700" },
  { title: "Attendance", icon: UserRoundCheck, tone: "bg-teal-50 text-teal-700" },
  { title: "Planner", icon: CalendarDays, tone: "bg-sky-50 text-sky-700" }
];

const daySteps = [
  ["Morning", "Open tomorrow's lesson plan."],
  ["AI creates lesson", "Objectives, activities, and notes appear."],
  ["Worksheet generated", "Practice work is ready before class."],
  ["Class completed", "Feedback and follow-up stay organized."],
  ["Homework sent", "Resources move into your teaching library."],
  ["Teacher earns", "Published resources create new growth paths."]
];

const marketplaceCards = [
  ["Algebra Worksheet Pack", "Free", "2.4k downloads", "4.9"],
  ["Grade 8 Science Quiz", "Pro", "812 downloads", "4.8"],
  ["Monthly Lesson Bundle", "Pro", "1.1k downloads", "4.9"]
];

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    line: "Start your teacher workspace.",
    features: ["AI starter credits", "Professional profile", "Resource drafts", "Marketplace preview"]
  },
  {
    name: "Pro",
    price: "799",
    line: "Create, publish, and grow.",
    featured: true,
    features: ["More AI credits", "Publish resources", "Teacher analytics", "Priority launch tools"]
  },
  {
    name: "Institution",
    price: "Custom",
    line: "For teams and training centers.",
    features: ["Multiple teachers", "Shared resource library", "Admin controls", "Launch support"]
  }
];

const faqItems = [
  ["What is TeachX Guru?", "A professional AI workspace built exclusively for teachers."],
  ["Is TeachX Guru an LMS?", "No. It is a creation, resource, profile, and growth workspace for teachers."],
  ["Can I start free?", "Yes. The Free plan is designed to help teachers experience the workspace first."],
  ["Can I create worksheets and question papers?", "Yes. The AI workspace is built around everyday teaching output."],
  ["Can teachers earn?", "TeachX Guru prepares resource publishing, marketplace visibility, and future earning paths."],
  ["Is it useful for tutors and institutes?", "Yes. Tutors, faculty, academic coaches, and training centers can use the same workspace."]
];

const workspaceNav: Array<{ icon: LucideIcon; label: string }> = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Sparkles, label: "AI Studio" },
  { icon: LibraryBig, label: "Resources" },
  { icon: Store, label: "Marketplace" },
  { icon: WalletCards, label: "Wallet" }
];

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-blue">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl lg:text-6xl">{title}</h2>
      {description ? <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function MiniWindow({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.6rem] border border-white/80 bg-white/84 p-4 shadow-brand-soft backdrop-blur-xl ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

function WorkspaceMockup() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="absolute -left-10 top-12 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl motion-soft-glow" />
      <div className="absolute -right-8 bottom-8 h-52 w-52 rounded-full bg-orange-300/20 blur-3xl motion-soft-glow" />
      <div className="premium-glass-card relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/76 p-4 shadow-brand backdrop-blur-2xl sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-[2rem] bg-brand-ink p-5 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-sm font-semibold">TX</span>
              <div>
                <p className="font-semibold">Teacher OS</p>
                <p className="text-xs text-white/55">Live workspace</p>
              </div>
            </div>
            <div className="mt-8 space-y-2">
              {workspaceNav.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 text-sm text-white/78 first:bg-white first:text-brand-ink" key={item.label}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </aside>
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <MiniWindow title="Lesson Generator">
                <div className="space-y-3">
                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-800">Grade 9 Physics</p>
                    <h3 className="mt-2 text-2xl font-semibold">Newton Laws</h3>
                  </div>
                  {["Learning outcomes", "Class activity", "Homework prompts"].map((item) => (
                    <div className="flex items-center gap-3 rounded-2xl bg-muted/70 px-4 py-3 text-sm font-medium text-muted-foreground" key={item}>
                      <Check className="h-4 w-4 text-emerald-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </MiniWindow>
              <MiniWindow className="motion-float" title="AI Assistant">
                <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 p-5 text-white">
                  <Sparkles className="h-6 w-6" />
                  <p className="mt-6 text-xl font-semibold">Prepare the next class.</p>
                  <p className="mt-2 text-sm text-white/76">Lesson, worksheet, quiz, and notes queued.</p>
                </div>
              </MiniWindow>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {["Worksheet Builder", "Question Paper", "Teacher Profile"].map((title, index) => (
                <div className="rounded-[1.5rem] border border-border/70 bg-white p-5 shadow-sm" key={title}>
                  <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-cyan-100 text-cyan-700" : "bg-rose-100 text-rose-700"}`}>
                    {index === 0 ? <PenLine className="h-5 w-5" /> : index === 1 ? <FileQuestion className="h-5 w-5" /> : <UserRoundCheck className="h-5 w-5" />}
                  </div>
                  <p className="font-semibold">{title}</p>
                  <div className="mt-4 h-2 rounded-full bg-muted" />
                  <div className="mt-2 h-2 w-2/3 rounded-full bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowcasePanel({ eyebrow, title, icon: Icon, children }: { eyebrow: string; title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <article className="premium-glass-card overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/80 p-5 shadow-brand backdrop-blur-2xl sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">{eyebrow}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">{title}</h3>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {children}
    </article>
  );
}

export function AudienceLanding({ config }: { config: AudienceLandingConfig }) {
  return (
    <main className="min-h-screen overflow-hidden bg-surface text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_28%_0%,rgba(37,99,235,0.18),transparent_42%),radial-gradient(circle_at_76%_10%,rgba(245,158,11,0.14),transparent_34%),radial-gradient(circle_at_50%_20%,rgba(168,85,247,0.12),transparent_38%)]" />

      <header className="sticky top-4 z-50 mx-auto flex w-[min(1120px,calc(100%-1.5rem))] items-center justify-between rounded-full border border-white/80 bg-white/78 px-4 py-3 shadow-brand-soft backdrop-blur-2xl sm:px-5">
        <BrandLogo markClassName="h-10 w-10 rounded-[1rem]" textClassName="hidden sm:block" />
        <nav aria-label="TeachX Guru landing navigation" className="flex items-center gap-2">
          <Link className="nav-link hidden rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition duration-brand ease-brand hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:inline-flex" href="#pricing">
            Pricing
          </Link>
          <Link className="nav-link rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition duration-brand ease-brand hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={config.loginHref}>
            Login
          </Link>
          <Link className="premium-button inline-flex h-11 items-center justify-center rounded-full bg-brand-ink px-5 text-sm font-semibold text-white shadow-brand-soft transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={config.primaryHref}>
            Get Started
          </Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 pt-20 text-center sm:px-8 lg:pb-24 lg:pt-24">
        <MotionPrimitive variant="fade-up">
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            The Professional AI Workspace for Teachers
          </div>
          <h1 className="mx-auto max-w-6xl text-6xl font-semibold leading-[0.96] tracking-normal text-foreground sm:text-7xl lg:text-8xl">
            The operating system teachers always deserved.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-xl leading-8 text-muted-foreground">
            Create lessons, publish resources, manage your profile, and grow your teaching business in one beautiful AI workspace.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link className="premium-button inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-ink px-8 text-base font-semibold text-white shadow-brand transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={config.primaryHref}>
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="premium-button-light inline-flex h-14 items-center justify-center rounded-full border border-border bg-white/86 px-8 text-base font-semibold text-foreground shadow-sm backdrop-blur transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="#showcase">
              Explore workspace
            </Link>
          </div>
        </MotionPrimitive>
        <MotionPrimitive className="mt-16" delay="sm" variant="scale">
          <WorkspaceMockup />
        </MotionPrimitive>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <SectionHeading eyebrow="Why TeachX" title="One workspace. Three outcomes." />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {whyCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="premium-glass-card rounded-[2rem] border border-white/80 bg-white/78 p-7 shadow-brand-soft backdrop-blur" key={card.title}>
                <div className={`mb-10 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br ${card.tone} text-white shadow-brand-soft`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-semibold tracking-normal">{card.title}</h2>
                <p className="mt-4 text-lg leading-7 text-muted-foreground">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8" id="showcase">
        <SectionHeading eyebrow="Product Showcase" title="Let the workspace speak." description="Big surfaces for the work teachers do every day." />
        <div className="mt-12 grid gap-6">
          <ShowcasePanel eyebrow="AI Studio" icon={Sparkles} title="From blank page to class-ready.">
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-violet-600 p-7 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Prompt</p>
                <h4 className="mt-4 text-4xl font-semibold">Create a 40-minute lesson on photosynthesis.</h4>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {["Lesson", "Worksheet", "Quiz"].map((item) => <span className="rounded-2xl bg-white/14 px-4 py-3 text-sm font-semibold" key={item}>{item}</span>)}
                </div>
              </div>
              <div className="space-y-3 rounded-[2rem] bg-muted/60 p-5">
                {["Objectives generated", "Activity mapped", "Homework ready", "Export queued"].map((item) => (
                  <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-sm font-semibold shadow-sm" key={item}>
                    <Check className="h-4 w-4 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </ShowcasePanel>

          <ShowcasePanel eyebrow="Resource Library" icon={LibraryBig} title="Your best work compounds.">
            <div className="grid gap-4 md:grid-cols-3">
              {["Worksheet Packs", "Question Banks", "Lesson Notes"].map((item, index) => (
                <div className="rounded-[1.8rem] border border-border/70 bg-white p-6 shadow-sm" key={item}>
                  <div className={`mb-8 h-32 rounded-[1.4rem] ${index === 0 ? "bg-blue-100" : index === 1 ? "bg-amber-100" : "bg-violet-100"}`} />
                  <h4 className="text-xl font-semibold">{item}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">Organized, reusable, and ready to publish.</p>
                </div>
              ))}
            </div>
          </ShowcasePanel>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <SectionHeading eyebrow="Your Teaching Day" title="From morning plan to evening growth." />
        <div className="relative mx-auto mt-12 max-w-4xl">
          <div className="absolute left-5 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-blue-500 via-violet-400 to-orange-400 sm:block" />
          <div className="space-y-4">
            {daySteps.map(([time, action], index) => (
              <div className="premium-glass-card grid gap-4 rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-brand-soft backdrop-blur sm:grid-cols-[auto_1fr] sm:items-center" key={time}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-ink text-sm font-semibold text-white">{index + 1}</div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-xl font-semibold">{time}</h3>
                  <p className="text-muted-foreground">{action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <SectionHeading eyebrow="AI Tools" title="The tools teachers open every week." />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {toolTiles.map((tool) => {
            const Icon = tool.icon;
            return (
              <article className="premium-glass-card rounded-[1.6rem] border border-white/80 bg-white/78 p-5 shadow-sm backdrop-blur" key={tool.title}>
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${tool.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold leading-tight">{tool.title}</h3>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <SectionHeading eyebrow="Resource Marketplace" title="Publish once. Grow beyond one classroom." />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {marketplaceCards.map(([title, price, downloads, rating], index) => (
            <article className="premium-glass-card overflow-hidden rounded-[2rem] border border-white/80 bg-white/82 shadow-brand-soft backdrop-blur" key={title}>
              <div className={`h-44 ${index === 0 ? "bg-gradient-to-br from-blue-500 to-cyan-400" : index === 1 ? "bg-gradient-to-br from-violet-500 to-fuchsia-400" : "bg-gradient-to-br from-orange-400 to-amber-300"} p-5 text-white`}>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/18 px-3 py-1 text-sm font-semibold">{price}</span>
                  <span className="flex items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-white" />{rating}</span>
                </div>
                <h3 className="mt-14 text-2xl font-semibold">{title}</h3>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-muted-foreground">{downloads}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Teacher earnings</span>
                  <span className="font-semibold text-emerald-700">Ready</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <SectionHeading eyebrow="Teacher Success" title="Built for teachers becoming brands." />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[
            ["Anika", "Math Tutor", "I stopped rebuilding the same worksheet every week."],
            ["Rahul", "Science Faculty", "My profile, resources, and AI prep finally live together."],
            ["Meera", "Academic Coach", "TeachX Guru feels like it was built around my day."]
          ].map(([name, role, quote], index) => (
            <figure className="premium-glass-card rounded-[2rem] border border-white/80 bg-white/80 p-7 shadow-brand-soft backdrop-blur" key={name}>
              <div className={`mb-7 flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white ${index === 0 ? "bg-blue-500" : index === 1 ? "bg-violet-500" : "bg-orange-400"}`}>{name[0]}</div>
              <blockquote className="text-2xl font-semibold leading-tight">&ldquo;{quote}&rdquo;</blockquote>
              <figcaption className="mt-6 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{name}</span> / {role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8" id="pricing">
        <SectionHeading eyebrow="Pricing" title="Start free. Upgrade when teaching grows." />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article className={`premium-glass-card rounded-[2rem] border p-7 shadow-brand-soft backdrop-blur ${plan.featured ? "border-brand-blue/30 bg-brand-ink text-white" : "border-white/80 bg-white/82 text-foreground"}`} key={plan.name}>
              <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${plan.featured ? "text-blue-200" : "text-brand-blue"}`}>{plan.name}</p>
              <div className="mt-6 flex items-end gap-2">
                <h3 className="text-5xl font-semibold">{plan.price}</h3>
                {plan.price !== "Custom" ? <span className={plan.featured ? "mb-2 text-white/60" : "mb-2 text-muted-foreground"}>/mo</span> : null}
              </div>
              <p className={`mt-4 ${plan.featured ? "text-white/70" : "text-muted-foreground"}`}>{plan.line}</p>
              <div className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <p className="flex items-center gap-3 text-sm font-medium" key={feature}>
                    <Check className={`h-4 w-4 ${plan.featured ? "text-blue-200" : "text-emerald-600"}`} />
                    {feature}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-8">
        <SectionHeading eyebrow="FAQ" title="The simple answers." />
        <div className="mt-10 space-y-3">
          {faqItems.map(([question, answer]) => (
            <details className="group rounded-[1.5rem] border border-white/80 bg-white/82 p-5 shadow-sm backdrop-blur" key={question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {question}
                <ChevronDown className="h-5 w-5 text-muted-foreground transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 leading-7 text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 pt-16 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.8rem] bg-brand-ink p-8 text-center text-white shadow-brand sm:p-14 lg:p-20">
          <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200">Begin</p>
            <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">Your teacher workspace is waiting.</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/70">Create faster. Teach better. Grow with confidence.</p>
            <Link className="premium-button mt-9 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-brand-ink shadow-brand transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-ink" href={config.primaryHref}>
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/80 bg-white/70 px-5 py-10 backdrop-blur sm:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 text-sm text-muted-foreground lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <BrandLogo />
            <p className="mt-4 max-w-sm leading-6">The Professional AI Workspace for Teachers.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Company</p>
              <Link className="block hover:text-foreground" href="/">Home</Link>
              <Link className="block hover:text-foreground" href="#pricing">Pricing</Link>
              <Link className="block hover:text-foreground" href={config.loginHref}>Login</Link>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Support</p>
              <Link className="block hover:text-foreground" href="/resources">Resources</Link>
              <Link className="block hover:text-foreground" href="/marketplace">Marketplace</Link>
              <a className="block hover:text-foreground" href="mailto:support@teachx.guru">Contact</a>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Legal</p>
              <Link className="block hover:text-foreground" href="/privacy">Privacy</Link>
              <Link className="block hover:text-foreground" href="/terms">Terms</Link>
              <span className="block">Social soon</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
