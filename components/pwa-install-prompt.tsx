"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, RefreshCw, WifiOff, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Notice = "offline" | "restored" | "update" | null;

export function PwaInstallPrompt() {
  const [notice, setNotice] = useState<Notice>(null);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const updateRequested = useRef(false);

  useEffect(() => {
    const offline = () => setNotice("offline");
    const online = () => {
      setNotice("restored");
      window.setTimeout(() => setNotice((current) => current === "restored" ? null : current), 3500);
    };
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    if (!navigator.onLine) setNotice("offline");
    if (!("serviceWorker" in navigator)) return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };

    let refreshing = false;
    const controllerChanged = () => {
      if (refreshing || !updateRequested.current) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", controllerChanged);
    const register = () => navigator.serviceWorker.register("/sw.js").then((registration) => {
      // Browsers otherwise throttle service-worker update checks. Check once
      // when the application starts so a deployed auth/server-action update
      // reaches an existing installation promptly.
      void registration.update().catch(() => undefined);
      if (registration.waiting) {
        setWaiting(registration.waiting);
        setNotice("update");
      }
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(worker);
            setNotice("update");
          }
        });
      });
    }).catch(() => undefined);

    // Registration and update checks are useful, but they do not need to
    // compete with the first page render or an authentication form.
    const idle = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(register, { timeout: 4000 });
      } else {
        void register();
      }
    }, 0);
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChanged);
    };
  }, []);

  if (!notice) return null;
  const update = notice === "update";
  const restored = notice === "restored";
  return (
    <div aria-live="polite" className={`fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-xl items-center gap-3 border px-4 py-3 shadow-lg ${restored ? "border-emerald-300 bg-emerald-50 text-emerald-950" : update ? "border-blue-300 bg-blue-50 text-blue-950" : "border-amber-300 bg-amber-50 text-amber-950"}`} role="status">
      {restored ? <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0" /> : update ? <RefreshCw aria-hidden="true" className="h-5 w-5 shrink-0" /> : <WifiOff aria-hidden="true" className="h-5 w-5 shrink-0" />}
      <p className="min-w-0 flex-1 text-sm font-medium">{restored ? "Connection restored." : update ? "A TeachX update is ready." : "You are offline. Open forms keep their local drafts."}</p>
      {update ? <Button className="h-9 px-3" onClick={() => { updateRequested.current = true; waiting?.postMessage({ type: "SKIP_WAITING" }); }} type="button">Update</Button> : null}
      {notice !== "offline" ? <button aria-label="Dismiss" className="grid h-9 w-9 shrink-0 place-items-center" onClick={() => setNotice(null)} title="Dismiss" type="button"><X aria-hidden="true" className="h-4 w-4" /></button> : null}
    </div>
  );
}
