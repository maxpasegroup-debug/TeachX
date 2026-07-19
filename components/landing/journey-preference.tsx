"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

// Future ClassTutor Frontend: retained for the former teacher/student chooser.
// TeachX Guru V1 public entry now goes directly to the teacher platform.
const journeyPreferenceKey = "teachx-guru-journey";

type Journey = "teacher" | "student";

const journeyRoutes: Record<Journey, string> = {
  teacher: "/teachers",
  student: "/students"
};

function getStoredJourney(): Journey | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(journeyPreferenceKey);
  return stored === "teacher" || stored === "student" ? stored : null;
}

export function JourneyRedirect() {
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredJourney();
    if (stored) router.replace(journeyRoutes[stored]);
  }, [router]);

  return null;
}

type PreferenceLinkProps = ComponentProps<typeof Link> & {
  journey: Journey;
};

export function PreferenceLink({ journey, onClick, ...props }: PreferenceLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        window.localStorage.setItem(journeyPreferenceKey, journey);
        onClick?.(event);
      }}
    />
  );
}

type SwitchJourneyLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: string;
};

export function SwitchJourneyLink({ href = "/", onClick, ...props }: SwitchJourneyLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        window.localStorage.removeItem(journeyPreferenceKey);
        onClick?.(event);
      }}
    />
  );
}
