import type { Metadata } from "next";
import { Clock3 } from "lucide-react";

import { PublicPillarPage, type PublicPillar } from "@/components/landing/public-pillar-page";

export const metadata: Metadata = {
  title: "Save Time for Teaching",
  description: "Bring lesson preparation, classroom creation, planning, resources and TARA into one teacher workspace.",
  alternates: { canonical: "/save-time" },
  openGraph: { title: "Give your time back | TeachX", description: "The TeachX workspace for better-prepared, more organized teaching.", url: "/save-time", type: "website" },
  twitter: { card: "summary_large_image", title: "Give your time back | TeachX", description: "The TeachX workspace for better-prepared, more organized teaching." },
};

const pillar: PublicPillar = {
  eyebrow: "Save Time",
  title: "Give your time back.",
  description: "Teaching, creation, planning, organization and AI assistance come together so you can move from preparation to classroom work without losing the thread.",
  statement: "One calm workspace for the work that fills a teacher's day.",
  icon: Clock3,
  heroTone: "bg-[#e7f2f3]",
  accentTone: "bg-[#c5e3e7] text-[#123b46]",
  categories: [
    { title: "Prepare", description: "Build the material you need for real classroom work.", items: ["Lessons and worksheets", "Question papers and assessments", "Rubrics, homework and activities", "Presentations and certificates"] },
    { title: "Teach", description: "Keep classes, students and communication connected.", items: ["Teaching workspace", "Reports and comments", "Parent communication", "Resources for lessons"] },
    { title: "Organize", description: "See what is next and find previous work again.", items: ["Planner and calendar", "Tasks and schedules", "Resource organization", "Search and TARA"] },
  ],
  taraPrompt: "Help me prepare tomorrow's lessons.",
};

export default function SaveTimePage() {
  return <PublicPillarPage pillar={pillar} />;
}
