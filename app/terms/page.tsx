import { FileText } from "lucide-react";

import { PolicyPage } from "@/components/legal/policy-page";

export const metadata = {
  title: "Terms of Service | TeachX Guru",
  description: "The account, acceptable use, AI, marketplace, subscription, and platform terms for TeachX Guru teachers."
};

export default function TermsPage() {
  return (
    <PolicyPage
      badge="Terms"
      description="These terms explain the rules for using TeachX Guru as a teacher workspace, AI creation tool, resource library, marketplace, and subscription platform."
      icon={FileText}
      title="Terms of Service"
      updated="17 August 2026"
      sections={[
        {
          title: "Account responsibility",
          body: "You are responsible for your account activity, password security, profile information, resources, marketplace submissions, and classroom use of generated material.",
          items: ["Use accurate signup details and keep access credentials private.", "Do not share accounts, bypass permissions, scrape the platform, or interfere with service security.", "Teachers must review AI outputs before using them with students, parents, institutions, or buyers."]
        },
        {
          title: "Acceptable use",
          body: "TeachX Guru is for lawful teaching, learning, resource creation, and professional growth.",
          items: ["Do not upload illegal, harmful, discriminatory, abusive, infringing, deceptive, or unsafe content.", "Do not use the platform for cheating, exam leaks, impersonation, spam, fraud, or unauthorized student data collection.", "Do not publish resources unless you own the rights or have permission to use them."]
        },
        {
          title: "AI and educational content",
          body: "AI features assist teachers but do not replace professional judgment.",
          items: ["AI may produce incomplete, incorrect, biased, or locally unsuitable content.", "Teachers are responsible for checking curriculum fit, factual accuracy, age suitability, and classroom safety.", "TeachX Guru may limit, review, or remove AI usage or content that violates safety, legal, or marketplace standards."]
        },
        {
          title: "Subscriptions and billing",
          body: "Free plans may activate immediately. Paid plans require checkout and successful payment verification before paid access is granted.",
          items: ["Plan limits, credits, storage, features, and prices may vary by region and may change with notice.", "Taxes, gateway fees, currency conversion, invoices, cancellations, and refunds may follow provider and local law rules.", "Institution plans may be governed by a separate written agreement."]
        },
        {
          title: "Marketplace and earnings",
          body: "Marketplace availability, publishing, buyer access, payouts, commissions, refunds, and tax reporting may require additional verification and regional compliance.",
          items: ["TeachX Guru may review, moderate, delist, or restrict resources to protect quality, safety, intellectual property, or users.", "Creators are responsible for ownership, licensing, tax obligations, and accuracy of published resources.", "Earnings features should be treated as enabled only where payout workflows and compliance are active."]
        }
      ]}
      footnote="These launch terms should be reviewed by local counsel before public commercial launch in each region."
    />
  );
}
