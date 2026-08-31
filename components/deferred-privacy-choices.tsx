"use client";

import dynamic from "next/dynamic";

const PrivacyChoices = dynamic(
  () => import("@/components/privacy/privacy-choices").then((module) => module.PrivacyChoices),
  { ssr: false }
);

/** Loads consent controls after the primary page can render and respond. */
export function DeferredPrivacyChoices({ hasChoice }: { hasChoice: boolean }) {
  return <PrivacyChoices hasChoice={hasChoice} />;
}
