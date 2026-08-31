"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Settings2, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const COOKIE_NAME = "teachx_privacy";

type Choices = { functional: boolean; analytics: boolean; marketing: boolean };

function anonymousId() {
  const key = "teachx_privacy_subject";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}

export function PrivacyChoices({ hasChoice }: { hasChoice: boolean }) {
  const [visible, setVisible] = useState(!hasChoice);
  const [customizing, setCustomizing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [choices, setChoices] = useState<Choices>({ functional: true, analytics: false, marketing: false });
  if (!visible) return null;

  const save = async (next: Choices) => {
    setBusy(true); setError("");
    const globalPrivacyControl = Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl);
    const safe = globalPrivacyControl ? { ...next, analytics: false, marketing: false } : next;
    const secure = location.protocol === "https:" ? "; Secure" : "";

    // A choice must close the banner immediately. The audit request is useful
    // for consent records, but it must not trap the visitor behind the banner.
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(safe))}; Path=/; Max-Age=15552000; SameSite=Lax${secure}`;
    setVisible(false);

    try {
      const response = await fetch("/api/privacy/consent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anonymousId: anonymousId(), ...safe, globalPrivacyControl }) });
      if (!response.ok) throw new Error("Privacy choices could not be saved. Please try again.");
    } catch {
      // The browser cookie remains the visitor's recorded choice. The next
      // page visit will not show the banner again if audit persistence fails.
    }
  };

  return (
    <div aria-label="Privacy choices" aria-modal="true" className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background p-4 shadow-2xl" role="dialog">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start gap-4"><ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-primary" /><div className="flex-1"><h2 className="text-lg font-semibold">Your privacy choices</h2><p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">Essential cookies keep TeachX secure. Optional cookies are always your choice.</p><Link className="mt-2 inline-block text-sm font-medium text-primary underline" href="/cookies">Cookie policy</Link></div></div>
        {customizing ? <div className="mt-4 grid gap-2 border-y border-border py-4 sm:grid-cols-2 lg:grid-cols-4"><label className="flex items-center gap-2 text-sm"><input checked disabled type="checkbox" />Essential</label>{(["functional", "analytics", "marketing"] as const).map((key) => <label className="flex items-center gap-2 text-sm capitalize" key={key}><input checked={choices[key]} onChange={(event) => setChoices((current) => ({ ...current, [key]: event.target.checked }))} type="checkbox" />{key}</label>)}</div> : null}
        {error ? <p className="mt-3 text-sm text-red-700" role="alert">{error}</p> : null}
        <div className="mt-4 flex flex-wrap justify-end gap-2">{customizing ? <Button disabled={busy} variant="secondary" onClick={() => setCustomizing(false)}><X className="mr-2 h-4 w-4" />Cancel</Button> : <Button disabled={busy} variant="secondary" onClick={() => setCustomizing(true)}><Settings2 className="mr-2 h-4 w-4" />Customize</Button>}<Button disabled={busy} variant="secondary" onClick={() => void save({ functional: false, analytics: false, marketing: false })}>Reject optional</Button>{customizing ? <Button disabled={busy} onClick={() => void save(choices)}><Check className="mr-2 h-4 w-4" />Save choices</Button> : <Button disabled={busy} onClick={() => void save({ functional: true, analytics: true, marketing: false })}><Check className="mr-2 h-4 w-4" />Accept selected</Button>}</div>
      </div>
    </div>
  );
}
