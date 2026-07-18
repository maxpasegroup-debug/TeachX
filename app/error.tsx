"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="max-w-lg text-center">
        <p className="text-sm font-medium text-muted-foreground">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">We could not load this page.</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">Please try again. Your work is safe.</p>
        <Button className="mt-8" onClick={() => reset()}>
          Try again
        </Button>
      </section>
    </main>
  );
}
