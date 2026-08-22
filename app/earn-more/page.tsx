import type { Metadata } from "next";
import { BriefcaseBusiness } from "lucide-react";

import { PublicPillarPage, type PublicPillar } from "@/components/landing/public-pillar-page";

export const metadata: Metadata = {
  title: "Earn More as a Teacher",
  description: "Build a professional teaching profile, present your expertise, publish resources and manage teacher business workflows with TeachX.",
  alternates: { canonical: "/earn-more" },
  openGraph: { title: "Your knowledge has more value | TeachX", description: "A professional home for teacher expertise, publishing and business.", url: "/earn-more", type: "website" },
  twitter: { card: "summary_large_image", title: "Your knowledge has more value | TeachX", description: "A professional home for teacher expertise, publishing and business." },
};

const pillar: PublicPillar = {
  eyebrow: "Earn More",
  title: "Your knowledge has more value.",
  description: "Build a credible professional presence around what you teach, how you teach and the knowledge you are ready to share.",
  statement: "A clear path from teacher expertise to professional opportunity.",
  icon: BriefcaseBusiness,
  heroTone: "bg-[#edf3e9]",
  accentTone: "bg-[#d4e6d3] text-[#244b34]",
  categories: [
    { title: "Teach 1:1", description: "Prepare a simple professional teaching profile.", items: ["Expertise and qualifications", "Languages and teaching formats", "Availability", "Teacher-defined pricing"] },
    { title: "Publish", description: "Turn useful teaching knowledge into professional work.", items: ["Resource publishing", "Portfolio", "Marketplace presence", "Happy Notes submission pathway"] },
    { title: "Manage", description: "Use existing TeachX business tools without fabricated results.", items: ["Products and orders", "Earnings and wallet", "Business analytics", "Future opportunities marked clearly"] },
  ],
  taraPrompt: "Help me improve my professional teacher profile.",
};

export default function EarnMorePage() {
  return <PublicPillarPage pillar={pillar} />;
}
