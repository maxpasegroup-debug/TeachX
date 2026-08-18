import Link from "next/link";
import { LifeBuoy, Mail, ReceiptText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Contact | TeachX Guru",
  description: "Contact TeachX Guru for teacher onboarding, billing, security, institutional launch, and support questions."
};

const contactChannels: Array<{ title: string; body: string; email: string; icon: LucideIcon }> = [
  { title: "Teacher support", body: "Questions about signup, AI Studio, resources, marketplace, or account access.", email: "support@teachx.guru", icon: LifeBuoy },
  { title: "Billing help", body: "Questions about checkout, invoices, refunds, cancellations, or plan changes.", email: "billing@teachx.guru", icon: ReceiptText },
  { title: "Security reports", body: "Private responsible disclosure for account, data, permission, or infrastructure issues.", email: "support@teachx.guru", icon: ShieldCheck },
  { title: "Institution launch", body: "Schools, training centers, and teacher teams preparing a managed rollout.", email: "partnerships@teachx.guru", icon: Mail }
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Badge>Contact</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">We are ready to help teachers launch with confidence.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Use the right channel for onboarding, billing, security, or institution rollout support.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-5 py-10 sm:px-8 lg:grid-cols-2">
        {contactChannels.map(({ title, body, email, icon: Icon }) => {
          return (
            <Card className="p-5 shadow-soft" key={title}>
              <Icon className="h-6 w-6 text-sky-700" />
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
              <a className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-foreground" href={`mailto:${email}`}>
                Email {email}
              </a>
            </Card>
          );
        })}
      </section>
      <section className="mx-auto max-w-5xl px-5 pb-12 sm:px-8">
        <Card className="p-5">
          <h2 className="font-semibold">Before you write</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">For faster help, include your account email, teacher/institution name, route or order ID if relevant, and a short description of what happened.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="text-sm font-semibold text-primary underline" href="/trust">Open Trust Center</Link>
            <Link className="text-sm font-semibold text-primary underline" href="/pricing">View Pricing</Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
