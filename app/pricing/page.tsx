import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

import { MotionPrimitive } from "@/components/brand/motion-primitives";
import { TeachXPublicFooter, TeachXPublicHeader } from "@/components/landing/teachx-public-chrome";

export const metadata: Metadata = {
  title: "Teacher Pricing",
  description: "Start TeachX with a 7-day free trial. TeachX Basic is INR 199 per month and TeachX Pro is INR 499 per month, plus applicable taxes.",
  alternates: { canonical: "/pricing" },
  openGraph: { title: "Simple teacher pricing | TeachX", description: "A 7-day free trial, then choose the TeachX plan that fits how you teach and grow.", url: "/pricing", type: "website" },
  twitter: { card: "summary_large_image", title: "Simple teacher pricing | TeachX", description: "A 7-day free trial, then choose the plan that fits how you teach and grow." },
};

const plans = [
  { name: "TeachX Basic", price: "199", eyebrow: "Everyday teaching", line: "The essential Teacher Life OS.", features: ["Save Time teaching workspace", "Essential TARA and AI access", "Planner, resources and organization", "Professional teacher profile"], tone: "tx-public-card tx-plan-basic" },
  { name: "TeachX Pro", price: "499", eyebrow: "Professional growth", line: "For teachers ready to create and grow.", features: ["Everything in TeachX Basic", "Expanded AI allowance", "Publishing and marketplace workflows", "Teacher business and portfolio tools"], tone: "tx-public-card tx-plan-pro" },
];

export default function PricingPage() {
  return (
    <main className="tx-public-page min-h-screen" data-world="Pricing">
      <TeachXPublicHeader />
      <section className="tx-hero-band" aria-labelledby="pricing-title">
        <span className="tx-blob tx-blob-orange" aria-hidden="true" />
        <span className="tx-blob tx-blob-violet" aria-hidden="true" />
        <MotionPrimitive className="tx-hero-copy mx-auto flex min-h-[24rem] max-w-[90rem] flex-col items-center justify-center px-5 py-16 text-center sm:px-8" variant="fade-up">
          <p className="tx-public-kicker text-2xl">Simple teacher pricing</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl" id="pricing-title">Start free. Choose when you are ready.</h1>
          <p className="tx-public-muted mt-5 max-w-2xl text-lg leading-8">Seven days to experience TeachX, with no need to choose a paid plan before you understand its value.</p>
          <Link className="tx-public-pill mt-8 inline-flex min-h-12 items-center gap-2 px-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] focus:ring-offset-2" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          <p className="tx-public-muted mt-4 text-xs">7-day free trial <span aria-hidden="true">&middot;</span> Monthly plans <span aria-hidden="true">&middot;</span> Cancel according to billing terms</p>
        </MotionPrimitive>
      </section>

      <section className="tx-section-lilac" aria-labelledby="plans-title">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="text-center"><p className="tx-public-kicker text-lg">India launch plans</p><h2 className="mt-3 text-3xl font-semibold sm:text-5xl" id="plans-title">One clear monthly price.</h2><p className="tx-public-muted mt-4 text-sm">Prices exclude applicable taxes. Annual pricing is not advertised until supported by billing.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {plans.map((plan, index) => (
            <MotionPrimitive delay={index === 1 ? "sm" : "none"} key={plan.name} variant="fade-up">
              <article className={`flex min-h-[31rem] flex-col p-7 sm:p-9 ${plan.tone}`}>
                <p className="tx-public-kicker text-lg">{plan.eyebrow}</p><h2 className="mt-3 text-2xl font-semibold">{plan.name}</h2>
                <p className="mt-7 flex items-start"><span className="mr-1 pt-2 text-2xl font-semibold text-[#fcaa1d]">{"\u20B9"}</span><span className="text-6xl font-semibold leading-none">{plan.price}</span><span className="tx-public-muted self-end pb-1 text-sm">/month</span></p>
                <p className="tx-public-muted mt-4 text-sm">{plan.line}</p>
                <ul className="mt-8 space-y-4">{plan.features.map((feature) => <li className="flex gap-3 text-sm" key={feature}><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#fcaa1d]" aria-hidden="true" /><span>{feature}</span></li>)}</ul>
                <Link className="tx-public-pill mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 px-5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] focus:ring-offset-2" href="/signup/teacher">Start 7-day trial<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </article>
            </MotionPrimitive>
          ))}
        </div>
        <div className="tx-public-card tx-plan-basic mt-8 flex gap-4 p-6"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#6f3b90]" aria-hidden="true" /><div><h2 className="font-semibold">No pretend checkout</h2><p className="tx-public-muted mt-2 text-sm leading-6">This page does not create a subscription or charge a card. Trial eligibility, exact AI allowance, regional availability and paid activation are confirmed through the existing TeachX subscription and billing workflow after signup.</p></div></div>
      </div>
      </section>
      <TeachXPublicFooter />
    </main>
  );
}
