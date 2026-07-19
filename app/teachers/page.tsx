import type { Metadata } from "next";

import { AudienceLanding, teacherLanding } from "@/components/landing/audience-landing";
import { getPublicBaseUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "TeachX Guru for Teachers | Professional AI Workspace",
  description: "TeachX Guru is the professional AI workspace for teachers to create lessons, manage resources, build a teaching profile, and grow a teaching business.",
  alternates: {
    canonical: `${getPublicBaseUrl()}/teachers`
  },
  openGraph: {
    title: "TeachX Guru for Teachers",
    description: "Teach smarter, grow faster, and build your professional teaching workspace with AI.",
    url: `${getPublicBaseUrl()}/teachers`
  }
};

export default function TeachersLandingPage() {
  return <AudienceLanding config={teacherLanding} />;
}
