import { redirect } from "next/navigation";
export default async function Page({ searchParams }: { searchParams: Promise<{ mode?: string }> }) { const p=await searchParams; redirect(`/student/ai?module=${p.mode === "Explain" ? "explainer" : "tutor"}`); }
