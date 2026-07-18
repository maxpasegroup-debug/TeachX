import Link from "next/link";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";

const paths = [
  {
    title: "Teacher",
    description: "Build AI assisted lessons, resources, marketplace offers, and learner experiences.",
    href: "/signup/teacher",
    icon: Sparkles
  },
  {
    title: "Student",
    description: "Learn with guided practice, personal AI support, and access to expert teachers.",
    href: "/signup/student",
    icon: GraduationCap
  }
];

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <section className="w-full max-w-5xl">
        <Link className="mb-10 inline-flex items-center gap-3" href="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-semibold text-white shadow-soft">TX</span>
          <span>
            <span className="block text-base font-semibold">TeachX</span>
            <span className="block text-xs text-muted-foreground">Learn • Teach • Earn</span>
          </span>
        </Link>
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-medium text-sky-700">Welcome to TeachX</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Choose your workspace</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">Start with the role that fits you today. Platform Admin access remains protected for invited operators.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {paths.map((path) => {
            const Icon = path.icon;

            return (
              <Link className="group rounded-[1.75rem] border border-border bg-surface p-7 shadow-soft transition hover:-translate-y-1 hover:border-sky-200" href={path.href} key={path.title}>
                <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold">{path.title}</h2>
                <p className="mt-3 min-h-16 leading-7 text-muted-foreground">{path.description}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                  Continue
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
