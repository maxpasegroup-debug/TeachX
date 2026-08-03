"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { reset: () => void }) { return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-7"><h1 className="text-xl font-semibold">Tenant intelligence is unavailable</h1><p className="mt-2 text-sm text-muted-foreground">The platform sources could not be read. Retry to refresh the operating system.</p><Button className="mt-4" onClick={reset}>Retry</Button></div>; }
