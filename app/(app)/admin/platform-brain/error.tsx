"use client";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PlatformBrainError({ reset }: { error: Error; reset: () => void }) {
  return <main className="py-12"><Card className="mx-auto max-w-xl p-6 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-amber-600" /><h1 className="mt-4 text-xl font-semibold">Platform evidence is unavailable</h1><p className="mt-2 text-sm text-muted-foreground">The command center could not load its existing service evidence. Retry, or inspect the source workflow if the issue persists.</p><Button className="mt-5" onClick={reset}>Retry</Button></Card></main>;
}
