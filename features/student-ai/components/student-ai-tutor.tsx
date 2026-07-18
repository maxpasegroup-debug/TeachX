"use client";

import { useActionState } from "react";
import { Bookmark, FileImage, FileText, Mic, Paperclip, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { askStudentTutorAction, favoriteStudentAIAction, type StudentAIState } from "@/features/student-ai/actions";
import { studentLearningModes } from "@/services/student-ai-learning-service";

const initialState: StudentAIState = {};

export function StudentAITutor({ defaultMode = "Explain" }: { defaultMode?: string }) {
  const [state, action, pending] = useActionState(askStudentTutorAction, initialState);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <Card className="p-5 shadow-soft">
        <p className="text-sm font-medium text-sky-700">AI Tutor</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Learn it your way</h1>
        <p className="mt-3 text-muted-foreground">Ask questions like “Explain Newton's Law”, “Teach me Algebra”, “Explain in Malayalam”, “Make it easier”, or “Give examples”.</p>

        <form action={action} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Select name="mode" defaultValue={defaultMode}>
              {studentLearningModes.map((mode) => <option key={mode}>{mode}</option>)}
            </Select>
            <Select name="language" defaultValue="English">
              <option>English</option>
              <option>Malayalam</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Arabic placeholder</option>
            </Select>
            <Select name="level" defaultValue="Simple">
              <option>Explain like I'm 10</option>
              <option>Simple</option>
              <option>Make easier</option>
              <option>Make harder</option>
              <option>Exam level</option>
            </Select>
          </div>
          <Textarea name="prompt" placeholder="Ask your learning question..." />
          <div className="grid gap-3 md:grid-cols-3">
            <button className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-background p-4 text-left text-sm text-muted-foreground" type="button">
              <Mic className="h-5 w-5 text-sky-700" />
              Voice Tutor UI
            </button>
            <button className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-background p-4 text-left text-sm text-muted-foreground" type="button">
              <FileImage className="h-5 w-5 text-sky-700" />
              Photo placeholder
            </button>
            <button className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-background p-4 text-left text-sm text-muted-foreground" type="button">
              <Paperclip className="h-5 w-5 text-sky-700" />
              PDF / notes
            </button>
          </div>
          {state.error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}
          <Button disabled={pending} type="submit">
            {pending ? "Tutor is thinking" : "Ask AI Tutor"}
          </Button>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Sparkles className="h-5 w-5 text-sky-700" /> Tutor Response</h2>
          {pending ? (
            <div className="mt-5 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <p className="text-sm text-muted-foreground">Typing a student-friendly explanation...</p>
            </div>
          ) : state.text ? (
            <div className="mt-5 rounded-2xl border border-border bg-background p-4 text-sm leading-7 whitespace-pre-wrap">{state.text}</div>
          ) : (
            <p className="mt-5 rounded-2xl border border-border bg-background p-6 text-center text-muted-foreground">Your answer will appear here.</p>
          )}
          {state.conversationId ? (
            <form action={favoriteStudentAIAction} className="mt-5">
              <input name="entityId" type="hidden" value={state.conversationId} />
              <input name="title" type="hidden" value="Saved AI answer" />
              <Button type="submit" variant="secondary"><Bookmark className="mr-2 h-4 w-4" />Bookmark Answer</Button>
            </form>
          ) : null}
        </Card>
        <Card className="p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><FileText className="h-5 w-5 text-sky-700" /> Homework Helper</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Question upload, photo upload, PDF upload, and teacher notes ingestion are ready as architecture placeholders. Provider/OCR integration comes later.</p>
        </Card>
      </div>
    </div>
  );
}
