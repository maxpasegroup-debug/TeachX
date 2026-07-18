import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <Card className="p-5 shadow-soft">
      <Skeleton className="h-10 w-10" />
      <Skeleton className="mt-5 h-5 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
    </Card>
  );
}

export function TableSkeleton() {
  return (
    <Card className="space-y-3 p-5 shadow-soft">
      <Skeleton className="h-5 w-36" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton className="h-11 w-full" key={index} />
      ))}
    </Card>
  );
}

export function SearchSkeleton() {
  return (
    <Card className="space-y-3 p-4 shadow-soft">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-5/6" />
      <Skeleton className="h-10 w-3/4" />
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TableSkeleton />
        <SearchSkeleton />
      </div>
    </div>
  );
}
