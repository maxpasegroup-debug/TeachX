"use client";

import { Check, Clipboard, FileDown, FileText, Printer } from "lucide-react";
import { useState } from "react";

export function ExportToolbar({ text, fileName = "teachx-ai-material" }: { text?: string; fileName?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function download(extension: "txt" | "doc") {
    if (!text) return;
    const content = extension === "doc"
      ? `<html><head><meta charset="utf-8"></head><body><pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${text.replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]!)}</pre></body></html>`
      : text;
    const blob = new Blob([content], { type: extension === "doc" ? "application/msword" : "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.${extension}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Export options">
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={() => window.print()} type="button">
        <FileDown className="h-4 w-4" />
        Save PDF
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={() => download("doc")} type="button">
        <FileText className="h-4 w-4" />
        Word
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={copy} type="button">
        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={() => download("txt")} type="button">
        <Printer className="h-4 w-4" />
        Text
      </button>
    </div>
  );
}
