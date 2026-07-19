"use client";

import { useEffect, useState } from "react";
import { Bug, MessageSquareText } from "lucide-react";

import { Card } from "@/components/ui/card";

type Entry = {
  kind: "feedback" | "bug";
};

const storageKey = "teachx-guru.launch-feedback";

function readEntries() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as Entry[];
  } catch {
    return [];
  }
}

export function LocalLaunchSignals() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const refresh = () => setEntries(readEntries());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("teachx-launch-feedback-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("teachx-launch-feedback-updated", refresh);
    };
  }, []);

  const feedback = entries.filter((entry) => entry.kind === "feedback").length;
  const bugs = entries.filter((entry) => entry.kind === "bug").length;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5 shadow-sm">
        <MessageSquareText className="h-5 w-5 text-sky-700" />
        <p className="mt-4 text-sm text-muted-foreground">Local feedback submitted</p>
        <p className="mt-2 text-3xl font-semibold">{feedback}</p>
      </Card>
      <Card className="p-5 shadow-sm">
        <Bug className="h-5 w-5 text-sky-700" />
        <p className="mt-4 text-sm text-muted-foreground">Local bug reports</p>
        <p className="mt-2 text-3xl font-semibold">{bugs}</p>
      </Card>
    </div>
  );
}
