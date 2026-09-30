"use client";

import { AlertTriangle } from "lucide-react";

export default function TaraError({ reset }: { error: Error; reset: () => void }) {
  return <main className="tx-public-page grid min-h-screen place-items-center px-5"><section className="tx-public-card max-w-lg px-8 py-10 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-[#fcaa1d]" aria-hidden="true" /><h1 className="mt-5 text-2xl font-semibold text-[#24182c]">TARA is temporarily unavailable</h1><p className="mt-3 text-sm leading-6 text-[#6d6574]">Your TeachX work is unchanged. Try opening TARA again.</p><button className="tx-public-pill mt-6 min-h-12 px-6 text-sm font-semibold" onClick={reset} type="button">Retry</button></section></main>;
}
