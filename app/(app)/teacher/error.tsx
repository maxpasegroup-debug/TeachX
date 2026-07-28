"use client";

import Link from "next/link";
import { AlertTriangle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TeacherError({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
  const offline=typeof navigator!=="undefined"&&!navigator.onLine;
  return <Card className="mx-auto max-w-2xl p-8 text-center" role="alert"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">{offline?<WifiOff/>:<AlertTriangle/>}</span><h1 className="mt-5 text-2xl font-semibold">{offline?"You appear to be offline":"This workspace could not load"}</h1><p className="mt-3 text-muted-foreground">{offline?"Reconnect to sync live data. Downloaded files and exported materials remain available on your device.":error.message||"TeachX preserved your work. Try loading the connected workspace again."}</p><div className="mt-6 flex justify-center gap-3"><Button onClick={reset} type="button">Try again</Button><Link className="rounded-xl border px-4 py-2 text-sm font-medium" href="/teacher">Teacher dashboard</Link></div>{error.digest?<p className="mt-4 text-xs text-muted-foreground">Reference: {error.digest}</p>:null}</Card>;
}
