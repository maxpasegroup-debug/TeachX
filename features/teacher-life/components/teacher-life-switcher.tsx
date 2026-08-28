import Link from "next/link";

const destinations = [
  ["save-time", "Save Time"],
  ["earn-more", "Earn More"],
  ["learn-more", "Learn More"],
  ["enjoy-more", "Enjoy More"]
] as const;

type TeacherLifeDestination = (typeof destinations)[number][0];

export function TeacherLifeSwitcher({ active }: { active: TeacherLifeDestination }) {
  return (
    <nav aria-label="Switch Teacher Life workspace" className="flex gap-2 overflow-x-auto border-y bg-white/80 px-3 py-2 shadow-sm">
      {destinations.map(([slug, label]) => (
        <Link
          aria-current={slug === active ? "page" : undefined}
          className={`inline-flex min-h-11 shrink-0 items-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary ${slug === active ? "bg-[#111714] text-white" : "border bg-surface hover:bg-muted"}`}
          href={`/teacher/life/${slug}`}
          key={slug}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
