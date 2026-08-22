import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { PublicPillarPage, type PublicPillar } from "@/components/landing/public-pillar-page";

export const metadata: Metadata = {
  title: "Learn More for Teachers",
  description: "Explore available AI skills, professional development, courses, webinars, audiobooks and books through TeachX.",
  alternates: { canonical: "/learn-more" },
  openGraph: { title: "Keep growing beyond the classroom | TeachX", description: "A learning destination designed around teacher growth.", url: "/learn-more", type: "website" },
  twitter: { card: "summary_large_image", title: "Keep growing beyond the classroom | TeachX", description: "A learning destination designed around teacher growth." },
};

const pillar: PublicPillar = {
  eyebrow: "Learn More",
  title: "Keep growing beyond the classroom.",
  description: "Explore learning designed for your professional growth. TeachX shows only content and access states that are genuinely available.",
  statement: "Professional learning that can grow with the teacher you are becoming.",
  icon: BookOpen,
  heroTone: "bg-[#faf1d8]",
  accentTone: "bg-[#f0dfad] text-[#624c17]",
  categories: [
    { title: "Build skills", description: "Grow confidence in the areas shaping modern teaching.", items: ["AI skills", "Professional development", "Personal learning plans"] },
    { title: "Watch and join", description: "Access learning formats as real content becomes available.", items: ["Video courses", "Upcoming webinars", "Recorded sessions"] },
    { title: "Read and listen", description: "Explore clearly labelled free, included or premium content.", items: ["Audiobooks", "Books", "Honest empty and coming-soon states"] },
  ],
  taraPrompt: "What should I learn next for my professional growth?",
};

export default function LearnMorePage() {
  return <PublicPillarPage pillar={pillar} />;
}
