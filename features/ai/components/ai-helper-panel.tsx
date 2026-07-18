"use client";

import { useActionState } from "react";

import { runAIHelperAction } from "@/features/ai/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function AIHelperPanel({ scope = "SYSTEM" }: { scope?: "TEACHER" | "STUDENT" | "ADMISSIONS" | "DIRECTOR" | "FINANCE" | "SEARCH" | "SYSTEM" }) {
  const [message, action, pending] = useActionState(runAIHelperAction, undefined);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">AI Helper</h2>
      <p className="mt-1 text-sm text-muted-foreground">Use AI inside your current work. No separate AI page.</p>
      <form action={action} className="mt-5 grid gap-3">
        <input name="scope" type="hidden" value={scope} />
        <Select name="feature">
          <option value="lesson_plan">Generate Lesson Plan</option>
          <option value="assignment">Generate Assignment</option>
          <option value="homework">Generate Homework</option>
          <option value="mcq">Generate MCQs</option>
          <option value="explanation">Generate Explanation</option>
          <option value="summarize">Summarize Notes</option>
          <option value="improve_announcement">Improve Announcement</option>
          <option value="study_plan">Study Plan</option>
          <option value="lead_summary">Lead Summary</option>
          <option value="daily_summary">Daily Summary</option>
          <option value="finance_prediction">Fee Collection Prediction</option>
        </Select>
        <Input name="prompt" placeholder="What should AI help with?" />
        <Button disabled={pending} type="submit" variant="secondary">{pending ? "Thinking" : "Ask AI"}</Button>
      </form>
      {message ? <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm leading-6">{message}</p> : null}
    </Card>
  );
}
