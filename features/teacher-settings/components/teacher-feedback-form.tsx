"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitLaunchFeedbackAction } from "@/features/launch-intelligence/actions";

type State={ok:boolean;message:string}|null;
async function submit(_:State,formData:FormData):Promise<State>{return submitLaunchFeedbackAction(formData)}
export function TeacherFeedbackForm(){const [state,action,pending]=useActionState(submit,null);return <form action={action} className="grid gap-4"><input name="mode" type="hidden" value="feedback"/><label className="text-sm font-medium">Rating<Select defaultValue="5" name="rating"><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Okay</option><option value="2">2 - Difficult</option><option value="1">1 - Very difficult</option></Select></label><Textarea disabled={pending} name="confusion" placeholder="What was confusing or difficult?"/><Textarea disabled={pending} name="suggestion" placeholder="What should TeachX improve?"/>{state?<p aria-live="polite" className={`p-3 text-sm ${state.ok?"bg-emerald-50 text-emerald-800":"bg-red-50 text-red-800"}`}>{state.message}</p>:null}<Button disabled={pending} type="submit">{pending?"Sending...":state&&!state.ok?"Retry feedback":"Send feedback"}</Button></form>}
