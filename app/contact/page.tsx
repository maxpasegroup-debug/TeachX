import Link from "next/link";
import { LifeBuoy, Mail, ReceiptText, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { TeachXPublicFooter, TeachXPublicHeader } from "@/components/landing/teachx-public-chrome";

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
    <main className="tx-public-page min-h-screen" data-world="Support">
      <TeachXPublicHeader />
      <section className="tx-hero-band" aria-labelledby="support-title">
        <span className="tx-blob tx-blob-orange" aria-hidden="true" />
        <span className="tx-blob tx-blob-violet" aria-hidden="true" />
        <div className="tx-hero-copy mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <p className="tx-public-kicker text-2xl">Support</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-[#2d183c] sm:text-6xl" id="support-title">We are ready to help teachers launch with confidence.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4c3d58]">Use the right channel for onboarding, billing, security, or institution rollout support.</p>
        </div>
      </section>
      <section className="tx-section-lilac" aria-label="Support channels">
        <div className="tx-color-grid mx-auto grid max-w-5xl gap-4 px-5 py-12 sm:px-8 lg:grid-cols-2">
          {contactChannels.map(({ title, body, email, icon: Icon }) => (
            <article className="tx-public-card flex h-full flex-col p-6" key={title}>
              <span className="tx-public-icon"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h2 className="mt-5 text-xl font-semibold text-[#2d183c]">{title}</h2>
              <p className="tx-public-muted mt-3 text-sm leading-6">{body}</p>
              <a className="tx-public-pill mt-6 inline-flex min-h-12 w-fit items-center px-5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] focus:ring-offset-2" href={`mailto:${email}`}>
                Email {email}
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="tx-section-cream">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
          <h2 className="text-2xl font-semibold text-[#2d183c]">Before you write</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c3d58]">For faster help, include your account email, teacher/institution name, route or order ID if relevant, and a short description of what happened.</p>
          <div className="mt-5 flex flex-wrap gap-4">
            <Link className="text-sm font-semibold underline" href="/trust" style={{ color: "#6f3b90" }}>Open Trust Center</Link>
            <Link className="text-sm font-semibold underline" href="/pricing" style={{ color: "#8a4b00" }}>View Pricing</Link>
          </div>
        </div>
      </section>
      <TeachXPublicFooter />
    </main>
  );
}
