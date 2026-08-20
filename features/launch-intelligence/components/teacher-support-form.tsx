"use client";

import { useActionState } from "react";

import { submitTeacherSupportAction } from "@/features/launch-intelligence/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SupportState = { ok: boolean; message: string } | null;

async function submit(_: SupportState, formData: FormData): Promise<SupportState> {
  return submitTeacherSupportAction(formData);
}

export function TeacherSupportForm() {
  const [state, action, pending] = useActionState(submit, null);

  return (
    <form action={action} className="mt-5 grid gap-4" noValidate>
      <input name="mode" type="hidden" value="support" />
      <Input disabled={pending} name="title" placeholder="What do you need help with?" required />
      <Textarea disabled={pending} name="description" placeholder="Tell us what you tried, what happened, and what you expected." required />
      <Select disabled={pending} name="severity" defaultValue="Medium">
        <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
      </Select>
      {state ? <p aria-live="polite" className={state.ok ? "rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800" : "rounded-lg bg-red-50 p-3 text-sm text-red-800"}>{state.message}</p> : null}
      <Button disabled={pending} type="submit">{pending ? "Sending request…" : state?.ok ? "Request sent" : "Send Support Request"}</Button>
      {!state?.ok && state ? <p className="text-sm text-muted-foreground">You can correct the details and try again.</p> : null}
    </form>
  );
}
