"use client";

import dynamic from "next/dynamic";

const PwaInstallPrompt = dynamic(
  () => import("@/components/pwa-install-prompt").then((module) => module.PwaInstallPrompt),
  { ssr: false }
);

/** Keeps service-worker update UI out of the critical public page bundle. */
export function DeferredPwaInstallPrompt() {
  return <PwaInstallPrompt />;
}
