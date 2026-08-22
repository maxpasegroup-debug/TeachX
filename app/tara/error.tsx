"use client";

import { AlertTriangle } from "lucide-react";

export default function TaraError({ reset }: { error: Error; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-5"><section className="max-w-lg border-y border-[#0b2230]/15 py-10 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-[#9a4f56]" aria-hidden="true" /><h1 className="mt-5 text-2xl font-semibold text-[#0b2230]">TARA is temporarily unavailable</h1><p className="mt-3 text-sm leading-6 text-[#617078]">Your TeachX work is unchanged. Try opening TARA again.</p><button className="mt-6 min-h-12 rounded-md bg-[#0b2230] px-6 text-sm font-semibold text-white" onClick={reset} type="button">Retry</button></section></main>;
}
