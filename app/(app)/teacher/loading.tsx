import { CardSkeleton, TableSkeleton } from "@/components/ui/loading-states";

export default function TeacherLoading() {
  return <div className="space-y-6" role="status" aria-label="Loading Teacher Operating System"><div className="h-52 animate-pulse rounded-[2rem] bg-muted"/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:4},(_,index)=><CardSkeleton key={index}/>)}</div><TableSkeleton/><p className="text-sm text-muted-foreground">Loading your connected workspace. Previously downloaded files may remain available if your connection is interrupted.</p></div>;
}
