import type { Metadata } from "next";
import { headers } from "next/headers";
import { AudienceLanding, teacherLanding } from "@/components/landing/audience-landing";
import { LearnXLanding } from "@/components/landing/learnx-landing";
import { isLearnXHost } from "@/lib/host";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  if (isLearnXHost(host)) return {};
  const title = "TeachX Guru | The Teacher Life OS";
  const description = "Teach better, work smarter, grow professionally, and make more time for life with TeachX and TARA.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: { type: "website", url: "/", siteName: "TeachX Guru", title, description, images: [{ url: "/teacher-life-os-home.webp", width: 1600, height: 900, alt: "TeachX Guru for teachers" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/teacher-life-os-home.webp"] }
  };
}

export default async function HomePage() {
  const host = (await headers()).get("host");
  return isLearnXHost(host) ? <LearnXLanding /> : <AudienceLanding config={teacherLanding} />;
}
