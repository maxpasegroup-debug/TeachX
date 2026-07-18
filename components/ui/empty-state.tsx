import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Card className="rounded-2xl p-8 text-center shadow-soft">
      {icon ? <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">{icon}</div> : null}
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md leading-7 text-muted-foreground">{description}</p>
    </Card>
  );
}
