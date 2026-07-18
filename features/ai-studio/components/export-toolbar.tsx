"use client";

import { Check, Clipboard, FileDown, FileText, Printer } from "lucide-react";
import { useState } from "react";

export function ExportToolbar({ text }: { text?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Export options">
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" type="button">
        <FileDown className="h-4 w-4" />
        PDF
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" type="button">
        <FileText className="h-4 w-4" />
        DOCX
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" onClick={copy} type="button">
        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" onClick={() => window.print()} type="button">
        <Printer className="h-4 w-4" />
        Print
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-3 text-sm font-medium text-muted-foreground" type="button">
        Google Docs
      </button>
    </div>
  );
}
