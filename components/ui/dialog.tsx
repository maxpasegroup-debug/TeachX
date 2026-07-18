import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type DialogProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function Dialog({ title, description, children }: DialogProps) {
  return (
    <Card className="rounded-2xl p-6 shadow-soft">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? <p className="mt-2 leading-7 text-muted-foreground">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </Card>
  );
}
