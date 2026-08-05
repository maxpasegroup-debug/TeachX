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

type WorkspaceSkeletonProps = {
  cardCount?: number;
  heroClassName?: string;
};

export function WorkspaceSkeleton({ cardCount = 3, heroClassName = "h-48" }: WorkspaceSkeletonProps) {
  return (
    <div aria-busy="true" className="space-y-4 animate-pulse">
      <Skeleton className={`${heroClassName} w-full rounded-[2rem]`} />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, index) => (
          <Skeleton className="h-32 rounded-2xl" key={index} />
        ))}
      </div>
    </div>
  );
}