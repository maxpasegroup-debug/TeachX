"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Bookmark, Copy, History, Languages, LibraryBig, RefreshCw, Save, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ExportToolbar } from "@/features/ai-studio/components/export-toolbar";
import {
  duplicateAIConversationAction,
  improveAIStudioContentAction,
  favoriteAIItemAction,
  generateAIStudioContent,
  saveAIOutputToTeacherLibraryAction,
  saveAIConversationContentAction,
  type AIStudioGenerationState
} from "@/features/ai-studio/actions";
import { getStudioToolConfig, type StudioField } from "@/features/ai-studio/tool-config";
import type { AIStudioTool } from "@/services/ai-studio-service";

const initialState: AIStudioGenerationState = {};
const languageOptions = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Bengali", "Gujarati", "Arabic", "Spanish", "French"];
const curriculumOptions = ["Teacher's local curriculum", "CBSE", "ICSE", "State Board", "IB", "Cambridge", "GCSE", "Common Core"];
const sharingOptions = ["Printable classroom handout", "WhatsApp-ready summary", "Student self-study sheet", "Parent communication", "Teacher reference notes"];

function Field({ field }: { field: StudioField }) {
  const id = `studio-${field.name}`;
  const shared = { id, name: field.name, required: field.required };
  return (
    <div className={`space-y-2 ${field.wide ? "md:col-span-2" : ""}`}>
      <Label htmlFor={field.type === "checkboxes" ? undefined : id}>{field.label}{field.required ? " *" : ""}</Label>
      {field.type === "textarea" ? <Textarea {...shared} placeholder={field.placeholder} /> :
        field.type === "select" ? <Select {...shared}>{field.options?.map((option) => <option key={option}>{option}</option>)}</Select> :
        field.type === "checkboxes" ? (
          <div className="grid gap-2 rounded-xl border border-border bg-background p-3 sm:grid-cols-2">
            {field.options?.map((option) => (
              <label className="flex items-center gap-2 text-sm" key={option}>
                <input className="h-4 w-4 accent-primary" name={field.name} type="checkbox" value={option} />
                {option}
              </label>
            ))}
          </div>
        ) : <Input {...shared} min={field.type === "number" ? 1 : undefined} placeholder={field.placeholder} type={field.type ?? "text"} />}
    </div>
  );
}

