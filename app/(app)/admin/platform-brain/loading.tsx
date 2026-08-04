import { Card } from "@/components/ui/card";

export default function PlatformBrainLoading() {
  return <main className="space-y-6 pb-10" aria-busy="true"><section className="h-44 animate-pulse rounded-[2rem] bg-slate-900" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <Card className="h-28 animate-pulse bg-muted" key={index} />)}</div></main>;
}
