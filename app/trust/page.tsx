import Link from "next/link";
import { BadgeCheck, FileText, Globe2, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Badge>Trust Center</Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">Built for teachers, schools, and global launch confidence.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            A simple public hub for privacy, security, AI safety, billing clarity, and the policies teachers expect before trusting a new platform.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-10 sm:px-8 lg:grid-cols-4">
        {trustCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={card.title}>
              <Card className="h-full p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-sky-300">
                <Icon className="h-6 w-6 text-sky-700" />
                <h2 className="mt-5 text-lg font-semibold">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.body}</p>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-12 sm:px-8 lg:grid-cols-3">
        <Card className="p-5">
          <Globe2 className="h-5 w-5 text-sky-700" />
          <h2 className="mt-4 font-semibold">International readiness</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Policies are written for global teacher adoption, with India-first billing and a reminder to review local law before entering each market.</p>
        </Card>
        <Card className="p-5">
          <BadgeCheck className="h-5 w-5 text-sky-700" />
          <h2 className="mt-4 font-semibold">Teacher-simple language</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The legal pages avoid heavy jargon so rural and first-time digital teachers can understand what they are accepting.</p>
        </Card>
        <Card className="p-5">
          <ShieldCheck className="h-5 w-5 text-sky-700" />
          <h2 className="mt-4 font-semibold">Secure by default</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The product favors authenticated access, permission checks, conservative payment activation, and clear disclosure channels.</p>
        </Card>
      </section>
    </main>
  );
}
