import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
};

export function Progress({ value, className, ...props }: ProgressProps) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalized} {...props}>
      <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-700 transition-all" style={{ width: `${normalized}%` }} />
    </div>
  );
}
