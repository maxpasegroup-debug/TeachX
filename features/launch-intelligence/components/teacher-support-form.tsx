"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitTeacherSupportAction } from "@/features/launch-intelligence/actions";

type SupportState = { ok: boolean; message: string } | null;
async function submit(_: SupportState, formData: FormData): Promise<SupportState> { return submitTeacherSupportAction(formData); }

export function TeacherSupportForm() {
  const [state, action, pending] = useActionState(submit, null);
  return <form action={action} className="mt-5 grid gap-4" noValidate><input name="mode" type="hidden" value="support"/><Input disabled={pending} maxLength={160} name="title" placeholder="What do you need help with?" required/><Select aria-label="Support category" defaultValue="Teaching" disabled={pending} name="category"><option>Getting Started</option><option>Teaching</option><option>AI Studio</option><option>Resources</option><option>Planner</option><option>Community</option><option>Business</option><option>Account</option><option>Bug</option><option>Broken page</option><option>Incorrect data</option><option>AI problem</option><option>Payment problem</option><option>Marketplace problem</option><option>Other issue</option></Select><Textarea disabled={pending} maxLength={3000} name="description" placeholder="Tell us what you tried, what happened, and what you expected." required/><Select aria-label="Issue priority" defaultValue="Medium" disabled={pending} name="severity"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></Select>{state?<p aria-live="polite" className={state.ok?"bg-emerald-50 p-3 text-sm text-emerald-800":"bg-red-50 p-3 text-sm text-red-800"}>{state.message}</p>:null}<Button disabled={pending} type="submit">{pending?"Sending request...":state?.ok?"Request sent":state?"Retry request":"Send support request"}</Button>{!state?.ok&&state?<p className="text-sm text-muted-foreground">Correct the details or check your connection, then retry.</p>:null}</form>;
}
