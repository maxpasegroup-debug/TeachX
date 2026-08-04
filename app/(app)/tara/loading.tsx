import { Card } from "@/components/ui/card";
export default function TaraLoading() { return <main className="space-y-5" aria-busy="true"><section className="h-44 animate-pulse rounded-[2rem] bg-slate-900"/><div className="grid gap-3 md:grid-cols-3">{[1,2,3,4,5,6].map((item) => <Card className="h-32 animate-pulse bg-muted" key={item}/>)}</div></main>; }
