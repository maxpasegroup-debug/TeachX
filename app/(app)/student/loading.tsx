import { Card } from "@/components/ui/card";
export default function StudentLoading() {
  return <div className="space-y-5" aria-busy="true" aria-label="Loading LearnX"><div className="h-48 animate-pulse rounded-[2rem] bg-indigo-100/70"/><div className="grid gap-4 md:grid-cols-3">{[1,2,3].map(item=><Card className="h-32 animate-pulse bg-muted/70" key={item}/>)}</div><p className="text-sm text-muted-foreground">Assembling your learning constellation…</p></div>;
}
