"use client";

import { Check, Clipboard, FileDown, FileText, MessageCircle, Printer, Share2 } from "lucide-react";
import { useState } from "react";

export function ExportToolbar({ text, fileName = "teachx-ai-material" }: { text?: string; fileName?: string }) {
  const [copied, setCopied] = useState(false);

  const safeName = fileName.replace(/[^a-z0-9-]+/gi, "-").toLowerCase() || "teachx-ai-material";

  function escapeHtml(value: string) {
    return value.replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]!);
  }

  function handoutHtml(value: string) {
    return `<!doctype html><html><head><meta charset="utf-8"><title>${safeName}</title><style>
      @page { margin: 18mm; }
      body { color: #111827; font-family: Arial, sans-serif; line-height: 1.55; }
      main { max-width: 780px; margin: 0 auto; }
      h1 { font-size: 20px; margin-bottom: 16px; }
      pre { white-space: pre-wrap; word-wrap: break-word; font-family: Arial, sans-serif; font-size: 13px; }
      footer { border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; margin-top: 28px; padding-top: 10px; }
    </style></head><body><main><h1>TeachX Classroom Material</h1><pre>${escapeHtml(value)}</pre><footer>Generated with TeachX AI Studio</footer></main></body></html>`;
  }

  async function copy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function printPdf() {
    if (!text) return;
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(handoutHtml(text));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  async function share() {
    if (!text) return;
    const payload = { title: "TeachX classroom material", text };
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
    await copy();
  }

  function whatsapp() {
    if (!text) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(text.slice(0, 3500))}`, "_blank", "noopener,noreferrer");
  }

  function download(extension: "txt" | "doc" | "html") {
    if (!text) return;
    const content = extension === "doc" || extension === "html"
      ? handoutHtml(text)
      : text;
    const blob = new Blob([content], { type: extension === "doc" ? "application/msword" : extension === "html" ? "text/html;charset=utf-8" : "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${safeName}.${extension}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Export options">
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={printPdf} type="button">
        <FileDown className="h-4 w-4" />
        Print / PDF
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={() => download("doc")} type="button">
        <FileText className="h-4 w-4" />
        Word
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={() => download("html")} type="button">
        <FileText className="h-4 w-4" />
        Handout
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={copy} type="button">
        {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={share} type="button">
        <Share2 className="h-4 w-4" />
        Share
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={whatsapp} type="button">
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" disabled={!text} onClick={() => download("txt")} type="button">
        <Printer className="h-4 w-4" />
        Text
      </button>
    </div>
  );
}
