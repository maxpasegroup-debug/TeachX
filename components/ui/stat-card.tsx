import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, detail, icon, className }: StatCardProps) {
  return (
    <Card className={cn("rounded-2xl p-5 shadow-soft", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        {icon ? <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">{icon}</div> : null}
      </div>
      {detail ? <p className="mt-4 text-sm leading-6 text-muted-foreground">{detail}</p> : null}
    </Card>
  );
}
