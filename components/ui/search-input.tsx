import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10", className)}>
      <Search className="h-4 w-4 text-muted-foreground" />
      <input className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" type="search" {...props} />
    </label>
  );
}
