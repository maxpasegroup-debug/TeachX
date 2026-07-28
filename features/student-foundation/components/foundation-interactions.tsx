"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, Search, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveOnboardingAction } from "@/features/student-foundation/actions";

const inputClass = "h-12 w-full rounded-lg border border-border bg-surface px-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
type Profile = Record<string, unknown>;
const str = (v: unknown) => typeof v === "string" ? v : "";
const arr = (v: unknown) => Array.isArray(v) ? v.join(", ") : "";

async function submitOnboarding(_: { message: string; ok: boolean }, formData: FormData) {
  try { await saveOnboardingAction(formData); return { message: "Your learning constellation is saved.", ok: true }; }
  catch (error) { return { message: error instanceof Error ? error.message : "We could not save your map. Check your connection and try again.", ok: false }; }
}

export function ProgressiveOnboarding({ profile, complete }: { profile: Profile; complete: boolean }) {
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(complete ? 3 : 0);
  const [values, setValues] = useState<Record<string, string>>({
    grade: str(profile.grade), board: str(profile.board), school: str(profile.school), subjects: arr(profile.subjects),
    targetExam: str(profile.targetExam), dailyStudyTime: str(profile.dailyStudyTime), language: str(profile.language),
    careerGoal: str(profile.careerGoal), learningStyle: str(profile.learningStyle) || "Visual"
  });
  const [error, setError] = useState("");
  const [state, action, pending] = useActionState(submitOnboarding, { message: "", ok: false });
  const steps = [
    { title: "You", subtitle: "Your current learning context", fields: ["grade", "language"] },
    { title: "Academics", subtitle: "Where and what you study", fields: ["board", "school", "subjects"] },
    { title: "Ambition", subtitle: "The direction you are heading", fields: ["targetExam", "careerGoal"] },
    { title: "Learning rhythm", subtitle: "How LearnX should support you", fields: ["dailyStudyTime", "learningStyle"] }
  ];
  const required: Record<number, string[]> = { 0: ["grade", "language"], 1: ["board", "subjects"], 2: [], 3: ["dailyStudyTime", "learningStyle"] };
  function next() {
    const missing = required[step].some((key) => !values[key]?.trim());
    if (missing) { setError("Complete the required fields in this constellation step."); return; }
    setError("");
    const nextStep = Math.min(3, step + 1);
    setMaxReached((current) => Math.max(current, nextStep));
    setStep(nextStep);
  }
  const set = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  return <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
    <Card className="p-5 shadow-soft">
      <p className="text-sm font-semibold text-indigo-700">YOUR LEARNING CONSTELLATION</p>
      <div className="mt-6">{steps.map((item, index) => <button className="relative flex w-full items-start gap-3 pb-7 text-left last:pb-0 disabled:cursor-not-allowed disabled:opacity-60" disabled={index > maxReached} key={item.title} onClick={() => setStep(index)} type="button">
        {index < 3 && <span className={`absolute left-[15px] top-8 h-7 w-px ${index < step ? "bg-emerald-400" : "bg-indigo-200"}`} />}
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition ${index < step ? "border-emerald-300 bg-emerald-50 text-emerald-700" : index === step ? "border-indigo-600 bg-indigo-600 text-white ring-4 ring-indigo-100" : "border-indigo-200 bg-white text-indigo-400"}`}>{index < step ? <Check className="h-4 w-4" /> : index + 1}</span>
        <span><span className="block font-semibold">{item.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{item.subtitle}</span></span>
      </button>)}</div>
    </Card>
    <Card className="p-6 shadow-soft sm:p-8">
      <p className="text-sm font-medium text-indigo-700">Step {step + 1} of 4</p><h2 className="mt-2 text-2xl font-semibold">{steps[step].title}</h2><p className="mt-2 text-muted-foreground">{steps[step].subtitle}. Your answers remain editable.</p>
      <form action={action} className="mt-7">
        {Object.entries(values).map(([key, value]) => <input key={key} name={key} type="hidden" value={value} />)}
        <div className="grid gap-5 md:grid-cols-2">
          {step === 0 && <><Field label="Grade / class" value={values.grade} onChange={(v)=>set("grade",v)} placeholder="Grade 10" required/><Field label="Preferred language" value={values.language} onChange={(v)=>set("language",v)} placeholder="English" required/></>}
          {step === 1 && <><Field label="Board" value={values.board} onChange={(v)=>set("board",v)} placeholder="CBSE, ICSE, State" required/><Field label="School or college" value={values.school} onChange={(v)=>set("school",v)} placeholder="Your institution"/><Field label="Subjects" value={values.subjects} onChange={(v)=>set("subjects",v)} placeholder="Physics, Mathematics, English" required/></>}
          {step === 2 && <><Field label="Target exam" value={values.targetExam} onChange={(v)=>set("targetExam",v)} placeholder="Boards, JEE, NEET"/><Field label="Career goal" value={values.careerGoal} onChange={(v)=>set("careerGoal",v)} placeholder="Engineer, designer, researcher"/></>}
          {step === 3 && <><Field label="Daily study time" value={values.dailyStudyTime} onChange={(v)=>set("dailyStudyTime",v)} placeholder="90 minutes" required/><label className="space-y-2 text-sm font-medium">Learning preference<select className={inputClass} value={values.learningStyle} onChange={(e)=>set("learningStyle",e.target.value)}><option>Visual</option><option>Reading and writing</option><option>Practice based</option><option>Discussion based</option><option>Mixed</option></select></label></>}
        </div>
        {step === 3 && <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Your first Today&apos;s Mission</p><p className="mt-2 font-semibold">{values.subjects ? `Spend ${values.dailyStudyTime || "your study time"} building confidence in ${values.subjects.split(",")[0]}.` : "Choose your subjects to assemble your first mission."}</p></div>}
        {error && <p className="mt-4 text-sm font-medium text-red-600" role="alert">{error}</p>}
        {state.message && <p className={`mt-4 text-sm font-medium ${state.ok ? "text-emerald-700" : "text-red-600"}`} role="status">{state.message}</p>}
        <div className="mt-7 flex justify-between gap-3"><Button disabled={step === 0 || pending} onClick={() => setStep((v)=>v-1)} type="button" variant="secondary">Back</Button>{step < 3 ? <Button onClick={next} type="button">Continue</Button> : <Button disabled={pending} type="submit">{pending ? "Saving…" : complete ? "Update learning map" : "Complete learning map"}</Button>}</div>
      </form>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><WifiOff className="h-3.5 w-3.5"/>If you go offline, keep this page open and submit again when reconnected.</p>
    </Card>
  </div>;
}

function Field({label,value,onChange,...props}:{label:string;value:string;onChange:(value:string)=>void;placeholder?:string;required?:boolean}) {
  return <label className="space-y-2 text-sm font-medium">{label}<Input value={value} onChange={(event)=>onChange(event.target.value)} {...props}/></label>;
}

type Institution = { id: string; name: string; address: string | null; logoUrl: string | null };
export function InstitutionSearch({ institutions }: { institutions: Institution[] }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => institutions.filter((item) => `${item.name} ${item.address ?? ""}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8), [institutions, query]);
  return <div className="mt-5 space-y-3"><label className="relative block"><Search className="absolute left-4 top-4 h-4 w-4 text-muted-foreground"/><Input className="pl-11" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search by institution name or location" /></label>
    {matches.length ? <div className="space-y-2">{matches.map((item)=><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 hover:border-cyan-300 hover:bg-cyan-50/40" key={item.id}><input className="mt-1" name="institutionId" required type="radio" value={item.id}/><span><span className="block font-medium">{item.name}</span><span className="text-sm text-muted-foreground">{item.address || "Address not provided"}</span></span></label>)}</div> : <div className="rounded-xl border border-dashed border-border p-5 text-center"><p className="font-medium">No institutions found</p><p className="mt-1 text-sm text-muted-foreground">Try a shorter name or a different location.</p></div>}
  </div>;
}
