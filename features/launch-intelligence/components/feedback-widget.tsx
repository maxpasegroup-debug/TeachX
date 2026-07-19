"use client";

import { useMemo, useState } from "react";
import { Bug, MessageSquareText, Send, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FeedbackEntry = {
  id: string;
  kind: "feedback" | "bug";
  rating?: number;
  confusion?: string;
  suggestion?: string;
  title?: string;
  description?: string;
  severity?: string;
  route: string;
  browser: string;
  timestamp: string;
};

const storageKey = "teachx-guru.launch-feedback";

function getEntries() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as FeedbackEntry[];
  } catch {
    return [];
  }
}

function saveEntry(entry: FeedbackEntry) {
  const entries = getEntries();
  window.localStorage.setItem(storageKey, JSON.stringify([entry, ...entries].slice(0, 50)));
  window.dispatchEvent(new Event("teachx-launch-feedback-updated"));
}

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"feedback" | "bug">("feedback");
  const [rating, setRating] = useState(0);
  const [sent, setSent] = useState(false);
  const browser = useMemo(() => (typeof navigator === "undefined" ? "Unknown browser" : navigator.userAgent), []);

  function submit(formData: FormData) {
    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      kind: mode,
      rating: mode === "feedback" ? rating : undefined,
      confusion: String(formData.get("confusion") ?? ""),
      suggestion: String(formData.get("suggestion") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      severity: String(formData.get("severity") ?? ""),
      route: window.location.pathname,
      browser,
      timestamp: new Date().toISOString()
    };

    saveEntry(entry);
    setSent(true);
    setRating(0);
  }

  if (!open) {
    return (
      <button
        aria-label="Open feedback and bug report widget"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:bg-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MessageSquareText className="h-5 w-5" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-md p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge>Demo-ready local capture</Badge>
          <h2 className="mt-3 text-xl font-semibold">Launch Feedback</h2>
          <p className="mt-1 text-sm text-muted-foreground">Stored locally until production feedback persistence is connected.</p>
        </div>
        <button aria-label="Close feedback widget" className="rounded-xl p-2 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" onClick={() => setOpen(false)} type="button">
          <X className="h-4 w-4" />
        </button>
      </div>

      {sent ? (
        <div className="mt-5 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900">
          Thanks. Your beta feedback was saved on this device.
          <Button className="mt-4 w-full" onClick={() => setSent(false)} type="button" variant="secondary">
            Add another note
          </Button>
        </div>
      ) : (
        <form action={submit} className="mt-5 grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setMode("feedback")} type="button" variant={mode === "feedback" ? "primary" : "secondary"}>
              Experience
            </Button>
            <Button onClick={() => setMode("bug")} type="button" variant={mode === "bug" ? "primary" : "secondary"}>
              <Bug className="mr-2 h-4 w-4" />
              Bug
            </Button>
          </div>

          {mode === "feedback" ? (
            <>
              <div>
                <p className="text-sm font-medium">How was your experience?</p>
                <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Experience rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button className={`text-2xl ${value <= rating ? "text-amber-500" : "text-muted-foreground"}`} key={value} onClick={() => setRating(value)} type="button" aria-label={`${value} star`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <Textarea name="confusion" placeholder="What confused you?" />
              <Textarea name="suggestion" placeholder="One suggestion for improvement" />
            </>
          ) : (
            <>
              <Input name="title" placeholder="Bug title" required />
              <Textarea name="description" placeholder="Describe what happened" required />
              <Select name="severity" defaultValue="Medium">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </Select>
              <div className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">Optional screenshot placeholder. Current route, browser, and timestamp are captured automatically.</div>
            </>
          )}

          <Button type="submit">
            <Send className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </form>
      )}
    </Card>
  );
}
