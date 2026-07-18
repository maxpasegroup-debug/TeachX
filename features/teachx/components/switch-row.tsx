"use client";

import { useState } from "react";

export function SwitchRow({ label, checked = false }: { label: string; checked?: boolean }) {
  const [enabled, setEnabled] = useState(checked);

  return (
    <button className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" onClick={() => setEnabled((value) => !value)} type="button" aria-pressed={enabled}>
      <span>{label}</span>
      <span className={`flex h-6 w-11 items-center rounded-full p-1 transition ${enabled ? "bg-sky-600" : "bg-muted"}`} aria-hidden="true">
        <span className={`h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}
