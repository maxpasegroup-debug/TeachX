import Link from "next/link";
import { BadgeCheck, FileText, Globe2, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";

import { TeachXPublicFooter, TeachXPublicHeader } from "@/components/landing/teachx-public-chrome";

export const metadata = {
  title: "Trust Center | TeachX Guru",
  description: "TeachX Guru trust center for privacy, security, billing, AI safety, teacher controls, and international launch readiness."
};

const trustCards = [
  { title: "Privacy-first teacher data", body: "Account, content, AI, billing, and support data are handled for clear product purposes.", href: "/privacy", icon: LockKeyhole },
  { title: "Security controls", body: "Protected workspaces, permission checks, security headers, audit logs, and responsible disclosure paths.", href: "/security", icon: ShieldCheck },
  { title: "Transparent terms", body: "Clear rules for AI use, marketplace publishing, account responsibility, and acceptable content.", href: "/terms", icon: FileText },
  { title: "Billing discipline", body: "Paid plans wait for checkout verification. Refund and cancellation rules are visible before launch.", href: "/refund-policy", icon: ReceiptText }
];

const principles = [
  { title: "International readiness", body: "Policies are written for global teacher adoption, with India-first billing and a reminder to review local law before entering each market.", icon: Globe2 },
  { title: "Teacher-simple language", body: "The legal pages avoid heavy jargon so rural and first-time digital teachers can understand what they are accepting.", icon: BadgeCheck },
  { title: "Secure by default", body: "The product favors authenticated access, permission checks, conservative payment activation, and clear disclosure channels.", icon: ShieldCheck }
];

export default function TrustPage() {
  return (
    <main className="tx-public-page min-h-screen" data-world="Trust">
      <TeachXPublicHeader />
      <section className="tx-hero-band" aria-labelledby="trust-title">
        <span className="tx-blob tx-blob-orange" aria-hidden="true" />
        <span className="tx-blob tx-blob-violet" aria-hidden="true" />
        <div className="tx-hero-copy mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <p className="tx-public-kicker text-2xl">Trust</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-[#6f3b90] sm:text-6xl" id="trust-title">Built for teachers, schools, and global launch confidence.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4c3d58]">
            A simple public hub for privacy, security, AI safety, billing clarity, and the policies teachers expect before trusting a new platform.
          </p>
        </div>
      </section>

      <section className="tx-section-lilac" aria-label="Trust topics">
        <div className="tx-color-grid mx-auto grid max-w-6xl gap-4 px-5 py-12 sm:px-8 lg:grid-cols-4">
          {trustCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link className="tx-public-card flex h-full flex-col p-6 focus:outline-none focus:ring-2 focus:ring-[#fcaa1d]" href={card.href} key={card.title}>
                <span className="tx-public-icon"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h2 className="mt-5 text-lg font-semibold text-[#6f3b90]">{card.title}</h2>
                <p className="tx-public-muted mt-3 text-sm leading-6">{card.body}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="tx-section-cream">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 sm:px-8 lg:grid-cols-3">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <article className="tx-public-card p-6" key={item.title}>
                <span className="tx-public-icon"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h2 className="mt-5 font-semibold text-[#6f3b90]">{item.title}</h2>
                <p className="tx-public-muted mt-3 text-sm leading-6">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>
      <TeachXPublicFooter />
    </main>
  );
}
