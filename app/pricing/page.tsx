import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

import { TeachXPublicFooter, TeachXPublicHeader } from "@/components/landing/teachx-public-chrome";

export const metadata: Metadata = {
  title: "Teacher Pricing",
  description: "TeachX Guru launch pricing for teachers: a 7-day free trial, TeachX Basic at INR 199 per month, and TeachX Pro at INR 499 per month.",
  alternates: { canonical: "/pricing" },
  openGraph: { title: "TeachX Guru Teacher Pricing", description: "Simple launch pricing built for teachers.", url: "/pricing", type: "website" }
};

const plans = [
  {
    name: "TeachX Basic",
    price: "₹199",
    line: "The everyday Teacher Life OS.",
    features: ["Save Time teaching workspace", "TARA and AI access according to plan allowance", "Planner, resources and teacher organization", "Professional teacher profile"]
  },
  {
    name: "TeachX Pro",
    price: "₹499",
    line: "For teachers ready to create and grow.",
    features: ["Everything in TeachX Basic", "Publishing and marketplace workflows", "Teacher business and portfolio tools", "Expanded limits shown before activation"]
  }
];

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f9f8]">
      <TeachXPublicHeader />
      <section className="border-b bg-white px-5 py-14 text-center sm:px-8 lg:py-20"><p className="text-sm font-semibold text-sky-700">Simple teacher pricing</p><h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">Start free. Choose when you are ready.</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">The approved India launch direction is a 7-day free trial, followed by a plan that fits how you teach and grow.</p><Link className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-foreground px-6 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" /></Link></section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:py-16" aria-labelledby="plans-title"><div className="text-center"><h2 className="text-2xl font-semibold" id="plans-title">India launch plans</h2><p className="mt-2 text-sm text-muted-foreground">Monthly prices exclude applicable taxes. No annual discount is advertised.</p></div><div className="mt-8 grid gap-5 md:grid-cols-2">{plans.map((plan, index) => <article className={`rounded-md border bg-white p-6 shadow-sm ${index === 1 ? "border-emerald-300" : "border-sky-200"}`} key={plan.name}>{index === 1 ? <p className="text-xs font-semibold uppercase text-emerald-700">Professional growth</p> : <p className="text-xs font-semibold uppercase text-sky-700">Everyday teaching</p>}<h2 className="mt-3 text-2xl font-semibold">{plan.name}</h2><p className="mt-5 text-4xl font-semibold">{plan.price}<span className="text-base font-normal text-muted-foreground">/month</span></p><p className="mt-3 text-sm text-muted-foreground">{plan.line}</p><div className="mt-6 space-y-3">{plan.features.map((feature) => <p className="flex gap-3 text-sm" key={feature}><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /><span>{feature}</span></p>)}</div><Link className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-foreground px-5 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/signup/teacher">Start 7-day trial</Link></article>)}</div>
        <div className="mt-6 rounded-md border bg-white p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" /><div><h2 className="font-semibold">Honest activation</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">This public page does not create a subscription or charge a card. Trial eligibility, exact AI allowance, regional availability and paid activation are confirmed through the existing TeachX subscription and billing workflow after signup.</p></div></div></div>
        <p className="mt-6 text-center text-sm text-muted-foreground">International billing details will be displayed only when available for the teacher’s region.</p>
      </section>
      <TeachXPublicFooter />
    </main>
  );
}
