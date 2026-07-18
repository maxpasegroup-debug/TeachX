"use client";

import { useEffect } from "react";

export function PwaInstallPrompt() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Best-effort registration should never block the app shell.
    });
  }, []);

  return null;
}
