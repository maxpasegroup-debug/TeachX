"use client";

import { useEffect, useState } from "react";

import { GuruLoader } from "@/components/brand/guru-loader";

const LOADER_MS = 3000;

export function StartupLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce";
    const timeout = window.setTimeout(() => {
      document.documentElement.setAttribute("data-hero", "ready");
      setVisible(false);
    }, reduceMotion ? 0 : LOADER_MS);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div aria-live="polite" className="fixed inset-0 z-[80] flex items-center justify-center" role="status" style={{ background: "#3a2150" }}>
      <GuruLoader />
      <p className="sr-only">Preparing Your Workspace</p>
    </div>
  );
}
