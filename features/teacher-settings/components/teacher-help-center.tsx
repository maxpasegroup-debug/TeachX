"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

const articles = [
  { category: "Getting Started", title: "Set up your teacher workspace", body: "Complete onboarding, open your profile, add teaching details, and create your first class." },
  { category: "Teaching Help", title: "Create and manage a class", body: "Open Teaching to manage classes, lessons, students, attendance, assignments, and classroom resources." },
  { category: "AI Studio Help", title: "Generate safely with AI", body: "Choose a tool, review available credits, generate content, verify it, and save it into an existing lesson or resource workflow." },
  { category: "Resource Help", title: "Create and publish a resource", body: "Use Resource Studio to create, save, upload, publish, archive, download, or send eligible work to the marketplace." },
  { category: "Planner Help", title: "Plan a lesson or event", body: "Use Planner to schedule classes, lessons, events, tasks, reminders, and deadlines without creating duplicate records." },
  { category: "Community Help", title: "Connect with teachers", body: "Discover professional teachers, join permitted groups, discuss teaching, share resources, and use private messages." },
  { category: "Business Help", title: "Publish and track earnings", body: "Complete your professional profile, publish an eligible resource, manage products and orders, then review wallet evidence." },
  { category: "Account Help", title: "Manage sign-in and privacy", body: "Open Settings to review your account, change supported preferences, reset your PIN or password, and open the Privacy Center." }
];

export function TeacherHelpCenter() {
  const [query,setQuery]=useState("");
  const filtered=useMemo(()=>articles.filter((item)=>`${item.category} ${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase())),[query]);
  return <section className="space-y-4" id="help"><div className="relative"><Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground"/><Input aria-label="Search teacher help" className="pl-10" onChange={(event)=>setQuery(event.target.value)} placeholder="Search Help Center" value={query}/></div>{filtered.length?<div className="grid gap-3 md:grid-cols-2">{filtered.map((item)=><Card className="p-5" key={item.title}><p className="text-xs font-semibold uppercase text-sky-700">{item.category}</p><h3 className="mt-2 font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p></Card>)}</div>:<EmptyState icon={<BookOpen className="h-5 w-5"/>} title="No help article found" description="Try a broader search or send a support request below."/>}<p className="text-sm text-muted-foreground">Need account, billing, privacy, or security help? <Link className="font-semibold text-sky-700" href="/contact">View official support contacts</Link>.</p></section>;
}
