import type { Metadata } from "next";
import { Heart } from "lucide-react";

import { PublicPillarPage, type PublicPillar } from "@/components/landing/public-pillar-page";

export const metadata: Metadata = {
  title: "Enjoy More - Coming Soon",
  description: "A future TeachX destination for more life beyond the classroom. Travel, family, wellness and teacher experiences are coming soon.",
  alternates: { canonical: "/enjoy-more" },
  openGraph: { title: "Life beyond the classroom | TeachX", description: "Enjoy More is a future TeachX destination, clearly marked Coming Soon.", url: "/enjoy-more", type: "website" },
  twitter: { card: "summary_large_image", title: "Life beyond the classroom | TeachX", description: "Enjoy More is a future TeachX destination, clearly marked Coming Soon." },
};

const pillar: PublicPillar = {
  eyebrow: "Enjoy More",
  title: "You give so much. Soon, TeachX will help you enjoy more.",
  description: "A future destination for the parts of life that happen beyond work. There are no offers, bookings, partners or prices here yet.",
  statement: "More life beyond the classroom, designed honestly from the beginning.",
  icon: Heart,
  heroTone: "bg-[#f8e8e8]",
  accentTone: "bg-[#efd2d5] text-[#6b3038]",
  categories: [
    { title: "Explore", description: "Future ways to make room for new experiences.", items: ["Travel", "Teacher experiences", "Special experiences"] },
    { title: "Reconnect", description: "Future ideas for time shared with people who matter.", items: ["Family", "Leisure", "Teacher events"] },
    { title: "Restore", description: "Future experiences that put wellbeing back on the list.", items: ["Wellness", "Rest", "Life beyond work"] },
  ],
  taraPrompt: "Tell me what Enjoy More will become.",
  comingSoon: true,
};

export default function EnjoyMorePage() {
  return <PublicPillarPage pillar={pillar} />;
}
