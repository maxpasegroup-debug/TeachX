"use client";

import { useActionState } from "react";
import { FileUp, Mic, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ExportToolbar } from "@/features/ai-studio/components/export-toolbar";
import { generateAIStudioContent, type AIStudioGenerationState } from "@/features/ai-studio/actions";
import type { AIStudioTool } from "@/services/ai-studio-service";

const initialState: AIStudioGenerationState = {};
const steps = ["Choose", "Preview", "Generate", "Edit", "Export"];

export function GenerationWorkflow({ tool }: { tool: AIStudioTool }) {
  const [state, action, pending] = useActionState(generateAIStudioContent, initialState);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <p className="text-sm font-medium text-sky-700">AI Studio</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{tool.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{tool.description}</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-5">
        {steps.map((step, index) => (
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm" key={step}>
            <p className="text-xs font-semibold text-sky-700">Step {index + 1}</p>
            <p className="mt-1 font-semibold">{step}</p>
          </div>
        ))}
      </div>

      <form action={action} className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <input name="tool" type="hidden" value={tool.slug} />
        <Card className="p-5 shadow-soft">
          <h2 className="text-xl font-semibold">Choose details</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="className">Class</Label><Input id="className" name="className" placeholder="Class 8" /></div>
            <div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" placeholder="Science" /></div>
            <div className="space-y-2"><Label htmlFor="board">Board</Label><Input id="board" name="board" placeholder="CBSE" /></div>
            <div className="space-y-2"><Label htmlFor="language">Language</Label><Select id="language" name="language"><option>English</option><option>Hindi</option><option>Malayalam</option><option>Tamil</option></Select></div>
            <div className="space-y-2"><Label htmlFor="chapter">Chapter</Label><Input id="chapter" name="chapter" placeholder="Force and Pressure" /></div>
            <div className="space-y-2"><Label htmlFor="topic">Topic</Label><Input id="topic" name="topic" placeholder="Types of force" /></div>
            <div className="space-y-2"><Label htmlFor="difficulty">Difficulty</Label><Select id="difficulty" name="difficulty"><option>Easy</option><option>Medium</option><option>Hard</option><option>Mixed</option></Select></div>
            <div className="space-y-2"><Label htmlFor="duration">Duration</Label><Input id="duration" name="duration" placeholder="40 minutes" /></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="learningObjective">Learning Objective</Label><Textarea id="learningObjective" name="learningObjective" placeholder="Students will understand..." /></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="outputFormat">Output Format</Label><Select id="outputFormat" name="outputFormat"><option>Markdown</option><option>PDF-ready</option><option>DOCX-ready</option><option>Print-ready</option></Select></div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-background p-4 text-left text-sm text-muted-foreground" type="button">
              <Mic className="h-5 w-5 text-sky-700" />
              Voice recording UI ready
            </button>
            <button className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-background p-4 text-left text-sm text-muted-foreground" type="button">
              <FileUp className="h-5 w-5 text-sky-700" />
              Upload PDF, DOCX, image, PPT. OCR later.
            </button>
          </div>

          {state.error ? <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}
          <Button className="mt-6 w-full sm:w-auto" disabled={pending} type="submit">
            {pending ? "Generating" : `Generate ${tool.title}`}
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 shadow-soft">
            <h2 className="text-xl font-semibold">Preview</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">TeachX will create a teacher-ready {tool.title.toLowerCase()} using your class, board, subject, topic, duration, and objective.</p>
          </Card>
          <Card className="p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><Sparkles className="h-5 w-5 text-sky-700" /> Output</h2>
            {pending ? (
              <div className="mt-5 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <p className="text-sm text-muted-foreground">Preparing your generation...</p>
              </div>
            ) : (
              <Textarea className="mt-5 min-h-80" readOnly={!state.text} value={state.text ?? ""} placeholder="Generated content will appear here. You can edit the output after generation." />
            )}
            <div className="mt-5">
              <ExportToolbar text={state.text} />
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
