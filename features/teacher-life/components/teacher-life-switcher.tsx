import Link from "next/link";

const destinations = [
  ["save-time", "Save Time"],
  ["earn-more", "Earn More"],
  ["learn-more", "Learn More"],
  ["enjoy-more", "Enjoy More"]
] as const;

type TeacherLifeDestination = (typeof destinations)[number][0];

export function TeacherLifeSwitcher({ active, variant = "default" }: { active: TeacherLifeDestination; variant?: "default" | "dark" }) {
  const dark = variant === "dark";
  return (
    <nav aria-label="Switch Teacher Life workspace" className={dark ? "mt-4 space-y-1" : "flex gap-2 overflow-x-auto border-y bg-white/80 px-3 py-2 shadow-sm"}>
      {destinations.map(([slug, label]) => (
        <Link
          aria-current={slug === active ? "page" : undefined}
          className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#20d16b]/50 ${dark ? slug === active ? "bg-[#20d16b] text-[#111714]" : "text-white/75 hover:bg-white/10 hover:text-white" : `shrink-0 ${slug === active ? "bg-[#111714] text-white" : "border bg-surface hover:bg-muted"}`}`}
          href={`/teacher/life/${slug}`}
          key={slug}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