export function GenerationWorkflow({ tool, courses }: { tool: AIStudioTool; courses: { id: string; name: string }[] }) {
  const config = getStudioToolConfig(tool.slug);
  const [state, action, pending] = useActionState(generateAIStudioContent, initialState);
  const [output, setOutput] = useState("");
  const [notice, setNotice] = useState("");
  const [activeConversationId, setActiveConversationId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id ?? "");
  const [outputLanguage, setOutputLanguage] = useState("English");
  const [curriculumBoard, setCurriculumBoard] = useState("Teacher's local curriculum");
  const [working, startTransition] = useTransition();

  useEffect(() => {
    if (state.text) setOutput(state.text);
    if (state.conversationId) setActiveConversationId(state.conversationId);
  }, [state.conversationId, state.text]);

  if (!config) return null;

  function runItemAction(kind: "save" | "duplicate" | "favorite" | "lesson" | "resource") {
    if (!activeConversationId || !output) return;
    startTransition(async () => {
      const data = new FormData();
      data.set("conversationId", activeConversationId);
      if (kind === "save") {
        data.set("content", output);
        await saveAIConversationContentAction(data);
        setNotice("Saved as a new version.");
      } else if (kind === "lesson" || kind === "resource") {
        if (!selectedCourse) {
          setNotice("Add or select a course before saving to your library.");
          return;
        }
        data.set("content", output);
        data.set("courseId", selectedCourse);
        data.set("title", tool.title);
        data.set("saveKind", kind);
        data.set("outputLanguage", outputLanguage);
        data.set("curriculumBoard", curriculumBoard);
        await saveAIOutputToTeacherLibraryAction(data);
        setNotice(kind === "lesson" ? "Saved to Lesson Library." : "Saved to Resource Library.");
      } else if (kind === "duplicate") {
        await duplicateAIConversationAction(data);
        setNotice("Duplicate added to history.");
      } else {
        data.set("entityId", activeConversationId);
        data.set("title", tool.title);
        data.set("type", "ai-generation");
        await favoriteAIItemAction(data);
        setNotice("Added to favorites.");
      }
    });
  }

  function improve(mode: "improve" | "simplify" | "language" | "share") {
    if (!activeConversationId || !output) return;
    startTransition(async () => {
      const data = new FormData();
      data.set("conversationId", activeConversationId);
      data.set("content", output);
      data.set("mode", mode);
      data.set("outputLanguage", outputLanguage);
      const next = await improveAIStudioContentAction(data);
      if (next.text) {
        setOutput(next.text);
        if (next.conversationId) setActiveConversationId(next.conversationId);
        setNotice(mode === "share" ? "Made share-ready." : mode === "simplify" ? "Simplified for easier classroom use." : mode === "language" ? `Adapted to ${outputLanguage}.` : "Improved output.");
      } else if (next.error) {
        setNotice(next.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <p className="text-sm font-medium text-sky-700">AI Teaching Studio</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{tool.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{tool.description}</p>
      </section>

      <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
        <input name="tool" type="hidden" value={tool.slug} />
        <Card className="p-5 shadow-soft sm:p-6">
          <h2 className="text-xl font-semibold">Creation details</h2>
          <p className="mt-2 text-sm text-muted-foreground">Complete the required fields. Your choices are sent directly into the generation brief.</p>
          <div className="mt-6 rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-sky-700" />
              <h3 className="font-semibold">Classroom presets</h3>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="outputLanguage">Output language</Label>
                <Select id="outputLanguage" name="outputLanguage" onChange={(event) => setOutputLanguage(event.target.value)} value={outputLanguage}>
                  {languageOptions.map((option) => <option key={option}>{option}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="curriculumBoard">Curriculum / board</Label>
                <Select id="curriculumBoard" name="curriculumBoard" onChange={(event) => setCurriculumBoard(event.target.value)} value={curriculumBoard}>
                  {curriculumOptions.map((option) => <option key={option}>{option}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="sharingFormat">Sharing format</Label>
                <Select id="sharingFormat" name="sharingFormat">
                  {sharingOptions.map((option) => <option key={option}>{option}</option>)}
                </Select>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {config.fields.map((field) => <Field field={field} key={field.name} />)}
          </div>
          {state.error ? <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p> : null}
          <Button className="mt-6 w-full sm:w-auto" disabled={pending} type="submit">
            <Sparkles className="mr-2 h-4 w-4" />
            {pending ? "Generating..." : `Generate ${tool.title}`}
          </Button>
        </Card>

        <Card className="h-fit p-5 shadow-soft sm:p-6 xl:sticky xl:top-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Editable output</h2>
              <p className="mt-1 text-sm text-muted-foreground">{activeConversationId ? "Saved to recent history automatically." : "Your generated material will appear here."}</p>
            </div>
            <History className="h-5 w-5 text-sky-700" />
          </div>
          {pending ? (
            <div className="mt-5 space-y-3" aria-live="polite">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <p className="text-sm text-muted-foreground">Preparing teacher-ready content...</p>
            </div>
          ) : (
            <Textarea
              aria-label="Generated content"
              className="mt-5 min-h-[32rem] font-mono text-sm leading-6"
              onChange={(event) => setOutput(event.target.value)}
              placeholder="Complete the form and generate your material."
              value={output}
            />
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={!activeConversationId || !output || working} onClick={() => runItemAction("save")} type="button" variant="secondary"><Save className="mr-2 h-4 w-4" />Save edits</Button>
            <Button disabled={!activeConversationId || !output || working} onClick={() => improve("improve")} type="button" variant="secondary"><RefreshCw className="mr-2 h-4 w-4" />Improve</Button>
            <Button disabled={!activeConversationId || !output || working} onClick={() => improve("simplify")} type="button" variant="secondary">Simplify</Button>
            <Button disabled={!activeConversationId || !output || working} onClick={() => improve("language")} type="button" variant="secondary"><Languages className="mr-2 h-4 w-4" />Language</Button>
            <Button disabled={!activeConversationId || !output || working} onClick={() => improve("share")} type="button" variant="secondary"><Share2 className="mr-2 h-4 w-4" />Share-ready</Button>
            <Button disabled={!activeConversationId || working} onClick={() => runItemAction("duplicate")} type="button" variant="secondary"><Copy className="mr-2 h-4 w-4" />Duplicate</Button>
            <Button disabled={!activeConversationId || working} onClick={() => runItemAction("favorite")} type="button" variant="secondary"><Bookmark className="mr-2 h-4 w-4" />Favorite</Button>
          </div>
          {notice ? <p className="mt-3 text-sm font-medium text-emerald-700" aria-live="polite">{notice}</p> : null}
          <div className="mt-5 rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <LibraryBig className="h-4 w-4 text-sky-700" />
              <h3 className="font-semibold">Save to teacher library</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <Select aria-label="Course for saved AI material" disabled={!courses.length} onChange={(event) => setSelectedCourse(event.target.value)} value={selectedCourse}>
                {courses.length ? courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>) : <option>No active courses</option>}
              </Select>
              <Button disabled={!activeConversationId || !output || !selectedCourse || working} onClick={() => runItemAction("lesson")} type="button" variant="secondary">Lesson Library</Button>
              <Button disabled={!activeConversationId || !output || !selectedCourse || working} onClick={() => runItemAction("resource")} type="button" variant="secondary">Resource Library</Button>
            </div>
          </div>
          <div className="mt-5 border-t border-border pt-5">
            <ExportToolbar fileName={tool.slug} text={output} />
          </div>
        </Card>
      </form>
    </div>
  );
}
