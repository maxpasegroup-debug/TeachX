import type { Metadata } from "next";

import { AudienceLanding, studentLanding } from "@/components/landing/audience-landing";
import { getPublicBaseUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "TeachX Guru for Students | Find Your Favourite Teacher",
  description: "Discover great teachers, learn with AI, practice daily, track progress, and join a learning community inside TeachX Guru.",
  alternates: {
    canonical: `${getPublicBaseUrl()}/students`
  },
  openGraph: {
    title: "TeachX Guru for Students",
    description: "Discover inspiring teachers, learn with AI, practice every day, and achieve your goals.",
    url: `${getPublicBaseUrl()}/students`
  }
};

export default function StudentsLandingPage() {
  return <AudienceLanding config={studentLanding} />;
}
