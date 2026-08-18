import Link from "next/link";
import { Check, Globe2, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { teacherLaunchPricing } from "@/services/commerce-service";

export const metadata = {
  title: "Pricing | TeachX Guru",
  description: "Simple India and international pricing for teachers using TeachX Guru AI Studio, resources, marketplace, and teaching tools."
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Badge>Teacher pricing</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Simple pricing for teachers everywhere.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Start free, use a rural-friendly starter plan, or grow into a professional teaching business with AI creation, resources, and marketplace tools.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-foreground" href="/signup/teacher">Start Free</Link>
            <Link className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold hover:bg-muted" href="/teachers">Explore Teachers</Link>
            <Link className="rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold hover:bg-muted" href="/trust">Trust Center</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-4 lg:grid-cols-5">
          {teacherLaunchPricing.map((plan) => (
            <Card className={`p-5 shadow-soft ${plan.key === "teacher-rural-starter" ? "border-sky-300" : ""}`} key={plan.key}>
              <div className="flex min-h-20 flex-col justify-between gap-3">
                <div>
                  <Badge>{plan.audience}</Badge>
                  <h2 className="mt-3 text-xl font-semibold">{plan.name}</h2>
                </div>
                {plan.key === "teacher-rural-starter" ? <p className="text-sm font-semibold text-sky-700">Recommended for India launch</p> : null}
              </div>
              <div className="mt-5 space-y-2">
                <p className="text-3xl font-semibold">{plan.indiaPrice}</p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground"><Globe2 className="h-4 w-4" />Global: {plan.globalPrice}</p>
              </div>
              <p className="mt-4 min-h-20 text-sm leading-6 text-muted-foreground">{plan.description}</p>
              <div className="mt-5 space-y-3">
                {plan.highlights.map((item) => (
                  <p className="flex gap-2 text-sm" key={item}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>
              <Link className="mt-6 inline-flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-foreground" href={plan.key === "teacher-institution" ? "/guest-portal" : "/signup/teacher"}>
                {plan.key === "teacher-institution" ? "Contact Team" : "Choose Plan"}
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-12 sm:px-8 lg:grid-cols-3">
        <Card className="p-5">
          <Sparkles className="h-5 w-5 text-sky-700" />
          <h2 className="mt-4 font-semibold">AI credits are transparent</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Plans show monthly AI creation capacity clearly so teachers know what they can create.</p>
        </Card>
        <Card className="p-5">
          <ShieldCheck className="h-5 w-5 text-sky-700" />
          <h2 className="mt-4 font-semibold">Paid access waits for checkout</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Free plans activate immediately. Paid plans create checkout orders and activate only after payment integration is live.</p>
          <Link className="mt-3 inline-block text-sm font-semibold text-primary underline" href="/refund-policy">Read billing policy</Link>
        </Card>
        <Card className="p-5">
          <Globe2 className="h-5 w-5 text-sky-700" />
          <h2 className="mt-4 font-semibold">India-first, global-ready</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Razorpay is planned for India and Stripe for international teachers, with region pricing shown separately.</p>
        </Card>
      </section>
    </main>
  );
}
