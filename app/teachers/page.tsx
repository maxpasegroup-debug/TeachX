import type { Metadata } from "next";

import { AudienceLanding, teacherLanding } from "@/components/landing/audience-landing";
import { getPublicBaseUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "TeachX Guru for Teachers | Find Your Favourite Student",
  description: "Build your teaching brand with AI tools, marketplace visibility, learning resources, community, and future earning paths inside TeachX Guru.",
  alternates: {
    canonical: `${getPublicBaseUrl()}/teachers`
  },
  openGraph: {
    title: "TeachX Guru for Teachers",
    description: "Teach with AI, inspire learners, build your teaching brand, and earn through teaching.",
    url: `${getPublicBaseUrl()}/teachers`
  }
};

export default function TeachersLandingPage() {
  return <AudienceLanding config={teacherLanding} />;
}
